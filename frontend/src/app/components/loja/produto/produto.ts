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
  upgrades: Upgrade[] = [];
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
    this.upgrades = [];
    this.naoAchou = false;
    this.loja.modeloPorLinha(linha).subscribe((resposta) => {
      this.modelo = resposta;
      this.title.setTitle(this.loja.nomeCompleto(resposta) + ' seminovo | PrimeCoding');
      this.loja.unidadesDisponiveis().subscribe((lista) => {
        // Mostra só as 3 de bateria melhor; quando uma sai, a próxima do estoque aparece
        this.unidades = lista.filter(u => u.modelo?.id == resposta.id)
          .sort((a, b) => (b.saudeBateria || 0) - (a.saudeBateria || 0))
          .slice(0, 3);
        // Já deixa marcada a unidade com a melhor bateria
        if (this.unidades.length > 0) {
          this.unidade = this.unidades[0];
        }
      });
    }, (err) => {
      this.naoAchou = true;
    });
  }

  total(): number {
    let valor = this.unidade?.preco || this.modelo?.preco || 0;
    for (const up of this.upgrades) {
      valor += up.preco;
    }
    return valor;
  }

  diasPreparo(): number {
    return 2 + this.upgrades.reduce((dias, up) => dias + (up.diasExtras || 0), 0);
  }

  temUpgrade(up: Upgrade): boolean {
    return this.upgrades.some(u => u.id == up.id);
  }

  // Liga e desliga cada upgrade; dá para levar mais de um
  alternarUpgrade(up: Upgrade): void {
    if (this.temUpgrade(up)) {
      this.upgrades = this.upgrades.filter(u => u.id != up.id);
    } else {
      this.upgrades = [...this.upgrades, up];
    }
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
    this.compra.escolher(this.modelo!, this.unidade, this.kit, this.upgrades);
    this.router.navigate(['/finalizar']);
  }

  fotoPadrao(): FotoPadrao | undefined {
    return FOTOS_PADRAO[this.modelo?.linha || ''];
  }

  mensagemEsgotado(): string {
    return `Olá! Quero ser avisado quando chegar o ${this.loja.nomeCompleto(this.modelo)}.`;
  }
}