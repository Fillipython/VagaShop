package com.vagashop.mapper;

import com.vagashop.domain.entity.Vaga;
import com.vagashop.dto.response.VagaDTO;
import org.springframework.stereotype.Component;

@Component
public class VagaMapper {

    public VagaDTO toDTO(Vaga entity) {
        if (entity == null) return null;
        VagaDTO dto = new VagaDTO();
        dto.setIdVaga(entity.getIdVaga());
        if (entity.getSetor() != null) {
            dto.setIdSetor(entity.getSetor().getIdSetor());
            dto.setNomeSetor(entity.getSetor().getNomeSetor());
        }
        dto.setCodigoVaga(entity.getCodigoVaga());
        dto.setTipoVaga(entity.getTipoVaga());
        dto.setIsOcupada(false);
        return dto;
    }

    public Vaga toEntity(VagaDTO dto) {
        if (dto == null) return null;
        Vaga entity = new Vaga();
        entity.setIdVaga(dto.getIdVaga());
        entity.setCodigoVaga(dto.getCodigoVaga());
        entity.setTipoVaga(dto.getTipoVaga());
        return entity;
    }
}
