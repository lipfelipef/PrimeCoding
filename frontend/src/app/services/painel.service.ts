import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Usuario } from '../entities/usuario';
import { Pedido } from '../entities/pedido';
import { Unidade } from '../entities/unidade';
import { Modelo } from '../entities/modelo';

// Rotas do painel do revendedor: todas mandam o token do login
@Injectable({
  providedIn: 'root'
})
export class PainelService {
  baseUrl = environment.baseUrl;
  usuarioLogado?: Usuario;
  fluxo = ['AGUARDANDO_ATENDIMENTO', 'AGUARDANDO_PAGAMENTO', 'EM_PREPARACAO', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE'];

  constructor(private http: HttpClient) {
    let salvo = this.lerSessao();
    if (salvo) {
      this.usuarioLogado = salvo;
    }
  }

  login(email: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/usuarios/login`, { email: email, senha: senha });
  }

  entrou(usuario: Usuario): void {
    this.usuarioLogado = usuario;
    try {
      localStorage.setItem('primecoding.painel', JSON.stringify(usuario));
    } catch (e) {}
  }

  sair(): void {
    this.http.post(`${this.baseUrl}/usuarios/logout`, null, { headers: this.headers() }).subscribe({ error: () => {} });
    this.esquecer();
  }

  // Token vencido (o servidor reiniciou, por exemplo): volta para o login
  esquecer(): void {
    this.usuarioLogado = undefined;
    try {
      localStorage.removeItem('primecoding.painel');
    } catch (e) {}
  }

  pedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/pedidos`, { headers: this.headers() });
  }

  pedido(id: any): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/pedidos/${id}`, { headers: this.headers() });
  }

  mudarStatus(id: any, status: string, observacao: string): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.baseUrl}/pedidos/${id}/status`, { status: status, observacao: observacao },
      { headers: this.headers() });
  }

  unidades(): Observable<Unidade[]> {
    return this.http.get<Unidade[]>(`${this.baseUrl}/unidades`, { headers: this.headers() });
  }

  unidade(id: any): Observable<Unidade> {
    return this.http.get<Unidade>(`${this.baseUrl}/unidades/${id}`, { headers: this.headers() });
  }

  cadastrarUnidade(unidade: Unidade): Observable<Unidade> {
    return this.http.post<Unidade>(`${this.baseUrl}/unidades`, unidade, { headers: this.headers() });
  }

  atualizarUnidade(unidade: Unidade): Observable<Unidade> {
    return this.http.put<Unidade>(`${this.baseUrl}/unidades/${unidade.id}`, unidade, { headers: this.headers() });
  }

  apagarUnidade(id: any): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/unidades/${id}`, { headers: this.headers() });
  }

  modelos(): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.baseUrl}/modelos/todos`, { headers: this.headers() });
  }

  modelo(id: any): Observable<Modelo> {
    return this.http.get<Modelo>(`${this.baseUrl}/modelos/${id}`, { headers: this.headers() });
  }

  atualizarModelo(modelo: Modelo): Observable<Modelo> {
    return this.http.put<Modelo>(`${this.baseUrl}/modelos/${modelo.id}`, modelo, { headers: this.headers() });
  }

  enviarFoto(id: any, foto: Blob): Observable<Modelo> {
    let dados = new FormData();
    dados.append('foto', foto, 'foto.jpg');
    return this.http.post<Modelo>(`${this.baseUrl}/modelos/${id}/foto`, dados, { headers: this.headers() });
  }

  apagarFoto(id: any): Observable<Modelo> {
    return this.http.delete<Modelo>(`${this.baseUrl}/modelos/${id}/foto`, { headers: this.headers() });
  }

  proximoStatus(status?: string): string {
    let i = this.fluxo.indexOf(status || '');
    if (i < 0 || i == this.fluxo.length - 1) {
      return '';
    }
    return this.fluxo[i + 1];
  }

  nomeStatus(status?: string): string {
    let nomes: any = {
      AGUARDANDO_ATENDIMENTO: 'Aguardando atendimento',
      AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
      EM_PREPARACAO: 'Em preparação',
      PRONTO_PARA_ENVIO: 'Pronto para envio',
      ENVIADO: 'Enviado',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado'
    };
    return nomes[status || ''] || status || '';
  }

  nomeSituacao(situacao?: string): string {
    let nomes: any = { EM_REVISAO: 'Em revisão', DISPONIVEL: 'Na vitrine', RESERVADA: 'Reservada', VENDIDA: 'Vendida' };
    return nomes[situacao || ''] || situacao || '';
  }

  mensagemErro(err: any, padrao: string): string {
    if (err.status == 401) {
      this.esquecer();
      return 'Sua sessão terminou. Entre de novo.';
    }
    if (err.status == 0) {
      return 'Servidor fora do ar.';
    }
    if (err.error && err.error.message) {
      return err.error.message;
    }
    return padrao;
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: this.usuarioLogado?.token || '' });
  }

  private lerSessao(): Usuario | undefined {
    try {
      let texto = localStorage.getItem('primecoding.painel');
      if (texto) {
        return JSON.parse(texto);
      }
    } catch (e) {}
    return undefined;
  }
}