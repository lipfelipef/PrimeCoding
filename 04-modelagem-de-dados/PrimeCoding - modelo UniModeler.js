let cliente = {
  '!id_cliente': 1,
  'nome': 'Lucas Martins',
  'whatsapp': '11900000001',
  'email?': 'lucas@exemplo.com',
  'tipo_documento': 'CPF',
  'documento': '000.000.000-00',
  'data_cadastro': '2026-10-29 10:40:00'
}

let endereco = {
  '!id_endereco': 1,
  '#id_cliente': 'cliente',
  'cep': '01000-000',
  'logradouro': 'Rua Exemplo',
  'numero': '100',
  'complemento?': 'Apto 12',
  'bairro': 'Centro',
  'cidade': 'São Paulo',
  'uf': 'SP'
}

let usuario = {
  '!id_usuario': 1,
  'nome': 'Revendedor',
  'email': 'admin@primecoding.com.br',
  'senha_hash': 'hash-bcrypt',
  'ativo': true,
  'ultimo_acesso?': '2026-10-29 09:00:00'
}

let modelo = {
  '!id_modelo': 1,
  'linha': 'ENTRADA',
  'nome': 'ThinkPad T14 Gen 2',
  'marca': 'Lenovo',
  'descricao': 'Para quem está começando a faculdade de TI',
  'preco': 2899.9,
  'ativo': true,
  'imagem_url?': '/img/thinkpad-t14-gen2.jpg'
}

let especificacao = {
  '!id_especificacao': 1,
  '#id_modelo': 'modelo',
  'nome': 'Memória',
  'valor': '16 GB DDR4 (ampliável para 32 GB)',
  'ordem': 2
}

let unidade = {
  '!id_unidade': 1,
  '#id_modelo': 'modelo',
  'numero_serie': 'SN-ENT-0001',
  'estado': 'A',
  'saude_bateria': 92,
  'ciclos_bateria': 210,
  'preco': 2899.9,
  'situacao': 'DISPONIVEL',
  'data_entrada': '2026-10-20',
  'observacao?': 'teclado novo'
}

let kit_setup = {
  '!id_kit': 1,
  'nome': 'Back-end',
  'descricao': 'APIs, bancos e containers',
  'ferramentas': 'Git, Docker, WSL, Java, Node.js, Postman e MySQL'
}

let upgrade = {
  '!id_upgrade': 1,
  '#id_modelo': 'modelo',
  'nome': 'Memória para 32 GB',
  'preco': 450.9,
  'dias_extras': 1
}

let aviso_reposicao = {
  '!id_aviso': 1,
  '#id_modelo': 'modelo',
  'whatsapp': '11900000002',
  'data_solicitacao': '2026-10-29 11:00:00',
  'avisado': false
}

let pedido = {
  '!id_pedido': 101,
  'codigo': 'PC-2026-0101',
  '#id_cliente': 'cliente',
  '#id_endereco': 'endereco',
  'data_pedido': '2026-10-29 10:40:00',
  'forma_pagamento': 'PIX',
  'parcelas': 1,
  'subtotal': 3350.8,
  'desconto': 335.08,
  'total': 3015.72,
  'status': 'AGUARDANDO_ATENDIMENTO',
  'prazo_pagamento': '2026-10-31 10:40:00'
}

let item_pedido = {
  '!id_item': 1,
  '#id_pedido': 'pedido',
  '#id_unidade': 'unidade',
  '#id_kit': 'kit_setup',
  '#id_upgrade?': 'upgrade',
  'preco_unidade': 2899.9,
  'preco_upgrade': 450.9
}

let historico_status = {
  '!id_historico': 1,
  '#id_pedido': 'pedido',
  '#id_usuario?': 'usuario',
  'status': 'AGUARDANDO_ATENDIMENTO',
  'data_hora': '2026-10-29 10:40:00',
  'observacao?': 'pedido criado pelo site'
}

let garantia = {
  '!id_garantia': 1,
  '#id_item': 'item_pedido',
  'data_abertura': '2026-11-20 14:00:00',
  'problema': 'Tecla falhando',
  'situacao': 'ABERTA',
  'solucao?': 'troca do teclado'
}
