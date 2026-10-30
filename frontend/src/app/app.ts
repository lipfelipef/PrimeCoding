import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private router: Router) {
    this.router.events.subscribe((evento) => {
      if (evento instanceof NavigationEnd) {
        this.noPainel = evento.urlAfterRedirects.startsWith('/painel');
      }
    });
  }
}