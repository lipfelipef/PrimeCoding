package br.senac.primecoding.services;

import br.senac.primecoding.entities.Unidade;
import br.senac.primecoding.repositories.ItemPedidoRepository;
import br.senac.primecoding.repositories.UnidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class UnidadeService {

    @Autowired
    private UnidadeRepository unidadeRepository;

    @Autowired
    private ItemPedidoRepository itemPedidoRepository;

    @Autowired
    private ModeloService modeloService;

    public List<Unidade> findAll() {
        return unidadeRepository.findAllByOrderByModeloPrecoAscNumeroSerieAsc();
    }

    public List<Unidade> findDisponiveis() {
        return unidadeRepository.findBySituacaoOrderByPrecoDescSaudeBateriaDesc("DISPONIVEL");
    }

    public Unidade findById(Integer id) {
        return unidadeRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unidade não encontrada"));
    }

    public Unidade gravar(Unidade unidade) {
        unidade.setId(null);
        validar(unidade, false);
        if (unidade.getDataEntrada() == null) {
            unidade.setDataEntrada(LocalDate.now());
        }
        return unidadeRepository.save(unidade);
    }

    public Unidade atualizar(Integer id, Unidade dados) {
        Unidade unidade = findById(id);
        dados.setId(id);
        // Reservada e vendida só mudam pelo pedido, nunca pelo cadastro da unidade
        boolean emPedido = emPedido(unidade);
        if (emPedido && !unidade.getSituacao().equals(dados.getSituacao())) {
            throw erro("Esta unidade está num pedido; a situação dela muda pelo pedido");
        }
        validar(dados, emPedido);
        unidade.setModelo(dados.getModelo());
        unidade.setNumeroSerie(dados.getNumeroSerie());
        unidade.setEstado(dados.getEstado());
        unidade.setSaudeBateria(dados.getSaudeBateria());
        unidade.setCiclosBateria(dados.getCiclosBateria());
        unidade.setPreco(dados.getPreco());
        unidade.setSituacao(dados.getSituacao());
        unidade.setObservacao(dados.getObservacao());
        if (dados.getDataEntrada() != null) {
            unidade.setDataEntrada(dados.getDataEntrada());
        }
        return unidadeRepository.save(unidade);
    }

    public void apagar(Integer id) {
        findById(id);
        if (itemPedidoRepository.existsByUnidadeId(id)) {
            throw erro("Esta unidade já entrou num pedido e não pode ser apagada");
        }
        unidadeRepository.deleteById(id);
    }

    private boolean emPedido(Unidade unidade) {
        return unidade.getSituacao().equals("RESERVADA") || unidade.getSituacao().equals("VENDIDA");
    }

    private void validar(Unidade unidade, boolean jaEstavaEmPedido) {
        if (unidade.getModelo() == null || unidade.getModelo().getId() == null) {
            throw erro("Escolha o modelo da unidade");
        }
        unidade.setModelo(modeloService.findById(unidade.getModelo().getId()));
        if (unidade.getNumeroSerie() == null || unidade.getNumeroSerie().trim().isEmpty()) {
            throw erro("Informe o número de série");
        }
        unidade.setNumeroSerie(unidade.getNumeroSerie().trim().toUpperCase());
        if (unidade.getNumeroSerie().length() > 30) {
            throw erro("O número de série vai até 30 caracteres");
        }
        String estado = unidade.getEstado();
        if (estado == null || !(estado.equals("A") || estado.equals("B"))) {
            throw erro("O estado da unidade é A ou B");
        }
        Integer bateria = unidade.getSaudeBateria();
        if (bateria == null || bateria < 0 || bateria > 100) {
            throw erro("A saúde da bateria vai de 0 a 100%");
        }
        if (unidade.getCiclosBateria() == null || unidade.getCiclosBateria() < 0) {
            throw erro("Informe os ciclos da bateria");
        }
        if (unidade.getPreco() == null || unidade.getPreco() <= 0) {
            throw erro("Informe o preço da unidade");
        }
        String situacao = unidade.getSituacao();
        if (situacao == null) {
            throw erro("Informe a situação da unidade");
        }
        boolean doCadastro = situacao.equals("EM_REVISAO") || situacao.equals("DISPONIVEL");
        if (!doCadastro && !jaEstavaEmPedido) {
            throw erro("A situação da unidade é em revisão ou disponível");
        }
        // Só vai para a vitrine com bateria de pelo menos 80% (RN03)
        if (situacao.equals("DISPONIVEL") && bateria < 80) {
            throw erro("Com bateria abaixo de 80% a unidade não vai para a vitrine: troque a bateria antes");
        }
        Unidade mesmoNumero = unidadeRepository.findByNumeroSerie(unidade.getNumeroSerie()).orElse(null);
        if (mesmoNumero != null && !mesmoNumero.getId().equals(unidade.getId())) {
            throw erro("Já existe uma unidade com o número de série " + unidade.getNumeroSerie());
        }
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
