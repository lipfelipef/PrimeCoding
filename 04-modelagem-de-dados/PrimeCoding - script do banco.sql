-- PrimeCoding - script do banco de dados (MySQL 8)
-- Modelo físico do diagrama "PrimeCoding - Modelo de dados.drawio".
-- As regras de negócio citadas (RNxx) estão no arquivo de regras de negócio.

CREATE DATABASE IF NOT EXISTS primecoding CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE primecoding;

-- Cliente não tem login: é identificado pelo WhatsApp (RN10)
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

-- Só 3 modelos, um por linha (RN01)
CREATE TABLE modelo (
    id_modelo   INT AUTO_INCREMENT PRIMARY KEY,
    linha       VARCHAR(13)   NOT NULL UNIQUE,
    nome        VARCHAR(100)  NOT NULL,
    marca       VARCHAR(30)   NOT NULL,
    descricao   TEXT          NOT NULL,
    preco       DECIMAL(10,2) NOT NULL,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    imagem_url  VARCHAR(255)  NULL,
    CONSTRAINT ck_modelo_linha CHECK (linha IN ('ENTRADA', 'INTERMEDIARIO', 'PRO')),
    CONSTRAINT ck_modelo_preco CHECK (preco > 0)
);

-- Ficha técnica do modelo, uma linha por item
CREATE TABLE especificacao (
    id_especificacao  INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo         INT          NOT NULL,
    nome              VARCHAR(40)  NOT NULL,
    valor             VARCHAR(150) NOT NULL,
    ordem             TINYINT      NOT NULL,
    CONSTRAINT fk_especificacao_modelo FOREIGN KEY (id_modelo) REFERENCES modelo (id_modelo),
    CONSTRAINT uq_especificacao UNIQUE (id_modelo, nome)
);

-- Cada notebook à venda é uma unidade única e revisada (RN02, RN03, RN04)
CREATE TABLE unidade (
    id_unidade      INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo       INT           NOT NULL,
    numero_serie    VARCHAR(30)   NOT NULL UNIQUE,
    estado          CHAR(1)       NOT NULL,
    saude_bateria   TINYINT       NOT NULL,
    ciclos_bateria  SMALLINT      NOT NULL,
    preco           DECIMAL(10,2) NOT NULL,
    situacao        VARCHAR(12)   NOT NULL DEFAULT 'EM_REVISAO',
    data_entrada    DATE          NOT NULL,
    observacao      VARCHAR(255)  NULL,
    CONSTRAINT fk_unidade_modelo  FOREIGN KEY (id_modelo) REFERENCES modelo (id_modelo),
    CONSTRAINT ck_unidade_estado  CHECK (estado IN ('A', 'B')),
    CONSTRAINT ck_unidade_bateria CHECK (saude_bateria BETWEEN 0 AND 100 AND ciclos_bateria >= 0),
    CONSTRAINT ck_unidade_vitrine CHECK (situacao <> 'DISPONIVEL' OR saude_bateria >= 80),
    CONSTRAINT ck_unidade_preco   CHECK (preco > 0),
    CONSTRAINT ck_unidade_situacao CHECK (situacao IN ('EM_REVISAO', 'DISPONIVEL', 'RESERVADA', 'VENDIDA'))
);

-- Kits de setup que acompanham cada notebook (RN11)
CREATE TABLE kit_setup (
    id_kit       INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(20)  NOT NULL UNIQUE,
    descricao    VARCHAR(150) NOT NULL,
    ferramentas  VARCHAR(255) NOT NULL
);

-- Upgrades permitidos por modelo; o Pro não tem nenhum (RN12)
CREATE TABLE upgrade (
    id_upgrade   INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo    INT           NOT NULL,
    nome         VARCHAR(60)   NOT NULL,
    preco        DECIMAL(10,2) NOT NULL,
    dias_extras  TINYINT       NOT NULL DEFAULT 1,
    CONSTRAINT fk_upgrade_modelo FOREIGN KEY (id_modelo) REFERENCES modelo (id_modelo),
    CONSTRAINT ck_upgrade_preco  CHECK (preco > 0 AND dias_extras BETWEEN 0 AND 5)
);

CREATE TABLE usuario (
    id_usuario     INT AUTO_INCREMENT PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL,
    email          VARCHAR(120) NOT NULL UNIQUE,
    senha_hash     CHAR(60)     NOT NULL,   -- hash bcrypt, nunca a senha (RN24)
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_acesso  DATETIME     NULL
);

