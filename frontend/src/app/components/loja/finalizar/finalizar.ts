import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  // CEP que o ViaCEP não conhece; cidade e UF ficam travadas quando o CEP as preencheu
  cepInexistente = false;
  cepPreencheu = false;
  semNumero = false;
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

  // Filtra o que a pessoa digitou e escreve o resultado de volta no próprio campo,
  // senão o texto extra continua aparecendo mesmo fora do modelo
  digitou(evento: Event, campo: string): void {
    let elemento = evento.target as HTMLInputElement;
    let limpo = this.filtrar(campo, elemento.value);
    if (elemento.value != limpo) {
      elemento.value = limpo;
    }
    let c = this.pedido.cliente;
    let e = this.pedido.endereco;
    switch (campo) {
      case 'nome': c.nome = limpo; break;
      case 'whatsapp': c.whatsapp = limpo; break;
      case 'cpf': c.documento = limpo; break;
      case 'email': c.email = limpo; break;
      case 'logradouro': e.logradouro = limpo; break;
      case 'numero': e.numero = limpo; break;
      case 'complemento': e.complemento = limpo; break;
      case 'bairro': e.bairro = limpo; break;
      case 'cidade': e.cidade = limpo; break;
      case 'cep':
        e.cep = limpo;
        this.buscarCep();
        break;
    }
  }

  filtrar(campo: string, valor: string): string {
    switch (campo) {
      case 'nome':
        return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '').substring(0, 100);
      case 'whatsapp':
        return this.mascaraWhatsapp(valor);
      case 'cpf':
        return this.mascaraCpf(valor);
      case 'email':
        return valor.replace(/\s/g, '').substring(0, 120);
      case 'cep':
        return this.mascaraCep(valor);
      case 'logradouro':
        return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 .,'ºª°/-]/g, '').replace(/\s{2,}/g, ' ').substring(0, 120);
      case 'numero':
        return this.numeros(valor).substring(0, 6);
      case 'complemento':
        return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 .,'ºª°/-]/g, '').replace(/\s{2,}/g, ' ').substring(0, 60);
      case 'bairro':
        return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 .,'-]/g, '').replace(/\s{2,}/g, ' ').substring(0, 60);
      case 'cidade':
        return valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, '').replace(/\s{2,}/g, ' ').substring(0, 60);
    }
    return valor;
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

  marcouSemNumero(): void {
    this.pedido.endereco.numero = this.semNumero ? 'S/N' : '';
    this.tocar('numero');
  }

  // Com os 8 dígitos do CEP, preenche rua, bairro, cidade e UF
  buscarCep(): void {
    let cep = this.numeros(this.pedido.endereco.cep);
    this.avisoCep = '';
    if (cep.length != 8) {
      // CEP mexido: cidade e UF voltam a ficar livres até a próxima busca
      this.cepInexistente = false;
      this.cepPreencheu = false;
      this.ultimoCep = '';
      return;
    }
    if (cep == this.ultimoCep) {
      return;
    }
    this.ultimoCep = cep;
    this.avisoCep = 'Buscando endereço...';
    this.loja.buscarCep(cep).subscribe((resposta) => {
      this.avisoCep = '';
      if (resposta.erro) {
        this.cepInexistente = true;
        this.cepPreencheu = false;
        this.tocar('cep');
        return;
      }
      this.cepInexistente = false;
      let e = this.pedido.endereco;
      e.logradouro = resposta.logradouro || e.logradouro;
      e.bairro = resposta.bairro || e.bairro;
      e.cidade = resposta.localidade || e.cidade;
      e.uf = resposta.uf || e.uf;
      this.cepPreencheu = !!(resposta.localidade && resposta.uf);
      setTimeout(() => this.campoNumero?.nativeElement.focus());
    }, () => {
      // Sem resposta do ViaCEP não dá para dizer que o CEP não existe: libera o preenchimento à mão
      this.ultimoCep = '';
      this.cepInexistente = false;
      this.cepPreencheu = false;
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
        if (email != '' && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(email)) {
          return 'E-mail inválido. Exemplo: nome@gmail.com';
        }
        return '';
      }
      case 'cep': {
        let n = this.numeros(e.cep);
        if (n == '') {
          return 'Informe o CEP.';
        }
        if (n.length != 8) {
          return 'O CEP tem 8 dígitos.';
        }
        if (this.cepInexistente) {
          return 'CEP não encontrado. Confira os números.';
        }
        return '';
      }
      case 'logradouro':
        if (e.logradouro.trim() == '') {
          return 'Informe a rua.';
        }
        return /[A-Za-zÀ-ÿ].*[A-Za-zÀ-ÿ].*[A-Za-zÀ-ÿ]/.test(e.logradouro) ? '' : 'Rua inválida.';
      case 'numero':
        if (this.semNumero) {
          return '';
        }
        return /^\d{1,6}$/.test(e.numero) ? '' : 'Informe o número ou marque "Sem número".';
      case 'bairro':
        if (e.bairro.trim() == '') {
          return 'Informe o bairro.';
        }
        return /[A-Za-zÀ-ÿ].*[A-Za-zÀ-ÿ]/.test(e.bairro) ? '' : 'Bairro inválido.';
      case 'cidade':
        return e.cidade.trim().length >= 2 ? '' : 'Informe a cidade.';
      case 'uf':
        return this.ufs.includes(e.uf) ? '' : 'Escolha a UF.';
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
    let e = this.pedido.endereco;
    this.pedido.cliente.nome = this.pedido.cliente.nome.trim();
    e.logradouro = e.logradouro.trim();
    e.bairro = e.bairro.trim();
    e.cidade = e.cidade.trim();
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
