import { Routes } from '@angular/router';
import { Home } from './components/loja/home/home';
import { Produto } from './components/loja/produto/produto';
import { Finalizar } from './components/loja/finalizar/finalizar';
import { PedidoFeito } from './components/loja/pedido-feito/pedido-feito';
import { Painel } from './components/painel/painel/painel';
import { PedidoLista } from './components/painel/pedido-lista/pedido-lista';
import { PedidoDetalhe } from './components/painel/pedido-detalhe/pedido-detalhe';
import { UnidadeCadastro } from './components/painel/unidade-cadastro/unidade-cadastro';
import { Notebooks } from './components/painel/notebooks/notebooks';
import { ModeloCadastro } from './components/painel/modelo-cadastro/modelo-cadastro';

export const routes: Routes = [
  { path: '', component: Home, title: 'PrimeCoding | Notebooks seminovos revisados para quem programa' },
  { path: 'notebook/:linha', component: Produto },
  { path: 'finalizar', component: Finalizar, title: 'Finalizar pedido | PrimeCoding' },
  { path: 'pedido-feito', component: PedidoFeito, title: 'Pedido reservado | PrimeCoding' },
  {
    path: 'painel', component: Painel, title: 'Painel do revendedor | PrimeCoding',
    children: [
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
      { path: 'pedidos', component: PedidoLista },
      { path: 'pedidos/:id', component: PedidoDetalhe },
      { path: 'notebooks', component: Notebooks },
      { path: 'unidades', redirectTo: 'notebooks', pathMatch: 'full' },
      { path: 'unidades/nova', component: UnidadeCadastro },
      { path: 'unidades/:id', component: UnidadeCadastro },
      { path: 'modelos', redirectTo: 'notebooks', pathMatch: 'full' },
      { path: 'modelos/:id', component: ModeloCadastro }
    ]
  },
  { path: '**', redirectTo: '' }
];