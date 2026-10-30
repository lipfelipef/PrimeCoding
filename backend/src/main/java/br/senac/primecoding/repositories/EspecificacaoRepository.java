package br.senac.primecoding.repositories;

import br.senac.primecoding.entities.Especificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EspecificacaoRepository extends JpaRepository<Especificacao, Integer> {
}