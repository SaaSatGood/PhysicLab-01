import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PhysicsWorld } from './engine/systems/PhysicsWorld';
import { Particle } from './engine/physics/Particle';
import { Vector } from './engine/math/Vector';
import { IntegratorType, ScenarioType, SimulationConfig, ChartDataPoint } from './types';
import { ControlPanel } from './components/ControlPanel';
import { DataCharts } from './components/DataCharts';
import { Scene3D } from './components/Scene3D';

const WORLD_WIDTH = 600;
const WORLD_HEIGHT = 400;
const WORLD_DEPTH = 400;

const INITIAL_CONFIG: SimulationConfig = {
  gravity: 9.8,
  restitution: 0.8,
  timeStep: 0.016,
  dragCoefficient: 0.00
};

const App: React.FC = () => {
  const worldRef = useRef<PhysicsWorld>(new PhysicsWorld(WORLD_WIDTH, WORLD_HEIGHT, WORLD_DEPTH, INITIAL_CONFIG));
  
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  const [scenario, setScenario] = useState<ScenarioType>(ScenarioType.PROJECTILE_COMPARISON);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Cores Sólidas e Funcionais
  const COLOR_EULER = '#ff6b6b'; // Vermelho Suave
  const COLOR_RK4 = '#4ecdc4';   // Turquesa Suave

  const setupComparison = useCallback((world: PhysicsWorld) => {
    world.clear();
    const startPos = new Vector(50, WORLD_HEIGHT - 50, WORLD_DEPTH / 2);
    const startVel = new Vector(60, -85, -20);
    
    const p1 = new Particle(startPos.x, startPos.y, startPos.z, startVel.x, startVel.y, startVel.z, 8, 12, COLOR_EULER);
    world.addParticle(p1, IntegratorType.EULER);

    const p2 = new Particle(startPos.x, startPos.y, startPos.z, startVel.x, startVel.y, startVel.z, 8, 12, COLOR_RK4);
    world.addParticle(p2, IntegratorType.RK4);
  }, []);

  const setupCollisions = useCallback((world: PhysicsWorld) => {
    world.clear();
    for(let i=0; i<20; i++) {
        const r = 8 + Math.random() * 8;
        const x = Math.random() * (WORLD_WIDTH - 100) + 50;
        const y = Math.random() * (WORLD_HEIGHT/2) + 50;
        const z = Math.random() * (WORLD_DEPTH - 100) + 50;
        
        const vx = (Math.random() - 0.5) * 150;
        const vy = (Math.random() - 0.5) * 150;
        const vz = (Math.random() - 0.5) * 150;
        
        const color = `hsl(${Math.random() * 360}, 70%, 65%)`;
        const p = new Particle(x, y, z, vx, vy, vz, r * 2, r, color);
        world.addParticle(p, IntegratorType.RK4);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    const world = worldRef.current;
    world.config = config;
    world.time = 0;
    setChartData([]);
    
    if (scenario === ScenarioType.PROJECTILE_COMPARISON) {
      setupComparison(world);
    } else {
      setupCollisions(world);
    }
  }, [config, scenario, setupComparison, setupCollisions]);

  useEffect(() => {
    worldRef.current.config = config;
  }, [config]);

  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  const handleDataUpdate = useCallback((point: ChartDataPoint) => {
     setChartData(prev => {
        const newData = [...prev, point];
        if (newData.length > 100) return newData.slice(-100);
        return newData;
     });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
      
      {/* Cabeçalho Simples */}
      <header className="bg-zinc-800 border-b border-zinc-700 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
             <h1 className="text-xl font-semibold flex items-center gap-2">
                PhysicLab 
                <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded font-normal">v2.0</span>
             </h1>
          </div>
          <div className="text-sm text-zinc-400">
             Simulador Didático de Física
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-8">
        
        {/* Área de Simulação e Controle */}
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Esquerda: Visualização */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-700">
                   <Scene3D 
                      world={worldRef.current} 
                      isRunning={isRunning} 
                      onDataUpdate={handleDataUpdate}
                   />
                   
                   {/* Legenda Simples */}
                    {scenario === ScenarioType.PROJECTILE_COMPARISON && (
                        <div className="absolute top-4 right-4 bg-zinc-900/90 px-4 py-3 rounded-lg border border-zinc-700">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff6b6b]"></div>
                                    <span className="text-sm text-zinc-200">Euler (Rápido, menos preciso)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#4ecdc4]"></div>
                                    <span className="text-sm text-zinc-200">RK4 (Preciso, robusto)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gráficos */}
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 h-64">
                    {scenario === ScenarioType.PROJECTILE_COMPARISON ? (
                        <DataCharts data={chartData} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-500">
                            Gráficos disponíveis apenas no modo de comparação.
                        </div>
                    )}
                </div>
            </div>

            {/* Direita: Controles */}
            <div className="w-full lg:w-80 shrink-0">
               <ControlPanel 
                  config={config} 
                  onConfigChange={setConfig} 
                  scenario={scenario}
                  onScenarioChange={setScenario}
                  onReset={resetSimulation}
                  isRunning={isRunning}
                  onTogglePlay={() => setIsRunning(!isRunning)}
              />
            </div>
        </div>

        {/* Seção Explicativa (Texto Legível) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-700">
            
            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Como Funciona?</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                    Este projeto simula física real no navegador. Para calcular o movimento, o computador precisa "adivinhar" onde o objeto estará no próximo quadro. Usamos matemática para fazer essa previsão.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Euler vs. Runge-Kutta</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                    <strong>Euler (Vermelho):</strong> É o método mais simples. Ele assume que a velocidade não muda durante o passo. É rápido, mas erra em curvas longas.<br/><br/>
                    <strong>RK4 (Turquesa):</strong> É o padrão da indústria. Ele faz 4 cálculos por passo para ter certeza da trajetória. É muito mais preciso.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Sobre o Projeto</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                    Desenvolvido com <strong>TypeScript</strong> puro para os cálculos matemáticos (Engine) e <strong>React Three Fiber</strong> para a visualização 3D. O código da física é totalmente separado da interface visual.
                </p>
            </div>

        </section>

      </main>
    </div>
  );
};

export default App;