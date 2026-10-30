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

  constructor(private http: HttpClient) {}

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
    return `https://wa.me/${environment.whatsappLoja}?text=${encodeURIComponent(mensagem)}`;
  }
}