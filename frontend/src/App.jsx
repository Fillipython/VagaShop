import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  Activity, 
  RefreshCw, 
  Layers, 
  CheckCircle, 
  PlusCircle, 
  LogOut, 
  X, 
  Search, 
  ShieldCheck,
  Check,
  ChevronRight,
  Sun,
  CloudRain
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

// Componente de Ilustração Top-View de Carro
function TopViewCar({ color = '#64748b' }) {
  return (
    <svg width="68" height="34" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="car-top-view">
      {/* Carroçaria Base */}
      <rect x="5" y="6" width="90" height="38" rx="10" fill={color} />
      {/* Pneus */}
      <rect x="18" y="2" width="14" height="4" rx="2" fill="#0f172a" />
      <rect x="68" y="2" width="14" height="4" rx="2" fill="#0f172a" />
      <rect x="18" y="44" width="14" height="4" rx="2" fill="#0f172a" />
      <rect x="68" y="44" width="14" height="4" rx="2" fill="#0f172a" />
      {/* Teto e Para-brisas */}
      <path d="M 28 10 L 72 10 Q 78 10 78 16 L 78 34 Q 78 40 72 40 L 28 40 Q 22 40 22 34 L 22 16 Q 22 10 28 10 Z" fill="#1e293b" />
      {/* Vidro Dianteiro (Frente apontando para a direita) */}
      <path d="M 68 12 L 75 16 L 75 34 L 68 38 Z" fill="#94a3b8" opacity="0.9" />
      {/* Vidro Traseiro */}
      <path d="M 32 12 L 25 16 L 25 34 L 32 38 Z" fill="#94a3b8" opacity="0.8" />
      {/* Vidros Laterais */}
      <rect x="34" y="11" width="32" height="3" fill="#cbd5e1" opacity="0.8" />
      <rect x="34" y="36" width="32" height="3" fill="#cbd5e1" opacity="0.8" />
      {/* Faróis Dianteiros */}
      <rect x="91" y="8" width="3" height="6" rx="1" fill="#fef08a" />
      <rect x="91" y="36" width="3" height="6" rx="1" fill="#fef08a" />
      {/* Lanternas Traseiras */}
      <rect x="6" y="8" width="2" height="5" rx="1" fill="#ef4444" />
      <rect x="6" y="37" width="2" height="5" rx="1" fill="#ef4444" />
    </svg>
  );
}

// Cores variadas para os carros estacionados
const CAR_COLORS = ['#334155', '#475569', '#1e293b', '#2563eb', '#dc2626', '#059669', '#d97706', '#4b5563'];

