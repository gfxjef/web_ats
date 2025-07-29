# Script de verificación para Next.js Build
# Uso: .\check-build.ps1

Write-Host "🔍 Verificando estado del build de Next.js..." -ForegroundColor Cyan

# Verificar si existe la carpeta .next
if (Test-Path ".next") {
    Write-Host "✅ Carpeta .next existe" -ForegroundColor Green
} else {
    Write-Host "❌ Carpeta .next no existe - Necesitas ejecutar 'npm run build'" -ForegroundColor Red
    exit 1
}

# Verificar archivo BUILD_ID
if (Test-Path ".next\BUILD_ID") {
    Write-Host "✅ Archivo BUILD_ID existe" -ForegroundColor Green
    $buildId = Get-Content ".next\BUILD_ID"
    Write-Host "   Build ID: $buildId" -ForegroundColor Gray
} else {
    Write-Host "❌ Archivo BUILD_ID no existe - Necesitas ejecutar 'npm run build'" -ForegroundColor Red
    exit 1
}

# Verificar archivos esenciales
$essentialFiles = @(
    "BUILD_ID",
    "build-manifest.json",
    "app-build-manifest.json",
    "app-path-routes-manifest.json"
)

foreach ($file in $essentialFiles) {
    if (Test-Path ".next\$file") {
        Write-Host "✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "❌ $file no existe" -ForegroundColor Red
    }
}

# Verificar carpetas esenciales
$essentialFolders = @(
    "static",
    "server"
)

foreach ($folder in $essentialFolders) {
    if (Test-Path ".next\$folder") {
        Write-Host "✅ Carpeta $folder existe" -ForegroundColor Green
    } else {
        Write-Host "❌ Carpeta $folder no existe" -ForegroundColor Red
    }
}

# Verificar si el servidor está corriendo
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    Write-Host "✅ Servidor corriendo en puerto 3000" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Servidor no está corriendo en puerto 3000" -ForegroundColor Yellow
}

# Verificar backend
$port5001 = netstat -ano | findstr :5001
if ($port5001) {
    Write-Host "✅ Backend corriendo en puerto 5001" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend no está corriendo en puerto 5001" -ForegroundColor Yellow
}

Write-Host "`n📋 Resumen de comandos útiles:" -ForegroundColor Cyan
Write-Host "   npm run build  - Construir para producción" -ForegroundColor Gray
Write-Host "   npm run start  - Iniciar servidor de producción" -ForegroundColor Gray
Write-Host "   npm run dev    - Iniciar servidor de desarrollo" -ForegroundColor Gray

Write-Host "`n✅ Verificación completada!" -ForegroundColor Green 