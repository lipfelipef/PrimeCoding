import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Unidade } from '../../../entities/unidade';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-unidade-lista',
  imports: [CommonModule, RouterLink],
  templateUrl: './unidade-lista.html'
})
export class UnidadeLista implements OnInit {
  list: Unidade[] = [];
  erro = '';
  mensagem = '';
  carregou = false;

  constructor(public painel: PainelService, public loja: LojaService) {}

  ngOnInit(): void {
    this.painel.unidades().subscribe((resposta) => {
      this.list = resposta;
      this.carregou = true;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível carregar as unidades');
    });
  }

  naVitrine(): number {
    return this.list.filter(u => u.situacao == 'DISPONIVEL').length;
  }

  apagar(unidade: Unidade): void {
    if (!confirm(`Apagar a unidade ${unidade.numeroSerie}?`)) {
      return;
    }
    this.erro = '';
    this.painel.apagarUnidade(unidade.id).subscribe(() => {
      this.mensagem = 'Unidade apagada';
      this.list = this.list.filter(u => u.id != unidade.id);
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível apagar a unidade');
    });
  }
}