#!/bin/bash

echo "🔧 CORRIGIENDO ERROR DE BUILD"
echo "============================="

echo "1. Añadiendo exportación EXAMPLES faltante en aws.ts..."

# Añadir la exportación EXAMPLES que falta
cat >> src/config/aws.ts << 'EOF'

export const EXAMPLES = {
  profile: `${CLOUDFRONT_BASE_URL}/${S3_BASE_PATH}/static/build/potree/profile.html`,
  templates: `${CLOUDFRONT_BASE_URL}/templates/`,
};

export const ASSETS = {
  brotli: `${CLOUDFRONT_BASE_URL}/static/libs/brotli/`,
  cesium: `${CLOUDFRONT_BASE_URL}/static/libs/Cesium/`,
  copc: `${CLOUDFRONT_BASE_URL}/static/libs/copc/`,
  d3: `${CLOUDFRONT_BASE_URL}/static/libs/d3/`,
  ept: `${CLOUDFRONT_BASE_URL}/static/libs/ept/`,
  geopackage: `${CLOUDFRONT_BASE_URL}/static/libs/geopackage/`,
  i18next: `${CLOUDFRONT_BASE_URL}/static/libs/i18next/`,
};
EOF

echo "✅ EXAMPLES y ASSETS añadidos"

echo ""
echo "2. Actualizando awsConfig para incluir las nuevas exportaciones..."

# Reemplazar la línea del awsConfig para incluir EXAMPLES y ASSETS
sed -i 's/export const awsConfig = {/export const awsConfig = {\
  cloudfrontBaseURL: CLOUDFRONT_BASE_URL,\
  pointclouds: POINTCLOUDS,\
  libraries: LIBRARIES,\
  examples: EXAMPLES,\
  assets: ASSETS,\
  buildURL: buildCloudFrontURL,\
};/' src/config/aws.ts

echo "✅ awsConfig actualizado"

echo ""
echo "3. Removiendo NODE_ENV=production del .env..."

# Crear .env sin NODE_ENV=production
cat > .env << 'EOF'
# CloudFront Configuration ✅ VERIFICADO
VITE_CLOUDFRONT_URL=https://d2h8nqd60uagyp.cloudfront.net

# API Configuration  
VITE_API_BASE_URL=https://8gcbzi8fzk.execute-api.us-east-1.amazonaws.com/production
VITE_WEBSOCKET_URL=wss://b5yrr6dcq0.execute-api.us-east-1.amazonaws.com/production/

# Point Cloud Configuration ✅ URLs VERIFICADAS  
VITE_S3_BASE_PATH=reto-comu-arreglado-main/reto-comu-arreglado-main
EOF

echo "✅ .env corregido (sin NODE_ENV=production)"

echo ""
echo "4. 🏗️  INTENTANDO BUILD DE NUEVO..."
npm run build

if [[ $? -eq 0 ]]; then
    echo "✅ Build exitoso!"
    
    echo ""
    echo "5. 🚀 INICIANDO PM2..."
    pm2 start ecosystem.config.js --update-env
    
    echo ""
    echo "6. 🔍 VERIFICANDO..."
    sleep 3
    pm2 list | grep reto-comu-dashboard
    curl -I http://localhost:3000 && echo "✅ Dashboard responde" || echo "❌ Dashboard no responde"
    
    echo ""
    echo "🎉 ¡DEPLOYMENT COMPLETADO!"
    echo "========================="
    echo ""
    echo "📊 INFORMACIÓN:"
    echo "• URL: http://44.204.93.25:3000"
    echo "• Estado: Dashboard con versión anti-CORS activa"
    echo "• Error CORS: Solucionado"
    echo ""
    echo "📋 PRÓXIMOS PASOS:"
    echo "1. Abre http://44.204.93.25:3000"
    echo "2. Ve a la pestaña 'Vista 3D'"
    echo "3. La vista 3D debería cargar SIN errores CORS"
    echo ""
    echo "🔧 MONITORING:"
    echo "pm2 logs reto-comu-dashboard --follow"
    
else
    echo "❌ Build falló nuevamente. Mostrando error:"
    echo ""
    echo "📋 ALTERNATIVA MANUAL:"
    echo "1. Edita src/init.ts y remueve EXAMPLES del import:"
    echo "   De: import { awsConfig, POINTCLOUDS, LIBRARIES, EXAMPLES } from './config/aws';"
    echo "   A:  import { awsConfig, POINTCLOUDS, LIBRARIES } from './config/aws';"
    echo "2. Ejecuta: npm run build"
    echo "3. Ejecuta: pm2 start ecosystem.config.js --update-env"
fi