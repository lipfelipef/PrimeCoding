import { Injectable } from '@angular/core';

// Claro ou escuro; começa pelo que o sistema usa e lembra a escolha da pessoa
@Injectable({
  providedIn: 'root'
})
export class TemaService {
  tema = document.documentElement.getAttribute('data-tema') || 'claro';

  escuro(): boolean {
    return this.tema == 'escuro';
  }

  alternar(): void {
    this.tema = this.escuro() ? 'claro' : 'escuro';
    document.documentElement.setAttribute('data-tema', this.tema);
    try {
      localStorage.setItem('primecoding.tema', this.tema);
    } catch (e) {}
  }
}
