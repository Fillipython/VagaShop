package com.vagashop.dto.response;

import java.util.ArrayList;
import java.util.List;

public class SetorDTO {

    private Integer idSetor;
    private String nomeSetor;
    private Boolean isCoberto;
    private Integer totalVagas;
    private Integer vagasOcupadas;
    private Integer vagasLivres;
    private List<VagaDTO> vagas = new ArrayList<>();

    public SetorDTO() {}

    public Integer getIdSetor() {
        return idSetor;
    }

    public void setIdSetor(Integer idSetor) {
        this.idSetor = idSetor;
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

    public List<VagaDTO> getVagas() {
        return vagas;
    }

    public void setVagas(List<VagaDTO> vagas) {
        this.vagas = vagas;
    }
}
