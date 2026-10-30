package br.senac.primecoding.entities;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

// Só existem 3 modelos, um por linha (RN01)
@Entity
@Table(name = "modelo")
public class Modelo implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false, length = 13)
    private String linha;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String marca;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(nullable = false)
    private Double preco;

    private Boolean ativo = true;

    private String imagemUrl;

    // Muda a cada foto enviada; vai no endereço da foto para o navegador não usar a antiga
    private Long fotoVersao;

    // orphanRemoval: item tirado da ficha no painel é apagado do banco
    @OneToMany(mappedBy = "modelo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem")
    private List<Especificacao> especificacoes = new ArrayList<>();

    @OneToMany(mappedBy = "modelo", cascade = CascadeType.ALL)
    @OrderBy("preco")
    private List<Upgrade> upgrades = new ArrayList<>();

    public Modelo() {
    }

    public Modelo(String linha, String nome, String marca, String descricao, Double preco) {
        this.linha = linha;
        this.nome = nome;
        this.marca = marca;
        this.descricao = descricao;
        this.preco = preco;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLinha() {
        return linha;
    }

    public void setLinha(String linha) {
        this.linha = linha;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public Long getFotoVersao() {
        return fotoVersao;
    }

    public void setFotoVersao(Long fotoVersao) {
        this.fotoVersao = fotoVersao;
    }

    public List<Especificacao> getEspecificacoes() {
        return especificacoes;
    }

    public void setEspecificacoes(List<Especificacao> especificacoes) {
        this.especificacoes = especificacoes;
    }

    public List<Upgrade> getUpgrades() {
        return upgrades;
    }

    public void setUpgrades(List<Upgrade> upgrades) {
        this.upgrades = upgrades;
    }
}
