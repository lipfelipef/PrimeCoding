package br.senac.primecoding.services;

import br.senac.primecoding.entities.Especificacao;
import br.senac.primecoding.entities.FotoModelo;
import br.senac.primecoding.entities.Modelo;
import br.senac.primecoding.repositories.FotoModeloRepository;
import br.senac.primecoding.repositories.ModeloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ModeloService {

    @Autowired
    private ModeloRepository modeloRepository;

    @Autowired
    private FotoModeloRepository fotoModeloRepository;

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

    public FotoModelo foto(Integer id) {
        return fotoModeloRepository.findByModeloId(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Este modelo não tem foto enviada"));
    }

    // Aceita JPEG ou PNG de até 3 MB com pelo menos 800 x 600; o painel já manda 1200 x 900
    @Transactional
    public Modelo gravarFoto(Integer id, MultipartFile arquivo) {
        Modelo modelo = findById(id);
        if (arquivo == null || arquivo.isEmpty()) {
            throw erro("Escolha uma foto");
        }
        if (arquivo.getSize() > 3_000_000) {
            throw erro("A foto pode ter até 3 MB");
        }
        byte[] dados;
        try {
            dados = arquivo.getBytes();
        } catch (IOException e) {
            throw erro("Não foi possível ler a foto");
        }
        // O tipo vem dos primeiros bytes do arquivo, não do que o navegador declara
        String tipo;
        if (dados.length > 3 && (dados[0] & 0xFF) == 0xFF && (dados[1] & 0xFF) == 0xD8 && (dados[2] & 0xFF) == 0xFF) {
            tipo = "image/jpeg";
        } else if (dados.length > 4 && (dados[0] & 0xFF) == 0x89 && dados[1] == 'P' && dados[2] == 'N' && dados[3] == 'G') {
            tipo = "image/png";
        } else {
            throw erro("A foto precisa ser JPG ou PNG");
        }
        BufferedImage imagem;
        try {
            imagem = ImageIO.read(new ByteArrayInputStream(dados));
        } catch (IOException e) {
            imagem = null;
        }
        if (imagem == null) {
            throw erro("Não foi possível abrir a foto");
        }
        if (imagem.getWidth() < 800 || imagem.getHeight() < 600) {
            throw erro("A foto precisa ter pelo menos 800 x 600 pixels");
        }
        FotoModelo foto = fotoModeloRepository.findByModeloId(id).orElse(new FotoModelo());
        foto.setModelo(modelo);
        foto.setTipo(tipo);
        foto.setDados(dados);
        fotoModeloRepository.save(foto);
        modelo.setFotoVersao(System.currentTimeMillis());
        return modeloRepository.save(modelo);
    }

    @Transactional
    public Modelo apagarFoto(Integer id) {
        Modelo modelo = findById(id);
        fotoModeloRepository.findByModeloId(id).ifPresent(foto -> fotoModeloRepository.delete(foto));
        modelo.setFotoVersao(null);
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
