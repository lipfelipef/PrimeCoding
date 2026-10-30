package br.senac.primecoding.entities;

import jakarta.persistence.*;

import java.io.Serializable;

// Foto enviada pelo painel; fica numa tabela própria para a lista de modelos não carregar os bytes
@Entity
@Table(name = "foto_modelo")
public class FotoModelo implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "id_modelo", nullable = false, unique = true)
    private Modelo modelo;

    @Column(nullable = false, length = 20)
    private String tipo;

    // Até 3 MB; o painel já manda a foto reduzida para 1200 x 900
    @Lob
    @Column(nullable = false, length = 3_000_000)
    private byte[] dados;

    public FotoModelo() {
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public byte[] getDados() {
        return dados;
    }

    public void setDados(byte[] dados) {
        this.dados = dados;
    }
}
