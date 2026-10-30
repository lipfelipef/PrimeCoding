export interface Especificacao {
  id?: number;
  nome: string;
  valor: string;
  ordem?: number;
}

export interface Upgrade {
  id?: number;
  nome: string;
  preco: number;
  diasExtras?: number;
}

export interface Modelo {
  id?: number;
  linha: string;
  nome: string;
  marca: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  imagemUrl?: string;
  especificacoes: Especificacao[];
  upgrades: Upgrade[];
}