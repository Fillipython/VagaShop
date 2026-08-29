package com.vagashop.service;

import com.vagashop.domain.entity.RegistroEstacionamento;
import com.vagashop.domain.entity.Setor;
import com.vagashop.domain.entity.Vaga;
import com.vagashop.dto.response.SetorDTO;
import com.vagashop.dto.response.VagaDTO;
import com.vagashop.mapper.SetorMapper;
import com.vagashop.mapper.VagaMapper;
import com.vagashop.repository.RegistroEstacionamentoRepository;
import com.vagashop.repository.SetorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SetorService {

    private final SetorRepository setorRepository;
    private final RegistroEstacionamentoRepository registroRepository;
    private final SetorMapper setorMapper;
    private final VagaMapper vagaMapper;

    public SetorService(
            SetorRepository setorRepository,
            RegistroEstacionamentoRepository registroRepository,
            SetorMapper setorMapper,
            VagaMapper vagaMapper) {
        this.setorRepository = setorRepository;
        this.registroRepository = registroRepository;
        this.setorMapper = setorMapper;
        this.vagaMapper = vagaMapper;
    }

    @Transactional(readOnly = true)
    public List<SetorDTO> listarTodosComStatus() {
        List<Setor> setores = setorRepository.findAllComVagas();
        List<RegistroEstacionamento> ativos = registroRepository.findCarrosEstacionadosAgora();

        // Mapeia ocupação por idVaga
        Map<Integer, RegistroEstacionamento> ocupacaoPorVaga = ativos.stream()
                .collect(Collectors.toMap(r -> r.getVaga().getIdVaga(), r -> r, (a, b) -> a));

        List<SetorDTO> result = new ArrayList<>();
        for (Setor s : setores) {
            SetorDTO dto = setorMapper.toDTO(s);
            int ocupadas = 0;

            if (s.getVagas() != null) {
                List<VagaDTO> vagasDTO = new ArrayList<>();
                for (Vaga v : s.getVagas()) {
                    VagaDTO vDTO = vagaMapper.toDTO(v);
                    if (ocupacaoPorVaga.containsKey(v.getIdVaga())) {
                        RegistroEstacionamento reg = ocupacaoPorVaga.get(v.getIdVaga());
                        vDTO.setIsOcupada(true);
                        vDTO.setPlaca(reg.getVeiculo().getPlaca());
                        vDTO.setDataHoraEntrada(reg.getDataHoraEntrada());
                        ocupadas++;
                    } else {
                        vDTO.setIsOcupada(false);
                    }
                    vagasDTO.add(vDTO);
                }
                dto.setVagas(vagasDTO);
            }
            dto.setTotalVagas(s.getVagas() != null ? s.getVagas().size() : 0);
            dto.setVagasOcupadas(ocupadas);
            dto.setVagasLivres(dto.getTotalVagas() - ocupadas);
            result.add(dto);
        }

        return result;
    }
}
