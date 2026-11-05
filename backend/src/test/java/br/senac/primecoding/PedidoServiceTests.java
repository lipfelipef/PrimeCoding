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
		assertEquals("EM_ABERTO", pedidoService.findById(noPrazo.getId()).getStatus());
		assertEquals("RESERVADA", unidadeRepository.findByNumeroSerie("SN-ENT-0003").get().getSituacao());
	}

	// Venda concluída: a unidade fica vendida e o pedido não muda mais
	@Test
	@Transactional
	void vendaConcluidaMarcaUnidadeVendida() {
		Pedido pedido = novoPedido("SN-INT-0002", "11987651111");
		assertEquals("EM_ABERTO", pedido.getStatus());

		pedidoService.mudarStatus(pedido.getId(), "VENDIDO", null, null);

		assertEquals("VENDIDO", pedidoService.findById(pedido.getId()).getStatus());
		assertEquals("VENDIDA", unidadeRepository.findByNumeroSerie("SN-INT-0002").get().getSituacao());
		// Encerrado: nem cancelar nem vender de novo
		assertThrows(Exception.class, () -> pedidoService.mudarStatus(pedido.getId(), "CANCELADO", null, null));
		assertEquals("VENDIDA", unidadeRepository.findByNumeroSerie("SN-INT-0002").get().getSituacao());
	}

	// Só existem vendido e cancelado a partir de em aberto
	@Test
	@Transactional
	void statusQueNaoExisteMaisERecusado() {
		Pedido pedido = novoPedido("SN-INT-0003", "11987652222");
		assertThrows(Exception.class, () -> pedidoService.mudarStatus(pedido.getId(), "EM_PREPARACAO", null, null));
		assertEquals("EM_ABERTO", pedidoService.findById(pedido.getId()).getStatus());
		assertEquals("RESERVADA", unidadeRepository.findByNumeroSerie("SN-INT-0003").get().getSituacao());
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

		Pedido pedido = new Pedido();
		pedido.setCliente(cliente);
		pedido.setFormaPagamento("PIX");
		pedido.getItens().add(item);
		return pedidoService.gravar(pedido);
	}
}
