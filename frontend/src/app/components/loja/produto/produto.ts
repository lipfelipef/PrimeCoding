import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Modelo, Upgrade } from '../../../entities/modelo';
import { KitSetup } from '../../../entities/kit-setup';
import { Unidade } from '../../../entities/unidade';
import { LojaService } from '../../../services/loja.service';
import { CompraService } from '../../../services/compra.service';
import { Foto } from '../foto/foto';
import { FOTOS_PADRAO, FotoPadrao } from '../../../entities/foto-padrao';

@Component({
  selector: 'app-produto',
  imports: [CommonModule, RouterLink, Foto],
  templateUrl: './produto.html'
})
export class Produto implements OnInit {
  modelo?: Modelo;
  unidades: Unidade[] = [];
  kits: KitSetup[] = [];
  unidade?: Unidade;
  kit?: KitSetup;
  upgrade?: Upgrade;
  naoAchou = false;
  aviso = '';

  constructor(public loja: LojaService, private compra: CompraService, private route: ActivatedRoute,
              private router: Router, private title: Title) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.carregar(params.get('linha') || '');
    });
    this.loja.kits().subscribe((resposta) => {
      this.kits = resposta;
    });
  }

  carregar(linha: string): void {
    this.modelo = undefined;
    this.unidade = undefined;
    this.upgrade = undefined;
    this.naoAchou = false;
    this.loja.modeloPorLinha(linha).subscribe((resposta) => {
      this.modelo = resposta;
      this.title.setTitle(this.loja.nomeCompleto(resposta) + ' seminovo | PrimeCoding');
      this.loja.unidadesDisponiveis().subscribe((lista) => {
        this.unidades = lista.filter(u => u.modelo?.id == resposta.id);
        // Já deixa marcada a unidade com a melhor bateria
        if (this.unidades.length > 0) {
          this.unidade = this.unidades[0];
          for (let u of this.unidades) {
            if ((u.saudeBateria || 0) > (this.unidade.saudeBateria || 0)) {
              this.unidade = u;
            }
          }
        }
      });
    }, (err) => {
      this.naoAchou = true;
    });
  }

  total(): number {
    let valor = this.unidade?.preco || this.modelo?.preco || 0;
    if (this.upgrade) {
      valor += this.upgrade.preco;
    }
    return valor;
  }

  diasPreparo(): number {
    return 2 + (this.upgrade?.diasExtras || 0);
  }

  continuar(): void {
    this.aviso = '';
    if (!this.unidade) {
      this.aviso = 'Escolha uma unidade.';
      return;
    }
    if (!this.kit) {
      this.aviso = 'Escolha o kit de setup que vem instalado.';
      return;
    }
    this.compra.escolher(this.modelo!, this.unidade, this.kit, this.upgrade);
    this.router.navigate(['/finalizar']);
  }

  fotoPadrao(): FotoPadrao | undefined {
    return FOTOS_PADRAO[this.modelo?.linha || ''];
  }

  mensagemEsgotado(): string {
    return `Olá! Quero ser avisado quando chegar o ${this.loja.nomeCompleto(this.modelo)}.`;
  }
}