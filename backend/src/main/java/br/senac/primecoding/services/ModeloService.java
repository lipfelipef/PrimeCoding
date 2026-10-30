package br.senac.primecoding.services;

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

    // A linha e a ficha técnica não mudam pelo painel; o resto, sim
    public Modelo atualizar(Integer id, Modelo dados) {
        Modelo modelo = findById(id);
        if (dados.getNome() == null || dados.getNome().trim().isEmpty()) {
            throw erro("Informe o nome do modelo");
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
        modelo.setNome(dados.getNome().trim());
        modelo.setDescricao(dados.getDescricao().trim());
        modelo.setPreco(dados.getPreco());
        modelo.setAtivo(dados.getAtivo() == null || dados.getAtivo());
        modelo.setImagemUrl(dados.getImagemUrl());
        return modeloRepository.save(modelo);
    }

    private ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
