import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemaService } from '../../../services/tema.service';

@Component({
  selector: 'app-botao-tema',
  imports: [CommonModule],
  templateUrl: './botao-tema.html'
})
export class BotaoTema {
  constructor(public tema: TemaService) {}
}
