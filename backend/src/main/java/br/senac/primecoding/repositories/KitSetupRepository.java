package br.senac.primecoding.repositories;

import br.senac.primecoding.entities.KitSetup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KitSetupRepository extends JpaRepository<KitSetup, Integer> {

    List<KitSetup> findAllByOrderByIdAsc();
}