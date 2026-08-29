package com.vagashop.domain.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "veiculo")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_veiculo")
    private Integer idVeiculo;

    @Column(name = "placa", nullable = false, unique = true, length = 20)
    private String placa;

    public Veiculo() {}

    public Veiculo(Integer idVeiculo, String placa) {
        this.idVeiculo = idVeiculo;
        this.placa = placa;
    }

    public Veiculo(String placa) {
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
