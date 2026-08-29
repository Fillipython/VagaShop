package com.vagashop.repository;

import com.vagashop.domain.entity.Setor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SetorRepository extends JpaRepository<Setor, Integer> {

    @Query("SELECT DISTINCT s FROM Setor s LEFT JOIN FETCH s.vagas ORDER BY s.idSetor")
    List<Setor> findAllComVagas();
}
