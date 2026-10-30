import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Pedido } from '../../../entities/pedido';
import { LojaService } from '../../../services/loja.service';
import { CompraService } from '../../../services/compra.service';

@Component({
  selector: 'app-pedido-feito',
  imports: [CommonModule, RouterLink],
  templateUrl: './pedido-feito.html'
})
export class PedidoFeito implements OnInit {
  pedido?: Pedido;

  constructor(public loja: LojaService, private compra: CompraService, private router: Router) {}

  ngOnInit(): void {
    this.pedido = this.compra.pedidoFeito;
    if (!this.pedido) {
      this.router.navigate(['/']);
      return;
    }
    this.compra.limpar();
  }

  prazo(): string {
    let data = new Date(this.pedido?.prazoPagamento || '');
    return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  // Mensagem que já chega pronta para o revendedor no WhatsApp
  mensagem(): string {
    let p = this.pedido!;
    let item = p.itens[0];
    let pagamento = p.formaPagamento == 'PIX' ? 'PIX' : `cartão em ${p.parcelas}x`;
    let texto = `Olá! Fiz o pedido ${p.codigo} no site.\n`
      + `${this.loja.nomeCompleto(item.unidade.modelo)}, unidade ${item.unidade.numeroSerie}\n`
      + `Kit ${item.kit.nome}` + (item.upgrade ? `, upgrade ${item.upgrade.nome}` : ', sem upgrade') + '\n'
      + `Pagamento: ${pagamento}, total ${this.loja.dinheiro(p.total)}\n`
      + `Nome: ${p.cliente.nome}`;
    return texto;
  }
}