package com.vagashop.dto.response;

public class VeiculoDTO {

    private Integer idVeiculo;
    private String placa;

    public VeiculoDTO() {}

    public VeiculoDTO(Integer idVeiculo, String placa) {
        this.idVeiculo = idVeiculo;
        this.placa = placa;
    }

    public Integer getIdVeiculo() {
        return idVeiculo;
    }

    public void setIdVeiculo(Integer idVeiculo) {
        this.idVeiculo = idVeiculo;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }
}
