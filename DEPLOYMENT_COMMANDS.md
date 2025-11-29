# 🚀 Comandos Listos para Copiar/Pegar en tu EC2

Reemplaza `your-key.pem` con tu archivo de clave y `44.204.93.25` con tu IP.

## 🔗 Paso 1: Conectar a EC2
```bash
ssh -i your-key.pem ec2-user@44.204.93.25
```

---

## 🔍 Paso 2: Diagnosticar Problemas

Copia y pega estos comandos UNO POR UNO:

### Verificar procesos pm2
```bash
pm2 list
```

### Ver los logs de error
```bash
tail -50 /home/ec2-user/apps/Reto_comu/logs/error.log
```

### Ver los logs de salida
```bash
tail -50 /home/ec2-user/apps/Reto_comu/logs/out.log
```

### Ver si el puerto está en uso
```bash
netstat -tlnp | grep :3000
```

### Ejecutar diagnóstico completo
```bash
cd /home/ec2-user/apps/Reto_comu && chmod +x scripts/diagnose.sh && ./scripts/diagnose.sh
```

---

## ✅ Paso 3: Soluciones

### Solución 1: Instalar dependencias (si falta node_modules)
```bash
cd /home/ec2-user/apps/Reto_comu
npm install
```

### Solución 2: Compilar el proyecto (si falta dist)
```bash
cd /home/ec2-user/apps/Reto_comu
npm run build
```

### Solución 3: Iniciar el servidor
```bash
cd /home/ec2-user/apps/Reto_comu
./scripts/deploy.sh start
```

### Solución 4: Reiniciar pm2
```bash
cd /home/ec2-user/apps/Reto_comu
pm2 restart reto-comu-dashboard
```

### Solución 5: Detener y reiniciar desde cero
```bash
cd /home/ec2-user/apps/Reto_comu
pm2 stop reto-comu-dashboard
pm2 delete reto-comu-dashboard
pm2 start ecosystem.config.js --update-env
```

---

## 🔄 Actualizar a la Última Versión

```bash
cd /home/ec2-user/apps/Reto_comu
./scripts/deploy.sh start
```

O manualmente:
```bash
cd /home/ec2-user/apps/Reto_comu
git pull
npm install
npm run build
pm2 restart reto-comu-dashboard
```

---

## 📊 Monitoreo Continuo

### Ver logs en tiempo real
```bash
cd /home/ec2-user/apps/Reto_comu
pm2 logs reto-comu-dashboard
```

### Dashboard de pm2 (CTRL+C para salir)
```bash
pm2 monit
```

### Ver info detallada del proceso
```bash
pm2 show reto-comu-dashboard
```

---

## 🆘 Si Necesitas Ayuda

Copia el output de esto:
```bash
cd /home/ec2-user/apps/Reto_comu && echo "=== DIAGNÓSTICO ===" && ./scripts/diagnose.sh && echo -e "\n=== LOGS ===" && pm2 logs reto-comu-dashboard --lines 50
```

---

## ⚠️ Si Aún No Funciona en el Navegador

**Verificar Security Group:**

1. Ve a AWS Console → EC2 → Instances
2. Selecciona tu instancia
3. Scroll a la derecha, haz click en "Security Groups"
4. Selecciona el grupo
5. "Edit inbound rules"
6. Agregar:
   - Type: Custom TCP Rule
   - Protocol: TCP
   - Port Range: 3000
   - Source: 0.0.0.0/0
   - Click "Save rules"

7. Luego intenta acceder a: `http://44.204.93.25:3000`

---

## ✨ Resumen de Archivos Nuevos

Se agregaron 4 archivos a tu proyecto:

1. **ecosystem.config.js** - Configuración de pm2
2. **scripts/deploy.sh** - Script para iniciar/parar/reiniciar
3. **scripts/diagnose.sh** - Script para diagnosticar problemas
4. **EC2_DEPLOYMENT_GUIDE.md** - Guía completa (este archivo)
5. **QUICK_FIX.md** - Guía rápida

---

**Haz un commit de estos cambios:**
```bash
cd /home/ec2-user/apps/Reto_comu
git add .
git commit -m "Add pm2 configuration and deployment scripts"
git push
```

