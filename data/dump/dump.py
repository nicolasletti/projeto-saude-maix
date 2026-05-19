import csv
import random
import datetime
from faker import Faker

# Inicializa o Faker para o Brasil
fake = Faker('pt_BR')

# Quantidades a serem geradas
num_responsaveis = 50
num_pacientes = 100
num_profissionais = 20
num_triagens = 150

def limpar_texto(texto):
    """Remove quebras de linha que podem desalinhar as colunas do CSV"""
    return str(texto).replace('\n', ' ').replace('\r', '')

print("Começando a gerar os arquivos CSV...")

# 1. RESPONSÁVEL
with open('responsavel.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id_responsavel', 'nome_completo', 'cpf', 'grau_parentesco', 'telefone', 'email'])
    for i in range(1, num_responsaveis + 1):
        writer.writerow([
            i, 
            limpar_texto(fake.name()), 
            fake.cpf(), 
            random.choice(["Pai", "Mãe", "Avô", "Avó", "Tio", "Tia", "Tutor Legal"]), 
            fake.cellphone_number(), 
            fake.email()
        ])

# 2. PACIENTE
with open('paciente.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id_paciente', 'id_responsavel', 'nome_completo', 'cpf', 'rg', 'data_nascimento', 'sexo_biologico', 'endereco', 'contato'])
    for i in range(1, num_pacientes + 1):
        id_resp = random.randint(1, num_responsaveis)
        nascimento = fake.date_of_birth(minimum_age=1, maximum_age=18).strftime('%Y-%m-%d')
        writer.writerow([
            i, 
            id_resp, 
            limpar_texto(fake.name()), 
            fake.cpf(), 
            fake.rg(), 
            nascimento, 
            random.choice(['M', 'F']), 
            limpar_texto(fake.address()), 
            fake.cellphone_number()
        ])

# 3. PROFISSIONAL
with open('profissional.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id_profissional', 'nome_completo', 'cpf', 'especialidade', 'telefone', 'email', 'num_conselho', 'login', 'senha_hash', 'perfil'])
    for i in range(1, num_profissionais + 1):
        conselho = f"CRM/{fake.state_abbr()} {random.randint(10000, 99999)}"
        login = f"user_{i}_{fake.user_name()}"
        writer.writerow([
            i, 
            limpar_texto(fake.name()), 
            fake.cpf(), 
            random.choice(["Pediatra", "Neurologista", "Psiquiatra", "Clínico Geral", "Geneticista"]), 
            fake.cellphone_number(), 
            fake.email(), 
            conselho, 
            login, 
            fake.sha256(), 
            random.choice(['Administrador', 'Padrão'])
        ])

# 4. TRIAGEM
data_start = datetime.date(2023, 1, 1)
data_end = datetime.date(2024, 12, 31)

with open('triagem.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id_triagem', 'id_paciente', 'id_profissional', 'data_hora'])
    for i in range(1, num_triagens + 1):
        id_pac = random.randint(1, num_pacientes)
        id_prof = random.randint(1, num_profissionais)
        data = fake.date_between_dates(date_start=data_start, date_end=data_end).strftime('%Y-%m-%d')
        hora = fake.time()
        writer.writerow([i, id_pac, id_prof, f"{data} {hora}"])

# 5. INDICADOR_TRIAGEM
with open('indicador_triagem.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id_triagem', 'id_indicador', 'presente'])
    for i_triagem in range(1, num_triagens + 1):
        qnt_indicadores = random.randint(3, 8)
        indicadores_selecionados = random.sample(range(1, 13), k=qnt_indicadores)
        for id_ind in indicadores_selecionados:
            # Booleano do Postgres aceita 'true' ou 'false'
            presente = random.choice(['true', 'false']) 
            writer.writerow([i_triagem, id_ind, presente])

# 6. RELATÓRIO
with open('relatorio.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id_relatorio', 'id_triagem', 'percentual', 'score_final', 'alertas'])
    alertas = ["Acompanhamento psicológico", "Exame genético", "Baixo risco", "Alta probabilidade TEA", "Reavaliar 6 meses"]
    for i in range(1, num_triagens + 1):
        percentual = round(random.uniform(10.0, 99.9), 2)
        score_final = round(random.uniform(0.5, 9.9), 2)
        writer.writerow([i, i, percentual, score_final, random.choice(alertas)])

# 7. PRONTUÁRIO
with open('prontuario.csv', mode='w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['id_prontuario', 'id_paciente', 'id_relatorio', 'conduta_adotada', 'data_registro'])
    condutas = ["Encaminhado exames", "Orientação familiar", "Alta", "Acompanhamento semanal", "Retorno agendado"]
    for i in range(1, num_triagens + 1):
        id_pac = random.randint(1, num_pacientes)
        data_reg = fake.date_time_this_year().strftime('%Y-%m-%d %H:%M:%S')
        writer.writerow([i, id_pac, i, random.choice(condutas), data_reg])

print("Pronto! Todos os 7 arquivos CSV foram gerados com sucesso.")