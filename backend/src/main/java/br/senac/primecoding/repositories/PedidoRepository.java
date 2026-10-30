package br.senac.primecoding.repositories;

import br.senac.primecoding.entities.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    List<Pedido> findAllByOrderByDataPedidoDesc();

    long countByCodigoStartingWith(String prefixo);

    List<Pedido> findByStatusInAndPrazoPagamentoBefore(List<String> status, LocalDateTime agora);
}