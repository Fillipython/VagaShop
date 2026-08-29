package com.vagashop.domain.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vaga")
public class Vaga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vaga")
    private Integer idVaga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_setor", nullable = false)
    private Setor setor;

    @Column(name = "codigo_vaga", nullable = false, length = 50)
    private String codigoVaga;

    @Column(name = "tipo_vaga", nullable = false, length = 50)
    private String tipoVaga; // 'Normal', 'PCD', 'Idoso', 'Moto'

    public Vaga() {}

    public Vaga(Integer idVaga, Setor setor, String codigoVaga, String tipoVaga) {
        this.idVaga = idVaga;
        this.setor = setor;
        this.codigoVaga = codigoVaga;
        this.tipoVaga = tipoVaga;
    }

    public Integer getIdVaga() {
        return idVaga;
    }

    public void setIdVaga(Integer idVaga) {
        this.idVaga = idVaga;
    }

    public Setor getSetor() {
        return setor;
    }

    public void setSetor(Setor setor) {
        this.setor = setor;
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
}
