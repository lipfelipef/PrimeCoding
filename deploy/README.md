# Deploy do PrimeCoding

Passo a passo para publicar o PrimeCoding numa VM Linux (Ubuntu) na Azure, usando Docker Compose.

Ao final, o site fica acessível em `http://IP_DA_VM:4200`.

Hoje o container publica as telas do protótipo (`05-prototipo`). Quando o site, a API e o banco existirem, eles entram como novos serviços no mesmo `docker-compose.yml`, e o processo de deploy continua o mesmo.

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

## 5. Subir a aplicação

```bash
sudo docker compose up -d --build
sudo docker compose ps
```

O container `primecoding-frontend` deve aparecer com status `Up`.

---

## 6. Liberar a porta na Azure

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
| `sudo docker logs primecoding-frontend` | Mostra o log do site |
| `sudo docker compose down` | Para o site |

Para não gastar crédito à toa, desligue a VM pelo botão **Parar** do portal quando ela não estiver em uso. Desligar pelo Ubuntu não para a cobrança.
