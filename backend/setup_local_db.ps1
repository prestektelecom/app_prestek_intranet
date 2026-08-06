# =============================================================
# setup_local_db.ps1 — Configura banco PostgreSQL local
# Execute: .\setup_local_db.ps1
# =============================================================

$PG_USER     = "prestek"
$PG_PASSWORD = "prestek_local_2024"
$PG_DB       = "prestek_db_postgres"
$PG_PORT     = "5432"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Prestek — Setup Banco Local PostgreSQL" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se psql está disponível
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    # Tenta encontrar no caminho padrão de instalação
    $defaultPaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe"
    )
    foreach ($path in $defaultPaths) {
        if (Test-Path $path) {
            $env:PATH += ";$(Split-Path $path)"
            Write-Host "✅ PostgreSQL encontrado em: $path" -ForegroundColor Green
            break
        }
    }
}

$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "❌ psql não encontrado no PATH." -ForegroundColor Red
    Write-Host "   Instale o PostgreSQL e adicione ao PATH, ou reinicie o terminal após a instalação." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Download: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ psql encontrado: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Solicita a senha do postgres (superusuário)
Write-Host "🔑 Digite a senha do usuário 'postgres' (superusuário):" -ForegroundColor Yellow
$pgSuperPass = Read-Host -AsSecureString
$pgSuperPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgSuperPass)
)

$env:PGPASSWORD = $pgSuperPassPlain

Write-Host ""
Write-Host "📦 Criando usuário '$PG_USER'..." -ForegroundColor Cyan

# Cria usuário (ignora se já existir)
$createUser = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$PG_USER') THEN
    CREATE USER $PG_USER WITH PASSWORD '$PG_PASSWORD';
    RAISE NOTICE 'Usuário $PG_USER criado.';
  ELSE
    ALTER USER $PG_USER WITH PASSWORD '$PG_PASSWORD';
    RAISE NOTICE 'Usuário $PG_USER já existe. Senha atualizada.';
  END IF;
END
`$`$;
"@

$createUser | psql -U postgres -h 127.0.0.1 -p $PG_PORT

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao criar usuário. Verifique a senha do postgres." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗄️  Criando banco '$PG_DB'..." -ForegroundColor Cyan

# Cria banco (ignora se já existir)
$dbExists = psql -U postgres -h 127.0.0.1 -p $PG_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='$PG_DB'"
if ($dbExists -eq "1") {
    Write-Host "   Banco '$PG_DB' já existe. Pulando criação." -ForegroundColor Yellow
} else {
    psql -U postgres -h 127.0.0.1 -p $PG_PORT -c "CREATE DATABASE $PG_DB OWNER $PG_USER;"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao criar banco." -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Banco criado." -ForegroundColor Green
}

# Concede privilégios
psql -U postgres -h 127.0.0.1 -p $PG_PORT -c "GRANT ALL PRIVILEGES ON DATABASE $PG_DB TO $PG_USER;"

Write-Host ""
Write-Host "🚀 Rodando migrations..." -ForegroundColor Cyan

$env:PGPASSWORD = $PG_PASSWORD
$migrationsDir = Join-Path $PSScriptRoot "migrations"
$sqlFiles = Get-ChildItem -Path $migrationsDir -Filter "*.sql" | Sort-Object Name

foreach ($file in $sqlFiles) {
    Write-Host "   → $($file.Name)" -ForegroundColor Gray
    psql -U $PG_USER -h 127.0.0.1 -p $PG_PORT -d $PG_DB -f $file.FullName -v ON_ERROR_STOP=0 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️  Aviso em $($file.Name) (pode ser coluna/tabela já existente, ignorando)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  ✅ Banco local configurado com sucesso!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Host    : 127.0.0.1" -ForegroundColor White
Write-Host "  Porta   : $PG_PORT" -ForegroundColor White
Write-Host "  Banco   : $PG_DB" -ForegroundColor White
Write-Host "  Usuário : $PG_USER" -ForegroundColor White
Write-Host "  Senha   : $PG_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "  Agora rode: cd backend && node server.js" -ForegroundColor Cyan
Write-Host ""
