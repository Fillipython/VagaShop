package com.vagashop.controller;

import com.vagashop.dto.response.SetorDTO;
import com.vagashop.service.SetorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/setores")
public class SetorController {

    private final SetorService setorService;

    public SetorController(SetorService setorService) {
        this.setorService = setorService;
    }

    @GetMapping
    public ResponseEntity<List<SetorDTO>> listarTodos() {
        return ResponseEntity.ok(setorService.listarTodosComStatus());
    }
}
