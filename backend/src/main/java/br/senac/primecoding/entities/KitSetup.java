package br.senac.primecoding.entities;

import jakarta.persistence.*;

import java.io.Serializable;

// Kits de setup que acompanham cada notebook, sem custo (RN11)
@Entity
@Table(name = "kit_setup")
public class KitSetup implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String nome;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private String ferramentas;

    public KitSetup() {
    }

    public KitSetup(String nome, String descricao, String ferramentas) {
        this.nome = nome;
        this.descricao = descricao;
        this.ferramentas = ferramentas;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getFerramentas() {
        return ferramentas;
    }

    public void setFerramentas(String ferramentas) {
        this.ferramentas = ferramentas;
    }
}
