import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Modelo } from '../../../entities/modelo';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-cabecalho',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cabecalho.html'
})
export class Cabecalho implements OnInit {
  modelos: Modelo[] = [];
  busca = '';
  semResultado = '';

  constructor(public loja: LojaService, private router: Router) {}

  ngOnInit(): void {
    this.loja.modelos().subscribe((resposta) => {
      this.modelos = resposta;
    });
  }

  // Procura no nome, na marca, na linha e na ficha técnica dos modelos
  buscar(): void {
    let termo = this.normalizar(this.busca);
    this.semResultado = '';
    if (termo == '') {
      return;
    }
    for (let modelo of this.modelos) {
      let texto = modelo.nome + ' ' + modelo.marca + ' ' + this.loja.nomeLinha(modelo.linha);
      for (let e of modelo.especificacoes) {
        texto += ' ' + e.valor;
      }
      if (this.normalizar(texto).includes(termo)) {
        this.router.navigate(['/notebook', this.loja.slug(modelo.linha)]);
        this.busca = '';
        return;
      }
    }
    this.semResultado = `Nenhum notebook com "${this.busca}". Tente i5, 32 GB, Mac ou Dell.`;
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}