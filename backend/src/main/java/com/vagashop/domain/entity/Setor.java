package com.vagashop.domain.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "setor")
public class Setor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_setor")
    private Integer idSetor;

    @Column(name = "nome_setor", nullable = false, length = 100)
    private String nomeSetor;

    @Column(name = "is_coberto", nullable = false)
    private Boolean isCoberto;

    @OneToMany(mappedBy = "setor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Vaga> vagas = new ArrayList<>();

    public Setor() {}

    public Setor(Integer idSetor, String nomeSetor, Boolean isCoberto) {
        this.idSetor = idSetor;
        this.nomeSetor = nomeSetor;
        this.isCoberto = isCoberto;
    }

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

    public List<Vaga> getVagas() {
        return vagas;
    }

    public void setVagas(List<Vaga> vagas) {
        this.vagas = vagas;
    }
}
