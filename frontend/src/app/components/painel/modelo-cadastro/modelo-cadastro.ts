import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Modelo } from '../../../entities/modelo';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-modelo-cadastro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './modelo-cadastro.html'
})
export class ModeloCadastro implements OnInit {
  modelo?: Modelo;
  erro = '';

  constructor(public painel: PainelService, public loja: LojaService, private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit(): void {
    this.painel.modelo(this.route.snapshot.paramMap.get('id')).subscribe((resposta) => {
      this.modelo = resposta;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Modelo não encontrado');
    });
  }

  gravar(): void {
    this.erro = '';
    this.painel.atualizarModelo(this.modelo!).subscribe(() => {
      this.router.navigate(['/painel/modelos']);
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível gravar o modelo');
    });
  }
}