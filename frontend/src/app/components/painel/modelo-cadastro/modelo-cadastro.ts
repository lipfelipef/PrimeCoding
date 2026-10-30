import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Modelo } from '../../../entities/modelo';
import { PainelService } from '../../../services/painel.service';
import { LojaService } from '../../../services/loja.service';
import { Foto } from '../../loja/foto/foto';

// Tamanho em que a foto é gravada: 4:3, o mesmo formato da moldura da loja
const LARGURA_FOTO = 1200;
const ALTURA_FOTO = 900;
const LARGURA_MINIMA = 800;
const ALTURA_MINIMA = 600;

@Component({
  selector: 'app-modelo-cadastro',
  imports: [CommonModule, FormsModule, RouterLink, Foto],
  templateUrl: './modelo-cadastro.html'
})
export class ModeloCadastro implements OnInit {
  modelo?: Modelo;
  erro = '';
  erroFoto = '';
  avisoFoto = '';
  enviandoFoto = false;

  constructor(public painel: PainelService, public loja: LojaService, private route: ActivatedRoute,
              private router: Router, private zona: NgZone) {}

  ngOnInit(): void {
    this.painel.modelo(this.route.snapshot.paramMap.get('id')).subscribe((resposta) => {
      this.modelo = resposta;
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Modelo não encontrado');
    });
  }

  novoItem(): void {
    this.modelo?.especificacoes.push({ nome: '', valor: '' });
  }

  tirarItem(i: number): void {
    this.modelo?.especificacoes.splice(i, 1);
  }

  // Corta o centro em 4:3, reduz para 1200 x 900 e envia como JPG
  escolheuFoto(evento: Event): void {
    let campo = evento.target as HTMLInputElement;
    let arquivo = campo.files?.[0];
    campo.value = '';
    this.erroFoto = '';
    this.avisoFoto = '';
    if (!arquivo) {
      return;
    }
    if (!arquivo.type.startsWith('image/')) {
      this.erroFoto = 'Escolha um arquivo de imagem (JPG ou PNG).';
      return;
    }
    let endereco = URL.createObjectURL(arquivo);
    let imagem = new Image();
    imagem.onload = () => {
      URL.revokeObjectURL(endereco);
      let largura = imagem.naturalWidth;
      let altura = imagem.naturalHeight;
      if (largura < LARGURA_MINIMA || altura < ALTURA_MINIMA) {
        this.erroFoto = `A foto tem ${largura} x ${altura} pixels. O mínimo é ${LARGURA_MINIMA} x ${ALTURA_MINIMA}.`;
        return;
      }
      // Pega o maior retângulo 4:3 que cabe no meio da foto
      let corteLargura = largura;
      let corteAltura = Math.round(largura * 3 / 4);
      if (corteAltura > altura) {
        corteAltura = altura;
        corteLargura = Math.round(altura * 4 / 3);
      }
      let x = Math.round((largura - corteLargura) / 2);
      let y = Math.round((altura - corteAltura) / 2);
      let tela = document.createElement('canvas');
      tela.width = LARGURA_FOTO;
      tela.height = ALTURA_FOTO;
      let pincel = tela.getContext('2d')!;
      // Fundo branco para PNG com transparência não virar preto no JPG
      pincel.fillStyle = '#ffffff';
      pincel.fillRect(0, 0, LARGURA_FOTO, ALTURA_FOTO);
      pincel.imageSmoothingQuality = 'high';
      pincel.drawImage(imagem, x, y, corteLargura, corteAltura, 0, 0, LARGURA_FOTO, ALTURA_FOTO);
      // O toBlob responde fora da zona do Angular; sem o zona.run a tela não se atualiza
      tela.toBlob((foto) => this.zona.run(() => {
        if (!foto) {
          this.erroFoto = 'Não foi possível preparar a foto.';
          return;
        }
        let cortou = corteLargura != largura || corteAltura != altura;
        this.enviar(foto, `Original ${largura} x ${altura}` + (cortou ? ', cortada no centro' : '') + `, gravada em ${LARGURA_FOTO} x ${ALTURA_FOTO}`);
      }), 'image/jpeg', 0.86);
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(endereco);
      this.erroFoto = 'Não foi possível abrir essa imagem.';
    };
    imagem.src = endereco;
  }

  private enviar(foto: Blob, descricao: string): void {
    this.enviandoFoto = true;
    this.painel.enviarFoto(this.modelo!.id, foto).subscribe((resposta) => {
      this.enviandoFoto = false;
      this.modelo!.fotoVersao = resposta.fotoVersao;
      this.avisoFoto = `Foto enviada. ${descricao} (${Math.round(foto.size / 1024)} KB).`;
    }, (err) => {
      this.enviandoFoto = false;
      this.erroFoto = this.painel.mensagemErro(err, 'Não foi possível enviar a foto');
    });
  }

  removerFoto(): void {
    if (!confirm('Remover a foto deste notebook? A loja volta a mostrar a foto ilustrativa.')) {
      return;
    }
    this.erroFoto = '';
    this.painel.apagarFoto(this.modelo!.id).subscribe((resposta) => {
      this.modelo!.fotoVersao = resposta.fotoVersao;
      this.avisoFoto = 'Foto removida.';
    }, (err) => {
      this.erroFoto = this.painel.mensagemErro(err, 'Não foi possível remover a foto');
    });
  }

  gravar(): void {
    this.erro = '';
    this.painel.atualizarModelo(this.modelo!).subscribe(() => {
      this.router.navigate(['/painel/notebooks']);
    }, (err) => {
      this.erro = this.painel.mensagemErro(err, 'Não foi possível gravar o modelo');
    });
  }
}
