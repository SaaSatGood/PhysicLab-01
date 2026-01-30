import React from 'react';
import { SimulationConfig, ScenarioType } from '../types';

interface Props {
  config: SimulationConfig;
  onConfigChange: (c: SimulationConfig) => void;
  scenario: ScenarioType;
  onScenarioChange: (s: ScenarioType) => void;
  onReset: () => void;
  isRunning: boolean;
  onTogglePlay: () => void;
}

export const ControlPanel: React.FC<Props> = ({
  config,
  onConfigChange,
  scenario,
  onScenarioChange,
  onReset,
  isRunning,
  onTogglePlay
}) => {
  const handleChange = (key: keyof SimulationConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow-sm flex flex-col gap-6">
      
      <div>
        <h2 className="text-lg font-semibold text-white">Painel de Controle</h2>
        <p className="text-sm text-zinc-400">Ajuste os parâmetros da simulação</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-300">Cenário</label>
        <select 
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value as ScenarioType)}
          className="w-full bg-zinc-900 border border-zinc-600 rounded-md p-3 text-sm text-white focus:border-indigo-500 outline-none cursor-pointer"
        >
          <option value={ScenarioType.PROJECTILE_COMPARISON}>Comparação (Euler vs RK4)</option>
          <option value={ScenarioType.ELASTIC_COLLISION}>Colisões Múltiplas 3D</option>
        </select>
      </div>

      <hr className="border-zinc-700" />

      {/* Controles Deslizantes - Focando na legibilidade dos valores */}
      <div className="flex flex-col gap-6">
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <span className="text-sm text-zinc-300">Gravidade</span>
             <span className="text-white font-semibold text-sm bg-zinc-700 px-2 py-1 rounded">
                {config.gravity.toFixed(1)} m/s²
             </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="0.1"
            value={config.gravity}
            onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <span className="text-sm text-zinc-300">Passo de Tempo (dt)</span>
             <span className="text-white font-semibold text-sm bg-zinc-700 px-2 py-1 rounded">
                {config.timeStep.toFixed(3)} s
             </span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.1"
            step="0.001"
            value={config.timeStep}
            onChange={(e) => handleChange('timeStep', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <span className="text-sm text-zinc-300">Elasticidade</span>
             <span className="text-white font-semibold text-sm bg-zinc-700 px-2 py-1 rounded">
                {(config.restitution * 100).toFixed(0)}%
             </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.2"
            step="0.05"
            value={config.restitution}
            onChange={(e) => handleChange('restitution', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        <div className="space-y-2">
           <div className="flex justify-between items-center">
             <span className="text-sm text-zinc-300">Resistência do Ar</span>
             <span className="text-white font-semibold text-sm bg-zinc-700 px-2 py-1 rounded">
                {config.dragCoefficient.toFixed(3)}
             </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.001"
            value={config.dragCoefficient}
            onChange={(e) => handleChange('dragCoefficient', parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

      </div>

      {/* Botões Grandes e Claros */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onTogglePlay}
          className={`flex-1 py-3 rounded-md font-semibold transition-colors text-white ${
            isRunning 
              ? 'bg-zinc-600 hover:bg-zinc-500' 
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {isRunning ? 'Pausar' : 'Iniciar'}
        </button>
        
        <button
          onClick={onReset}
          className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md font-semibold transition-colors"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
};