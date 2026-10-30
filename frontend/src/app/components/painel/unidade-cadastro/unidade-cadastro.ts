import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Unidade } from '../../../entities/unidade';
import { Modelo } from '../../../entities/modelo';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';

@Component({
  selector: 'app-unidade-cadastro',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './unidade-cadastro.html'
})
export class UnidadeCadastro implements OnInit {
  unidade: Unidade = { numeroSerie: '', estado: 'A', situacao: 'EM_REVISAO', saudeBateria: 100, ciclosBateria: 0 };
  modelos: Modelo[] = [];
  idModelo?: number;
  editando = false;
  erro = '';

  constructor(public painel: PainelService, public loja: LojaService, private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit(): void {
    this.painel.modelos().subscribe((resposta) => {
      this.modelos = resposta;
      // "Nova unidade" de um modelo já chega com ele escolhido
      let doModelo = this.route.snapshot.queryParamMap.get('modelo');
      if (doModelo && !this.editando) {
        this.idModelo = Number(doModelo);
        this.escolheuModelo();
      }
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível carregar os modelos');
    });
    let id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.painel.unidade(id).subscribe((resposta) => {
        this.unidade = resposta;
        this.idModelo = resposta.modelo?.id;
      }, (err) => {
        this.erro = this.painel.mensagemErro(err, 'Unidade não encontrada');
      });
    }
  }

  // Num pedido a situação só muda pelo próprio pedido
  emPedido(): boolean {
    return this.unidade.situacao == 'RESERVADA' || this.unidade.situacao == 'VENDIDA';
  }

  // Ao escolher o modelo numa unidade nova, já sugere o preço dele
  escolheuModelo(): void {
    let modelo = this.modelos.find(m => m.id == this.idModelo);
    if (modelo && !this.editando && !this.unidade.preco) {
      this.unidade.preco = modelo.preco;
    }
  }

  gravar(): void {
    this.erro = '';
    if (!this.idModelo) {
      this.erro = 'Escolha o modelo.';
      return;
    }
    this.unidade.modelo = this.modelos.find(m => m.id == this.idModelo);
    let pedido = this.editando ? this.painel.atualizarUnidade(this.unidade) : this.painel.cadastrarUnidade(this.unidade);
    pedido.subscribe(() => {
      this.router.navigate(['/painel/notebooks']);
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível gravar a unidade');
    });
  }
}