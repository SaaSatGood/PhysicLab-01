import { Vector } from '../math/Vector';
import { Particle } from '../physics/Particle';
import { Integrator } from '../math/Integrators';
import { IntegratorType, SimulationConfig } from '../../types';

export class PhysicsWorld {
  particles: Particle[] = [];
  config: SimulationConfig;
  width: number;
  height: number;
  depth: number;
  time: number = 0;
  
  integratorMap: Map<string, IntegratorType> = new Map();

  constructor(width: number, height: number, depth: number, config: SimulationConfig) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.config = config;
  }

  addParticle(p: Particle, integrator: IntegratorType) {
    this.particles.push(p);
    this.integratorMap.set(p.id, integrator);
  }

  clear() {
    this.particles = [];
    this.integratorMap.clear();
    this.time = 0;
  }

  // Calculate environmental forces (Gravity, Drag)
  private getEnvironmentalForces(p: Particle): Vector {
    let totalForce = Vector.zero();

    // Gravity: F = m * g (downwards in Y axis)
    totalForce = totalForce.add(new Vector(0, this.config.gravity * p.mass, 0));

    // Drag: F = -k * v (Linear drag for stability)
    if (this.config.dragCoefficient > 0) {
      const speed = p.velocity.mag();
      if (speed > 0) {
        const dragMag = this.config.dragCoefficient * speed; 
        const dragForce = p.velocity.normalize().mult(-1).mult(dragMag);
        totalForce = totalForce.add(dragForce);
      }
    }

    return totalForce;
  }

  resolveCollisions() {
    // 1. Wall Collisions (Box Container)
    // Naive continuous check for boundaries to prevent escape
    for (const p of this.particles) {
      // Floor (Y Max)
      if (p.position.y + p.radius > this.height) {
        p.position = new Vector(p.position.x, this.height - p.radius, p.position.z);
        p.velocity = new Vector(p.velocity.x, p.velocity.y * -this.config.restitution, p.velocity.z);
      }
      // Ceiling (Y Min)
      if (p.position.y - p.radius < 0) {
        p.position = new Vector(p.position.x, p.radius, p.position.z);
        p.velocity = new Vector(p.velocity.x, p.velocity.y * -this.config.restitution, p.velocity.z);
      }
      // Right Wall (X Max)
      if (p.position.x + p.radius > this.width) {
        p.position = new Vector(this.width - p.radius, p.position.y, p.position.z);
        p.velocity = new Vector(p.velocity.x * -this.config.restitution, p.velocity.y, p.velocity.z);
      }
      // Left Wall (X Min)
      if (p.position.x - p.radius < 0) {
        p.position = new Vector(p.radius, p.position.y, p.position.z);
        p.velocity = new Vector(p.velocity.x * -this.config.restitution, p.velocity.y, p.velocity.z);
      }
      // Back Wall (Z Max)
      if (p.position.z + p.radius > this.depth) {
        p.position = new Vector(p.position.x, p.position.y, this.depth - p.radius);
        p.velocity = new Vector(p.velocity.x, p.velocity.y, p.velocity.z * -this.config.restitution);
      }
      // Front Wall (Z Min)
      if (p.position.z - p.radius < 0) {
        p.position = new Vector(p.position.x, p.position.y, p.radius);
        p.velocity = new Vector(p.velocity.x, p.velocity.y, p.velocity.z * -this.config.restitution);
      }
    }

    // 2. Particle-Particle Collisions (Elastic 3D)
    // O(N^2) naive check - ok for small N
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        const dist = p1.position.distance(p2.position);
        const minDist = p1.radius + p2.radius;

        // Discrete Collision Detection
        if (dist < minDist) {
          const normal = p2.position.sub(p1.position).normalize();
          
          // CRITICAL: Positional Correction (Projection)
          // Must separate particles *before* resolving velocity to prevent
          // "sinking" and false energy accumulation (tunneling/sticking).
          const overlap = minDist - dist;
          const separation = normal.mult(overlap * 0.5);
          p1.position = p1.position.sub(separation);
          p2.position = p2.position.add(separation);

          // Resolve Velocity (collision along normal)
          const relVel = p1.velocity.sub(p2.velocity);
          const velAlongNormal = relVel.dot(normal);

          // Do not resolve if already separating
          if (velAlongNormal > 0) continue;

          // Impulse scalar
          let jVal = -(1 + this.config.restitution) * velAlongNormal;
          jVal /= (1 / p1.mass + 1 / p2.mass);

          const impulse = normal.mult(jVal);

          p1.velocity = p1.velocity.add(impulse.mult(1 / p1.mass));
          p2.velocity = p2.velocity.sub(impulse.mult(1 / p2.mass));
        }
      }
    }
  }

  step() {
    // Collision Resolution
    // Note: Applying collision resolution *before* integration avoids some tunneling,
    // but ideally, we would handle collisions mid-integration step.
    this.resolveCollisions();

    for (const p of this.particles) {
      p.clearForces();
      
      const envForce = this.getEnvironmentalForces(p);
      p.applyForce(envForce);

      const type = this.integratorMap.get(p.id) || IntegratorType.EULER;

      if (type === IntegratorType.EULER) {
        Integrator.integrateEuler(p, this.config.timeStep);
      } else {
        // Wrapper to allow RK4 to probe forces at future hypothetical states
        const getForceAtState = (tempP: Particle) => {
          return this.getEnvironmentalForces(tempP);
        };
        Integrator.integrateRK4(p, this.config.timeStep, getForceAtState);
      }
    }
    
    this.time += this.config.timeStep;
  }
}