import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Pedido } from '../../../entities/pedido';
import { LojaService } from '../../../services/loja.service';
import { CompraService } from '../../../services/compra.service';
import { Foto } from '../foto/foto';

// DDDs que existem no Brasil (Anatel)
const DDDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99];

// A venda fecha no WhatsApp: o site só pede quem é e como quer pagar.
// Endereço e CPF a loja combina na conversa.
@Component({
  selector: 'app-finalizar',
  imports: [CommonModule, FormsModule, RouterLink, Foto],
  templateUrl: './finalizar.html'
})
export class Finalizar implements OnInit {
  pedido: Pedido = {
    cliente: { nome: '', whatsapp: '' },
    formaPagamento: 'PIX',
    parcelas: 12,
    itens: []
  };
  vezes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  erro = '';
  enviando = false;
  campos = ['nome', 'whatsapp'];
  tocados: string[] = [];

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

  // Filtra o que a pessoa digitou e escreve o resultado de volta no próprio campo,
  // senão o texto extra continua aparecendo mesmo fora do modelo
  digitou(evento: Event, campo: string): void {
    let elemento = evento.target as HTMLInputElement;
    let limpo = campo == 'nome'
      ? elemento.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '').substring(0, 100)
      : this.mascaraWhatsapp(elemento.value);
    if (elemento.value != limpo) {
      elemento.value = limpo;
    }
    if (campo == 'nome') {
      this.pedido.cliente.nome = limpo;
    } else {
      this.pedido.cliente.whatsapp = limpo;
    }
  }

  mascaraWhatsapp(valor: string): string {
    let n = this.numeros(valor);
    // Quem cola "+55 11 91234-5678" põe o código do Brasil na frente: ele sai, fica DDD e número
    if (n.length > 11 && n.startsWith('55')) {
      n = n.substring(2);
    }
    n = n.substring(0, 11);
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

  // Regra de cada campo; devolve a mensagem de erro ou '' quando está certo
  regra(campo: string): string {
    let c = this.pedido.cliente;
    if (campo == 'nome') {
      let nome = c.nome.trim();
      if (nome == '') {
        return 'Informe seu nome.';
      }
      if (nome.split(/\s+/).filter(p => p.length >= 2).length < 2) {
        return 'Informe nome e sobrenome.';
      }
      return '';
    }
    let n = this.numeros(c.whatsapp);
    if (n == '') {
      return 'Informe o WhatsApp.';
    }
    if (n.length < 10) {
      return 'Informe o DDD e o número completo.';
    }
    if (!DDDS.includes(Number(n.substring(0, 2)))) {
      return `O DDD ${n.substring(0, 2)} não existe.`;
    }
    if (n.length == 11 && n[2] != '9') {
      return 'Celular com 9 dígitos começa com 9.';
    }
    if (n.length == 10 && !'2345'.includes(n[2])) {
      return 'Número fixo começa com 2, 3, 4 ou 5. Celular tem 9 dígitos.';
    }
    return '';
  }

  // 55 é DDD de verdade (Santa Maria, RS), mas quase sempre é o código do Brasil digitado no lugar do DDD
  avisoDdd55(): boolean {
    return this.numeros(this.pedido.cliente.whatsapp).startsWith('55') && !this.erroDe('whatsapp');
  }

  // O erro só aparece depois que a pessoa passou pelo campo ou tentou enviar
  erroDe(campo: string): string {
    return this.tocados.includes(campo) ? this.regra(campo) : '';
  }

  tocar(campo: string): void {
    if (!this.tocados.includes(campo)) {
      this.tocados.push(campo);
    }
  }

  enviar(): void {
    this.erro = '';
    this.tocados = [...this.campos];
    let primeiro = this.campos.find(campo => this.regra(campo) != '');
    if (primeiro) {
      this.erro = 'Confira os campos marcados em vermelho.';
      document.querySelector<HTMLInputElement>(`.finalizar [name=${primeiro}]`)?.focus();
      return;
    }
    this.pedido.cliente.nome = this.pedido.cliente.nome.trim();
    this.pedido.itens = [{
      // A loja separa a unidade de bateria melhor deste modelo
      unidade: { modelo: this.compra.modelo, numeroSerie: '', estado: '', situacao: '' },
      kit: this.compra.kit!,
      upgrades: this.compra.upgrades
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
