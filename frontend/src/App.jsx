import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  Activity, 
  RefreshCw, 
  Sun, 
  CloudRain, 
  ArrowDownRight, 
  ArrowUpRight, 
  Layers, 
  Search,
  CheckCircle2,
  PlusCircle,
  LogOut,
  X,
  AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

export default function App() {
  const [data, setData] = useState({
    summary: { totalVagas: 0, vagasOcupadas: 0, vagasLivres: 0, taxaOcupacao: 0, atualizadoEm: '-' },
    parkedCars: [],
    recentActivity: [],
    sectors: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('parked'); // 'parked' | 'feed' | 'map'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  
  // Modais de Entrada e Saída
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSaidaModal, setShowSaidaModal] = useState(false);
  const [placaEntrada, setPlacaEntrada] = useState('');
  const [vagaEntrada, setVagaEntrada] = useState('');
  const [placaSaida, setPlacaSaida] = useState('');
  const [modalFeedback, setModalFeedback] = useState(null); // { type: 'success'|'error', message: '' }
  const isFetchingRef = React.useRef(false);

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
      console.error("Erro ao conectar ao backend Spring Boot:", err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEntrada = async (e) => {
    e.preventDefault();
    setModalFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/estacionamento/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: placaEntrada, idVaga: parseInt(vagaEntrada) })
      });
      const json = await res.json();
      if (res.ok) {
        setModalFeedback({ type: 'success', message: `Veículo ${json.placa} registrado na vaga ${json.codigoVaga}!` });
        setPlacaEntrada('');
        setVagaEntrada('');
        fetchData();
        setTimeout(() => { setShowEntradaModal(false); setModalFeedback(null); }, 1500);
      } else {
        const msg = json.errors ? Object.values(json.errors).join(', ') : (json.message || 'Erro ao registrar entrada.');
        setModalFeedback({ type: 'error', message: msg });
      }
    } catch (err) {
      setModalFeedback({ type: 'error', message: 'Falha na conexão com o servidor Spring Boot.' });
    }
  };

  const handleSaida = async (e) => {
    e.preventDefault();
    setModalFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/estacionamento/saida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: placaSaida })
      });
      const json = await res.json();
      if (res.ok) {
        setModalFeedback({ type: 'success', message: `Saída do veículo ${json.placa} realizada! Total: R$ ${json.valorPago}` });
        setPlacaSaida('');
        fetchData();
        setTimeout(() => { setShowSaidaModal(false); setModalFeedback(null); }, 2000);
      } else {
        const msg = json.errors ? Object.values(json.errors).join(', ') : (json.message || 'Erro ao registrar saída.');
        setModalFeedback({ type: 'error', message: msg });
      }
    } catch (err) {
      setModalFeedback({ type: 'error', message: 'Falha na conexão com o servidor Spring Boot.' });
    }
  };

  const filteredCars = (data.parkedCars || []).filter(car => {
    const matchesSearch = (car.placa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (car.codigoVaga || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || car.nomeSetor === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Lista todas as vagas livres para preencher o select do modal de entrada
  const vagasLivresList = [];
  (data.sectors || []).forEach(sec => {
    (sec.vagas || []).forEach(v => {
      if (!v.isOcupada) {
        vagasLivresList.push({ idVaga: v.idVaga, codigoVaga: v.codigoVaga, nomeSetor: sec.nomeSetor });
      }
    });
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* HEADER */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
            padding: '12px', 
            borderRadius: '14px',
            boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.5)'
          }}>
            <Car size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Vaga<span style={{ color: '#3b82f6' }}>Shop</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                Spring Boot + React
              </span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monitoramento de Pátio e Fluxo de Veículos em Tempo Real</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setModalFeedback(null); setShowEntradaModal(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              background: '#10b981',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
            }}
          >
            <PlusCircle size={17} />
            Registrar Entrada
          </button>

          <button 
            onClick={() => { setModalFeedback(null); setShowSaidaModal(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: 'none',
              background: '#f43f5e',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)'
            }}
          >
            <LogOut size={17} />
            Registrar Saída
          </button>

          <div className="live-badge">
            <span className="pulse-dot"></span>
            Spring API Conectada
          </div>
          
          <button 
            onClick={fetchData} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {data.summary?.atualizadoEm || '-'}
          </button>
        </div>
      </header>

      {/* METRICS CARDS */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total de Vagas</span>
            <Layers size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {data.summary?.totalVagas || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            5 Setores cadastrados
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Carros Estacionados</span>
            <Car size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fb7185' }}>
            {data.summary?.vagasOcupadas || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {data.summary?.taxaOcupacao || 0}% de ocupação
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Vagas Livres</span>
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
            {data.summary?.vagasLivres || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Disponíveis para entrada
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Taxa de Lotação</span>
            <Activity size={18} color="#a78bfa" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>
            {data.summary?.taxaOcupacao || 0}%
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '4px', 
            marginTop: '10px',
            overflow: 'hidden' 
          }}>
            <div style={{ 
              width: `${Math.min(100, data.summary?.taxaOcupacao || 0)}%`, 
              height: '100%', 
              background: (data.summary?.taxaOcupacao || 0) > 80 ? '#f43f5e' : ((data.summary?.taxaOcupacao || 0) > 50 ? '#f59e0b' : '#3b82f6'),
              transition: 'width 0.5s ease-in-out'
            }}></div>
          </div>
        </div>
      </section>

      {/* TABS & FILTERS */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          background: 'rgba(17, 24, 39, 0.6)', 
          padding: '4px', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)' 
        }}>
          <button 
            onClick={() => setActiveTab('parked')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'parked' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'parked' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Car size={16} />
            Carros Estacionados Agora ({(data.parkedCars || []).length})
          </button>

          <button 
            onClick={() => setActiveTab('feed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'feed' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'feed' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Activity size={16} />
            Feed em Tempo Real
          </button>

          <button 
            onClick={() => setActiveTab('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'map' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'map' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <MapPin size={16} />
            Mapa dos 5 Setores
          </button>
        </div>

        {activeTab === 'parked' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar placa ou vaga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 12px 8px 36px',
                  color: '#fff',
                  fontSize: '0.875rem',
                  outline: 'none',
                  width: '200px'
                }}
              />
            </div>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            >
              <option value="ALL">Todos os Setores</option>
              {(data.sectors || []).map(s => (
                <option key={s.idSetor} value={s.nomeSetor}>{s.nomeSetor}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CONTENT: TAB 1 - CARROS ESTACIONADOS AGORA */}
      {activeTab === 'parked' && (
        <div>
          {filteredCars.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Car size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h3>Nenhum veículo encontrado no pátio neste momento.</h3>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {filteredCars.map((car) => (
                <div key={car.idRegistro || car.idVaga} className="glass-card" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />

                  {/* Header: Placa & Vaga */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div className="plate-tag">
                      <div className="plate-header">
                        <span>BRASIL</span>
                        <span>BR</span>
                      </div>
                      <div className="plate-text">{car.placa}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        background: 'rgba(59, 130, 246, 0.15)', 
                        color: '#60a5fa', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: '1px solid rgba(59, 130, 246, 0.3)'
                      }}>
                        Vaga {car.codigoVaga}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Tipo: {car.tipoVaga}
                      </div>
                    </div>
                  </div>

                  {/* Setor */}
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.03)', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <MapPin size={15} color="#94a3b8" />
                      <span>{car.nomeSetor}</span>
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: car.isCoberto ? '#34d399' : '#f59e0b' 
                    }}>
                      {car.isCoberto ? <Sun size={13} /> : <CloudRain size={13} />}
                      {car.isCoberto ? 'Coberto' : 'Descoberto'}
                    </span>
                  </div>

                  {/* Entrada e Tempo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} /> Entrada: {car.dataHoraEntrada ? new Date(car.dataHoraEntrada).toLocaleTimeString() : '-'}
                    </span>
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      color: '#34d399', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 600 
                    }}>
                      {car.minutosEstacionado > 0 ? `${car.minutosEstacionado} min` : 'Recém chegado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENT: TAB 2 - FEED EM TEMPO REAL */}
      {activeTab === 'feed' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="#3b82f6" />
            Fluxo de Entradas e Saídas em Tempo Real
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(data.recentActivity || []).map((event, idx) => (
              <div 
                key={event.idRegistro || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: event.tipoEvento === 'ENTRADA' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                  border: `1px solid ${event.tipoEvento === 'ENTRADA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: event.tipoEvento === 'ENTRADA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    color: event.tipoEvento === 'ENTRADA' ? '#34d399' : '#fb7185'
                  }}>
                    {event.tipoEvento === 'ENTRADA' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{event.placa}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: event.tipoEvento === 'ENTRADA' ? '#10b981' : '#f43f5e',
                        color: '#fff',
                        fontWeight: 700
                      }}>
                        {event.tipoEvento}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {event.nomeSetor} • Vaga {event.codigoVaga}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {event.dataEvento ? new Date(event.dataEvento).toLocaleTimeString() : '-'}
                  </div>
                  {event.valorPago && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                      Pago: R$ {parseFloat(event.valorPago).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT: TAB 3 - MAPA DOS 5 SETORES */}
      {activeTab === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {(data.sectors || []).map((sector) => (
            <div key={sector.idSetor} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{sector.nomeSetor}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {sector.isCoberto ? 'Área Coberta' : 'Área Descoberta'} • {sector.totalVagas} Vagas Totais
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {sector.vagasOcupadas} Ocupadas
                  </span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {sector.vagasLivres} Livres
                  </span>
                </div>
              </div>

              {/* Grid das 20 Vagas */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
                gap: '10px' 
              }}>
                {(sector.vagas || []).map((vaga) => (
                  <div 
                    key={vaga.idVaga}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '8px',
                      background: vaga.isOcupada ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                      border: `1px solid ${vaga.isOcupada ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: vaga.isOcupada ? '#fb7185' : '#34d399' }}>
                      {vaga.codigoVaga}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {vaga.tipoVaga}
                    </div>

                    {vaga.isOcupada ? (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        background: '#000', 
                        padding: '2px 4px', 
                        borderRadius: '4px',
                        color: '#fff',
                        marginTop: '4px'
                      }}>
                        {vaga.placa}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, marginTop: '4px' }}>
                        LIVRE
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: REGISTRAR ENTRADA */}
      {showEntradaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', background: '#111827', position: 'relative' }}>
            <button 
              onClick={() => setShowEntradaModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PlusCircle size={20} color="#10b981" />
              Registrar Entrada de Veículo
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Insira a placa e selecione a vaga disponível para check-in.
            </p>

            {modalFeedback && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: modalFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: modalFeedback.type === 'success' ? '#34d399' : '#fb7185',
                border: `1px solid ${modalFeedback.type === 'success' ? '#10b981' : '#f43f5e'}`
              }}>
                {modalFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {modalFeedback.message}
              </div>
            )}

            <form onSubmit={handleEntrada}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Placa do Veículo (Mercosul ou Tradicional)
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: ABC1D23 ou ABC-1234"
                  value={placaEntrada}
                  onChange={(e) => setPlacaEntrada(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '1px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Selecione a Vaga Livre ({vagasLivresList.length} disponíveis)
                </label>
                <select
                  required
                  value={vagaEntrada}
                  onChange={(e) => setVagaEntrada(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">Selecione uma vaga...</option>
                  {vagasLivresList.map(v => (
                    <option key={v.idVaga} value={v.idVaga}>
                      {v.codigoVaga} - {v.nomeSetor}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Confirmar Entrada
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR SAÍDA */}
      {showSaidaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', background: '#111827', position: 'relative' }}>
            <button 
              onClick={() => setShowSaidaModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={20} color="#f43f5e" />
              Registrar Saída e Pagamento
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              O sistema calculará automaticamente o tempo e o valor de cobrança.
            </p>

            {modalFeedback && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: modalFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: modalFeedback.type === 'success' ? '#34d399' : '#fb7185',
                border: `1px solid ${modalFeedback.type === 'success' ? '#10b981' : '#f43f5e'}`
              }}>
                {modalFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {modalFeedback.message}
              </div>
            )}

            <form onSubmit={handleSaida}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Placa do Veículo que está saindo
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: ABC1D23 ou selecione abaixo"
                  value={placaSaida}
                  onChange={(e) => setPlacaSaida(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    marginBottom: '10px'
                  }}
                />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                  {(data.parkedCars || []).slice(0, 10).map(c => (
                    <button
                      key={c.idRegistro || c.idVaga}
                      type="button"
                      onClick={() => setPlacaSaida(c.placa)}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer'
                      }}
                    >
                      {c.placa} ({c.codigoVaga})
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#f43f5e',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Confirmar Saída e Calcular Tarifa
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
