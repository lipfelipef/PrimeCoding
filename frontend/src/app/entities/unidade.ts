import { Modelo } from './modelo';

export interface Unidade {
  id?: number;
  modelo?: Modelo;
  numeroSerie: string;
  estado: string;
  saudeBateria?: number;
  ciclosBateria?: number;
  preco?: number;
  situacao: string;
  dataEntrada?: string;
  observacao?: string;
}