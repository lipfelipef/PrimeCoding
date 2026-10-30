import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Modelo } from '../entities/modelo';
import { KitSetup } from '../entities/kit-setup';
import { Unidade } from '../entities/unidade';
import { Pedido } from '../entities/pedido';

// Tudo o que a vitrine usa: não precisa de login
@Injectable({
  providedIn: 'root'
})
export class LojaService {
  baseUrl = environment.baseUrl;
  // Vem da API (que lê do .env); o fictício só vale até a resposta chegar
  whatsappLoja = '5511900000000';

  constructor(private http: HttpClient) {
    this.http.get<{ whatsapp: string }>(`${this.baseUrl}/loja`).subscribe((resposta) => {
      this.whatsappLoja = resposta.whatsapp;
    });
  }

  modelos(): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.baseUrl}/modelos`);
  }

  modeloPorLinha(linha: string): Observable<Modelo> {
    return this.http.get<Modelo>(`${this.baseUrl}/modelos/linha/${linha}`);
  }

  kits(): Observable<KitSetup[]> {
    return this.http.get<KitSetup[]>(`${this.baseUrl}/kits`);
  }

  unidadesDisponiveis(): Observable<Unidade[]> {
    return this.http.get<Unidade[]>(`${this.baseUrl}/unidades/disponiveis`);
  }

  fazerPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.baseUrl}/pedidos`, pedido);
  }

  // Cada palavra digitada precisa aparecer no nome, marca, linha, descrição ou ficha.
  // Sem espaços, acentos e maiúsculas: "32gb" acha "32 GB" e "intermediario" acha "Intermediário".
  buscar(modelos: Modelo[], termo: string): Modelo[] {
    let palavras = this.normalizar(termo).split(' ').filter(p => p != '');
    return modelos.filter((modelo) => {
      let texto = [modelo.nome, modelo.marca, this.nomeLinha(modelo.linha), modelo.descricao]
        .concat(modelo.especificacoes.map(e => e.valor)).join(' ');
      let semEspaco = this.normalizar(texto).replace(/ /g, '');
      return palavras.every(p => semEspaco.includes(p));
    });
  }

  private normalizar(texto: string): string {
    return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  // ViaCEP: serviço gratuito que devolve o endereço do CEP (só o CEP sai do site)
  buscarCep(cep: string): Observable<any> {
    return this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`);
  }

  dinheiro(valor?: number): string {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // 10% de desconto no PIX (RN06)
  precoPix(valor: number): number {
    return Math.round(valor * 90) / 100;
  }

  // Até 12x sem juros no cartão (RN06)
  parcela(valor: number, vezes: number): number {
    return Math.floor((valor / vezes) * 100) / 100;
  }

  nomeLinha(linha?: string): string {
    if (linha == 'ENTRADA') {
      return 'Entrada';
    }
    if (linha == 'INTERMEDIARIO') {
      return 'Intermediário';
    }
    return 'Pro';
  }

  // Endereço da página do modelo: /notebook/entrada, /notebook/intermediario, /notebook/pro
  slug(linha?: string): string {
    return (linha || '').toLowerCase();
  }

  nomeCompleto(modelo?: Modelo): string {
    if (!modelo) {
      return '';
    }
    return modelo.marca + ' ' + modelo.nome;
  }

  // "Intel Core i5-1145G7, 4 núcleos" vira "Intel Core i5-1145G7"
  especificacao(modelo: Modelo, nome: string): string {
    for (let e of modelo.especificacoes) {
      if (e.nome == nome) {
        return e.valor.split(',')[0].split('(')[0].trim();
      }
    }
    return '';
  }

  resumo(modelo: Modelo): string {
    let chip = this.especificacao(modelo, 'Processador') || this.especificacao(modelo, 'Chip');
    let memoria = this.especificacao(modelo, 'Memória').replace(' DDR4', '').replace(' unificada', '');
    let ssd = this.especificacao(modelo, 'Armazenamento').replace('SSD NVMe de ', 'SSD ').replace('SSD de ', 'SSD ');
    return [chip, memoria, ssd].filter(t => t != '').join(' · ');
  }

  linkWhatsapp(mensagem: string): string {
    return `https://wa.me/${this.whatsappLoja}?text=${encodeURIComponent(mensagem)}`;
  }
}