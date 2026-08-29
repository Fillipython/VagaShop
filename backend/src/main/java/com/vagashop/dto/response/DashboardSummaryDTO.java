package com.vagashop.dto.response;

public class DashboardSummaryDTO {

    private Integer totalVagas;
    private Integer vagasOcupadas;
    private Integer vagasLivres;
    private Double taxaOcupacao;
    private String atualizadoEm;

    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(Integer totalVagas, Integer vagasOcupadas, Integer vagasLivres, Double taxaOcupacao, String atualizadoEm) {
        this.totalVagas = totalVagas;
        this.vagasOcupadas = vagasOcupadas;
        this.vagasLivres = vagasLivres;
        this.taxaOcupacao = taxaOcupacao;
        this.atualizadoEm = atualizadoEm;
    }

    public Integer getTotalVagas() {
        return totalVagas;
    }

    public void setTotalVagas(Integer totalVagas) {
        this.totalVagas = totalVagas;
    }

    public Integer getVagasOcupadas() {
        return vagasOcupadas;
    }

    public void setVagasOcupadas(Integer vagasOcupadas) {
        this.vagasOcupadas = vagasOcupadas;
    }

    public Integer getVagasLivres() {
        return vagasLivres;
    }

    public void setVagasLivres(Integer vagasLivres) {
        this.vagasLivres = vagasLivres;
    }

    public Double getTaxaOcupacao() {
        return taxaOcupacao;
    }

    public void setTaxaOcupacao(Double taxaOcupacao) {
        this.taxaOcupacao = taxaOcupacao;
    }

    public String getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(String atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }
}
