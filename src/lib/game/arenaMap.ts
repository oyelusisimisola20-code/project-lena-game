import * as THREE from "three";

export interface ArenaObstacle {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  type: "wall" | "pillar" | "ramp" | "jump_pad" | "cover";
  color?: string;
  glow?: boolean;
}

export const ARENA_BOUNDS = {
  minX: -45,
  maxX: 45,
  minZ: -45,
  maxZ: 45,
  floorY: 0,
  ceilingY: 25,
};

export const SPAWN_POINTS: [number, number, number][] = [
  [-30, 1.5, -30],
  [30, 1.5, 30],
  [-30, 1.5, 30],
  [30, 1.5, -30],
  [0, 1.5, -35],
  [0, 1.5, 35],
  [-35, 1.5, 0],
  [35, 1.5, 0],
  [0, 7.5, 0], // Center Upper Platform
];

export const JUMP_PADS: { position: [number, number, number]; radius: number; boost: number }[] = [
  { position: [-18, 0.1, -18], radius: 2.5, boost: 18 },
  { position: [18, 0.1, 18], radius: 2.5, boost: 18 },
  { position: [-18, 0.1, 18], radius: 2.5, boost: 18 },
  { position: [18, 0.1, -18], radius: 2.5, boost: 18 },
];

export const ARENA_OBSTACLES: ArenaObstacle[] = [
  // Center elevated platform
  { id: "center_platform", position: [0, 3, 0], size: [16, 6, 16], type: "wall", color: "#00E5FF", glow: true },
  
  // Outer perimeter boundary walls
  { id: "wall_north", position: [0, 6, -45], size: [90, 12, 2], type: "wall", color: "#00E5FF", glow: true },
  { id: "wall_south", position: [0, 6, 45], size: [90, 12, 2], type: "wall", color: "#FF0055", glow: true },
  { id: "wall_west", position: [-45, 6, 0], size: [2, 12, 90], type: "wall", color: "#00E5FF", glow: true },
  { id: "wall_east", position: [45, 6, 0], size: [2, 12, 90], type: "wall", color: "#FF0055", glow: true },

  // Tactical cover pillars & barriers
  { id: "pillar_nw", position: [-20, 4, -20], size: [3, 8, 3], type: "pillar", color: "#00E5FF", glow: true },
  { id: "pillar_ne", position: [20, 4, -20], size: [3, 8, 3], type: "pillar", color: "#00E5FF", glow: true },
  { id: "pillar_sw", position: [-20, 4, 20], size: [3, 8, 3], type: "pillar", color: "#FF0055", glow: true },
  { id: "pillar_se", position: [20, 4, 20], size: [3, 8, 3], type: "pillar", color: "#FF0055", glow: true },

  // Low barriers / cover blocks
  { id: "cover_n", position: [0, 1.5, -22], size: [10, 3, 1.5], type: "cover", color: "#00E5FF", glow: false },
  { id: "cover_s", position: [0, 1.5, 22], size: [10, 3, 1.5], type: "cover", color: "#FF0055", glow: false },
  { id: "cover_w", position: [-22, 1.5, 0], size: [1.5, 3, 10], type: "cover", color: "#00E5FF", glow: false },
  { id: "cover_e", position: [22, 1.5, 0], size: [1.5, 3, 10], type: "cover", color: "#FF0055", glow: false },

  // Corner towers
  { id: "corner_nw", position: [-34, 4, -34], size: [6, 8, 6], type: "wall", color: "#00E5FF", glow: true },
  { id: "corner_ne", position: [34, 4, -34], size: [6, 8, 6], type: "wall", color: "#00E5FF", glow: true },
  { id: "corner_sw", position: [-34, 4, 34], size: [6, 8, 6], type: "wall", color: "#FF0055", glow: true },
  { id: "corner_se", position: [34, 4, 34], size: [6, 8, 6], type: "wall", color: "#FF0055", glow: true },
];

export function checkObstacleCollision(
  position: THREE.Vector3,
  radius: number = 0.8
): { collided: boolean; normal: THREE.Vector3 } {
  // Check bounds
  if (position.x - radius < ARENA_BOUNDS.minX) return { collided: true, normal: new THREE.Vector3(1, 0, 0) };
  if (position.x + radius > ARENA_BOUNDS.maxX) return { collided: true, normal: new THREE.Vector3(-1, 0, 0) };
  if (position.z - radius < ARENA_BOUNDS.minZ) return { collided: true, normal: new THREE.Vector3(0, 0, 1) };
  if (position.z + radius > ARENA_BOUNDS.maxZ) return { collided: true, normal: new THREE.Vector3(0, 0, -1) };

  for (const obs of ARENA_OBSTACLES) {
    const halfX = obs.size[0] / 2 + radius;
    const halfY = obs.size[1] / 2;
    const halfZ = obs.size[2] / 2 + radius;

    const minX = obs.position[0] - halfX;
    const maxX = obs.position[0] + halfX;
    const minY = obs.position[1] - halfY;
    const maxY = obs.position[1] + halfY;
    const minZ = obs.position[2] - halfZ;
    const maxZ = obs.position[2] + halfZ;

    if (
      position.x >= minX &&
      position.x <= maxX &&
      position.y >= minY &&
      position.y <= maxY &&
      position.z >= minZ &&
      position.z <= maxZ
    ) {
      // Determine penetration axis
      const dx1 = position.x - minX;
      const dx2 = maxX - position.x;
      const dz1 = position.z - minZ;
      const dz2 = maxZ - position.z;
      const minPen = Math.min(dx1, dx2, dz1, dz2);

      let normal = new THREE.Vector3(0, 0, 0);
      if (minPen === dx1) normal.set(-1, 0, 0);
      else if (minPen === dx2) normal.set(1, 0, 0);
      else if (minPen === dz1) normal.set(0, 0, -1);
      else normal.set(0, 0, 1);

      return { collided: true, normal };
    }
  }

  return { collided: false, normal: new THREE.Vector3() };
}
