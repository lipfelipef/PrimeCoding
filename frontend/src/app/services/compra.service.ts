import { Injectable } from '@angular/core';
import { Modelo, Upgrade } from '../entities/modelo';
import { Unidade } from '../entities/unidade';
import { KitSetup } from '../entities/kit-setup';
import { Pedido } from '../entities/pedido';

// Guarda o que o cliente escolheu entre a página do notebook e o fim do pedido
@Injectable({
  providedIn: 'root'
})
export class CompraService {
  modelo?: Modelo;
  unidade?: Unidade;
  kit?: KitSetup;
  upgrade?: Upgrade;
  pedidoFeito?: Pedido;

  escolher(modelo: Modelo, unidade: Unidade, kit: KitSetup, upgrade?: Upgrade): void {
    this.modelo = modelo;
    this.unidade = unidade;
    this.kit = kit;
    this.upgrade = upgrade;
    this.pedidoFeito = undefined;
  }

  temEscolha(): boolean {
    return this.modelo != undefined && this.unidade != undefined && this.kit != undefined;
  }

  subtotal(): number {
    let total = this.unidade?.preco || 0;
    if (this.upgrade) {
      total += this.upgrade.preco;
    }
    return total;
  }

  limpar(): void {
    this.modelo = undefined;
    this.unidade = undefined;
    this.kit = undefined;
    this.upgrade = undefined;
  }
}