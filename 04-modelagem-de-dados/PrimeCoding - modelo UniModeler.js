let cliente = {
  '!id_cliente': 1,
  'nome': 'Lucas Martins',
  'whatsapp': '11900000001',
  'email?': 'lucas@exemplo.com',
  'tipo_documento': 'CNPJ',
  'documento': '00.000.000/0001-00',
  'data_cadastro': '2026-10-08 10:40:00'
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

let produto = {
  '!id_produto': 1,
  'nome': 'MacBook Pro 14 (M5 Pro)',
  'marca': 'Apple',
  'descricao': 'Para quem desenvolve para iPhone e Mac',
  'preco': 30999.9,
  'estoque': 5,
  'ativo': true,
  'imagem_url?': '/img/macbook-pro-14-m5-pro.jpg'
}

let especificacao = {
  '!id_especificacao': 1,
  '#id_produto': 'produto',
  'nome': 'Memória',
  'valor': '24 GB unificada',
  'ordem': 3
}

let aviso_reposicao = {
  '!id_aviso': 1,
  '#id_produto': 'produto',
  'whatsapp': '41900000002',
  'data_solicitacao': '2026-10-08 11:00:00',
  'avisado': false
}

let usuario = {
  '!id_usuario': 1,
  'nome': 'Vendedor',
  'email': 'admin@primecoding.com.br',
  'senha_hash': 'hash-bcrypt',
  'ativo': true,
  'ultimo_acesso?': '2026-10-08 09:00:00'
}

let pedido = {
  '!id_pedido': 42,
  'codigo': 'PC-2026-0042',
  '#id_cliente': 'cliente',
  '#id_endereco': 'endereco',
  'data_pedido': '2026-10-08 10:40:00',
  'forma_pagamento': 'PIX',
  'parcelas': 1,
  'subtotal': 30999.90,
  'desconto': 3099.99,
  'total': 27899.91,
  'status': 'AGUARDANDO_ATENDIMENTO',
  'prazo_pagamento': '2026-10-10 10:40:00'
}

let item_pedido = {
  '!id_item': 1,
  '#id_pedido': 'pedido',
  '#id_produto': 'produto',
  'quantidade': 1,
  'preco_unitario': 30999.90
}

let historico_status = {
  '!id_historico': 1,
  '#id_pedido': 'pedido',
  '#id_usuario?': 'usuario',
  'status': 'AGUARDANDO_ATENDIMENTO',
  'data_hora': '2026-10-08 10:40:00',
  'observacao?': 'pedido criado pelo site'
}
