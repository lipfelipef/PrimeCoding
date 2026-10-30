import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Modelo } from '../../../entities/modelo';
import { KitSetup } from '../../../entities/kit-setup';
import { Unidade } from '../../../entities/unidade';
import { LojaService } from '../../../services/loja.service';
import { Foto } from '../foto/foto';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, Foto],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  modelos: Modelo[] = [];
  kits: KitSetup[] = [];
  unidades: Unidade[] = [];
  carregando = true;
  erro = '';
  busca = '';

  constructor(public loja: LojaService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.busca = params.get('busca') || '';
    });
    this.loja.modelos().subscribe((resposta) => {
      this.modelos = resposta;
      this.carregando = false;
    }, (err) => {
      this.carregando = false;
      this.erro = 'Não foi possível carregar os notebooks. Tente de novo em instantes.';
    });
    this.loja.unidadesDisponiveis().subscribe((resposta) => {
      this.unidades = resposta;
    });
    this.loja.kits().subscribe((resposta) => {
      this.kits = resposta;
    });
  }

  // Sem busca mostra os três; com busca, só os que batem
  vitrine(): Modelo[] {
    if (this.busca == '') {
      return this.modelos;
    }
    return this.loja.buscar(this.modelos, this.busca);
  }

  unidadesDo(modelo: Modelo): Unidade[] {
    return this.unidades.filter(u => u.modelo?.id == modelo.id);
  }

  // Estado B sai mais barato, então o card mostra o menor preço disponível
  menorPreco(modelo: Modelo): number {
    let menor = modelo.preco;
    for (let u of this.unidadesDo(modelo)) {
      if (u.preco && u.preco < menor) {
        menor = u.preco;
      }
    }
    return menor;
  }

  temVariosPrecos(modelo: Modelo): boolean {
    let lista = this.unidadesDo(modelo);
    return lista.some(u => u.preco != lista[0].preco);
  }

  melhorBateria(modelo: Modelo): number {
    let melhor = 0;
    for (let u of this.unidadesDo(modelo)) {
      if ((u.saudeBateria || 0) > melhor) {
        melhor = u.saudeBateria || 0;
      }
    }
    return melhor;
  }
}