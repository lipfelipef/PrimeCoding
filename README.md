# PrimeCoding

E-commerce acadêmico de um revendedor autônomo de notebooks seminovos revisados. São três linhas, Entrada, Intermediário e Pro, e cada unidade é vendida com fotos reais, bateria conferida, kit de setup para programar e 90 dias de garantia. A venda é fechada pelo WhatsApp.

**Site no ar: https://primecoding.com.br**

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

## O site

| Pasta | O que tem |
|---|---|
| [backend](backend) | API em Spring Boot 4 e Java 21: modelos, unidades, kits, pedidos e login do painel |
| [frontend](frontend) | Site em Angular 21: vitrine, página de cada notebook, finalizar pedido e painel do revendedor |
| [deploy](deploy) | `docker-compose.yml` com MySQL 8.4, API, site e Caddy (HTTPS) |

### Loja

- Vitrine com os três notebooks, preço no PIX e em 12x, e busca por modelo, processador ou memória
- Página de cada notebook: escolha da unidade (estado A ou B, saúde da bateria), do kit de setup grátis e do upgrade
- Finalizar pedido com o endereço preenchido pelo CEP ([ViaCEP](https://viacep.com.br)) e validação em cada campo
- O pedido reserva a unidade por 48 h e termina no WhatsApp, com a mensagem já pronta; sem pagamento no prazo, a reserva cai sozinha
- Modo claro e escuro

### Painel do revendedor (`/painel`)

- **Pedidos:** cada etapa diz o que fazer e o botão registra o que aconteceu na conversa ("Pagamento recebido", "Enviei"...), com histórico e atalho para o WhatsApp do cliente
- **Notebooks:** as três linhas com as unidades de cada uma; dá para trocar o notebook de uma linha (marca, nome, preço, ficha técnica e foto) e cadastrar unidades
- A foto enviada é cortada em 4:3 e reduzida para 1200 x 900 no navegador

Login de demonstração: `admin@admin.com` com a senha `admin`.

O banco segue o modelo de dados de [04-modelagem-de-dados](04-modelagem-de-dados), com três diferenças que o site pediu: a tabela `foto_modelo` guarda a foto enviada pelo painel, o modelo ganhou a coluna `foto_versao`, e `item_pedido.id_unidade` não é única, para a unidade de um pedido cancelado poder ser vendida de novo.

As fotos ilustrativas dos notebooks são do [Wikimedia Commons](https://commons.wikimedia.org), com licença livre, e o crédito aparece na página de cada notebook.

### Rodar sem Docker

Com o Java 21 e o Node instalados, em dois terminais:

```bash
cd backend
./mvnw spring-boot:run
```

```bash
cd frontend
npm install
npm start
```

Abra http://localhost:4200. Sem Docker a API usa um banco H2 em memória, que volta aos dados de exemplo toda vez que reinicia.

### Rodar com Docker

```bash
cd deploy
cp .env.example .env
docker compose up -d --build
```

Troque as senhas no `.env` antes de subir. O passo a passo para publicar numa VM da Azure, com domínio próprio e HTTPS, está em [deploy/README.md](deploy/README.md).

Publicado numa VM da Azure: https://primecoding.com.br (também em http://172.195.104.176:4200)

## Como abrir os arquivos

- `.docx`: no Word ou no Google Docs.
- `.drawio`: em [app.diagrams.net](https://app.diagrams.net), no menu Arquivo > Abrir.
- `.sql`: script para MySQL 8, com os três modelos, os kits, os upgrades e as unidades de exemplo.
- `.js`: o modelo de dados no formato do UniModeler.
- `.html`: as 14 telas do protótipo, direto no navegador. O site real seguiu outro visual; o protótipo ficou como registro do planejamento.
