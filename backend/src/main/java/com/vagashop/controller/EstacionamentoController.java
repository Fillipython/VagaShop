package com.vagashop.controller;

import com.vagashop.dto.request.EntradaVeiculoDTO;
import com.vagashop.dto.request.SaidaVeiculoDTO;
import com.vagashop.dto.response.RegistroEstacionamentoDTO;
import com.vagashop.service.EstacionamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estacionamento")
public class EstacionamentoController {

    private final EstacionamentoService estacionamentoService;

    public EstacionamentoController(EstacionamentoService estacionamentoService) {
        this.estacionamentoService = estacionamentoService;
    }

    @PostMapping("/entrada")
    public ResponseEntity<RegistroEstacionamentoDTO> registrarEntrada(@Valid @RequestBody EntradaVeiculoDTO dto) {
        RegistroEstacionamentoDTO response = estacionamentoService.registrarEntrada(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/saida")
    public ResponseEntity<RegistroEstacionamentoDTO> registrarSaida(@Valid @RequestBody SaidaVeiculoDTO dto) {
        RegistroEstacionamentoDTO response = estacionamentoService.registrarSaida(dto);
        return ResponseEntity.ok(response);
    }
}
