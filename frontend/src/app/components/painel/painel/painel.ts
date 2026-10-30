import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PainelService } from '../../../services/painel.service';
import { BotaoTema } from '../../loja/botao-tema/botao-tema';

// Moldura do painel: sem login mostra o formulário de entrada
@Component({
  selector: 'app-painel',
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, BotaoTema],
  templateUrl: './painel.html'
})
export class Painel {
  email = '';
  senha = '';
  erro = '';

  constructor(public painel: PainelService) {}

  entrar(): void {
    this.erro = '';
    if (this.email == '' || this.senha == '') {
      this.erro = 'Preencha o e-mail e a senha.';
      return;
    }
    this.painel.login(this.email, this.senha).subscribe((usuario) => {
      this.painel.entrou(usuario);
      this.senha = '';
    }, (err) => {
      if (err.status == 0) {
        this.erro = 'Servidor fora do ar.';
      } else {
        this.erro = 'E-mail ou senha inválidos.';
      }
      this.senha = '';
    });
  }
}