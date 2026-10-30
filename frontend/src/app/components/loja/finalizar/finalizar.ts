import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Pedido } from '../../../entities/pedido';
import { LojaService } from '../../../services/loja.service';
import { CompraService } from '../../../services/compra.service';
import { Foto } from '../foto/foto';

@Component({
  selector: 'app-finalizar',
  imports: [CommonModule, FormsModule, RouterLink, Foto],
  templateUrl: './finalizar.html'
})
export class Finalizar implements OnInit {
  pedido: Pedido = {
    cliente: { nome: '', whatsapp: '', email: '', documento: '' },
    endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
    formaPagamento: 'PIX',
    parcelas: 12,
    itens: []
  };
  vezes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  erro = '';
  enviando = false;

  constructor(public loja: LojaService, public compra: CompraService, private router: Router) {}

  ngOnInit(): void {
    // Quem chega aqui sem ter escolhido um notebook volta para a vitrine
    if (!this.compra.temEscolha()) {
      this.router.navigate(['/']);
    }
  }

  desconto(): number {
    if (this.pedido.formaPagamento == 'PIX') {
      return Math.round(this.compra.subtotal() * 10) / 100;
    }
    return 0;
  }

  total(): number {
    return Math.round((this.compra.subtotal() - this.desconto()) * 100) / 100;
  }

  mascaraWhatsapp(valor: string): string {
    let n = this.numeros(valor).substring(0, 11);
    if (n.length <= 2) {
      return n.length ? '(' + n : '';
    }
    if (n.length <= 6) {
      return `(${n.substring(0, 2)}) ${n.substring(2)}`;
    }
    if (n.length <= 10) {
      return `(${n.substring(0, 2)}) ${n.substring(2, 6)}-${n.substring(6)}`;
    }
    return `(${n.substring(0, 2)}) ${n.substring(2, 7)}-${n.substring(7)}`;
  }

  mascaraCpf(valor: string): string {
    let n = this.numeros(valor).substring(0, 11);
    let resultado = '';
    for (let i = 0; i < n.length; i++) {
      if (i == 3 || i == 6) {
        resultado += '.';
      } else if (i == 9) {
        resultado += '-';
      }
      resultado += n[i];
    }
    return resultado;
  }

  mascaraCep(valor: string): string {
    let n = this.numeros(valor).substring(0, 8);
    if (n.length > 5) {
      return n.substring(0, 5) + '-' + n.substring(5);
    }
    return n;
  }

  enviar(): void {
    this.erro = '';
    let c = this.pedido.cliente;
    let e = this.pedido.endereco;
    if (c.nome.trim() == '' || c.whatsapp == '' || c.documento == '') {
      this.erro = 'Preencha nome, WhatsApp e CPF.';
      return;
    }
    if (e.cep == '' || e.logradouro.trim() == '' || e.numero.trim() == '' || e.bairro.trim() == ''
        || e.cidade.trim() == '' || e.uf.trim() == '') {
      this.erro = 'Preencha o endereço de entrega.';
      return;
    }
    this.pedido.itens = [{
      unidade: { id: this.compra.unidade!.id, numeroSerie: '', estado: '', situacao: '' },
      kit: this.compra.kit!,
      upgrade: this.compra.upgrade
    }];
    if (this.pedido.formaPagamento == 'PIX') {
      this.pedido.parcelas = 1;
    }
    this.enviando = true;
    this.loja.fazerPedido(this.pedido).subscribe((resposta) => {
      this.compra.pedidoFeito = resposta;
      this.router.navigate(['/pedido-feito']);
    }, (err) => {
      this.enviando = false;
      if (this.pedido.formaPagamento == 'PIX') {
        this.pedido.parcelas = 12;
      }
      if (err.status == 0) {
        this.erro = 'Sem conexão com a loja. Tente de novo.';
      } else if (err.error && err.error.message) {
        this.erro = err.error.message;
      } else {
        this.erro = 'Não foi possível fazer o pedido.';
      }
    });
  }

  private numeros(valor: string): string {
    return (valor || '').replace(/\D/g, '');
  }
}