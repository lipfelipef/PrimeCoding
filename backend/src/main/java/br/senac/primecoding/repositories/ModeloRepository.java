package br.senac.primecoding.repositories;

import br.senac.primecoding.entities.Modelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModeloRepository extends JpaRepository<Modelo, Integer> {

    List<Modelo> findAllByOrderByPrecoAsc();

    Optional<Modelo> findByLinha(String linha);
}