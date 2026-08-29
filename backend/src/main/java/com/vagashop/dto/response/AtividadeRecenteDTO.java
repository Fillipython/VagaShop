package com.vagashop.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AtividadeRecenteDTO {

    private Integer idRegistro;
    private String tipoEvento; // 'ENTRADA' ou 'SAIDA'
    private String placa;
    private String nomeSetor;
    private String codigoVaga;
    private LocalDateTime dataEvento;
    private BigDecimal valorPago;

    public AtividadeRecenteDTO() {}

    public AtividadeRecenteDTO(Integer idRegistro, String tipoEvento, String placa, String nomeSetor, String codigoVaga, LocalDateTime dataEvento, BigDecimal valorPago) {
        this.idRegistro = idRegistro;
        this.tipoEvento = tipoEvento;
        this.placa = placa;
        this.nomeSetor = nomeSetor;
        this.codigoVaga = codigoVaga;
        this.dataEvento = dataEvento;
        this.valorPago = valorPago;
    }

    public Integer getIdRegistro() {
        return idRegistro;
    }

    public void setIdRegistro(Integer idRegistro) {
        this.idRegistro = idRegistro;
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public String getPlaca() {
        return placa;
    }

    public void setPlaca(String placa) {
        this.placa = placa;
    }

    public String getNomeSetor() {
        return nomeSetor;
    }

    public void setNomeSetor(String nomeSetor) {
        this.nomeSetor = nomeSetor;
    }

    public String getCodigoVaga() {
        return codigoVaga;
    }

    public void setCodigoVaga(String codigoVaga) {
        this.codigoVaga = codigoVaga;
    }

    public LocalDateTime getDataEvento() {
        return dataEvento;
    }

    public void setDataEvento(LocalDateTime dataEvento) {
        this.dataEvento = dataEvento;
    }

    public BigDecimal getValorPago() {
        return valorPago;
    }

    public void setValorPago(BigDecimal valorPago) {
        this.valorPago = valorPago;
    }
}
