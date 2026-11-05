package br.senac.primecoding.services;

import br.senac.primecoding.entities.*;
import br.senac.primecoding.repositories.*;
import br.senac.primecoding.util.Documentos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoService {

    // Ordem do fluxo do pedido; cancelar vale em qualquer ponto antes da entrega
    // A negociação acontece no WhatsApp; o painel só registra como ela terminou
    public static final String EM_ABERTO = "EM_ABERTO";
    public static final String VENDIDO = "VENDIDO";
    public static final String CANCELADO = "CANCELADO";

    // Letras com acento, espaço, apóstrofo e hífen (nomes)
    private static final String LETRAS = "[A-Za-zÀ-ÖØ-öø-ÿ' -]";

    // DDDs que existem no Brasil (Anatel)
    private static final List<Integer> DDDS = List.of(11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28,
            31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65,
            66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96,
            97, 98, 99);

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private UnidadeRepository unidadeRepository;

    @Autowired
    private KitSetupRepository kitSetupRepository;

    @Autowired
    private UpgradeRepository upgradeRepository;

    public List<Pedido> findAll() {
        return pedidoRepository.findAllByOrderByDataPedidoDesc();
    }

    public Pedido findById(Integer id) {
        return pedidoRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    }

    // O cliente monta o pedido no site e a venda termina pelo WhatsApp
    @Transactional
    public Pedido gravar(Pedido dados) {
        if (dados.getItens() == null || dados.getItens().size() != 1) {
            throw erro("O pedido leva um notebook");
        }
        ItemPedido item = montarItem(dados.getItens().get(0));

        Pedido pedido = new Pedido();
        pedido.setCliente(gravarCliente(dados.getCliente()));
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setPrazoPagamento(pedido.getDataPedido().plusHours(48));
        pedido.setStatus(EM_ABERTO);
        pedido.setCodigo(novoCodigo());

        // 12x sem juros no cartão ou 10% de desconto no PIX (RN06)
        String forma = dados.getFormaPagamento();
        double subtotal = item.getPrecoUnidade() + item.getPrecoUpgrade();
        pedido.setSubtotal(subtotal);
        if ("PIX".equals(forma)) {
            pedido.setParcelas(1);
            pedido.setDesconto(Math.round(subtotal * 10) / 100.0);
        } else if ("CARTAO".equals(forma)) {
            Integer parcelas = dados.getParcelas();
            if (parcelas == null || parcelas < 1 || parcelas > 12) {
                throw erro("No cartão são de 1 a 12 parcelas");
            }
            pedido.setParcelas(parcelas);
            pedido.setDesconto(0.0);
        } else {
            throw erro("Escolha PIX ou cartão");
        }
        pedido.setFormaPagamento(forma);
        pedido.setTotal(Math.round((subtotal - pedido.getDesconto()) * 100) / 100.0);

        item.setPedido(pedido);
        pedido.getItens().add(item);
        pedido.getHistorico().add(new HistoricoStatus(pedido, null, pedido.getStatus(), "Pedido feito pelo site"));

        // A unidade sai da vitrine enquanto o pedido estiver aberto
        item.getUnidade().setSituacao("RESERVADA");
        unidadeRepository.save(item.getUnidade());
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido mudarStatus(Integer id, String novoStatus, String observacao, Usuario usuario) {
        Pedido pedido = findById(id);
        if (!pedido.getStatus().equals(EM_ABERTO)) {
            throw erro("Este pedido já foi encerrado");
        }
        if (!VENDIDO.equals(novoStatus) && !CANCELADO.equals(novoStatus)) {
            throw erro("O pedido em aberto vira vendido ou cancelado");
        }
        aplicarStatus(pedido, novoStatus, observacao, usuario);
        return pedidoRepository.save(pedido);
    }

    // Reserva de 48 h: sem pagamento no prazo, o pedido cai e a unidade volta (RN15)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelarVencidos() {
        List<Pedido> vencidos = pedidoRepository.findByStatusInAndPrazoPagamentoBefore(
                List.of(EM_ABERTO), LocalDateTime.now());
        for (Pedido pedido : vencidos) {
            aplicarStatus(pedido, CANCELADO, "Prazo de 48 h vencido", null);
            pedidoRepository.save(pedido);
        }
    }

    private void aplicarStatus(Pedido pedido, String status, String observacao, Usuario usuario) {
        pedido.setStatus(status);
        pedido.getHistorico().add(new HistoricoStatus(pedido, usuario, status, observacao));
        for (ItemPedido item : pedido.getItens()) {
            Unidade unidade = item.getUnidade();
            if (status.equals(CANCELADO)) {
                unidade.setSituacao("DISPONIVEL");
            } else if (status.equals(VENDIDO)) {
                // Venda fechada no WhatsApp: a unidade é do cliente
                unidade.setSituacao("VENDIDA");
            }
            unidadeRepository.save(unidade);
        }
    }

    private ItemPedido montarItem(ItemPedido dados) {
        // O cliente escolhe o notebook; a loja separa a unidade de bateria melhor
        Unidade pedida = dados.getUnidade();
        Unidade unidade;
        if (pedida != null && pedida.getId() != null) {
            unidade = unidadeRepository.findById(pedida.getId()).orElse(null);
            if (unidade == null || !unidade.getSituacao().equals("DISPONIVEL")) {
                throw erro("Esta unidade acabou de ser reservada por outra pessoa. Escolha outra.");
            }
        } else if (pedida != null && pedida.getModelo() != null && pedida.getModelo().getId() != null) {
            unidade = unidadeRepository.findFirstByModeloIdAndSituacaoOrderBySaudeBateriaDescIdAsc(
                    pedida.getModelo().getId(), "DISPONIVEL").orElseThrow(
                    () -> erro("Este notebook acabou de esgotar. Peça para ser avisado pelo WhatsApp."));
        } else {
            throw erro("Escolha o notebook");
        }
        if (dados.getKit() == null || dados.getKit().getId() == null) {
            throw erro("Escolha o kit de setup");
        }
        KitSetup kit = kitSetupRepository.findById(dados.getKit().getId()).orElseThrow(
                () -> erro("Kit de setup não encontrado"));

        ItemPedido item = new ItemPedido();
        item.setUnidade(unidade);
        item.setKit(kit);
        item.setPrecoUnidade(unidade.getPreco());
        item.setPrecoUpgrade(0.0);
        // Pode juntar mais de um upgrade, mas cada um entra uma vez só
        if (dados.getUpgrades() != null) {
            for (Upgrade escolhido : dados.getUpgrades()) {
                Upgrade upgrade = escolhido == null || escolhido.getId() == null ? null
                        : upgradeRepository.findById(escolhido.getId()).orElse(null);
                if (upgrade == null || !upgrade.getModelo().getId().equals(unidade.getModelo().getId())) {
                    throw erro("Este upgrade não serve para este modelo");
                }
                if (item.getUpgrades().contains(upgrade)) {
                    throw erro("O mesmo upgrade foi escolhido duas vezes");
                }
                item.getUpgrades().add(upgrade);
                item.setPrecoUpgrade(item.getPrecoUpgrade() + upgrade.getPreco());
            }
        }
        return item;
    }

    // Quem já comprou é achado pelo WhatsApp e tem os dados atualizados
    private Cliente gravarCliente(Cliente dados) {
        if (dados == null) {
            throw erro("Informe seus dados");
        }
        String nome = dados.getNome() == null ? "" : dados.getNome().trim().replaceAll("\\s+", " ");
        if (nome.length() > 100 || !nome.matches(LETRAS + "+")) {
            throw erro("Use só letras no nome");
        }
        if (nome.split(" ").length < 2 || contaPalavras(nome, 2) < 2) {
            throw erro("Informe nome e sobrenome");
        }
        // Só dígitos e a máscara: "(11) 91234-5678"; letra no meio é recusada, não apagada
        String whatsappDigitado = dados.getWhatsapp() == null ? "" : dados.getWhatsapp().trim();
        if (!whatsappDigitado.matches("\\+?[0-9() -]{10,19}")) {
            throw erro("Informe o WhatsApp com DDD, só números");
        }
        String whatsapp = Documentos.somenteNumeros(whatsappDigitado);
        // O código do Brasil não é guardado: o link do painel já põe o 55 na frente
        if (whatsapp.length() > 11 && whatsapp.startsWith("55")) {
            whatsapp = whatsapp.substring(2);
        }
        if (whatsapp.length() < 10 || whatsapp.length() > 11) {
            throw erro("Informe o WhatsApp com DDD");
        }
        if (!DDDS.contains(Integer.parseInt(whatsapp.substring(0, 2)))) {
            throw erro("O DDD " + whatsapp.substring(0, 2) + " não existe");
        }
        if (whatsapp.length() == 11 && whatsapp.charAt(2) != '9') {
            throw erro("Celular com 9 dígitos começa com 9");
        }
        if (whatsapp.length() == 10 && "2345".indexOf(whatsapp.charAt(2)) < 0) {
            throw erro("Número fixo começa com 2, 3, 4 ou 5");
        }
        Cliente cliente = clienteRepository.findByWhatsapp(whatsapp).orElse(new Cliente());
        if (cliente.getId() == null) {
            cliente.setDataCadastro(LocalDateTime.now());
        }
        cliente.setNome(nome);
        cliente.setWhatsapp(whatsapp);
        return clienteRepository.save(cliente);
    }

    private String novoCodigo() {
        String prefixo = "PC-" + LocalDateTime.now().getYear() + "-";
        long numero = pedidoRepository.countByCodigoStartingWith(prefixo) + 1;
        return prefixo + String.format("%04d", numero);
    }

    private int contaLetras(String valor) {
        return valor.replaceAll("[^A-Za-zÀ-ÖØ-öø-ÿ]", "").length();
    }

    // Quantas palavras têm pelo menos "minimo" letras
    private int contaPalavras(String valor, int minimo) {
        int total = 0;
        for (String palavra : valor.split(" ")) {
            if (contaLetras(palavra) >= minimo) {
                total++;
            }
        }
        return total;
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
