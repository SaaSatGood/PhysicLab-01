import { Vector } from './Vector';
import { Particle } from '../physics/Particle';

/**
 * State derivative interface for RK4
 * dy/dt = f(t, y)
 * For physics:
 * d(pos)/dt = vel
 * d(vel)/dt = acc = force / mass
 */
interface StateDerivative {
  dPos: Vector; // velocity
  dVel: Vector; // acceleration
}

export class Integrator {
  
  /**
   * Euler Integration (First Order)
   * x(t+dt) = x(t) + v(t)*dt
   * v(t+dt) = v(t) + a(t)*dt
   * 
   * Simple, fast, but accumulates error quickly (O(dt) error).
   * Energy is not conserved in orbital/curved motions.
   */
  static integrateEuler(particle: Particle, dt: number): void {
    // a = F / m
    particle.acceleration = particle.forceAccumulator.div(particle.mass);

    // Update Position
    particle.position = particle.position.add(particle.velocity.mult(dt));

    // Update Velocity
    particle.velocity = particle.velocity.add(particle.acceleration.mult(dt));
  }

  /**
   * Runge-Kutta 4 Integration (Fourth Order)
   * Samples derivative at 4 points to estimate the next step.
   * Much higher accuracy (O(dt^4) error).
   * 
   * CRITICAL: We must recalculate forces at each intermediate state (k1..k4).
   * Simply using constant acceleration would degrade this to RK2 or Euler.
   */
  static integrateRK4(particle: Particle, dt: number, getForces: (p: Particle) => Vector): void {
    const initialPos = particle.position;
    const initialVel = particle.velocity;

    // Helper to evaluate derivatives at a given state
    const evaluate = (
      pos: Vector, 
      vel: Vector, 
      dtOffset: number, 
      dDerivative: StateDerivative | null
    ): StateDerivative => {
      // Create a temporary state for evaluation
      let statePos = pos;
      let stateVel = vel;

      if (dDerivative) {
        statePos = statePos.add(dDerivative.dPos.mult(dtOffset));
        stateVel = stateVel.add(dDerivative.dVel.mult(dtOffset));
      }

      // We need a temporary particle to calculate forces at this hypothetical state.
      // NOTE: Cloning here has a performance cost but ensures math safety.
      const tempParticle = particle.clone();
      tempParticle.position = statePos;
      tempParticle.velocity = stateVel;
      
      // RECALCULATE FORCES based on the new position/velocity (e.g. for Drag or Gravity variations)
      const forces = getForces(tempParticle);
      const acc = forces.div(tempParticle.mass);

      return {
        dPos: stateVel,
        dVel: acc
      };
    };

    // k1: Derivatives at initial state
    const k1 = evaluate(initialPos, initialVel, 0, null);

    // k2: Derivatives at t + dt/2, using k1
    const k2 = evaluate(initialPos, initialVel, dt * 0.5, k1);

    // k3: Derivatives at t + dt/2, using k2
    const k3 = evaluate(initialPos, initialVel, dt * 0.5, k2);

    // k4: Derivatives at t + dt, using k3
    const k4 = evaluate(initialPos, initialVel, dt, k3);

    // Combine weighted average
    // dPos_dt = (k1.dPos + 2*k2.dPos + 2*k3.dPos + k4.dPos) / 6
    const dPosTotal = k1.dPos.add(k2.dPos.mult(2)).add(k3.dPos.mult(2)).add(k4.dPos);
    const dVelTotal = k1.dVel.add(k2.dVel.mult(2)).add(k3.dVel.mult(2)).add(k4.dVel);

    particle.position = initialPos.add(dPosTotal.mult(dt / 6));
    particle.velocity = initialVel.add(dVelTotal.mult(dt / 6));
    
    // Set final acceleration for display purposes
    particle.acceleration = particle.forceAccumulator.div(particle.mass);
  }
}