package com.vagashop.constant;

import java.math.BigDecimal;

public final class EstacionamentoConstants {

    private EstacionamentoConstants() {
        // Construtor privado para impedir instanciação
    }

    public static final String REGEX_PLACA = "^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$";
    public static final String MENSAGEM_PLACA_INVALIDA = "Formato de placa inválido. Use o padrão Mercosul (ex: BRA2E19) ou Tradicional (ex: ABC-1234)";
    public static final String MENSAGEM_PLACA_OBRIGATORIA = "A placa do veículo é obrigatória";

    public static final BigDecimal VALOR_POR_HORA = new BigDecimal("5.00");
    public static final String FORMATO_HORA = "HH:mm:ss";
}
