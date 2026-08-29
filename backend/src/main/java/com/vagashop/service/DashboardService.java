package com.vagashop.service;

import com.vagashop.constant.EstacionamentoConstants;
import com.vagashop.domain.entity.RegistroEstacionamento;
import com.vagashop.dto.response.*;
import com.vagashop.mapper.RegistroEstacionamentoMapper;
import com.vagashop.repository.RegistroEstacionamentoRepository;
import com.vagashop.repository.VagaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final RegistroEstacionamentoRepository registroRepository;
    private final VagaRepository vagaRepository;
    private final SetorService setorService;
    private final RegistroEstacionamentoMapper registroMapper;

    public DashboardService(
            RegistroEstacionamentoRepository registroRepository,
            VagaRepository vagaRepository,
            SetorService setorService,
            RegistroEstacionamentoMapper registroMapper) {
        this.registroRepository = registroRepository;
        this.vagaRepository = vagaRepository;
        this.setorService = setorService;
        this.registroMapper = registroMapper;
    }

    @Transactional(readOnly = true)
    public LiveDashboardDTO getLiveDashboard() {
        // 1. Carros estacionados agora
        List<RegistroEstacionamento> ativos = registroRepository.findCarrosEstacionadosAgora();
        List<RegistroEstacionamentoDTO> parkedCars = ativos.stream()
                .map(registroMapper::toDTO)
                .collect(Collectors.toList());

        // 2. Total de vagas
        long totalVagas = vagaRepository.count();
        int ocupadas = parkedCars.size();
        int livres = Math.max(0, (int) totalVagas - ocupadas);
        double taxaOcupacao = totalVagas > 0 ? Math.round((ocupadas / (double) totalVagas * 100.0) * 10.0) / 10.0 : 0.0;
        String horaAtual = LocalTime.now().format(DateTimeFormatter.ofPattern(EstacionamentoConstants.FORMATO_HORA));

        DashboardSummaryDTO summary = new DashboardSummaryDTO(
                (int) totalVagas,
                ocupadas,
                livres,
                taxaOcupacao,
                horaAtual
        );

        // 3. Atividades recentes (limitado estritamente às últimas 30)
        List<RegistroEstacionamento> recentes = registroRepository.findAtividadesRecentes(
                org.springframework.data.domain.PageRequest.of(0, 30)
        );
        List<AtividadeRecenteDTO> recentActivity = recentes.stream()
                .map(registroMapper::toAtividadeDTO)
                .collect(Collectors.toList());

        // 4. Setores e mapa de vagas
        List<SetorDTO> sectors = setorService.listarTodosComStatus();

        return new LiveDashboardDTO(summary, parkedCars, recentActivity, sectors);
    }
}
