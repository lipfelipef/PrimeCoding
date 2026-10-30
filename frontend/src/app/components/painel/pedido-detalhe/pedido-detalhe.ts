import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Pedido } from '../../../entities/pedido';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-pedido-detalhe',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedido-detalhe.html'
})
export class PedidoDetalhe implements OnInit {
  pedido?: Pedido;
  observacao = '';
  erro = '';
  mensagem = '';

  constructor(public painel: PainelService, public loja: LojaService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.painel.pedido(this.route.snapshot.paramMap.get('id')).subscribe((resposta) => {
      this.pedido = resposta;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Pedido não encontrado');
    });
  }

  encerrado(): boolean {
    return this.pedido?.status == 'ENTREGUE' || this.pedido?.status == 'CANCELADO';
  }

  mudar(status: string): void {
    if (status == 'CANCELADO' && !confirm(`Cancelar o pedido ${this.pedido?.codigo}? A unidade volta para a vitrine.`)) {
      return;
    }
    this.erro = '';
    this.mensagem = '';
    this.painel.mudarStatus(this.pedido?.id, status, this.observacao).subscribe((resposta) => {
      this.pedido = resposta;
      this.observacao = '';
      this.mensagem = 'Status alterado para ' + this.painel.nomeStatus(status).toLowerCase();
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível mudar o status');
    });
  }

  data(texto?: string): string {
    return new Date(texto || '').toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  linkCliente(): string {
    return `https://wa.me/55${this.pedido?.cliente.whatsapp}`;
  }

  whatsappFormatado(): string {
    let n = this.pedido?.cliente.whatsapp || '';
    return `(${n.substring(0, 2)}) ${n.substring(2, n.length - 4)}-${n.substring(n.length - 4)}`;
  }
}