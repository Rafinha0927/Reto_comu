import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Maximize2, RefreshCw, Box } from 'lucide-react';
import { Button } from './ui/button';
import { useEffect, useRef, useState } from 'react';

interface Sensor {
  id: string;
  name: string;
  x: number;
  y: number;
  z?: number;
  status: 'active' | 'inactive';
}

interface ThreeDViewProps {
  sensors: Sensor[];
  onSensorClick: (sensorId: string) => void;
  selectedSensorId: string | null;
}

export function ThreeDView({ sensors, onSensorClick, selectedSensorId }: ThreeDViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded || !containerRef.current) return;

    // Cargar Three.js
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@r128/build/three.min.js';
    script.onload = () => {
      console.log('✅ Three.js cargado');
      initThreeScene();
      setLoaded(true);
    };
    script.onerror = () => {
      setError('Error cargando Three.js');
      console.error('❌ Error cargando Three.js');
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [loaded]);

  const initThreeScene = () => {
    if (!containerRef.current) return;

    const THREE = (window as any).THREE;
    if (!THREE) {
      setError('THREE.js no disponible');
      return;
    }

    console.log('🎬 Inicializando escena 3D...');

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    scene.fog = new THREE.Fog(0x111827, 100, 200);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x333333);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Crear esferas para sensores
    const sensorObjects: { [key: string]: any } = {};
    
    sensors.forEach((sensor) => {
      const geometry = new THREE.SphereGeometry(2, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: sensor.status === 'active' ? 0x00ff00 : 0xff5555,
        emissive: sensor.status === 'active' ? 0x00aa00 : 0xaa0000,
        metalness: 0.5,
        roughness: 0.4,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(sensor.x, sensor.z || 10, sensor.y);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      
      // Agregar userData para identificar el sensor
      sphere.userData.sensorId = sensor.id;
      sphere.userData.sensorName = sensor.name;

      scene.add(sphere);
      sensorObjects[sensor.id] = sphere;

      // Agregar etiqueta de texto
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(sensor.name, 128, 40);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(10, 2.5, 1);
      sprite.position.set(sensor.x, (sensor.z || 10) + 5, sensor.y);
      scene.add(sprite);
    });

    // Raycaster para detectar clics
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object as any;
        if (obj.userData.sensorId) {
          onSensorClick(obj.userData.sensorId);
          console.log(`Sensor seleccionado: ${obj.userData.sensorName}`);
          break;
        }
      }
    };

    renderer.domElement.addEventListener('click', onClick);

    // Controles de cámara con ratón
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
        camera.position.applyAxisAngle(
          new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005),
          deltaY * 0.005
        );
        camera.lookAt(0, 0, 0);
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Zoom con rueda
    renderer.domElement.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const direction = camera.position.clone().normalize();
      const distance = camera.position.length();
      const newDistance = distance + (e.deltaY > 0 ? 5 : -5);
      camera.position.copy(direction.multiplyScalar(Math.max(10, newDistance)));
      camera.lookAt(0, 0, 0);
    });

    // Resaltar sensor seleccionado
    const updateSelectedSensor = () => {
      Object.values(sensorObjects).forEach((mesh: any) => {
        const material = mesh.material as any;
        if (mesh.userData.sensorId === selectedSensorId) {
          material.emissiveIntensity = 1;
          material.roughness = 0.2;
        } else {
          material.emissiveIntensity = 0.5;
          material.roughness = 0.4;
        }
      });
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotar esferas
      Object.values(sensorObjects).forEach((mesh: any) => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
      });

      updateSelectedSensor();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    console.log('✅ Escena 3D inicializada correctamente');

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
    };
  };

  return (
    <Card className="h-full relative bg-black overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50 pointer-events-none">
        <Badge variant="outline" className="bg-white/95 backdrop-blur pointer-events-auto">
          <Box className="w-4 h-4 mr-2" />
          Vista 3D - Sensores IoT
        </Badge>
        <div className="flex gap-2 pointer-events-auto">
          <Button size="icon" variant="outline" className="bg-white/90 backdrop-blur">
            <RefreshCw className="w-4 h-4" onClick={() => window.location.reload()} />
          </Button>
          <Button size="icon" variant="outline" className="bg-white/90 backdrop-blur">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900 to-black z-40">
          <div className="text-center text-white">
            <div className="text-xl font-bold mb-4">⚠️ Error</div>
            <div className="text-sm bg-red-950/50 p-4 rounded max-w-md">{error}</div>
          </div>
        </div>
      )}

      {/* Contenedor 3D */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Fallback mientras carga */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
          <div className="text-white text-center">
            <div className="text-xl animate-pulse mb-4">Cargando vista 3D...</div>
            <div className="text-xs text-gray-400">Inicializando Three.js</div>
          </div>
        </div>
      )}
    </Card>
  );
}