CREATE TABLE pedido (
    id_pedido        INT AUTO_INCREMENT PRIMARY KEY,
    codigo           CHAR(12)      NOT NULL UNIQUE,              -- PC-AAAA-NNNN (RN14)
    id_cliente       INT           NOT NULL,
    id_endereco      INT           NOT NULL,
    data_pedido      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento  VARCHAR(6)    NOT NULL,
    parcelas         TINYINT       NOT NULL DEFAULT 1,
    subtotal         DECIMAL(10,2) NOT NULL,
    desconto         DECIMAL(10,2) NOT NULL DEFAULT 0,           -- 10% no PIX (RN06)
    total            DECIMAL(10,2) NOT NULL,
    status           VARCHAR(25)   NOT NULL DEFAULT 'AGUARDANDO_ATENDIMENTO',
    prazo_pagamento  DATETIME      NOT NULL,                     -- reserva de 48 h (RN15)
    CONSTRAINT fk_pedido_cliente  FOREIGN KEY (id_cliente)  REFERENCES cliente (id_cliente),
    CONSTRAINT fk_pedido_endereco FOREIGN KEY (id_endereco) REFERENCES endereco (id_endereco),
    CONSTRAINT ck_pedido_forma    CHECK (forma_pagamento IN ('PIX', 'CARTAO')),
    CONSTRAINT ck_pedido_parcelas CHECK (parcelas BETWEEN 1 AND 12 AND (forma_pagamento = 'CARTAO' OR parcelas = 1)),
    CONSTRAINT ck_pedido_total    CHECK (total = subtotal - desconto),
    CONSTRAINT ck_pedido_status   CHECK (status IN ('AGUARDANDO_ATENDIMENTO', 'AGUARDANDO_PAGAMENTO', 'EM_PREPARACAO',
                                                    'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE', 'CANCELADO'))
);

