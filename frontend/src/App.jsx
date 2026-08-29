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
  CheckCircle2
} from 'lucide-react';

// Função auxiliar para gerar placas aleatórias (Mercosul e Tradicional)
function generatePlate() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const l = (n) => Array.from({ length: n }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const d = (n) => Array.from({ length: n }, () => digits[Math.floor(Math.random() * digits.length)]).join('');
  
  if (Math.random() > 0.5) {
    // Mercosul: AAA1A23
    return `${l(3)}${d(1)}${l(1)}${d(2)}`;
  } else {
    // Tradicional: AAA-1234
    return `${l(3)}-${d(4)}`;
  }
}

// Configuração dos 5 setores (3 cobertos, 2 descobertos) com 20 vagas cada
function createInitialSectors() {
  const sectorsConfig = [
    { id: 1, name: 'Setor G1 (Coberto)', isCovered: true, prefix: 'G1' },
    { id: 2, name: 'Setor G2 (Coberto)', isCovered: true, prefix: 'G2' },
    { id: 3, name: 'Setor G3 (Descoberto)', isCovered: false, prefix: 'G3' },
    { id: 4, name: 'Setor G4 (Coberto)', isCovered: true, prefix: 'G4' },
    { id: 5, name: 'Setor Subsolo (Descoberto)', isCovered: false, prefix: 'SUB' },
  ];

  const spotTypes = ['Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal', 'PCD', 'Idoso', 'Moto'];

  return sectorsConfig.map(sec => ({
    id_setor: sec.id,
    nome_setor: sec.name,
    is_coberto: sec.isCovered,
    vagas: Array.from({ length: 20 }, (_, i) => ({
      id_vaga: sec.id * 100 + (i + 1),
      codigo_vaga: `${sec.prefix}-${String(i + 1).padStart(2, '0')}`,
      tipo_vaga: spotTypes[i % spotTypes.length],
      is_ocupada: false,
      placa: null,
      data_hora_entrada: null
    }))
  }));
}

