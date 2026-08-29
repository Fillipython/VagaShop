package com.vagashop.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RegistroEstacionamentoDTO {

    private Integer idRegistro;
    private String placa;
    private Integer idVaga;
    private String codigoVaga;
    private String tipoVaga;
    private String nomeSetor;
    private Boolean isCoberto;
    private LocalDateTime dataHoraEntrada;
    private LocalDateTime dataHoraSaida;
    private BigDecimal valorPago;
    private Long minutosEstacionado;

    public RegistroEstacionamentoDTO() {}

    public Integer getIdRegistro() {
        return idRegistro;
    }

    public void setIdRegistro(Integer idRegistro) {
        this.idRegistro = idRegistro;
    }

    public String getPlaca() {
        return placa;
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

    public String getCodigoVaga() {
        return codigoVaga;
    }

    public void setCodigoVaga(String codigoVaga) {
        this.codigoVaga = codigoVaga;
    }

    public String getTipoVaga() {
        return tipoVaga;
    }

    public void setTipoVaga(String tipoVaga) {
        this.tipoVaga = tipoVaga;
    }

    public String getNomeSetor() {
        return nomeSetor;
    }

    public void setNomeSetor(String nomeSetor) {
        this.nomeSetor = nomeSetor;
    }

    public Boolean getIsCoberto() {
        return isCoberto;
    }

    public void setIsCoberto(Boolean isCoberto) {
        this.isCoberto = isCoberto;
    }

    public LocalDateTime getDataHoraEntrada() {
        return dataHoraEntrada;
    }

    public void setDataHoraEntrada(LocalDateTime dataHoraEntrada) {
        this.dataHoraEntrada = dataHoraEntrada;
    }

    public LocalDateTime getDataHoraSaida() {
        return dataHoraSaida;
    }

    public void setDataHoraSaida(LocalDateTime dataHoraSaida) {
        this.dataHoraSaida = dataHoraSaida;
    }

    public BigDecimal getValorPago() {
        return valorPago;
    }

    public void setValorPago(BigDecimal valorPago) {
        this.valorPago = valorPago;
    }

    public Long getMinutosEstacionado() {
        return minutosEstacionado;
    }

    public void setMinutosEstacionado(Long minutosEstacionado) {
        this.minutosEstacionado = minutosEstacionado;
    }
}
