package com.vagashop.dto.request;

import com.vagashop.constant.EstacionamentoConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class EntradaVeiculoDTO {

    @NotBlank(message = EstacionamentoConstants.MENSAGEM_PLACA_OBRIGATORIA)
    @Pattern(
        regexp = EstacionamentoConstants.REGEX_PLACA,
        message = EstacionamentoConstants.MENSAGEM_PLACA_INVALIDA
    )
    private String placa;

    @NotNull(message = "O identificador da vaga é obrigatório")
    private Integer idVaga;

    public EntradaVeiculoDTO() {}

    public EntradaVeiculoDTO(String placa, Integer idVaga) {
        this.placa = placa;
        this.idVaga = idVaga;
    }

    public String getPlaca() {
        return placa != null ? placa.trim().toUpperCase() : null;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public Integer getIdVaga() {
        return idVaga;
    }

    public void setIdVaga(Integer idVaga) {
        this.idVaga = idVaga;
    }
}
