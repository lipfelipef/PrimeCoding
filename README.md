# PrimeCoding

E-commerce acadêmico de um revendedor autônomo de notebooks seminovos revisados. São três linhas, Entrada, Intermediário e Pro, e cada unidade é vendida com fotos reais, bateria conferida, kit de setup para programar e 90 dias de garantia. A venda é fechada pelo WhatsApp.

Projeto de Análise e Desenvolvimento de Sistemas, Senac.

## Grupo 06

- PAULO HENRIQUE DE CASTRO LIMA
- EDUARDO ALMEIDA OLIVEIRA
- FELIPE FARIA DA FONSECA
- JOSE VICTOR SOUZA DE ABREU

## Os três modelos

| Linha | Notebook | Preço | No PIX |
|---|---|---|---|
| Entrada | ThinkPad T14 Gen 2, i5, 16 GB, SSD de 512 GB | R$ 2.899,00 | R$ 2.609,10 |
| Intermediário | Dell Latitude 5430, i7, 32 GB, SSD de 1 TB | R$ 4.999,00 | R$ 4.499,10 |
| Pro | MacBook Air 13 (M2), 16 GB, SSD de 512 GB | R$ 6.999,00 | R$ 6.299,10 |

## Entregáveis

| Item | Link | Arquivos |
|---|---|---|
| Autônomo | Revendedor autônomo de notebooks | |
| Dor do cliente | | [01-dor-do-cliente](01-dor-do-cliente) |
| Diagrama de casos de uso | [Google Drive](https://drive.google.com/drive/folders/1TZ2HCe_pexSKLUiY1ToWxg59dEAg-uNk?usp=sharing) | [02-caso-de-uso](02-caso-de-uso) |
| Regras de negócio | [Google Drive](https://drive.google.com/drive/folders/1e4BlxpXMr1VX2s94HKxcQLay49bkRQP4?usp=sharing) | [03-regras-de-negocio](03-regras-de-negocio) |
| Modelagem de dados | [UniModeler](https://app.unimodeler.dev/workspace/shareLink/pv0phwbokkj0i6xflar2ssbsikjx4h) | [04-modelagem-de-dados](04-modelagem-de-dados) |
| Prototipação | [Figma](https://www.figma.com/design/SkmBoNKMRvz39hk4UZcHGY/PrimeCoding---Prototipo) | [05-prototipo](05-prototipo) |

O link do UniModeler abre para quem estiver logado no site.

## Docker e deploy

O projeto roda em Docker. O `docker-compose.yml` fica em [deploy](deploy) e o `Dockerfile` do front-end em [frontend](frontend). Hoje o container publica as telas do protótipo; o site, a API e o banco entram como novos serviços no mesmo compose.

Publicado na Azure: http://172.195.104.176:4200

Para rodar na sua máquina, com o Docker instalado:

```bash
cd deploy
docker compose up -d --build
```

e abra http://localhost:4200. O passo a passo para publicar numa VM da Azure está em [deploy/README.md](deploy/README.md).

## Como abrir os arquivos

- `.docx`: no Word ou no Google Docs.
- `.drawio`: em [app.diagrams.net](https://app.diagrams.net), no menu Arquivo > Abrir.
- `.sql`: script para MySQL 8, com os três modelos, os kits, os upgrades e as unidades de exemplo.
- `.js`: o modelo de dados no formato do UniModeler.
- `.html`: as 14 telas do protótipo, direto no navegador.
