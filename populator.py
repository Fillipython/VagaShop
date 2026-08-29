import os
import random
import sys
import time
from datetime import datetime, timedelta
import psycopg2
from psycopg2 import extras
from dotenv import load_dotenv

load_dotenv()

# Configurações do Banco de Dados
DB_NAME = os.getenv("POSTGRES_DB", "vagashop")
DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("PORT", "5432")

def get_connection():
    try:
        return psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
    except Exception as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        print("Certifique-se de que o container do banco está rodando ('docker compose up -d').")
        sys.exit(1)

# Gerador de Placas (Formato Mercosul e Tradicional)
def generate_plate():
    letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3))
    numbers = "".join(random.choices("0123456789", k=4))
    if random.choice([True, False]):
        # Formato Mercosul: AAA1A23
        mercosul_letter = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
        return f"{letters}{numbers[0]}{mercosul_letter}{numbers[2:]}"
    else:
        # Formato Tradicional: AAA-1234
        return f"{letters}-{numbers}"

# 1. Configuração inicial de Setores e Vagas
def setup_sectors_and_spots(conn):
    with conn.cursor() as cur:
        # Verifica se já existem setores cadastrados
        cur.execute("SELECT COUNT(*) FROM Setor;")
        if cur.fetchone()[0] > 0:
            print("Setores e vagas já configurados.")
            return

        print("Configurando 5 setores (3 cobertos, 2 descobertos) com 20 vagas cada...")
        
        # 5 Setores (3 Cobertos, 2 Descobertos)
        sectors_data = [
            ("Setor G1 (Coberto)", True),
            ("Setor G2 (Coberto)", True),
            ("Setor G3 (Descoberto)", False),
            ("Setor G4 (Coberto)", True),
            ("Setor Subsolo (Descoberto)", False)
        ]
        
        inserted_sectors = []
        for nome, coberto in sectors_data:
            cur.execute(
                "INSERT INTO Setor (nome_setor, is_coberto) VALUES (%s, %s) RETURNING id_setor;",
                (nome, coberto)
            )
            inserted_sectors.append(cur.fetchone()[0])
            
        # 20 vagas para cada setor (Normal, PCD, Idoso, Moto)
        vagas_to_insert = []
        spot_types = ["Normal"] * 14 + ["PCD"] * 2 + ["Idoso"] * 2 + ["Moto"] * 2
        
        for idx, sector_id in enumerate(inserted_sectors):
            prefix = f"S{idx+1}"
            random.shuffle(spot_types)
            for i in range(1, 21):
                codigo = f"{prefix}-{i:02d}"
                tipo = spot_types[i - 1]
                vagas_to_insert.append((sector_id, codigo, tipo))
                
        extras.execute_values(
            cur,
            "INSERT INTO Vaga (id_setor, codigo_vaga, tipo_vaga) VALUES %s",
            vagas_to_insert
        )
        conn.commit()
        print("Setores e Vagas criados com sucesso!")

