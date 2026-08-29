package com.vagashop.domain.enums;

public enum TipoVaga {
    NORMAL("Normal"),
    PCD("PCD"),
    IDOSO("Idoso"),
    MOTO("Moto");

    private final String descricao;

    TipoVaga(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public static TipoVaga fromString(String text) {
        if (text == null) return NORMAL;
        for (TipoVaga b : TipoVaga.values()) {
            if (b.name().equalsIgnoreCase(text) || b.descricao.equalsIgnoreCase(text)) {
                return b;
            }
        }
        return NORMAL;
    }
}
