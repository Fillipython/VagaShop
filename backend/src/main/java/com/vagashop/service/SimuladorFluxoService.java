package com.vagashop.service;

import com.vagashop.domain.entity.RegistroEstacionamento;
import com.vagashop.domain.entity.Setor;
import com.vagashop.domain.entity.Vaga;
import com.vagashop.domain.entity.Veiculo;
import com.vagashop.domain.enums.TipoVaga;
import com.vagashop.dto.request.EntradaVeiculoDTO;
import com.vagashop.dto.request.SaidaVeiculoDTO;
import com.vagashop.repository.RegistroEstacionamentoRepository;
import com.vagashop.repository.SetorRepository;
import com.vagashop.repository.VagaRepository;
import com.vagashop.repository.VeiculoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class SimuladorFluxoService {

    private static final Logger log = LoggerFactory.getLogger(SimuladorFluxoService.class);
    private final Random random = new Random();

    private final SetorRepository setorRepository;
    private final VagaRepository vagaRepository;
    private final VeiculoRepository veiculoRepository;
    private final RegistroEstacionamentoRepository registroRepository;
    private final EstacionamentoService estacionamentoService;

    public SimuladorFluxoService(
            SetorRepository setorRepository,
            VagaRepository vagaRepository,
            VeiculoRepository veiculoRepository,
            RegistroEstacionamentoRepository registroRepository,
            EstacionamentoService estacionamentoService) {
        this.setorRepository = setorRepository;
        this.vagaRepository = vagaRepository;
        this.veiculoRepository = veiculoRepository;
        this.registroRepository = registroRepository;
        this.estacionamentoService = estacionamentoService;
    }

    /**
     * Inicializa os 5 setores e 100 vagas e popula alguns carros ao subir o Spring
     * Boot.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void inicializarEstruturaEPopulacao() {
        if (setorRepository.count() == 0) {
            log.info("Inicializando os 5 setores (3 cobertos, 2 descobertos) e 100 vagas...");

            Object[][] setoresConfig = {
                    { "Setor G1 (Coberto)", true, "G1" },
                    { "Setor G2 (Coberto)", true, "G2" },
                    { "Setor G3 (Descoberto)", false, "G3" },
                    { "Setor G4 (Coberto)", true, "G4" },
                    { "Setor Subsolo (Descoberto)", false, "SUB" }
            };

            for (Object[] config : setoresConfig) {
                Setor setor = new Setor(null, (String) config[0], (Boolean) config[1]);
                Setor salvo = setorRepository.save(setor);

                List<Vaga> vagas = new ArrayList<>();
                for (int i = 1; i <= 20; i++) {
                    String tipo = (i <= 14) ? TipoVaga.NORMAL.getDescricao()
                            : (i <= 16) ? TipoVaga.PCD.getDescricao()
                                    : (i <= 18) ? TipoVaga.IDOSO.getDescricao() : TipoVaga.MOTO.getDescricao();

                    String codigo = String.format("%s-%02d", config[2], i);
                    vagas.add(new Vaga(null, salvo, codigo, tipo));
                }
                vagaRepository.saveAll(vagas);
            }
            log.info("Setores e vagas criados com sucesso!");
        }

        // Se não houver carros estacionados, popula entre 25 a 35 carros iniciais
        if (registroRepository.findCarrosEstacionadosAgora().isEmpty()) {
            List<Vaga> vagasLivres = vagaRepository.findVagasLivres();
            int quantidadeInicial = Math.min(30, vagasLivres.size());
            log.info("Populando {} carros iniciais no estacionamento...", quantidadeInicial);

            for (int i = 0; i < quantidadeInicial; i++) {
                Vaga vaga = vagasLivres.get(i);
                String placa = gerarPlacaAleatoria();

                Veiculo veiculo = veiculoRepository.findByPlaca(placa)
                        .orElseGet(() -> veiculoRepository.save(new Veiculo(placa)));

                RegistroEstacionamento reg = new RegistroEstacionamento();
                reg.setVeiculo(veiculo);
                reg.setVaga(vaga);
                reg.setDataHoraEntrada(LocalDateTime.now().minusMinutes(random.nextInt(120) + 5));
                registroRepository.save(reg);
            }
            log.info("Pátio populado com sucesso!");
        }
    }

    /**
     * Roda a cada 3 segundos simulando carros entrando e saindo em tempo real.
     */
    @Scheduled(fixedRate = 3000)
    public void simularFluxoTempoReal() {
        try {
            // 1. Simulação de Saída (40% de chance)
            if (random.nextDouble() < 0.40) {
                List<RegistroEstacionamento> estacionados = registroRepository.findCarrosEstacionadosAgora();
                if (!estacionados.isEmpty()) {
                    RegistroEstacionamento escolhido = estacionados.get(random.nextInt(estacionados.size()));
                    estacionamentoService.registrarSaida(new SaidaVeiculoDTO(escolhido.getVeiculo().getPlaca()));
                    log.info("SAÍDA: Veículo [{}] saiu da vaga [{}]", escolhido.getVeiculo().getPlaca(),
                            escolhido.getVaga().getCodigoVaga());
                }
            }

            // 2. Simulação de Entrada (50% de chance)
            if (random.nextDouble() < 0.50) {
                List<Vaga> vagasLivres = vagaRepository.findVagasLivres();
                if (!vagasLivres.isEmpty()) {
                    Vaga vagaEscolhida = vagasLivres.get(random.nextInt(vagasLivres.size()));
                    String placa = gerarPlacaAleatoria();
                    estacionamentoService.registrarEntrada(new EntradaVeiculoDTO(placa, vagaEscolhida.getIdVaga()));
                    log.info("ENTRADA: Veículo [{}] estacionou na vaga [{}]", placa, vagaEscolhida.getCodigoVaga());
                }
            }
        } catch (Exception e) {
            log.warn("Falha passageira no ciclo do simulador: {}", e.getMessage());
        }
    }

    private String gerarPlacaAleatoria() {
        String letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String numeros = "0123456789";

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++)
            sb.append(letras.charAt(random.nextInt(letras.length())));

        if (random.nextBoolean()) {
            // Mercosul: AAA1A23
            sb.append(numeros.charAt(random.nextInt(numeros.length())));
            sb.append(letras.charAt(random.nextInt(letras.length())));
            sb.append(numeros.charAt(random.nextInt(numeros.length())));
            sb.append(numeros.charAt(random.nextInt(numeros.length())));
        } else {
            // Tradicional: AAA-1234
            sb.append("-");
            for (int i = 0; i < 4; i++)
                sb.append(numeros.charAt(random.nextInt(numeros.length())));
        }
        return sb.toString();
    }
}
