export enum IntegratorType {
  EULER = 'Euler',
  RK4 = 'Runge-Kutta 4'
}

export interface SimulationConfig {
  gravity: number;
  restitution: number; // 0 to 1 (bounciness)
  timeStep: number; // Delta T
  dragCoefficient: number;
}

export interface ChartDataPoint {
  time: number;
  positionY_Euler?: number;
  positionY_RK4?: number;
  energy_Euler?: number;
  energy_RK4?: number;
}

export enum ScenarioType {
  PROJECTILE_COMPARISON = 'PROJECTILE_COMPARISON',
  ELASTIC_COLLISION = 'ELASTIC_COLLISION'
}