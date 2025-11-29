# 🎯 Resumen Rápido: Recuperar tu Dashboard en EC2

## Tu Problema
- ❌ Dashboard no visible en `http://44.204.93.25/`
- ❌ pm2 probablemente está detenido o con errores

## Solución Rápida (5 minutos)

### Paso 1: Conectarse a EC2
```bash
ssh -i your-key.pem ec2-user@44.204.93.25
```

### Paso 2: Ejecutar Diagnóstico
```bash
cd /home/ec2-user/apps/Reto_comu
chmod +x scripts/diagnose.sh
./scripts/diagnose.sh
```

Esto te dirá exactamente qué está mal.

### Paso 3: Resolver según el diagnóstico

**Si dice "node_modules NO existe":**
```bash
npm install
```

**Si dice "dist NO existe":**
```bash
npm run build
```

**Si dice "Puerto 3000 no está en uso":**
```bash
./scripts/deploy.sh start
```

**Si pm2 aparece como "stopped" o "errored":**
```bash
pm2 logs reto-comu-dashboard  # Ver qué error hay
pm2 restart reto-comu-dashboard
```

### Paso 4: Verificar que funciona
```bash
# Debería decir que el proceso está activo
pm2 list

# Debería mostrar el servidor escuchando
netstat -tlnp | grep :3000

# Debería servir la página
curl http://localhost:3000
```

### Paso 5: Acceder en navegador
```
http://44.204.93.25:3000
```

## ⚠️ Posible Problema: Security Group

Si aún no ves la página, el problema es el Security Group de AWS:

1. Ve a AWS Console
2. EC2 → Instances → tu instancia
3. Security Groups (parte de la derecha)
4. Click en el nombre del grupo
5. "Edit inbound rules"
6. Agregar nueva regla:
   - Type: Custom TCP
   - Port: 3000
   - Source: 0.0.0.0/0
7. Save

## 🔄 Actualizar Código

Ya no necesitas git pull manual. Usa:
```bash
./scripts/deploy.sh start  # Actualiza, compila, reinicia
```

O simplemente:
```bash
cd /home/ec2-user/apps/Reto_comu
git pull
npm run build
pm2 restart reto-comu-dashboard
```

## 📊 Comandos Útiles

```bash
# Ver estado
pm2 list

# Ver logs en vivo
pm2 logs reto-comu-dashboard

# Reiniciar
pm2 restart reto-comu-dashboard

# Detener
pm2 stop reto-comu-dashboard

# Ver dashboard de pm2
pm2 monit
```

## 🆘 Si nada funciona

Ejecuta esto y copia el output aquí:
```bash
./scripts/diagnose.sh
pm2 logs reto-comu-dashboard --lines 50
```

Eso me dirá exactamente qué está roto.

---

**¡Eso es todo! El dashboard debería estar funcionando en 5 minutos.**
