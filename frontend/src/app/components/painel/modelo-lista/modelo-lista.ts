import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Modelo } from '../../../entities/modelo';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-modelo-lista',
  imports: [CommonModule, RouterLink],
  templateUrl: './modelo-lista.html'
})
export class ModeloLista implements OnInit {
  list: Modelo[] = [];
  erro = '';

  constructor(public painel: PainelService, public loja: LojaService) {}

  ngOnInit(): void {
    this.painel.modelos().subscribe((resposta) => {
      this.list = resposta;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível carregar os modelos');
    });
  }
}