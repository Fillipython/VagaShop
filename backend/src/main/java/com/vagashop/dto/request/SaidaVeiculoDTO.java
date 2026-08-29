package com.vagashop.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SaidaVeiculoDTO {

    @NotBlank(message = "A placa do veículo é obrigatória para registrar a saída")
    private String placa;

    public SaidaVeiculoDTO() {}

    public SaidaVeiculoDTO(String placa) {
        this.placa = placa;
    }

    public String getPlaca() {
        return placa != null ? placa.trim().toUpperCase() : null;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }
}
