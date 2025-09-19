# Script para configurar firewall do Windows
# Execute como Administrador

Write-Host "CONFIGURANDO FIREWALL PARA ESCOLTA PLATFORM" -ForegroundColor Green
Write-Host ""

# Verificar se esta rodando como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "Este script precisa ser executado como Administrador" -ForegroundColor Red
    Write-Host "Clique com botao direito no PowerShell e selecione 'Executar como administrador'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Executando como Administrador" -ForegroundColor Green
Write-Host ""

# Configurar regras de firewall para as portas
Write-Host "Configurando regras de firewall..." -ForegroundColor Yellow

try {
    # Regra para porta 9443 (HTTPS)
    Write-Host "Configurando porta 9443 (HTTPS)..."
    New-NetFirewallRule -DisplayName "Escolta Platform HTTPS" -Direction Inbound -Protocol TCP -LocalPort 9443 -Action Allow -Profile Any
    Write-Host "Porta 9443 configurada" -ForegroundColor Green

    # Regra para porta 8080 (HTTP)
    Write-Host "Configurando porta 8080 (HTTP)..."
    New-NetFirewallRule -DisplayName "Escolta Platform HTTP" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow -Profile Any
    Write-Host "Porta 8080 configurada" -ForegroundColor Green

    Write-Host ""
    Write-Host "FIREWALL CONFIGURADO COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs para acessar:" -ForegroundColor Cyan
    Write-Host "• Local: https://localhost:9443" -ForegroundColor White
    Write-Host "• Local: http://localhost:8080" -ForegroundColor White
    Write-Host "• Rede: https://192.168.0.35:9443" -ForegroundColor White
    Write-Host "• Rede: http://192.168.0.35:8080" -ForegroundColor White
    Write-Host ""
    Write-Host "Para acessar de outro dispositivo na mesma rede:" -ForegroundColor Yellow
    Write-Host "• Use: http://192.168.0.35:8080 (mais confiavel)" -ForegroundColor White
    Write-Host "• Ou: https://192.168.0.35:9443 (aceite o certificado)" -ForegroundColor White

} catch {
    Write-Host "Erro ao configurar firewall: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "CONFIGURACAO MANUAL:" -ForegroundColor Yellow
    Write-Host "1. Abra 'Firewall do Windows Defender'"
    Write-Host "2. Clique em 'Configuracoes avancadas'"
    Write-Host "3. Clique em 'Regras de entrada' > 'Nova regra'"
    Write-Host "4. Selecione 'Porta' > 'TCP' > 'Portas especificas'"
    Write-Host "5. Digite: 9443,8080"
    Write-Host "6. Permita a conexao"
    Write-Host "7. Aplique para todos os perfis"
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")