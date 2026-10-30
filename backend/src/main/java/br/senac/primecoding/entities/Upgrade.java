package br.senac.primecoding.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;

// Upgrades permitidos por modelo; o Pro não tem nenhum (RN12)
@Entity
@Table(name = "upgrade")
public class Upgrade implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_modelo", nullable = false)
    private Modelo modelo;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Double preco;

    private Integer diasExtras;

    public Upgrade() {
    }

    public Upgrade(Modelo modelo, String nome, Double preco, Integer diasExtras) {
        this.modelo = modelo;
        this.nome = nome;
        this.preco = preco;
        this.diasExtras = diasExtras;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Modelo getModelo() {
        return modelo;
    }

    public void setModelo(Modelo modelo) {
        this.modelo = modelo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Integer getDiasExtras() {
        return diasExtras;
    }

    public void setDiasExtras(Integer diasExtras) {
        this.diasExtras = diasExtras;
    }
}
