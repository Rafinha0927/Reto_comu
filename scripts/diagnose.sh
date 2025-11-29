#!/bin/bash

# Script de Diagnóstico para Reto Comu Dashboard en EC2
# Este script ayuda a diagnosticar problemas con pm2 y el servidor

echo "🔍 === DIAGNÓSTICO RETO COMU DASHBOARD === 🔍"
echo ""

# 1. Verificar si pm2 está instalado
echo "1️⃣  Verificando pm2..."
if ! command -v pm2 &> /dev/null; then
    echo "❌ pm2 no está instalado"
    echo "   Instálalo con: npm install -g pm2"
else
    echo "✅ pm2 está instalado"
    pm2 --version
fi
echo ""

# 2. Listar procesos pm2
echo "2️⃣  Procesos pm2 activos:"
pm2 list
echo ""

# 3. Ver logs del proceso
echo "3️⃣  Últimos 20 líneas del log de error:"
if [ -f /home/ec2-user/apps/Reto_comu/logs/error.log ]; then
    tail -20 /home/ec2-user/apps/Reto_comu/logs/error.log
else
    echo "❌ No existe el archivo de error log"
fi
echo ""

# 4. Ver logs de salida
echo "4️⃣  Últimos 20 líneas del log de salida:"
if [ -f /home/ec2-user/apps/Reto_comu/logs/out.log ]; then
    tail -20 /home/ec2-user/apps/Reto_comu/logs/out.log
else
    echo "❌ No existe el archivo de salida log"
fi
echo ""

# 5. Verificar puerto
echo "5️⃣  Verificando si el puerto 3000 está abierto:"
netstat -tlnp | grep :3000 || echo "❌ Puerto 3000 no está en uso"
echo ""

# 6. Verificar si el directorio existe
echo "6️⃣  Verificando directorio del proyecto:"
if [ -d /home/ec2-user/apps/Reto_comu ]; then
    echo "✅ Directorio existe"
    ls -la /home/ec2-user/apps/Reto_comu/ | head -10
else
    echo "❌ Directorio NO existe"
fi
echo ""

# 7. Verificar si node_modules existe
echo "7️⃣  Verificando node_modules:"
if [ -d /home/ec2-user/apps/Reto_comu/node_modules ]; then
    echo "✅ node_modules existe"
else
    echo "⚠️  node_modules NO existe - necesitas hacer: npm install"
fi
echo ""

# 8. Verificar build
echo "8️⃣  Verificando carpeta dist (build):"
if [ -d /home/ec2-user/apps/Reto_comu/dist ]; then
    echo "✅ dist existe"
else
    echo "⚠️  dist NO existe - necesitas hacer: npm run build"
fi
echo ""

echo "🔍 === FIN DEL DIAGNÓSTICO === 🔍"
