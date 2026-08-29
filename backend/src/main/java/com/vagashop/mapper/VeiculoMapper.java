package com.vagashop.mapper;

import com.vagashop.domain.entity.Veiculo;
import com.vagashop.dto.response.VeiculoDTO;
import org.springframework.stereotype.Component;

@Component
public class VeiculoMapper {

    public VeiculoDTO toDTO(Veiculo entity) {
        if (entity == null) return null;
        return new VeiculoDTO(entity.getIdVeiculo(), entity.getPlaca());
    }

    public Veiculo toEntity(VeiculoDTO dto) {
        if (dto == null) return null;
        return new Veiculo(dto.getIdVeiculo(), dto.getPlaca());
    }
}
