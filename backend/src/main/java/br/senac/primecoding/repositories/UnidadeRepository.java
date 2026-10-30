package br.senac.primecoding.repositories;

import br.senac.primecoding.entities.Unidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnidadeRepository extends JpaRepository<Unidade, Integer> {

    List<Unidade> findAllByOrderByModeloPrecoAscNumeroSerieAsc();

    List<Unidade> findBySituacaoOrderByPrecoDescSaudeBateriaDesc(String situacao);

    Optional<Unidade> findByNumeroSerie(String numeroSerie);
}