-- PrimeCoding - script do banco de dados (MySQL 8)
-- Modelo físico do diagrama "PrimeCoding - Modelo de dados.drawio".
-- As regras de negócio citadas (RNxx) estão no arquivo de regras de negócio.

CREATE DATABASE IF NOT EXISTS primecoding CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE primecoding;

-- Cliente não tem login: é identificado pelo WhatsApp (RN09)
CREATE TABLE cliente (
    id_cliente      INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(100) NOT NULL,
    whatsapp        VARCHAR(15)  NOT NULL UNIQUE,
    email           VARCHAR(120) NULL,
    tipo_documento  CHAR(4)      NOT NULL,
    documento       VARCHAR(18)  NOT NULL,
    data_cadastro   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_cliente_tipo_documento CHECK (tipo_documento IN ('CPF', 'CNPJ'))
);

CREATE TABLE endereco (
    id_endereco  INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente   INT          NOT NULL,
    cep          CHAR(9)      NOT NULL,
    logradouro   VARCHAR(120) NOT NULL,
    numero       VARCHAR(10)  NOT NULL,
    complemento  VARCHAR(60)  NULL,
    bairro       VARCHAR(60)  NOT NULL,
    cidade       VARCHAR(60)  NOT NULL,
    uf           CHAR(2)      NOT NULL,
    CONSTRAINT fk_endereco_cliente FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente)
);

-- Só existem dois produtos à venda (RN01)
CREATE TABLE produto (
    id_produto  INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(100)  NOT NULL,
    marca       VARCHAR(30)   NOT NULL,
    descricao   TEXT          NOT NULL,
    preco       DECIMAL(10,2) NOT NULL,
    estoque     INT           NOT NULL DEFAULT 0,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    imagem_url  VARCHAR(255)  NULL,
    CONSTRAINT ck_produto_preco   CHECK (preco > 0),
    CONSTRAINT ck_produto_estoque CHECK (estoque >= 0)
);

-- Ficha técnica: uma linha por item (RN03)
CREATE TABLE especificacao (
    id_especificacao  INT AUTO_INCREMENT PRIMARY KEY,
    id_produto        INT          NOT NULL,
    nome              VARCHAR(40)  NOT NULL,
    valor             VARCHAR(150) NOT NULL,
    ordem             TINYINT      NOT NULL,
    CONSTRAINT fk_especificacao_produto FOREIGN KEY (id_produto) REFERENCES produto (id_produto),
    CONSTRAINT uq_especificacao UNIQUE (id_produto, nome)
);

CREATE TABLE usuario (
    id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL,
    email          VARCHAR(120) NOT NULL UNIQUE,
    senha_hash     CHAR(60)     NOT NULL,   -- hash bcrypt, nunca a senha (RN19)
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acesso  DATETIME     NULL
);

CREATE TABLE pedido (
    id_pedido        INT AUTO_INCREMENT PRIMARY KEY,
    codigo           CHAR(12)      NOT NULL UNIQUE,              -- PC-AAAA-NNNN (RN11)
    id_cliente       INT           NOT NULL,
    id_endereco      INT           NOT NULL,
    data_pedido      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento  VARCHAR(6)    NOT NULL,
    parcelas         TINYINT       NOT NULL DEFAULT 1,
    subtotal         DECIMAL(10,2) NOT NULL,
    desconto         DECIMAL(10,2) NOT NULL DEFAULT 0,           -- 10% no PIX (RN04)
    total            DECIMAL(10,2) NOT NULL,
    status           VARCHAR(25)   NOT NULL DEFAULT 'AGUARDANDO_ATENDIMENTO',
    prazo_pagamento  DATETIME      NOT NULL,                     -- data do pedido + 48 h (RN07)
    CONSTRAINT fk_pedido_cliente  FOREIGN KEY (id_cliente)  REFERENCES cliente (id_cliente),
    CONSTRAINT fk_pedido_endereco FOREIGN KEY (id_endereco) REFERENCES endereco (id_endereco),
    CONSTRAINT ck_pedido_forma    CHECK (forma_pagamento IN ('PIX', 'CARTAO')),
    CONSTRAINT ck_pedido_parcelas CHECK (parcelas BETWEEN 1 AND 12 AND (forma_pagamento = 'CARTAO' OR parcelas = 1)),
    CONSTRAINT ck_pedido_total    CHECK (total = subtotal - desconto),
    CONSTRAINT ck_pedido_status   CHECK (status IN ('AGUARDANDO_ATENDIMENTO', 'AGUARDANDO_PAGAMENTO',
                                                    'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'))
);