-- Cada item é uma unidade com seu kit e, no máximo, um upgrade (RN08, RN11, RN12)
CREATE TABLE item_pedido (
    id_item        INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido      INT           NOT NULL,
    id_unidade     INT           NOT NULL UNIQUE,
    id_kit         INT           NOT NULL,
    id_upgrade     INT           NULL,
    preco_unidade  DECIMAL(10,2) NOT NULL,
    preco_upgrade  DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_item_pedido  FOREIGN KEY (id_pedido)  REFERENCES pedido (id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_item_unidade FOREIGN KEY (id_unidade) REFERENCES unidade (id_unidade),
    CONSTRAINT fk_item_kit     FOREIGN KEY (id_kit)     REFERENCES kit_setup (id_kit),
    CONSTRAINT fk_item_upgrade FOREIGN KEY (id_upgrade) REFERENCES upgrade (id_upgrade),
    CONSTRAINT ck_item_upgrade CHECK ((id_upgrade IS NULL AND preco_upgrade = 0) OR (id_upgrade IS NOT NULL AND preco_upgrade > 0))
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

-- Garantia de 90 dias da loja (RN20, RN21)
CREATE TABLE garantia (
    id_garantia    INT AUTO_INCREMENT PRIMARY KEY,
    id_item        INT          NOT NULL,
    data_abertura  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    problema       VARCHAR(500) NOT NULL,
    situacao       VARCHAR(12)  NOT NULL DEFAULT 'ABERTA',
    solucao        VARCHAR(255) NULL,
    CONSTRAINT fk_garantia_item     FOREIGN KEY (id_item) REFERENCES item_pedido (id_item),
    CONSTRAINT ck_garantia_situacao CHECK (situacao IN ('ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'NEGADA'))
);

-- "Avise-me quando chegar" para modelo esgotado (RN05)
CREATE TABLE aviso_reposicao (
    id_aviso          INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo         INT         NOT NULL,
    whatsapp          VARCHAR(15) NOT NULL,
    data_solicitacao  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    avisado           BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_aviso_modelo FOREIGN KEY (id_modelo) REFERENCES modelo (id_modelo)
);

-- Os 3 modelos da loja (preços de referência de outubro de 2026)
INSERT INTO modelo (linha, nome, marca, descricao, preco, imagem_url) VALUES
('ENTRADA', 'ThinkPad T14 Gen 2', 'Lenovo',
 'Para quem está começando a faculdade de TI: robusto, com teclado ótimo e memória que dá para ampliar.',
 2899.00, '/img/thinkpad-t14-gen2.jpg'),
('INTERMEDIARIO', 'Latitude 5430', 'Dell',
 'Para estágio e back-end: 32 GB para Docker, máquinas virtuais e IDE abertos ao mesmo tempo.',
 4999.00, '/img/latitude-5430.jpg'),
('PRO', 'MacBook Air 13 (M2)', 'Apple',
 'Para quem quer bateria para o dia todo, silêncio total e desenvolvimento para iPhone com Xcode.',
 6999.00, '/img/macbook-air-m2.jpg');

INSERT INTO especificacao (id_modelo, nome, valor, ordem) VALUES
(1, 'Processador',   'Intel Core i5-1145G7, 4 núcleos, até 4,4 GHz', 1),
(1, 'Memória',       '16 GB DDR4 (ampliável para 32 GB)', 2),
(1, 'Armazenamento', 'SSD NVMe de 512 GB', 3),
(1, 'Tela',          '14 polegadas, Full HD (1920 x 1080), IPS', 4),
(1, 'Portas',        '2 USB-C (1 Thunderbolt 4), 2 USB-A, HDMI, rede RJ45 e fone', 5),
(1, 'Sistema',       'Windows 11 Pro', 6),
(1, 'Teclado',       'ABNT2 (português do Brasil)', 7),
(2, 'Processador',   'Intel Core i7-1265U, 10 núcleos, até 4,8 GHz', 1),
(2, 'Memória',       '32 GB DDR4', 2),
(2, 'Armazenamento', 'SSD NVMe de 1 TB', 3),
(2, 'Tela',          '14 polegadas, Full HD (1920 x 1080)', 4),
(2, 'Portas',        '2 USB-C Thunderbolt 4, 2 USB-A, HDMI, rede RJ45, leitor microSD e fone', 5),
(2, 'Sistema',       'Windows 11 Pro', 6),
(2, 'Teclado',       'ABNT2 (português do Brasil)', 7),
(3, 'Chip',          'Apple M2, CPU de 8 núcleos', 1),
(3, 'Memória',       '16 GB unificada', 2),
(3, 'Armazenamento', 'SSD de 512 GB', 3),
(3, 'Tela',          'Liquid Retina de 13,6 polegadas', 4),
(3, 'Portas',        '2 Thunderbolt / USB 4, MagSafe 3 e fone', 5),
(3, 'Sistema',       'macOS', 6),
(3, 'Teclado',       'ABNT2 (português do Brasil)', 7);

INSERT INTO kit_setup (nome, descricao, ferramentas) VALUES
('Estudante', 'O básico para a faculdade de TI', 'Git, VS Code, Java (JDK 21), Python e navegadores'),
('Back-end',  'APIs, bancos e containers', 'Git, Docker, WSL (no Windows), Java (JDK 21), Node.js, Postman e MySQL'),
('Front-end', 'Sites e aplicações web', 'Git, VS Code, Node.js, extensões de front-end e navegadores de teste'),
('Dados',     'Análise de dados e ciência de dados', 'Git, Python, Jupyter, pandas e VS Code'),
('Mobile',    'Apps para Android e iPhone', 'Git, Android Studio, Flutter e, no MacBook, Xcode');

INSERT INTO upgrade (id_modelo, nome, preco, dias_extras) VALUES
(1, 'Memória para 32 GB', 450.00, 1),
(1, 'SSD de 1 TB',        350.00, 1),
(2, 'SSD de 2 TB',        650.00, 1);

-- Unidades revisadas em estoque (estado B custa R$ 200 a menos, RN04)
INSERT INTO unidade (id_modelo, numero_serie, estado, saude_bateria, ciclos_bateria, preco, situacao, data_entrada) VALUES
(1, 'SN-ENT-0001', 'A', 92, 210, 2899.00, 'DISPONIVEL', '2026-10-20'),
(1, 'SN-ENT-0002', 'A', 88, 340, 2899.00, 'DISPONIVEL', '2026-10-20'),
(1, 'SN-ENT-0003', 'B', 85, 410, 2699.00, 'DISPONIVEL', '2026-10-22'),
(2, 'SN-INT-0001', 'A', 95, 120, 4999.00, 'DISPONIVEL', '2026-10-21'),
(2, 'SN-INT-0002', 'B', 90, 260, 4799.00, 'DISPONIVEL', '2026-10-23'),
(3, 'SN-PRO-0001', 'A', 96, 85,  6999.00, 'DISPONIVEL', '2026-10-24'),
(3, 'SN-PRO-0002', 'A', 91, 150, 6999.00, 'EM_REVISAO', '2026-10-27');
