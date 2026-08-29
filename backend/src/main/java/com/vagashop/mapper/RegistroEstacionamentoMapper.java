package com.vagashop.mapper;

import com.vagashop.domain.entity.RegistroEstacionamento;
import com.vagashop.domain.enums.TipoEvento;
import com.vagashop.dto.response.AtividadeRecenteDTO;
import com.vagashop.dto.response.RegistroEstacionamentoDTO;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class RegistroEstacionamentoMapper {

    public RegistroEstacionamentoDTO toDTO(RegistroEstacionamento entity) {
        if (entity == null) return null;
        RegistroEstacionamentoDTO dto = new RegistroEstacionamentoDTO();
        dto.setIdRegistro(entity.getIdRegistro());
        if (entity.getVeiculo() != null) {
            dto.setPlaca(entity.getVeiculo().getPlaca());
        }
        if (entity.getVaga() != null) {
            dto.setIdVaga(entity.getVaga().getIdVaga());
            dto.setCodigoVaga(entity.getVaga().getCodigoVaga());
            dto.setTipoVaga(entity.getVaga().getTipoVaga());
            if (entity.getVaga().getSetor() != null) {
                dto.setNomeSetor(entity.getVaga().getSetor().getNomeSetor());
                dto.setIsCoberto(entity.getVaga().getSetor().getIsCoberto());
            }
        }
        dto.setDataHoraEntrada(entity.getDataHoraEntrada());
        dto.setDataHoraSaida(entity.getDataHoraSaida());
        dto.setValorPago(entity.getValorPago());

        if (entity.getDataHoraEntrada() != null) {
            LocalDateTime end = entity.getDataHoraSaida() != null ? entity.getDataHoraSaida() : LocalDateTime.now();
            dto.setMinutosEstacionado(Math.max(0, Duration.between(entity.getDataHoraEntrada(), end).toMinutes()));
        }

        return dto;
    }

    public AtividadeRecenteDTO toAtividadeDTO(RegistroEstacionamento entity) {
        if (entity == null) return null;
        AtividadeRecenteDTO dto = new AtividadeRecenteDTO();
        dto.setIdRegistro(entity.getIdRegistro());
        dto.setTipoEvento(entity.getDataHoraSaida() == null ? TipoEvento.ENTRADA.name() : TipoEvento.SAIDA.name());
        if (entity.getVeiculo() != null) {
            dto.setPlaca(entity.getVeiculo().getPlaca());
        }
        if (entity.getVaga() != null) {
            dto.setCodigoVaga(entity.getVaga().getCodigoVaga());
            if (entity.getVaga().getSetor() != null) {
                dto.setNomeSetor(entity.getVaga().getSetor().getNomeSetor());
            }
        }
        dto.setDataEvento(entity.getDataHoraSaida() != null ? entity.getDataHoraSaida() : entity.getDataHoraEntrada());
        dto.setValorPago(entity.getValorPago());
        return dto;
    }
}

