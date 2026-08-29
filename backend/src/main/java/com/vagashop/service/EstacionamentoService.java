package com.vagashop.service;

import com.vagashop.constant.EstacionamentoConstants;
import com.vagashop.domain.entity.RegistroEstacionamento;
import com.vagashop.domain.entity.Vaga;
import com.vagashop.domain.entity.Veiculo;
import com.vagashop.dto.request.EntradaVeiculoDTO;
import com.vagashop.dto.request.SaidaVeiculoDTO;
import com.vagashop.dto.response.RegistroEstacionamentoDTO;
import com.vagashop.exception.BusinessException;
import com.vagashop.exception.ResourceNotFoundException;
import com.vagashop.mapper.RegistroEstacionamentoMapper;
import com.vagashop.repository.RegistroEstacionamentoRepository;
import com.vagashop.repository.VagaRepository;
import com.vagashop.repository.VeiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class EstacionamentoService {

    private final RegistroEstacionamentoRepository registroRepository;
    private final VeiculoRepository veiculoRepository;
    private final VagaRepository vagaRepository;
    private final RegistroEstacionamentoMapper registroMapper;

    public EstacionamentoService(
            RegistroEstacionamentoRepository registroRepository,
            VeiculoRepository veiculoRepository,
            VagaRepository vagaRepository,
            RegistroEstacionamentoMapper registroMapper) {
        this.registroRepository = registroRepository;
        this.veiculoRepository = veiculoRepository;
        this.vagaRepository = vagaRepository;
        this.registroMapper = registroMapper;
    }

    @Transactional
    public RegistroEstacionamentoDTO registrarEntrada(EntradaVeiculoDTO dto) {
        String placaFormatada = dto.getPlaca();

        // Regra 1: Verificar se o veículo já está estacionado atualmente
        registroRepository.findAtivoPorPlaca(placaFormatada).ifPresent(r -> {
            throw new BusinessException("O veículo de placa " + placaFormatada + " já possui uma estadia ativa na vaga " + r.getVaga().getCodigoVaga());
        });

        // Regra 2: Verificar se a vaga existe
        Vaga vaga = vagaRepository.findById(dto.getIdVaga())
                .orElseThrow(() -> new ResourceNotFoundException("Vaga de identificador " + dto.getIdVaga() + " não encontrada"));

        // Regra 3: Verificar se a vaga já está ocupada
        registroRepository.findAtivoPorVaga(vaga.getIdVaga()).ifPresent(r -> {
            throw new BusinessException("A vaga " + vaga.getCodigoVaga() + " já está ocupada pelo veículo " + r.getVeiculo().getPlaca());
        });

        // Regra 4: Obter ou cadastrar o veículo
        Veiculo veiculo = veiculoRepository.findByPlaca(placaFormatada)
                .orElseGet(() -> veiculoRepository.save(new Veiculo(placaFormatada)));

        // Regra 5: Criar e persistir o registro de entrada
        RegistroEstacionamento registro = new RegistroEstacionamento();
        registro.setVeiculo(veiculo);
        registro.setVaga(vaga);
        registro.setDataHoraEntrada(LocalDateTime.now());

        RegistroEstacionamento salvo = registroRepository.save(registro);
        return registroMapper.toDTO(salvo);
    }

    @Transactional
    public RegistroEstacionamentoDTO registrarSaida(SaidaVeiculoDTO dto) {
        String placaFormatada = dto.getPlaca();

        // Regra 1: Buscar a estadia ativa do veículo
        RegistroEstacionamento registro = registroRepository.findAtivoPorPlaca(placaFormatada)
                .orElseThrow(() -> new BusinessException("Nenhuma estadia ativa encontrada para o veículo com placa " + placaFormatada));

        // Regra 2: Calcular tempo e valor a ser pago
        LocalDateTime saida = LocalDateTime.now();
        registro.setDataHoraSaida(saida);

        long minutos = Math.max(1, Duration.between(registro.getDataHoraEntrada(), saida).toMinutes());
        long horas = Math.max(1, (long) Math.ceil(minutos / 60.0));
        BigDecimal totalAPagar = EstacionamentoConstants.VALOR_POR_HORA.multiply(BigDecimal.valueOf(horas));
        registro.setValorPago(totalAPagar);

        RegistroEstacionamento atualizado = registroRepository.save(registro);
        return registroMapper.toDTO(atualizado);
    }
}
