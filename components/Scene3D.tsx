import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { PhysicsWorld } from '../engine/systems/PhysicsWorld';
import { ChartDataPoint } from '../types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      lineSegments: any;
      edgesGeometry: any;
      lineBasicMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      gridHelper: any;
      color: any;
    }
  }
}

interface SceneProps {
  world: PhysicsWorld;
  isRunning: boolean;
  onDataUpdate: (data: ChartDataPoint) => void;
}

const SimulationLoop: React.FC<SceneProps> = ({ world, isRunning, onDataUpdate }) => {
  const meshRefs = useRef<THREE.Mesh[]>([]);
  // Accumulator para Fixed Timestep (Padrão de Game Loop)
  const accumulator = useRef(0);
  
  // Limite para evitar "spiral of death" se a aba ficar em background
  const MAX_FRAME_TIME = 0.1; 

  useFrame((state, delta) => {
    if (!isRunning) return;

    // 1. Acumula o tempo passado desde o último frame
    // Clamp no delta para evitar instabilidade física em lags severos
    const safeDelta = Math.min(delta, MAX_FRAME_TIME);
    accumulator.current += safeDelta;

    const fixedTimeStep = world.config.timeStep;
    let stepsProcessed = 0;

    // 2. Consome o acumulador em passos fixos de física
    // Isso garante que a física rode na mesma velocidade independente de 60fps ou 144fps
    while (accumulator.current >= fixedTimeStep && stepsProcessed < 10) {
      world.step();
      accumulator.current -= fixedTimeStep;
      stepsProcessed++;
    }

    // 3. Amostragem de dados para os gráficos
    // Limitamos a amostragem visual para não saturar o Recharts/React
    if (stepsProcessed > 0 && world.time % (fixedTimeStep * 5) < fixedTimeStep) {
      const point: ChartDataPoint = { time: world.time };
      
      if (world.particles.length >= 2) {
          const p1 = world.particles[0]; // Euler
          const p2 = world.particles[1]; // RK4
          
          point.positionY_Euler = world.height - p1.position.y;
          point.positionY_RK4 = world.height - p2.position.y;
          
          // Energia Potencial baseada no chão (height)
          point.energy_Euler = p1.getKineticEnergy() + p1.getPotentialEnergy(world.config.gravity, world.height);
          point.energy_RK4 = p2.getKineticEnergy() + p2.getPotentialEnergy(world.config.gravity, world.height);
      }
      onDataUpdate(point);
    }

    // 4. Sincronização Visual (Interpolação poderia ser adicionada aqui para suavidade extra)
    world.particles.forEach((p, i) => {
      const mesh = meshRefs.current[i];
      if (mesh) {
        // Conversão de Coordenadas: Engine (Y Down) -> ThreeJS (Y Up)
        const x = p.position.x - world.width / 2;
        const y = -(p.position.y - world.height / 2);
        const z = p.position.z - world.depth / 2;
        
        mesh.position.set(x, y, z);
        (mesh.material as THREE.MeshStandardMaterial).color.set(p.color);
        (mesh.material as THREE.MeshStandardMaterial).emissive.set(p.color);
      }
    });
  });

  return (
    <>
      {world.particles.map((p, i) => (
        <Trail
          key={p.id}
          width={p.radius * 0.5} 
          length={15} // Reduzido para economizar memória visual
          decay={1}
          local={false}
          stride={0}
          interval={1}
          color={new THREE.Color(p.color)} 
          attenuation={(t) => t * t} 
        >
          <mesh 
              ref={(el) => { if (el) meshRefs.current[i] = el; }}
              castShadow 
              receiveShadow
          >
            <sphereGeometry args={[p.radius, 32, 32]} />
            <meshStandardMaterial 
              color={p.color} 
              roughness={0.1} 
              metalness={0.2} 
              emissive={p.color}
              emissiveIntensity={0.4}
            />
          </mesh>
        </Trail>
      ))}
    </>
  );
};

const BoundsBox: React.FC<{ width: number; height: number; depth: number }> = ({ width, height, depth }) => {
  return (
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
      <lineBasicMaterial color="#3f3f46" transparent opacity={0.3} />
    </lineSegments>
  );
};

export const Scene3D: React.FC<SceneProps> = (props) => {
  const { world } = props;

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <PerspectiveCamera makeDefault position={[world.width * 0.8, world.height * 0.5, world.width * 1.2]} fov={45} />
      <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 1.8} />
      
      <color attach="background" args={['#18181b']} />
      <fog attach="fog" args={['#18181b', world.width, world.width * 3.5]} />
      
      <ambientLight intensity={0.7} />
      <spotLight 
        position={[200, 500, 200]} 
        angle={0.4} 
        penumbra={1} 
        intensity={1000} 
        castShadow 
        shadow-bias={-0.0001}
      />
      <pointLight position={[-100, -100, -100]} intensity={300} color="#818cf8" />

      <BoundsBox width={world.width} height={world.height} depth={world.depth} />
      
      <group position={[0, -world.height/2 - 1, 0]}>
         <gridHelper args={[world.width * 2, 20, '#27272a', '#18181b']} />
         <ContactShadows 
            resolution={1024} 
            scale={world.width * 2} 
            blur={2.5} 
            opacity={0.4} 
            far={100} 
            color="#000000" 
         />
      </group>

      <SimulationLoop {...props} />
    </Canvas>
  );
};