export default function App() {
  const [sectors, setSectors] = useState(createInitialSectors);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('parked'); // 'parked' | 'feed' | 'map'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Inicializa algumas vagas com carros estacionados para teste imediato
  useEffect(() => {
    setSectors(prev => {
      const initial = JSON.parse(JSON.stringify(prev));
      const initialEvents = [];
      const now = new Date();

      initial.forEach(sec => {
        // Ocupa entre 5 e 9 vagas por setor inicialmente
        const spotsToOccupy = Math.floor(Math.random() * 5) + 5;
        for (let i = 0; i < spotsToOccupy; i++) {
          const plate = generatePlate();
          const minutesAgo = Math.floor(Math.random() * 90) + 5;
          const entryTime = new Date(now.getTime() - minutesAgo * 60000);
          
          sec.vagas[i].is_ocupada = true;
          sec.vagas[i].placa = plate;
          sec.vagas[i].data_hora_entrada = entryTime.toISOString();

          initialEvents.push({
            id: Math.random(),
            tipo_evento: 'ENTRADA',
            placa: plate,
            nome_setor: sec.nome_setor,
            codigo_vaga: sec.vagas[i].codigo_vaga,
            data_evento: entryTime.toISOString(),
            valor_pago: null
          });
        }
      });

      setRecentActivity(initialEvents.sort((a, b) => new Date(b.data_evento) - new Date(a.data_evento)).slice(0, 25));
      return initial;
    });
  }, []);

  // Motor da Simulação em Tempo Real (Loop a cada 3 segundos)
  useEffect(() => {
    const timer = setInterval(() => {
      setSectors(currentSectors => {
        const next = JSON.parse(JSON.stringify(currentSectors));
        const now = new Date();
        const newEvents = [];

        // 1. Simula Saída de Carro (Chance de 40%)
        if (Math.random() < 0.40) {
          const occupied = [];
          next.forEach(s => {
            s.vagas.forEach(v => {
              if (v.is_ocupada) occupied.push({ sector: s, vaga: v });
            });
          });

          if (occupied.length > 0) {
            const chosen = occupied[Math.floor(Math.random() * occupied.length)];
            const entryTime = new Date(chosen.vaga.data_hora_entrada);
            const minutes = Math.max(1, Math.round((now - entryTime) / 60000));
            const hours = Math.max(1, Math.ceil(minutes / 60));
            const valor = (hours * 5.0).toFixed(2);

            newEvents.push({
              id: Math.random(),
              tipo_evento: 'SAIDA',
              placa: chosen.vaga.placa,
              nome_setor: chosen.sector.nome_setor,
              codigo_vaga: chosen.vaga.codigo_vaga,
              data_evento: now.toISOString(),
              valor_pago: valor
            });

            // Libera a vaga
            chosen.vaga.is_ocupada = false;
            chosen.vaga.placa = null;
            chosen.vaga.data_hora_entrada = null;
          }
        }

        // 2. Simula Entrada de Novo Carro (Chance de 50%)
        if (Math.random() < 0.50) {
          const free = [];
          next.forEach(s => {
            s.vagas.forEach(v => {
              if (!v.is_ocupada) free.push({ sector: s, vaga: v });
            });
          });

          if (free.length > 0) {
            const chosen = free[Math.floor(Math.random() * free.length)];
            const plate = generatePlate();

            chosen.vaga.is_ocupada = true;
            chosen.vaga.placa = plate;
            chosen.vaga.data_hora_entrada = now.toISOString();

            newEvents.push({
              id: Math.random(),
              tipo_evento: 'ENTRADA',
              placa: plate,
              nome_setor: chosen.sector.nome_setor,
              codigo_vaga: chosen.vaga.codigo_vaga,
              data_evento: now.toISOString(),
              valor_pago: null
            });
          }
        }

        if (newEvents.length > 0) {
          setRecentActivity(prev => [...newEvents, ...prev].slice(0, 30));
        }

        setLastUpdated(new Date());
        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Extrai lista de carros estacionados atualmente
  const parkedCars = [];
  let totalSpots = 0;
  let occupiedSpots = 0;

  sectors.forEach(sec => {
    sec.vagas.forEach(v => {
      totalSpots++;
      if (v.is_ocupada) {
        occupiedSpots++;
        const minutes = v.data_hora_entrada 
          ? Math.max(0, Math.round((new Date() - new Date(v.data_hora_entrada)) / 60000))
          : 0;

        parkedCars.push({
          id_vaga: v.id_vaga,
          placa: v.placa,
          codigo_vaga: v.codigo_vaga,
          tipo_vaga: v.tipo_vaga,
          nome_setor: sec.nome_setor,
          is_coberto: sec.is_coberto,
          data_hora_entrada: v.data_hora_entrada,
          minutos_estacionado: minutes
        });
      }
    });
  });

  const freeSpots = totalSpots - occupiedSpots;
  const occupancyRate = totalSpots > 0 ? ((occupiedSpots / totalSpots) * 100).toFixed(1) : 0;

  const filteredCars = parkedCars.filter(car => {
    const matchesSearch = car.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          car.codigo_vaga.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || car.nome_setor === selectedSector;
    return matchesSearch && matchesSector;
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
              <span style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>v1.0</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monitoramento de Pátio e Fluxo de Veículos em Tempo Real</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="live-badge">
            <span className="pulse-dot"></span>
            Simulador Ativo
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}>
            <RefreshCw size={15} style={{ animation: 'spin 3s linear infinite' }} />
            {lastUpdated.toLocaleTimeString()}
          </div>
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
            {totalSpots}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            5 Setores (100 vagas)
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Carros Estacionados</span>
            <Car size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fb7185' }}>
            {occupiedSpots}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {occupancyRate}% de lotação agora
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Vagas Livres</span>
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
            {freeSpots}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Disponíveis para entrada
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Taxa de Ocupação</span>
            <Activity size={18} color="#a78bfa" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc' }}>
            {occupancyRate}%
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
              width: `${Math.min(100, occupancyRate)}%`, 
              height: '100%', 
              background: occupancyRate > 80 ? '#f43f5e' : (occupancyRate > 50 ? '#f59e0b' : '#3b82f6'),
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
            Carros Estacionados Agora ({parkedCars.length})
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
            Feed em Tempo Real (Entradas e Saídas)
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
              {sectors.map(s => (
                <option key={s.id_setor} value={s.nome_setor}>{s.nome_setor}</option>
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
              <h3>Nenhum veículo encontrado com esse filtro.</h3>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px' 
            }}>
              {filteredCars.map((car) => (
                <div key={car.id_vaga} className="glass-card animate-fade-in" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
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
                        Vaga {car.codigo_vaga}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Tipo: {car.tipo_vaga}
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
                      <span>{car.nome_setor}</span>
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: car.is_coberto ? '#34d399' : '#f59e0b' 
                    }}>
                      {car.is_coberto ? <Sun size={13} /> : <CloudRain size={13} />}
                      {car.is_coberto ? 'Coberto' : 'Descoberto'}
                    </span>
                  </div>

                  {/* Entrada e Tempo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} /> Entrada: {new Date(car.data_hora_entrada).toLocaleTimeString()}
                    </span>
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      color: '#34d399', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 600 
                    }}>
                      {car.minutos_estacionado > 0 ? `${car.minutos_estacionado} min` : 'Recém chegado'}
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
            {recentActivity.map((event) => (
              <div 
                key={event.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: event.tipo_evento === 'ENTRADA' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                  border: `1px solid ${event.tipo_evento === 'ENTRADA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: event.tipo_evento === 'ENTRADA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    color: event.tipo_evento === 'ENTRADA' ? '#34d399' : '#fb7185'
                  }}>
                    {event.tipo_evento === 'ENTRADA' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{event.placa}</span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        background: event.tipo_evento === 'ENTRADA' ? '#10b981' : '#f43f5e',
                        color: '#fff',
                        fontWeight: 700
                      }}>
                        {event.tipo_evento}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {event.nome_setor} • Vaga {event.codigo_vaga}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(event.data_evento).toLocaleTimeString()}
                  </div>
                  {event.valor_pago && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                      Pago: R$ {event.valor_pago}
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
          {sectors.map((sector) => {
            const ocupadas = sector.vagas.filter(v => v.is_ocupada).length;
            const livres = 20 - ocupadas;

            return (
              <div key={sector.id_setor} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{sector.nome_setor}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {sector.is_coberto ? 'Área Coberta' : 'Área Descoberta'} • 20 Vagas Totais
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {ocupadas} Ocupadas
                    </span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {livres} Livres
                    </span>
                  </div>
                </div>

                {/* Grid das 20 Vagas */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
                  gap: '10px' 
                }}>
                  {sector.vagas.map((vaga) => (
                    <div 
                      key={vaga.id_vaga}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '8px',
                        background: vaga.is_ocupada ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${vaga.is_ocupada ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: vaga.is_ocupada ? '#fb7185' : '#34d399' }}>
                        {vaga.codigo_vaga}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        {vaga.tipo_vaga}
                      </div>

                      {vaga.is_ocupada ? (
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
            );
          })}
        </div>
      )}

    </div>
  );
}
