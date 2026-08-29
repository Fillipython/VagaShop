package com.vagashop.repository;

import com.vagashop.domain.entity.RegistroEstacionamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroEstacionamentoRepository extends JpaRepository<RegistroEstacionamento, Integer> {

    @Query("SELECT r FROM RegistroEstacionamento r " +
           "JOIN FETCH r.veiculo " +
           "JOIN FETCH r.vaga v " +
           "JOIN FETCH v.setor " +
           "WHERE r.dataHoraSaida IS NULL ORDER BY r.dataHoraEntrada DESC")
    List<RegistroEstacionamento> findCarrosEstacionadosAgora();

    @Query("SELECT r FROM RegistroEstacionamento r " +
           "WHERE r.veiculo.placa = :placa AND r.dataHoraSaida IS NULL")
    Optional<RegistroEstacionamento> findAtivoPorPlaca(@Param("placa") String placa);

    @Query("SELECT r FROM RegistroEstacionamento r " +
           "WHERE r.vaga.idVaga = :idVaga AND r.dataHoraSaida IS NULL")
    Optional<RegistroEstacionamento> findAtivoPorVaga(@Param("idVaga") Integer idVaga);

    @Query("SELECT r FROM RegistroEstacionamento r " +
           "JOIN FETCH r.veiculo " +
           "JOIN FETCH r.vaga v " +
           "JOIN FETCH v.setor " +
           "ORDER BY r.idRegistro DESC")
    List<RegistroEstacionamento> findAtividadesRecentes(org.springframework.data.domain.Pageable pageable);
}
