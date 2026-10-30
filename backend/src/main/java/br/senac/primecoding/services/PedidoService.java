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
    public static final List<String> FLUXO = List.of("AGUARDANDO_ATENDIMENTO", "AGUARDANDO_PAGAMENTO",
            "EM_PREPARACAO", "PRONTO_PARA_ENVIO", "ENVIADO", "ENTREGUE");

    private static final List<String> UFS = List.of("AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
            "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO");

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EnderecoRepository enderecoRepository;

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
        pedido.setEndereco(gravarEndereco(dados.getEndereco(), pedido.getCliente()));
        pedido.setDataPedido(LocalDateTime.now());
        pedido.setPrazoPagamento(pedido.getDataPedido().plusHours(48));
        pedido.setStatus("AGUARDANDO_ATENDIMENTO");
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
        String atual = pedido.getStatus();
        if (atual.equals("ENTREGUE") || atual.equals("CANCELADO")) {
            throw erro("Este pedido já foi encerrado");
        }
        boolean cancelar = "CANCELADO".equals(novoStatus);
        boolean proximo = FLUXO.indexOf(novoStatus) == FLUXO.indexOf(atual) + 1;
        if (!cancelar && !proximo) {
            throw erro("O próximo passo deste pedido é " + FLUXO.get(FLUXO.indexOf(atual) + 1));
        }
        aplicarStatus(pedido, novoStatus, observacao, usuario);
        return pedidoRepository.save(pedido);
    }

    // Reserva de 48 h: sem pagamento no prazo, o pedido cai e a unidade volta (RN15)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelarVencidos() {
        List<Pedido> vencidos = pedidoRepository.findByStatusInAndPrazoPagamentoBefore(
                List.of("AGUARDANDO_ATENDIMENTO", "AGUARDANDO_PAGAMENTO"), LocalDateTime.now());
        for (Pedido pedido : vencidos) {
            aplicarStatus(pedido, "CANCELADO", "Prazo de 48 h para pagamento vencido", null);
            pedidoRepository.save(pedido);
        }
    }

    private void aplicarStatus(Pedido pedido, String status, String observacao, Usuario usuario) {
        pedido.setStatus(status);
        pedido.getHistorico().add(new HistoricoStatus(pedido, usuario, status, observacao));
        for (ItemPedido item : pedido.getItens()) {
            Unidade unidade = item.getUnidade();
            if (status.equals("CANCELADO")) {
                unidade.setSituacao("DISPONIVEL");
            } else if (status.equals("EM_PREPARACAO")) {
                // Pagamento confirmado: a unidade é do cliente
                unidade.setSituacao("VENDIDA");
            }
            unidadeRepository.save(unidade);
        }
    }

    private ItemPedido montarItem(ItemPedido dados) {
        if (dados.getUnidade() == null || dados.getUnidade().getId() == null) {
            throw erro("Escolha a unidade");
        }
        Unidade unidade = unidadeRepository.findById(dados.getUnidade().getId()).orElse(null);
        if (unidade == null || !unidade.getSituacao().equals("DISPONIVEL")) {
            throw erro("Esta unidade acabou de ser reservada por outra pessoa. Escolha outra.");
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
        if (dados.getUpgrade() != null && dados.getUpgrade().getId() != null) {
            Upgrade upgrade = upgradeRepository.findById(dados.getUpgrade().getId()).orElse(null);
            if (upgrade == null || !upgrade.getModelo().getId().equals(unidade.getModelo().getId())) {
                throw erro("Este upgrade não serve para este modelo");
            }
            item.setUpgrade(upgrade);
            item.setPrecoUpgrade(upgrade.getPreco());
        }
        return item;
    }

    // Quem já comprou é achado pelo WhatsApp e tem os dados atualizados
    private Cliente gravarCliente(Cliente dados) {
        if (dados == null) {
            throw erro("Informe seus dados");
        }
        if (dados.getNome() == null || dados.getNome().trim().split("\\s+").length < 2) {
            throw erro("Informe nome e sobrenome");
        }
        String whatsapp = Documentos.somenteNumeros(dados.getWhatsapp());
        if (whatsapp.length() < 10 || whatsapp.length() > 11) {
            throw erro("Informe o WhatsApp com DDD");
        }
        // Projeto acadêmico: qualquer CPF com 11 dígitos, sem conferir os verificadores
        String cpf = Documentos.somenteNumeros(dados.getDocumento());
        if (cpf.length() != 11) {
            throw erro("O CPF tem 11 dígitos");
        }
        String email = dados.getEmail();
        if (email != null && !email.trim().isEmpty() && !email.contains("@")) {
            throw erro("E-mail inválido");
        }
        Cliente cliente = clienteRepository.findByWhatsapp(whatsapp).orElse(new Cliente());
        if (cliente.getId() == null) {
            cliente.setDataCadastro(LocalDateTime.now());
        }
        cliente.setNome(dados.getNome().trim());
        cliente.setWhatsapp(whatsapp);
        cliente.setTipoDocumento("CPF");
        cliente.setDocumento(cpf);
        if (email != null && !email.trim().isEmpty()) {
            cliente.setEmail(email.trim().toLowerCase());
        }
        return clienteRepository.save(cliente);
    }

    private Endereco gravarEndereco(Endereco dados, Cliente cliente) {
        if (dados == null) {
            throw erro("Informe o endereço de entrega");
        }
        String cep = Documentos.somenteNumeros(dados.getCep());
        if (cep.length() != 8) {
            throw erro("CEP inválido");
        }
        if (vazio(dados.getLogradouro()) || vazio(dados.getNumero()) || vazio(dados.getBairro())
                || vazio(dados.getCidade())) {
            throw erro("Preencha o endereço completo");
        }
        String uf = dados.getUf() == null ? "" : dados.getUf().trim().toUpperCase();
        if (!UFS.contains(uf)) {
            throw erro("UF inválida");
        }
        Endereco endereco = new Endereco();
        endereco.setCliente(cliente);
        endereco.setCep(cep.substring(0, 5) + "-" + cep.substring(5));
        endereco.setLogradouro(dados.getLogradouro().trim());
        endereco.setNumero(dados.getNumero().trim());
        endereco.setComplemento(dados.getComplemento());
        endereco.setBairro(dados.getBairro().trim());
        endereco.setCidade(dados.getCidade().trim());
        endereco.setUf(uf);
        return enderecoRepository.save(endereco);
    }

    private String novoCodigo() {
        String prefixo = "PC-" + LocalDateTime.now().getYear() + "-";
        long numero = pedidoRepository.countByCodigoStartingWith(prefixo) + 1;
        return prefixo + String.format("%04d", numero);
    }

    private boolean vazio(String valor) {
        return valor == null || valor.trim().isEmpty();
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
