import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pedido } from '../../../entities/pedido';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-pedido-lista',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedido-lista.html'
})
export class PedidoLista implements OnInit {
  list: Pedido[] = [];
  filtro = 'ABERTOS';
  erro = '';
  carregou = false;

  constructor(public painel: PainelService, public loja: LojaService) {}

  ngOnInit(): void {
    this.painel.pedidos().subscribe((resposta) => {
      this.list = resposta;
      this.carregou = true;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível carregar os pedidos');
    });
  }

  filtrados(): Pedido[] {
    if (this.filtro == 'TODOS') {
      return this.list;
    }
    if (this.filtro == 'ABERTOS') {
      return this.list.filter(p => p.status != 'ENTREGUE' && p.status != 'CANCELADO');
    }
    return this.list.filter(p => p.status == this.filtro);
  }

  data(texto?: string): string {
    return new Date(texto || '').toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}