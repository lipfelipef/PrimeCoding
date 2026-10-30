import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FOTOS_PADRAO } from '../../../entities/foto-padrao';

// Foto do modelo; sem foto cadastrada usa a foto padrão da linha e, sem ela, desenha o notebook
@Component({
  selector: 'app-foto',
  imports: [CommonModule],
  templateUrl: './foto.html'
})
export class Foto {
  @Input() linha?: string;
  @Input() imagemUrl?: string;
  @Input() alt = '';
  falhou = false;

  endereco(): string {
    if (this.imagemUrl) {
      return this.imagemUrl;
    }
    return FOTOS_PADRAO[this.linha || '']?.url || '';
  }
}
