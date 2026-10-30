import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  avisoCep = '';
  ultimoCep = '';
  campos = ['nome', 'whatsapp', 'cpf', 'email', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'uf'];
  tocados: string[] = [];
  ufs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR',
    'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
  @ViewChild('campoNumero') campoNumero?: ElementRef<HTMLInputElement>;

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

  // Com os 8 dígitos do CEP, preenche rua, bairro, cidade e UF
  digitouCep(valor: string): void {
    this.pedido.endereco.cep = this.mascaraCep(valor);
    let cep = this.numeros(valor);
    this.avisoCep = '';
    if (cep.length != 8 || cep == this.ultimoCep) {
      return;
    }
    this.ultimoCep = cep;
    this.avisoCep = 'Buscando endereço...';
    this.loja.buscarCep(cep).subscribe((resposta) => {
      if (resposta.erro) {
        this.avisoCep = 'CEP não encontrado. Preencha o endereço abaixo.';
        return;
      }
      let e = this.pedido.endereco;
      e.logradouro = resposta.logradouro || e.logradouro;
      e.bairro = resposta.bairro || e.bairro;
      e.cidade = resposta.localidade || e.cidade;
      e.uf = resposta.uf || e.uf;
      this.avisoCep = '';
      setTimeout(() => this.campoNumero?.nativeElement.focus());
    }, () => {
      this.ultimoCep = '';
      this.avisoCep = 'Não deu para buscar o CEP agora. Preencha o endereço abaixo.';
    });
  }

  // Regra de cada campo; devolve a mensagem de erro ou '' quando está certo
  regra(campo: string): string {
    let c = this.pedido.cliente;
    let e = this.pedido.endereco;
    switch (campo) {
      case 'nome': {
        let nome = c.nome.trim();
        if (nome == '') {
          return 'Informe seu nome.';
        }
        if (!/^[A-Za-zÀ-ÿ' .-]+$/.test(nome)) {
          return 'Use só letras no nome.';
        }
        if (nome.split(/\s+/).filter(p => p.length >= 2).length < 2) {
          return 'Informe nome e sobrenome.';
        }
        return '';
      }
      case 'whatsapp': {
        let n = this.numeros(c.whatsapp);
        if (n == '') {
          return 'Informe o WhatsApp.';
        }
        if (n.length < 10) {
          return 'Informe o DDD e o número completo.';
        }
        return '';
      }
      case 'cpf': {
        // Projeto acadêmico: aceita qualquer CPF com 11 dígitos, sem conferir os verificadores
        let n = this.numeros(c.documento);
        if (n == '') {
          return 'Informe o CPF.';
        }
        if (n.length != 11) {
          return 'O CPF tem 11 dígitos.';
        }
        return '';
      }
      case 'email': {
        let email = (c.email || '').trim();
        if (email != '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          return 'E-mail inválido. Exemplo: nome@gmail.com';
        }
        return '';
      }
      case 'cep':
        return this.numeros(e.cep).length == 8 ? '' : 'Informe o CEP com 8 dígitos.';
      case 'logradouro':
        return e.logradouro.trim().length >= 2 ? '' : 'Informe a rua.';
      case 'numero':
        return e.numero.trim() != '' ? '' : 'Informe o número (ou S/N).';
      case 'bairro':
        return e.bairro.trim().length >= 2 ? '' : 'Informe o bairro.';
      case 'cidade':
        return e.cidade.trim().length >= 2 ? '' : 'Informe a cidade.';
      case 'uf':
        if (e.uf.trim() == '') {
          return 'Informe a UF.';
        }
        return this.ufs.includes(e.uf.trim().toUpperCase()) ? '' : 'UF inválida. Exemplo: SP';
    }
    return '';
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
      let elemento = document.querySelector<HTMLInputElement>(`.finalizar [name=${primeiro}]`);
      elemento?.focus();
      return;
    }
    this.pedido.endereco.uf = this.pedido.endereco.uf.trim().toUpperCase();
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