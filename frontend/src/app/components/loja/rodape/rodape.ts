import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-rodape',
  imports: [RouterLink],
  templateUrl: './rodape.html'
})
export class Rodape {
  ano = new Date().getFullYear();

  constructor(public loja: LojaService) {}
}
