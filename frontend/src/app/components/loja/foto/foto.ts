import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Foto da unidade; enquanto não tem foto, desenha o notebook na cor de cada linha
@Component({
  selector: 'app-foto',
  imports: [CommonModule],
  templateUrl: './foto.html'
})
export class Foto {
  @Input() linha?: string;
  @Input() imagemUrl?: string;
  @Input() alt = '';
}