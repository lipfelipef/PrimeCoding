package br.senac.primecoding.repositories;

import br.senac.primecoding.entities.FotoModelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FotoModeloRepository extends JpaRepository<FotoModelo, Integer> {

    Optional<FotoModelo> findByModeloId(Integer id);
}