# 2. Carga inicial de 100.000 dados históricos
def populate_history(conn, num_records=100000):
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM Registro_Estacionamento;")
        current_count = cur.fetchone()[0]
        if current_count >= num_records:
            print(f"O banco já possui {current_count} registros históricos.")
            return

        print(f"Iniciando a geração de {num_records} registros históricos...")
        
        # Criamos um pool de veículos únicos para ter carros que entram e saem repetidamente
        num_vehicles = 8000
        print(f"Gerando pool de {num_vehicles} veículos únicos...")
        vehicles_plates = list(set(generate_plate() for _ in range(num_vehicles * 2)))[:num_vehicles]
        
        cur.execute("SELECT id_veiculo FROM Veiculo;")
        db_vehicles = [r[0] for r in cur.fetchall()]
        
        if not db_vehicles:
            extras.execute_values(
                cur,
                "INSERT INTO Veiculo (placa) VALUES %s ON CONFLICT DO NOTHING RETURNING id_veiculo;",
                [(p,) for p in vehicles_plates]
            )
            cur.execute("SELECT id_veiculo FROM Veiculo;")
            db_vehicles = [r[0] for r in cur.fetchall()]
            
        conn.commit()
        
        cur.execute("SELECT id_vaga FROM Vaga;")
        vagas_ids = [r[0] for r in cur.fetchall()]
        
        print("Gerando registros de estadia histórica (últimos 180 dias)...")
        records_to_insert = []
        now = datetime.now()
        start_date = now - timedelta(days=180)
        
        # Gerar registros
        for i in range(num_records):
            # Veículo aleatório
            vehicle_id = random.choice(db_vehicles)
            # Vaga aleatória
            vaga_id = random.choice(vagas_ids)
            
            # Entrada aleatória
            random_minutes = random.randint(0, 180 * 24 * 60)
            entry_time = start_date + timedelta(minutes=random_minutes)
            
            # Duração aleatória (entre 15 minutos e 8 horas)
            duration_minutes = random.randint(15, 480)
            exit_time = entry_time + timedelta(minutes=duration_minutes)
            
            # Não gerar saídas para o futuro
            if exit_time > now:
                exit_time = None
                valor_pago = None
            else:
                # Cálculo fictício do valor (ex: R$ 5,00 por hora cheia)
                hours = max(1, duration_minutes // 60)
                valor_pago = float(hours * 5.00)
                
            records_to_insert.append((vehicle_id, vaga_id, entry_time, exit_time, valor_pago))
            
            if len(records_to_insert) >= 10000:
                extras.execute_values(
                    cur,
                    "INSERT INTO Registro_Estacionamento (id_veiculo, id_vaga, data_hora_entrada, data_hora_saida, valor_pago) VALUES %s",
                    records_to_insert
                )
                records_to_insert = []
                print(f"Inseridos {i + 1} registros...")
                
        if records_to_insert:
            extras.execute_values(
                cur,
                "INSERT INTO Registro_Estacionamento (id_veiculo, id_vaga, data_hora_entrada, data_hora_saida, valor_pago) VALUES %s",
                records_to_insert
            )
            
        conn.commit()
        print("Carga histórica concluída!")

# 3. Simulador em tempo real (background activity loop)
def run_simulation(conn):
    print("\n--- SIMULADOR EM TEMPO REAL INICIADO ---")
    print("Simulando entradas e saídas de carros no pátio a cada 3 segundos...")
    print("Pressione Ctrl+C para encerrar o simulador.\n")
    
    while True:
        try:
            with conn.cursor() as cur:
                # 1. Tenta retirar alguns carros que estão estacionados (estadias ativas)
                cur.execute("SELECT id_registro, id_vaga, data_hora_entrada FROM Registro_Estacionamento WHERE data_hora_saida IS NULL;")
                active_sessions = cur.fetchall()
                
                # Se houver carros estacionados, tem 40% de chance de alguém sair
                if active_sessions and random.random() < 0.40:
                    chosen_session = random.choice(active_sessions)
                    reg_id, vaga_id, entry_time = chosen_session
                    
                    now = datetime.now()
                    duration = now - entry_time
                    hours = max(1, duration.seconds // 3600)
                    valor = float(hours * 5.00)
                    
                    cur.execute(
                        "UPDATE Registro_Estacionamento SET data_hora_saida = %s, valor_pago = %s WHERE id_registro = %s RETURNING id_veiculo, id_vaga;",
                        (now, valor, reg_id)
                    )
                    vei_id, vag_id = cur.fetchone()
                    
                    # Busca placa do veículo e código da vaga para o log
                    cur.execute("SELECT placa FROM Veiculo WHERE id_veiculo = %s;", (vei_id,))
                    placa = cur.fetchone()[0]
                    cur.execute("SELECT codigo_vaga FROM Vaga WHERE id_vaga = %s;", (vag_id,))
                    codigo_vaga = cur.fetchone()[0]
                    
                    print(f"🚗 SAÍDA: Veículo [{placa}] saiu da vaga [{codigo_vaga}] após {duration.seconds // 60} min. Valor Pago: R$ {valor:.2f}")
                    conn.commit()
                    
                # 2. Tenta fazer um novo carro entrar (se houver vagas livres)
                cur.execute("""
                    SELECT id_vaga, codigo_vaga FROM Vaga 
                    WHERE id_vaga NOT IN (
                        SELECT id_vaga FROM Registro_Estacionamento WHERE data_hora_saida IS NULL
                    );
                """)
                free_spots = cur.fetchall()
                
                # Se tiver vaga livre, tem 50% de chance de um carro entrar
                if free_spots and random.random() < 0.50:
                    vaga_id, codigo_vaga = random.choice(free_spots)
                    
                    # Gera uma placa nova ou pega uma aleatória
                    plate = generate_plate()
                    cur.execute("INSERT INTO Veiculo (placa) VALUES (%s) ON CONFLICT (placa) DO UPDATE SET placa = EXCLUDED.placa RETURNING id_veiculo;", (plate,))
                    vehicle_id = cur.fetchone()[0]
                    
                    # Cria a entrada
                    now = datetime.now()
                    cur.execute(
                        "INSERT INTO Registro_Estacionamento (id_veiculo, id_vaga, data_hora_entrada) VALUES (%s, %s, %s);",
                        (vehicle_id, vaga_id, now)
                    )
                    print(f"ENTRADA: Veículo [{plate}] estacionou na vaga [{codigo_vaga}] às {now.strftime('%H:%M:%S')}")
                    conn.commit()
                    
            time.sleep(3)
        except KeyboardInterrupt:
            print("\nSimulação finalizada.")
            break
        except Exception as e:
            print(f"Erro na simulação: {e}")
            time.sleep(5)

if __name__ == "__main__":
    conn = get_connection()
    try:
        setup_sectors_and_spots(conn)
        populate_history(conn, 100000)
        run_simulation(conn)
    finally:
        conn.close()
