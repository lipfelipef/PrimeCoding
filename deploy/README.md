# Deploy do PrimeCoding

Passo a passo para publicar o PrimeCoding numa VM Linux (Ubuntu) na Azure, usando Docker Compose.

Ao final, o site fica acessível em `http://IP_DA_VM:4200`.

O compose sobe três containers:

| Container | O que é |
|---|---|
| `primecoding-mysql` | Banco MySQL 8.4, com os dados num volume que sobrevive a reinícios |
| `primecoding-backend` | API em Spring Boot, que cria as tabelas e os dados de exemplo na primeira vez |
| `primecoding-frontend` | nginx servindo o site em Angular e repassando `/api` para a API |

Só o site fica exposto, na porta 4200. A API e o banco ficam na rede interna do Docker.

---

## 1. Criar a VM

No portal da Azure, em **Máquinas virtuais**, crie uma VM com:

- **Imagem:** Ubuntu Server 24.04 LTS - x64
- **Opções de disponibilidade:** Nenhuma redundância de infraestrutura necessária
- **Tamanho:** um de 2 vCPUs e 8 GB que a sua assinatura tenha cota (na conta de estudante funcionou o `Standard_D2as_v4`)
- **Autenticação:** chave pública SSH, com usuário `senac`
- **Portas de entrada:** SSH (22)

Guarde a chave `.pem` baixada **fora** de qualquer pasta de projeto. Ela nunca vai para o GitHub.

---

## 2. Conectar na VM

No seu computador, na pasta onde está a chave `.pem`:

```bash
ssh -i primecoding-vm_key.pem senac@IP_DA_VM
```

---

## 3. Instalar o Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo docker --version
sudo docker compose version
```

---

## 4. Baixar o projeto

```bash
sudo mkdir -p ~/services
cd ~/services
sudo git clone https://github.com/lipfelipef/PrimeCoding.git
cd PrimeCoding/deploy
```

---

## 5. Criar o .env com as senhas

```bash
sudo cp .env.example .env
sudo nano .env
```

Troque `DB_SENHA`, `MYSQL_ROOT_SENHA` e `ADMIN_SENHA`. A `ADMIN_SENHA` é a do login do painel em `/painel`. O `.env` fica só na VM e nunca vai para o GitHub.

---

## 6. Subir a aplicação

```bash
sudo docker compose up -d --build
sudo docker compose ps
```

Os três containers devem aparecer com status `Up`. Na primeira vez o build demora alguns minutos, porque baixa as dependências do Maven e do npm.

---

## 7. Liberar a porta na Azure

1. No portal da Azure, abra a VM.
2. Vá em **Rede** → **Configurações de rede**.
3. Clique em **+ Criar regra de porta** → **Regra de porta de entrada**.
4. Preencha **Intervalos de portas de destino:** `4200`, **Protocolo:** `TCP`, **Ação:** `Permitir` e **Nome:** `primecoding-site`.
5. Clique em **Adicionar**.

Agora acesse `http://IP_DA_VM:4200` no navegador.

---

## Atualizar a aplicação

Depois de enviar alterações para o GitHub, rode na VM:

```bash
cd ~/services/PrimeCoding
sudo git pull
cd deploy
sudo docker compose up -d --build
```

---

## Comandos úteis

| Comando | O que faz |
|---|---|
| `sudo docker compose ps` | Lista os containers e o status de cada um |
| `sudo docker logs primecoding-backend` | Mostra o log da API |
| `sudo docker logs primecoding-frontend` | Mostra o log do site |
| `sudo docker compose down` | Para tudo, sem apagar o banco |
| `sudo docker compose down -v` | Para tudo e apaga o banco (volta aos dados de exemplo) |

Para não gastar crédito à toa, desligue a VM pelo botão **Parar** do portal quando ela não estiver em uso. Desligar pelo Ubuntu não para a cobrança.