-- O preço fica gravado no item no momento do pedido (RN06)
CREATE TABLE item_pedido (
    id_item         INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido       INT           NOT NULL,
    id_produto      INT           NOT NULL,
    quantidade      TINYINT       NOT NULL,
    preco_unitario  DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_pedido  FOREIGN KEY (id_pedido)  REFERENCES pedido (id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (id_produto) REFERENCES produto (id_produto),
    CONSTRAINT uq_item_pedido  UNIQUE (id_pedido, id_produto),
    CONSTRAINT ck_item_quantidade CHECK (quantidade BETWEEN 1 AND 3)   -- RN10
);

-- Cada mudança de status fica registrada; id_usuario nulo = mudança automática do sistema
CREATE TABLE historico_status (
    id_historico  INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido     INT          NOT NULL,
    id_usuario    INT          NULL,
    status        VARCHAR(25)  NOT NULL,
    data_hora     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacao    VARCHAR(255) NULL,
    CONSTRAINT fk_historico_pedido  FOREIGN KEY (id_pedido)  REFERENCES pedido (id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_historico_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

-- "Avise-me quando chegar" para produto esgotado (RN02)
CREATE TABLE aviso_reposicao (
    id_aviso          INT AUTO_INCREMENT PRIMARY KEY,
    id_produto        INT         NOT NULL,
    whatsapp          VARCHAR(15) NOT NULL,
    data_solicitacao  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avisado           BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_aviso_produto FOREIGN KEY (id_produto) REFERENCES produto (id_produto)
);

-- Os dois produtos da loja (preços de referência de outubro de 2026)
INSERT INTO produto (nome, marca, descricao, preco, estoque, imagem_url) VALUES
('MacBook Pro 14 (M5 Pro)', 'Apple',
 'Para quem desenvolve para iPhone e Mac (o Xcode só roda no macOS) e para quem trabalha com Docker, back-end e muitas abas abertas.',
 30999.00, 5, '/img/macbook-pro-14-m5-pro.jpg'),
('Galaxy Book6 Pro 14', 'Samsung',
 'Para quem trabalha no Windows com WSL, .NET e ferramentas da Microsoft, quer tela AMOLED e um notebook leve, de 1,24 kg.',
 13999.00, 8, '/img/galaxy-book6-pro-14.jpg');

INSERT INTO especificacao (id_produto, nome, valor, ordem) VALUES
(1, 'Processador',   'Apple M5 Pro, CPU de 15 núcleos', 1),
(1, 'Gráfico',       'GPU de 16 núcleos integrada', 2),
(1, 'Memória',       '24 GB unificada', 3),
(1, 'Armazenamento', 'SSD de 1 TB', 4),
(1, 'Tela',          'Liquid Retina XDR de 14,2 polegadas', 5),
(1, 'Portas',        '3 Thunderbolt 5, HDMI, leitor SDXC, MagSafe 3 e fone 3,5 mm', 6),
(1, 'Conexão',       'Wi-Fi 7 e Bluetooth 6', 7),
(1, 'Sistema',       'macOS', 8),
(1, 'Teclado',       'ABNT2 (português do Brasil)', 9),
(1, 'Cor',           'Preto-espacial', 10),
(1, 'Garantia',      '1 ano, Apple Brasil', 11),
(2, 'Processador',   'Intel Core Ultra X7 358H, 16 núcleos, até 4,8 GHz', 1),
(2, 'Gráfico',       'Intel Arc B390 integrada', 2),
(2, 'Memória',       '32 GB LPDDR5X', 3),
(2, 'Armazenamento', 'SSD de 1 TB', 4),
(2, 'Tela',          'AMOLED de 14 polegadas, 2880 x 1800, 120 Hz, touch', 5),
(2, 'Portas',        '2 Thunderbolt 4, USB-A, HDMI 2.1 e fone 3,5 mm', 6),
(2, 'Conexão',       'Wi-Fi 7 e Bluetooth 5.4', 7),
(2, 'Sistema',       'Windows 11 Home', 8),
(2, 'Teclado',       'ABNT2 (português do Brasil)', 9),
(2, 'Cor',           'Grafite', 10),
(2, 'Garantia',      '1 ano, Samsung Brasil', 11);
