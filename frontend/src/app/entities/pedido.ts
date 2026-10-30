import { KitSetup } from './kit-setup';
import { Upgrade } from './modelo';
import { Unidade } from './unidade';
import { Usuario } from './usuario';

export interface Cliente {
  id?: number;
  nome: string;
  whatsapp: string;
  email?: string;
  documento: string;
}

export interface Endereco {
  id?: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ItemPedido {
  id?: number;
  unidade: Unidade;
  kit: KitSetup;
  upgrade?: Upgrade;
  precoUnidade?: number;
  precoUpgrade?: number;
}

export interface HistoricoStatus {
  id?: number;
  usuario?: Usuario;
  status: string;
  dataHora?: string;
  observacao?: string;
}

export interface Pedido {
  id?: number;
  codigo?: string;
  cliente: Cliente;
  endereco: Endereco;
  dataPedido?: string;
  formaPagamento: string;
  parcelas: number;
  subtotal?: number;
  desconto?: number;
  total?: number;
  status?: string;
  prazoPagamento?: string;
  itens: ItemPedido[];
  historico?: HistoricoStatus[];
}