import { Vector } from '../math/Vector';

export interface ParticleState {
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
}

export class Particle {
  id: string;
  mass: number;
  radius: number;
  color: string;
  
  // State
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  
  // Metadata for accumulation
  forceAccumulator: Vector;

  constructor(
    x: number, 
    y: number, 
    z: number = 0,
    vx: number = 0, 
    vy: number = 0, 
    vz: number = 0,
    mass: number = 1, 
    radius: number = 10,
    color: string = '#3b82f6'
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = new Vector(x, y, z);
    this.velocity = new Vector(vx, vy, vz);
    this.acceleration = Vector.zero();
    this.forceAccumulator = Vector.zero();
    this.mass = mass;
    this.radius = radius;
    this.color = color;
  }

  applyForce(force: Vector) {
    this.forceAccumulator = this.forceAccumulator.add(force);
  }

  clearForces() {
    this.forceAccumulator = Vector.zero();
    this.acceleration = Vector.zero();
  }

  // Calculate Kinetic Energy: 0.5 * m * v^2
  getKineticEnergy(): number {
    return 0.5 * this.mass * this.velocity.magSq();
  }

  // GPE = m * g * h
  // In our world, Y increases downwards (0 is top), so Height = (Floor - Y)
  getPotentialEnergy(gravity: number, floorHeight: number): number {
    return this.mass * gravity * (floorHeight - this.position.y);
  }

  // Create a deep copy for RK4 integration steps
  clone(): Particle {
    const p = new Particle(
      this.position.x, this.position.y, this.position.z,
      this.velocity.x, this.velocity.y, this.velocity.z,
      this.mass, this.radius, this.color
    );
    p.acceleration = this.acceleration;
    p.forceAccumulator = this.forceAccumulator;
    return p;
  }
}