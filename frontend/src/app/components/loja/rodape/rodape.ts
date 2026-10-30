import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LojaService } from '../../../services/loja.service';
import { FOTOS_PADRAO } from '../../../entities/foto-padrao';

@Component({
  selector: 'app-rodape',
  imports: [CommonModule, RouterLink],
  templateUrl: './rodape.html'
})
export class Rodape {
  ano = new Date().getFullYear();
  fotos = Object.values(FOTOS_PADRAO);

  constructor(public loja: LojaService) {}
}
