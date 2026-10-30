package br.senac.primecoding.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.io.Serializable;

// Cada item é uma unidade com seu kit e, no máximo, um upgrade (RN08, RN11, RN12)
@Entity
@Table(name = "item_pedido")
public class ItemPedido implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    // Sem unique: se o pedido for cancelado a unidade volta à vitrine e pode entrar em outro
    @ManyToOne
    @JoinColumn(name = "id_unidade", nullable = false)
    private Unidade unidade;

    @ManyToOne
    @JoinColumn(name = "id_kit", nullable = false)
    private KitSetup kit;

    @ManyToOne
    @JoinColumn(name = "id_upgrade")
    private Upgrade upgrade;

    private Double precoUnidade;

    private Double precoUpgrade = 0.0;

    public ItemPedido() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public Unidade getUnidade() {
        return unidade;
    }

    public void setUnidade(Unidade unidade) {
        this.unidade = unidade;
    }

    public KitSetup getKit() {
        return kit;
    }

    public void setKit(KitSetup kit) {
        this.kit = kit;
    }

    public Upgrade getUpgrade() {
        return upgrade;
    }

    public void setUpgrade(Upgrade upgrade) {
        this.upgrade = upgrade;
    }

    public Double getPrecoUnidade() {
        return precoUnidade;
    }

    public void setPrecoUnidade(Double precoUnidade) {
        this.precoUnidade = precoUnidade;
    }

    public Double getPrecoUpgrade() {
        return precoUpgrade;
    }

    public void setPrecoUpgrade(Double precoUpgrade) {
        this.precoUpgrade = precoUpgrade;
    }
}
