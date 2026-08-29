package com.vagashop.mapper;

import com.vagashop.domain.entity.Setor;
import com.vagashop.dto.response.SetorDTO;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class SetorMapper {

    private final VagaMapper vagaMapper;

    public SetorMapper(VagaMapper vagaMapper) {
        this.vagaMapper = vagaMapper;
    }

    public SetorDTO toDTO(Setor entity) {
        if (entity == null) return null;
        SetorDTO dto = new SetorDTO();
        dto.setIdSetor(entity.getIdSetor());
        dto.setNomeSetor(entity.getNomeSetor());
        dto.setIsCoberto(entity.getIsCoberto());
        if (entity.getVagas() != null) {
            dto.setVagas(entity.getVagas().stream().map(vagaMapper::toDTO).collect(Collectors.toList()));
            dto.setTotalVagas(entity.getVagas().size());
        } else {
            dto.setTotalVagas(0);
        }
        return dto;
    }

    public Setor toEntity(SetorDTO dto) {
        if (dto == null) return null;
        Setor entity = new Setor();
        entity.setIdSetor(dto.getIdSetor());
        entity.setNomeSetor(dto.getNomeSetor());
        entity.setIsCoberto(dto.getIsCoberto());
        return entity;
    }
}
