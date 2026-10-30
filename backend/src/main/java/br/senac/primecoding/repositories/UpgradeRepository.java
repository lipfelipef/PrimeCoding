package br.senac.primecoding.repositories;

import br.senac.primecoding.entities.Upgrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpgradeRepository extends JpaRepository<Upgrade, Integer> {
}