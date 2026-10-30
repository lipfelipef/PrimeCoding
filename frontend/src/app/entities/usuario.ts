export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  token?: string;
  ultimoAcesso?: string;
}