/**
 * Immutable Vector class for mathematical operations (3D).
 * 
 * ARCHITECTURE NOTE:
 * Immutability is prioritized here to ensure algorithmic correctness in RK4,
 * which requires calculating hypothetical future states without mutating the
 * current state of the particle.
 * 
 * PERFORMANCE TRADE-OFF:
 * In high-performance scenarios (e.g., >10k particles), this approach creates
 * pressure on the Garbage Collector due to frequent object allocation. 
 * For this educational demonstration, correctness and code clarity are favored.
 */
export class Vector {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static zero(): Vector {
    return new Vector(0, 0, 0);
  }

  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  mult(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  div(scalar: number): Vector {
    if (scalar === 0) return new Vector(0, 0, 0);
    return new Vector(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize(): Vector {
    const m = this.mag();
    if (m === 0) return Vector.zero();
    return this.div(m);
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  distance(v: Vector): number {
    return this.sub(v).mag();
  }
}