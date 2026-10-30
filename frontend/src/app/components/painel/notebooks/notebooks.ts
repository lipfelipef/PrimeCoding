import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Modelo } from '../../../entities/modelo';
import { Unidade } from '../../../entities/unidade';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';

// Cada modelo com as unidades dele logo abaixo: é o estoque inteiro numa tela
@Component({
  selector: 'app-notebooks',
  imports: [CommonModule, RouterLink],
  templateUrl: './notebooks.html'
})
export class Notebooks implements OnInit {
  modelos: Modelo[] = [];
  unidades: Unidade[] = [];
  erro = '';
  mensagem = '';
  carregou = false;

  constructor(public painel: PainelService, public loja: LojaService) {}

  ngOnInit(): void {
    this.painel.modelos().subscribe((resposta) => {
      this.modelos = resposta;
      this.carregou = true;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível carregar os modelos');
    });
    this.painel.unidades().subscribe((resposta) => {
      this.unidades = resposta;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível carregar as unidades');
    });
  }

  unidadesDo(modelo: Modelo): Unidade[] {
    return this.unidades.filter(u => u.modelo?.id == modelo.id);
  }

  // "2 na vitrine · 1 em revisão", só com as situações que existem
  resumo(modelo: Modelo): string {
    let partes: string[] = [];
    for (let situacao of ['DISPONIVEL', 'EM_REVISAO', 'RESERVADA', 'VENDIDA']) {
      let total = this.unidadesDo(modelo).filter(u => u.situacao == situacao).length;
      if (total > 0) {
        partes.push(total + ' ' + this.painel.nomeSituacao(situacao).toLowerCase());
      }
    }
    if (partes.length == 0) {
      return 'Nenhuma unidade';
    }
    return partes.join(' · ');
  }

  naVitrine(): number {
    return this.unidades.filter(u => u.situacao == 'DISPONIVEL').length;
  }

  apagar(unidade: Unidade): void {
    if (!confirm(`Apagar a unidade ${unidade.numeroSerie}?`)) {
      return;
    }
    this.erro = '';
    this.mensagem = '';
    this.painel.apagarUnidade(unidade.id).subscribe(() => {
      this.mensagem = 'Unidade ' + unidade.numeroSerie + ' apagada';
      this.unidades = this.unidades.filter(u => u.id != unidade.id);
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível apagar a unidade');
    });
  }
}
