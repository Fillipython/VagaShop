package com.vagashop.domain.enums;

public enum TipoEvento {
    ENTRADA("Entrada"),
    SAIDA("Saída");

    private final String descricao;

    TipoEvento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
