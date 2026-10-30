package br.senac.primecoding.entities;

import jakarta.persistence.*;

import java.io.Serializable;
import java.time.LocalDate;

// Cada notebook à venda é uma unidade única e revisada (RN02, RN03, RN04)
@Entity
@Table(name = "unidade")
public class Unidade implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_modelo", nullable = false)
    private Modelo modelo;

    @Column(unique = true, nullable = false)
    private String numeroSerie;

    // A = sem marcas de uso, B = marcas leves e R$ 200 a menos
    @Column(nullable = false, length = 1)
    private String estado;

    private Integer saudeBateria;

    private Integer ciclosBateria;

    @Column(nullable = false)
    private Double preco;

    // EM_REVISAO, DISPONIVEL, RESERVADA ou VENDIDA
    @Column(nullable = false)
    private String situacao;

    private LocalDate dataEntrada;

    private String observacao;

    public Unidade() {
    }

    public Unidade(Modelo modelo, String numeroSerie, String estado, Integer saudeBateria, Integer ciclosBateria,
                   Double preco, String situacao, LocalDate dataEntrada) {
        this.modelo = modelo;
        this.numeroSerie = numeroSerie;
        this.estado = estado;
        this.saudeBateria = saudeBateria;
        this.ciclosBateria = ciclosBateria;
        this.preco = preco;
        this.situacao = situacao;
        this.dataEntrada = dataEntrada;
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

    public String getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(String numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getSaudeBateria() {
        return saudeBateria;
    }

    public void setSaudeBateria(Integer saudeBateria) {
        this.saudeBateria = saudeBateria;
    }

    public Integer getCiclosBateria() {
        return ciclosBateria;
    }

    public void setCiclosBateria(Integer ciclosBateria) {
        this.ciclosBateria = ciclosBateria;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public LocalDate getDataEntrada() {
        return dataEntrada;
    }

    public void setDataEntrada(LocalDate dataEntrada) {
        this.dataEntrada = dataEntrada;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
