#!/bin/bash

# Script para iniciar/reiniciar el servidor Reto Comu en EC2
# Uso: ./deploy.sh [start|stop|restart|status|logs]

COMMAND=${1:-start}
APP_DIR="/home/ec2-user/apps/Reto_comu"
LOG_DIR="$APP_DIR/logs"

# Crear directorio de logs si no existe
mkdir -p $LOG_DIR

case $COMMAND in
  start)
    echo "🚀 Iniciando Reto Comu Dashboard..."
    cd $APP_DIR
    
    # Actualizar código
    echo "📥 Actualizando código..."
    git pull
    
    # Instalar dependencias
    echo "📦 Instalando dependencias..."
    npm install
    
    # Hacer build
    echo "🔨 Compilando..."
    npm run build
    
    # Iniciar con pm2
    echo "⚙️  Iniciando con pm2..."
    pm2 start ecosystem.config.js --update-env
    
    echo "✅ Servidor iniciado"
    pm2 logs reto-comu-dashboard --lines 20
    ;;
    
  stop)
    echo "🛑 Deteniendo Reto Comu Dashboard..."
    pm2 stop reto-comu-dashboard
    echo "✅ Servidor detenido"
    ;;
    
  restart)
    echo "🔄 Reiniciando Reto Comu Dashboard..."
    pm2 restart reto-comu-dashboard
    echo "✅ Servidor reiniciado"
    pm2 logs reto-comu-dashboard --lines 20
    ;;
    
  status)
    echo "📊 Estado de pm2:"
    pm2 list
    echo ""
    echo "🔌 Puerto 3000:"
    netstat -tlnp | grep :3000 || echo "No hay proceso en puerto 3000"
    ;;
    
  logs)
    echo "📜 Mostrando logs..."
    pm2 logs reto-comu-dashboard
    ;;
    
  *)
    echo "Uso: $0 {start|stop|restart|status|logs}"
    echo ""
    echo "Comandos disponibles:"
    echo "  start   - Actualiza, compila e inicia el servidor"
    echo "  stop    - Detiene el servidor"
    echo "  restart - Reinicia el servidor"
    echo "  status  - Muestra el estado"
    echo "  logs    - Muestra los logs en tiempo real"
    ;;
esac
