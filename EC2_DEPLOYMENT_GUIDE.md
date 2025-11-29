# 🚀 Guía de Despliegue en EC2 - Reto Comu Dashboard

## 📋 Requisitos Previos

Asegúrate de que en tu instancia EC2 tengas instalado:
- Node.js v18+ 
- npm
- git
- pm2 (gestor de procesos)

## 🔧 Instalación Inicial de pm2 (Solo la primera vez)

```bash
# Conectarte a tu instancia EC2
ssh -i your-key.pem ec2-user@44.204.93.25

# Instalar pm2 globalmente
sudo npm install -g pm2

# Permitir que pm2 se inicie automáticamente al reiniciar la instancia
pm2 startup
pm2 save
```

## 📥 Primera vez: Clonar y Configurar

```bash
# Crear directorio de aplicaciones
mkdir -p /home/ec2-user/apps
cd /home/ec2-user/apps

# Clonar el repositorio
git clone https://github.com/Rafinha0927/Reto_comu.git
cd Reto_comu

# Instalar dependencias
npm install

# Crear directorio de logs
mkdir -p logs

# Compilar el proyecto
npm run build
```

## ✅ Iniciar el Servidor

### Opción 1: Usar el script de deploy (RECOMENDADO)

```bash
# Hacer el script ejecutable (primera vez)
chmod +x scripts/deploy.sh

# Iniciar el servidor
./scripts/deploy.sh start

# Verificar estado
./scripts/deploy.sh status

# Ver logs
./scripts/deploy.sh logs
```

### Opción 2: Usar pm2 directamente

```bash
# Iniciar
pm2 start ecosystem.config.js --update-env

# Verificar estado
pm2 list

# Ver logs
pm2 logs reto-comu-dashboard

# Reiniciar
pm2 restart reto-comu-dashboard

# Detener
pm2 stop reto-comu-dashboard
```

## 🔄 Actualizar Código

```bash
# Opción 1: Con script (MEJOR)
./scripts/deploy.sh restart

# Opción 2: Manual
cd /home/ec2-user/apps/Reto_comu
git pull
npm install
npm run build
pm2 restart reto-comu-dashboard
```

## 🔍 Diagnosticar Problemas

```bash
# Ejecutar diagnóstico completo
chmod +x scripts/diagnose.sh
./scripts/diagnose.sh

# Ver si pm2 está corriendo
pm2 list

# Ver logs de error
tail -50 /home/ec2-user/apps/Reto_comu/logs/error.log

# Ver logs de salida
tail -50 /home/ec2-user/apps/Reto_comu/logs/out.log

# Verificar puerto 3000
netstat -tlnp | grep :3000

# Verificar grupo de seguridad permite puerto 3000
# En AWS Console: EC2 → Security Groups → Inbound Rules
# Debe permitir: TCP 3000 desde 0.0.0.0/0
```

## ❌ Solucionar Problemas Comunes

### Problema: "No puedo acceder a http://44.204.93.25:3000"

**Solución 1: Verificar que el proceso esté corriendo**
```bash
pm2 list
# Si no aparece o está stopped, ejecutar:
./scripts/deploy.sh start
```

**Solución 2: Verificar puerto**
```bash
netstat -tlnp | grep :3000
# Debe mostrar algo como: tcp 0 0 0.0.0.0:3000 0.0.0.0:* LISTEN 12345/node
```

**Solución 3: Verificar Security Group**
1. Ir a AWS Console
2. EC2 → Instances → tu instancia
3. Security Groups → Edit inbound rules
4. Agregar regla:
   - Type: Custom TCP
   - Port Range: 3000
   - Source: 0.0.0.0/0 (o tu IP)
   - Guardar

**Solución 4: Ver logs de error**
```bash
pm2 logs reto-comu-dashboard
# O ver archivo directamente:
tail -100 /home/ec2-user/apps/Reto_comu/logs/error.log
```

### Problema: "npm run build falla"

```bash
cd /home/ec2-user/apps/Reto_comu

# Limpiar cache
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Intentar build de nuevo
npm run build
```

### Problema: "Error: ENOSPC: no space left on device"

Tu instancia se quedó sin espacio. Necesitas:
1. Limpiar archivos innecesarios
2. O aumentar el volumen EBS en AWS

```bash
# Ver espacio disponible
df -h

# Limpiar npm cache
npm cache clean --force

# Limpiar logs viejos
rm -f /home/ec2-user/apps/Reto_comu/logs/*.log
```

## 📊 Monitoreo Continuo

```bash
# Ver dashboard de pm2 en vivo
pm2 monit

# Ver logs en tiempo real
pm2 logs

# Obtener información detallada
pm2 show reto-comu-dashboard
```

## 🔐 Seguridad

1. **Nunca** uses el puerto 80 sin estar tras un balanceador o proxy
2. Si quieres acceder sin puerto especifico, usa Nginx como proxy:

```bash
# Instalar Nginx
sudo amazon-linux-extras install nginx1.12 -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Configurar proxy (pedir ejemplo)
```

## 📝 Archivo ecosystem.config.js

El archivo `ecosystem.config.js` en la raíz del proyecto contiene la configuración de pm2:
- Puerto: 3000
- Host: 0.0.0.0 (acepta conexiones de cualquier lugar)
- Logs: `/home/ec2-user/apps/Reto_comu/logs/`
- Restart automático si falla

## ✨ Próximos Pasos

1. Ejecutar el diagnóstico: `./scripts/diagnose.sh`
2. Iniciar el servidor: `./scripts/deploy.sh start`
3. Verificar en navegador: `http://44.204.93.25:3000`
4. Configurar dominio personalizado (opcional)
5. Configurar SSL/HTTPS (recomendado para producción)

---

**¿Preguntas o problemas?** Revisa los logs con: `pm2 logs reto-comu-dashboard`
