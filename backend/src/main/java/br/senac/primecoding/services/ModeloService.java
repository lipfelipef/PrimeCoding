package br.senac.primecoding.services;

import br.senac.primecoding.entities.Especificacao;
import br.senac.primecoding.entities.Modelo;
import br.senac.primecoding.repositories.ModeloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class ModeloService {

    @Autowired
    private ModeloRepository modeloRepository;

    public List<Modelo> findAll() {
        return modeloRepository.findAllByOrderByPrecoAsc();
    }

    // A vitrine só mostra os modelos que o revendedor deixou ativos
    public List<Modelo> findAtivos() {
        List<Modelo> ativos = new ArrayList<>();
        for (Modelo modelo : findAll()) {
            if (modelo.getAtivo()) {
                ativos.add(modelo);
            }
        }
        return ativos;
    }

    public Modelo findById(Integer id) {
        return modeloRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelo não encontrado"));
    }

    public Modelo findByLinha(String linha) {
        Modelo modelo = modeloRepository.findByLinha(linha.toUpperCase()).orElse(null);
        if (modelo == null || !modelo.getAtivo()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelo não encontrado");
        }
        return modelo;
    }

    // A linha (Entrada, Intermediário, Pro) é fixa; o notebook que ocupa a linha pode ser trocado inteiro
    public Modelo atualizar(Integer id, Modelo dados) {
        Modelo modelo = findById(id);
        if (dados.getNome() == null || dados.getNome().trim().isEmpty()) {
            throw erro("Informe o nome do modelo");
        }
        if (dados.getMarca() == null || dados.getMarca().trim().isEmpty()) {
            throw erro("Informe a marca do modelo");
        }
        if (dados.getDescricao() == null || dados.getDescricao().trim().isEmpty()) {
            throw erro("Informe a descrição do modelo");
        }
        if (dados.getDescricao().length() > 500) {
            throw erro("A descrição vai até 500 caracteres");
        }
        if (dados.getPreco() == null || dados.getPreco() <= 0) {
            throw erro("Informe o preço do modelo");
        }
        if (dados.getEspecificacoes() != null) {
            trocarFicha(modelo, dados.getEspecificacoes());
        }
        modelo.setNome(dados.getNome().trim());
        modelo.setMarca(dados.getMarca().trim());
        modelo.setDescricao(dados.getDescricao().trim());
        modelo.setPreco(dados.getPreco());
        modelo.setAtivo(dados.getAtivo() == null || dados.getAtivo());
        modelo.setImagemUrl(dados.getImagemUrl());
        return modeloRepository.save(modelo);
    }

    // A ficha que chega do painel substitui a antiga, na ordem em que veio
    private void trocarFicha(Modelo modelo, List<Especificacao> nova) {
        if (nova.isEmpty() || nova.size() > 12) {
            throw erro("A ficha técnica tem de 1 a 12 itens");
        }
        List<String> nomes = new ArrayList<>();
        for (Especificacao e : nova) {
            if (e.getNome() == null || e.getNome().trim().isEmpty()
                    || e.getValor() == null || e.getValor().trim().isEmpty()) {
                throw erro("Preencha o nome e o valor de cada item da ficha técnica");
            }
            if (e.getNome().trim().length() > 40 || e.getValor().trim().length() > 150) {
                throw erro("Item da ficha técnica muito longo: nome até 40 e valor até 150 caracteres");
            }
            String nome = e.getNome().trim().toLowerCase();
            if (nomes.contains(nome)) {
                throw erro("A ficha técnica tem dois itens chamados " + e.getNome().trim());
            }
            nomes.add(nome);
        }
        modelo.getEspecificacoes().clear();
        int ordem = 1;
        for (Especificacao e : nova) {
            modelo.getEspecificacoes().add(new Especificacao(modelo, e.getNome().trim(), e.getValor().trim(), ordem));
            ordem++;
        }
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
