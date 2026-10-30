package br.senac.primecoding;

import br.senac.primecoding.entities.*;
import br.senac.primecoding.repositories.PedidoRepository;
import br.senac.primecoding.repositories.UnidadeRepository;
import br.senac.primecoding.services.PedidoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

// Reserva de 48 h (RN15): pedido sem pagamento no prazo é cancelado e a unidade volta à vitrine
@SpringBootTest
class PedidoServiceTests {

	@Autowired
	private PedidoService pedidoService;

	@Autowired
	private PedidoRepository pedidoRepository;

	@Autowired
	private UnidadeRepository unidadeRepository;

	// @Transactional: o teste lê o histórico do pedido e desfaz tudo no fim
	@Test
	@Transactional
	void reservaVencidaECanceladaEUnidadeVolta() {
		Pedido vencido = novoPedido("SN-ENT-0002", "11987654321");
		Pedido noPrazo = novoPedido("SN-ENT-0003", "11987650000");

		// Só o primeiro passou do prazo
		vencido.setPrazoPagamento(LocalDateTime.now().minusMinutes(1));
		pedidoRepository.save(vencido);
		assertEquals("RESERVADA", unidadeRepository.findByNumeroSerie("SN-ENT-0002").get().getSituacao());

		pedidoService.cancelarVencidos();

		Pedido depois = pedidoService.findById(vencido.getId());
		assertEquals("CANCELADO", depois.getStatus());
		HistoricoStatus ultimo = depois.getHistorico().get(depois.getHistorico().size() - 1);
		assertEquals("CANCELADO", ultimo.getStatus());
		assertNull(ultimo.getUsuario(), "o cancelamento automático não tem usuário");
		assertEquals("DISPONIVEL", unidadeRepository.findByNumeroSerie("SN-ENT-0002").get().getSituacao());

		// O que ainda está no prazo não muda
		assertEquals("AGUARDANDO_ATENDIMENTO", pedidoService.findById(noPrazo.getId()).getStatus());
		assertEquals("RESERVADA", unidadeRepository.findByNumeroSerie("SN-ENT-0003").get().getSituacao());
	}

	private Pedido novoPedido(String serie, String whatsapp) {
		Unidade unidade = unidadeRepository.findByNumeroSerie(serie).get();
		KitSetup kit = new KitSetup();
		kit.setId(1);
		ItemPedido item = new ItemPedido();
		item.setUnidade(unidade);
		item.setKit(kit);

		Cliente cliente = new Cliente();
		cliente.setNome("Maria da Silva");
		cliente.setWhatsapp(whatsapp);
		cliente.setDocumento("11111111111");

		Endereco endereco = new Endereco();
		endereco.setCep("01310-100");
		endereco.setLogradouro("Avenida Paulista");
		endereco.setNumero("1000");
		endereco.setBairro("Bela Vista");
		endereco.setCidade("São Paulo");
		endereco.setUf("SP");

		Pedido pedido = new Pedido();
		pedido.setCliente(cliente);
		pedido.setEndereco(endereco);
		pedido.setFormaPagamento("PIX");
		pedido.getItens().add(item);
		return pedidoService.gravar(pedido);
	}
}
