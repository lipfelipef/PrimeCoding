import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { LojaService } from '../../../services/loja.service';
import { BotaoTema } from '../botao-tema/botao-tema';

@Component({
  selector: 'app-cabecalho',
  imports: [CommonModule, FormsModule, RouterLink, BotaoTema],
  templateUrl: './cabecalho.html'
})
export class Cabecalho {
  busca = '';

  constructor(public loja: LojaService, private router: Router) {
    // A caixa mostra o que foi buscado e se esvazia fora da busca
    this.router.events.subscribe((evento) => {
      if (evento instanceof NavigationEnd) {
        this.busca = this.router.parseUrl(evento.urlAfterRedirects).queryParams['busca'] || '';
      }
    });
  }

  // Os resultados aparecem na vitrine da página inicial
  buscar(): void {
    let termo = this.busca.trim();
    if (termo == '') {
      this.router.navigate(['/']);
      return;
    }
    this.router.navigate(['/'], { queryParams: { busca: termo }, fragment: 'busca' });
  }
}