export default function App() {
  const [data, setData] = useState({
    summary: { totalVagas: 0, vagasOcupadas: 0, vagasLivres: 0, taxaOcupacao: 0, atualizadoEm: '-' },
    parkedCars: [],
    recentActivity: [],
    sectors: []
  });

  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedCarForExit, setSelectedCarForExit] = useState(null);
  
  // Modais
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSaidaModal, setShowSaidaModal] = useState(false);
  const [placaInput, setPlacaInput] = useState('');
  const [modalFeedback, setModalFeedback] = useState(null);

  const isFetchingRef = useRef(false);

  const fetchData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch(`${API_BASE}/dashboard/live`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao sincronizar com backend:", err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentSector = data.sectors && data.sectors.length > 0 
    ? data.sectors[activeSectorIndex] || data.sectors[0]
    : null;

  // Divide as 20 vagas do setor atual em Lado Esquerdo (1-10) e Lado Direito (11-20)
  const leftSpots = currentSector ? (currentSector.vagas || []).slice(0, 10) : [];
  const rightSpots = currentSector ? (currentSector.vagas || []).slice(10, 20) : [];

  const handleSpotClick = (vaga) => {
    if (vaga.isOcupada) {
      setSelectedCarForExit(vaga);
      setShowSaidaModal(true);
      setModalFeedback(null);
    } else {
      setSelectedSpot(vaga);
      setModalFeedback(null);
    }
  };

  const handleConfirmEntrada = async (e) => {
    e.preventDefault();
    if (!selectedSpot || !placaInput) return;
    setModalFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/estacionamento/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: placaInput, idVaga: selectedSpot.idVaga })
      });
      const json = await res.json();
      if (res.ok) {
        setModalFeedback({ type: 'success', message: `Veículo ${json.placa} estacionado na vaga ${json.codigoVaga}!` });
        setPlacaInput('');
        setSelectedSpot(null);
        fetchData();
        setTimeout(() => { setShowEntradaModal(false); setModalFeedback(null); }, 1500);
      } else {
        const msg = json.errors ? Object.values(json.errors).join(', ') : (json.message || 'Erro ao registrar entrada.');
        setModalFeedback({ type: 'error', message: msg });
      }
    } catch (err) {
      setModalFeedback({ type: 'error', message: 'Servidor Spring Boot inacessível.' });
    }
  };

  const handleConfirmSaida = async (e) => {
    e.preventDefault();
    if (!selectedCarForExit) return;
    setModalFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/estacionamento/saida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: selectedCarForExit.placa })
      });
      const json = await res.json();
      if (res.ok) {
        setModalFeedback({ type: 'success', message: `Saída do veículo ${json.placa} confirmada! Total: R$ ${json.valorPago}` });
        setSelectedCarForExit(null);
        fetchData();
        setTimeout(() => { setShowSaidaModal(false); setModalFeedback(null); }, 2000);
      } else {
        const msg = json.errors ? Object.values(json.errors).join(', ') : (json.message || 'Erro ao registrar saída.');
        setModalFeedback({ type: 'error', message: msg });
      }
    } catch (err) {
      setModalFeedback({ type: 'error', message: 'Servidor Spring Boot inacessível.' });
    }
  };

  return (
    <div className="app-layout">
      
      {/* CABEÇALHO */}
      <header className="app-header">
        <div className="header-brand">
          <div style={{ background: '#2563eb', padding: '10px', borderRadius: '12px', color: '#fff', display: 'flex', flexShrink: 0 }}>
            <Car size={24} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              VagaShop <span style={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: 600 }}>• Smart Parking</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', wordBreak: 'break-word' }}>
              Monitoramento de Pátio e Fluxo de Veículos em Tempo Real
            </p>
          </div>
        </div>

        <div className="header-status">
          <div className="badge-simulator">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }}></span>
            <span>Simulador Ativo (Spring Boot)</span>
          </div>

          <button 
            onClick={fetchData} 
            className="btn-refresh"
          >
            <RefreshCw size={13} />
            <span>{data.summary?.atualizadoEm || '-'}</span>
          </button>
        </div>
      </header>

      {/* GRID PRINCIPAL (CANVAS DO ESTACIONAMENTO + PAINEL LATERAL) */}
      <div className="main-grid">
        
        {/* COLUNA ESQUERDA: CANVAS DE VAGAS TOP-VIEW */}
        <div className="clean-card">
          
          {/* SELETOR DE SETORES (FLOOR PILLS) */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Selecione o Setor do Estacionamento
            </div>

            <div className="floor-pills-scroll">
              {(data.sectors || []).map((sec, idx) => (
                <button
                  key={sec.idSetor}
                  onClick={() => { setActiveSectorIndex(idx); setSelectedSpot(null); }}
                  className={`floor-pill ${activeSectorIndex === idx ? 'active' : ''}`}
                >
                  {sec.nomeSetor}
                </button>
              ))}
            </div>
          </div>

          {/* STATUS DO SETOR SELECIONADO */}
          {currentSector && (
            <div className="sector-status-bar">
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{currentSector.nomeSetor}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {currentSector.isCoberto ? <Sun size={13} color="#10b981" /> : <CloudRain size={13} color="#f59e0b" />}
                  {currentSector.isCoberto ? 'Área com Cobertura' : 'Área Descoberta'} • 20 Vagas Totais
                </div>
              </div>

              <div className="sector-counts">
                <span style={{ color: '#ef4444', fontWeight: 600 }}>{currentSector.vagasOcupadas} Ocupadas</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{currentSector.vagasLivres} Livres</span>
              </div>
            </div>
          )}

          {/* PÁTIO / VISÃO TOP-VIEW DE 20 VAGAS COM PISTA CENTRAL */}
          <div className="parking-lot-canvas">
            <div className="parking-road-grid">
              
              {/* LADO ESQUERDO: Vagas 1 a 10 */}
              <div className="parking-wing">
                {leftSpots.map((vaga, i) => {
                  const isSelected = selectedSpot?.idVaga === vaga.idVaga;
                  return (
                    <div 
                      key={vaga.idVaga}
                      onClick={() => handleSpotClick(vaga)}
                      className={`parking-bay ${vaga.isOcupada ? 'occupied' : 'free'} ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="parking-bay-info">
                        <span className="parking-bay-code">{vaga.codigoVaga}</span>
                        <span className="parking-bay-type">{vaga.tipoVaga}</span>
                      </div>

                      {vaga.isOcupada ? (
                        <div className="parking-bay-content">
                          <TopViewCar color={CAR_COLORS[(vaga.idVaga || i) % CAR_COLORS.length]} />
                          <div className="brazil-plate">
                            <div className="brazil-plate-header">
                              <span>BR</span>
                            </div>
                            <div className="brazil-plate-code">{vaga.placa}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="parking-bay-action">
                          {isSelected ? (
                            <span className="badge-selected">
                              ✓ Selecionada
                            </span>
                          ) : (
                            <span className="badge-available">
                              + Disponível
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CORREDOR / PISTA CENTRAL COM MARCAÇÕES (visível no desktop) */}
              <div className="road-aisle">
                <div className="road-dashed-line"></div>
                <div className="road-marker-badge">A</div>
                <div className="road-marker-badge" style={{ marginTop: 'auto', marginBottom: 'auto' }}>B</div>
                <div className="road-marker-badge" style={{ marginTop: 'auto' }}>C</div>
              </div>

              {/* LADO DIREITO: Vagas 11 a 20 */}
              <div className="parking-wing">
                {rightSpots.map((vaga, i) => {
                  const isSelected = selectedSpot?.idVaga === vaga.idVaga;
                  return (
                    <div 
                      key={vaga.idVaga}
                      onClick={() => handleSpotClick(vaga)}
                      className={`parking-bay ${vaga.isOcupada ? 'occupied' : 'free'} ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="parking-bay-info">
                        <span className="parking-bay-code">{vaga.codigoVaga}</span>
                        <span className="parking-bay-type">{vaga.tipoVaga}</span>
                      </div>

                      {vaga.isOcupada ? (
                        <div className="parking-bay-content">
                          <TopViewCar color={CAR_COLORS[(vaga.idVaga || i + 10) % CAR_COLORS.length]} />
                          <div className="brazil-plate">
                            <div className="brazil-plate-header">
                              <span>BR</span>
                            </div>
                            <div className="brazil-plate-code">{vaga.placa}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="parking-bay-action">
                          {isSelected ? (
                            <span className="badge-selected">
                              ✓ Selecionada
                            </span>
                          ) : (
                            <span className="badge-available">
                              + Disponível
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          {/* BOTÃO FLUTUANTE DE CONFIRMAÇÃO DE ENTRADA SELECIONADA */}
          {selectedSpot && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowEntradaModal(true)}
                className="btn-primary-blue"
                style={{ width: '100%', maxWidth: '360px' }}
              >
                <Check size={18} />
                Confirmar Entrada na Vaga {selectedSpot.codigoVaga}
              </button>
            </div>
          )}

        </div>

        {/* COLUNA DIREITA: PAINEL DE CONTROLE E RESUMO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CARD DE RESUMO GERAL */}
          <div className="clean-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#2563eb" />
              Ocupação Total do Estacionamento
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Carros no Pátio</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                  {data.summary?.vagasOcupadas || 0}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Vagas Livres</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  {data.summary?.vagasLivres || 0}
                </div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                <span>Taxa de Lotação</span>
                <span>{data.summary?.taxaOcupacao || 0}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(100, data.summary?.taxaOcupacao || 0)}%`, 
                  height: '100%', 
                  background: (data.summary?.taxaOcupacao || 0) > 85 ? '#ef4444' : '#2563eb',
                  transition: 'width 0.4s ease'
                }}></div>
              </div>
            </div>
          </div>

          {/* CARD DE FEED DE MOVIMENTAÇÕES AO VIVO */}
          <div className="clean-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#2563eb" />
              Movimentação em Tempo Real
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
              {(data.recentActivity || []).slice(0, 8).map((event, idx) => (
                <div 
                  key={event.idRegistro || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: event.tipoEvento === 'ENTRADA' ? '#ecfdf5' : '#fff1f2',
                      color: event.tipoEvento === 'ENTRADA' ? '#059669' : '#e11d48'
                    }}>
                      {event.tipoEvento}
                    </span>

                    <div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{event.placa}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Vaga {event.codigoVaga} • {event.nomeSetor}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {event.dataEvento ? new Date(event.dataEvento).toLocaleTimeString() : '-'}
                    </div>
                    {event.valorPago && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                        R$ {parseFloat(event.valorPago).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTÕES RÁPIDOS DE CHECK-IN / CHECK-OUT */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => { setSelectedSpot(null); setShowEntradaModal(true); }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              <PlusCircle size={16} />
              Nova Entrada
            </button>

            <button 
              onClick={() => { setSelectedCarForExit(null); setShowSaidaModal(true); }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f43f5e',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)'
              }}
            >
              <LogOut size={16} />
              Dar Saída
            </button>
          </div>

        </div>

      </div>

      {/* MODAL ENTRADA */}
      {showEntradaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Check-in de Veículo</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedSpot ? `Vaga selecionada: ${selectedSpot.codigoVaga}` : 'Selecione a vaga e digite a placa'}
                </p>
              </div>
              <button onClick={() => setShowEntradaModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            {modalFeedback && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: modalFeedback.type === 'success' ? '#ecfdf5' : '#fff1f2',
                color: modalFeedback.type === 'success' ? '#059669' : '#e11d48',
                border: `1px solid ${modalFeedback.type === 'success' ? '#a7f3d0' : '#fecdd3'}`
              }}>
                {modalFeedback.message}
              </div>
            )}

            <form onSubmit={handleConfirmEntrada}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Placa do Carro (Mercosul ou Padrão)
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: ABC1D23 ou ABC-1234"
                  value={placaInput}
                  onChange={(e) => setPlacaInput(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    outline: 'none'
                  }}
                />
              </div>

              {!selectedSpot && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Escolha a Vaga Livre
                  </label>
                  <select
                    required
                    onChange={(e) => {
                      const vId = parseInt(e.target.value);
                      const found = currentSector?.vagas?.find(v => v.idVaga === vId);
                      if (found) setSelectedSpot(found);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">Selecione uma vaga...</option>
                    {(currentSector?.vagas || []).filter(v => !v.isOcupada).map(v => (
                      <option key={v.idVaga} value={v.idVaga}>{v.codigoVaga} ({v.tipoVaga})</option>
                    ))}
                  </select>
                </div>
              )}

              <button type="submit" className="btn-primary-blue" style={{ width: '100%' }}>
                Confirmar Estadia
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SAÍDA */}
      {showSaidaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Check-out e Pagamento</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedCarForExit ? `Veículo: ${selectedCarForExit.placa} (Vaga ${selectedCarForExit.codigoVaga})` : 'Digite a placa para calcular a tarifa'}
                </p>
              </div>
              <button onClick={() => setShowSaidaModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            {modalFeedback && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: modalFeedback.type === 'success' ? '#ecfdf5' : '#fff1f2',
                color: modalFeedback.type === 'success' ? '#059669' : '#e11d48',
                border: `1px solid ${modalFeedback.type === 'success' ? '#a7f3d0' : '#fecdd3'}`
              }}>
                {modalFeedback.message}
              </div>
            )}

            <form onSubmit={handleConfirmSaida}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Placa do Veículo
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: ABC1D23"
                  value={selectedCarForExit?.placa || ''}
                  onChange={(e) => setSelectedCarForExit({ ...selectedCarForExit, placa: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    outline: 'none'
                  }}
                />
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f43f5e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)'
                }}
              >
                Liberar Vaga e Cobrar Tarifa
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
