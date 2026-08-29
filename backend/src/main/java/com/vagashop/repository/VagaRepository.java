package com.vagashop.repository;

import com.vagashop.domain.entity.Vaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VagaRepository extends JpaRepository<Vaga, Integer> {

    Optional<Vaga> findByCodigoVaga(String codigoVaga);

    @Query("SELECT v FROM Vaga v WHERE v.idVaga NOT IN (" +
           "  SELECT r.vaga.idVaga FROM RegistroEstacionamento r WHERE r.dataHoraSaida IS NULL" +
           ")")
    List<Vaga> findVagasLivres();
}
