import { Component } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Cabecalho } from './components/loja/cabecalho/cabecalho';
import { Rodape } from './components/loja/rodape/rodape';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Cabecalho, Rodape],
  templateUrl: './app.html'
})
export class App {
  // O painel tem o próprio topo; cabeçalho e rodapé são só da loja
  noPainel = false;

  constructor(private router: Router, scroller: ViewportScroller) {
    this.router.events.subscribe((evento) => {
      if (evento instanceof NavigationEnd) {
        this.noPainel = evento.urlAfterRedirects.startsWith('/painel');
      }
    });
    // Ao rolar até uma âncora (#como-funciona), para logo abaixo do cabeçalho fixo,
    // que no celular é mais alto porque a busca desce para uma segunda linha
    scroller.setOffset(() => {
      let cabecalho = document.querySelector('.cabecalho');
      if (!cabecalho) {
        return [0, 0];
      }
      return [0, Math.ceil(cabecalho.getBoundingClientRect().height) + 16];
    });
  }
}
