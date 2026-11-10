import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { INTERACTABLES, PLAYER, getInteractable } from './config.js';
import { activate, live, useRoom } from './store.js';
import { moveWithCollisions } from './systems/collision.js';

const SKIN = '#edc3a4';
const HAIR = '#3b2619';
const SHIRT = '#f5f3ec';
const TROUSERS = '#1c4a2a';
const SHOES = '#20262a';

// Screen-space input to floor-space movement for the isometric camera (camera sits at +x, +z).
const INV_SQRT2 = Math.SQRT1_2;
const NEAR_DISTANCE = 1.15;

// Top tufts and fringe that give the hair its messy, slightly wavy volume: [x, y, z, radius].
const HAIR_TUFTS = [
  [0, 0.33, 0.02, 0.12],
  [-0.12, 0.31, 0.07, 0.1],
  [0.13, 0.3, 0.05, 0.105],
  [0.05, 0.34, -0.09, 0.115],
  [-0.09, 0.33, -0.1, 0.11],
  [0.17, 0.26, -0.06, 0.095],
  [-0.18, 0.25, -0.03, 0.095],
  [-0.11, 0.2, 0.175, 0.085],
  [0.02, 0.225, 0.195, 0.09],
  [0.14, 0.19, 0.165, 0.08],
  [-0.235, 0.0, -0.02, 0.09],
  [0.235, 0.0, -0.02, 0.09],
  [-0.2, -0.1, -0.12, 0.09],
  [0.2, -0.1, -0.12, 0.09],
];

function shortestAngle(from, to) {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

// Stylized low-poly developer: light skin, wavy medium-length hair, white T-shirt, green trousers.
// The same component owns movement so position, facing and the walk cycle stay in one place.
export default function Character() {
  const root = useRef();
  const body = useRef();
  const head = useRef();
  const legLeft = useRef();
  const legRight = useRef();
  const armLeft = useRef();
  const armRight = useRef();
  const walkPhase = useRef(0);
  const blocked = useRef(0);

  const torsoGeometry = useMemo(() => new RoundedBoxGeometry(0.5, 0.5, 0.29, 3, 0.09), []);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const state = useRoom.getState();
    const locked = !!state.activeId || state.cvOpen;

    // 1. Decide the direction: keyboard or joystick first, otherwise follow the current path.
    let inputX = live.keys.x + live.stick.x;
    let inputY = live.keys.y + live.stick.y;
    const inputLength = Math.hypot(inputX, inputY);
    let dirX = 0;
    let dirZ = 0;
    let wanted = 0;

    if (!locked && inputLength > 0.08) {
      if (inputLength > 1) {
        inputX /= inputLength;
        inputY /= inputLength;
      }
      // right on screen = (+x, -z), up on screen = (-x, -z)
      dirX = (inputX - inputY) * INV_SQRT2;
      dirZ = (-inputX - inputY) * INV_SQRT2;
      wanted = Math.min(1, inputLength);
      live.path = [];
      live.pending = null;
    } else if (!locked && live.path.length > 0) {
      const next = live.path[0];
      const dx = next.x - live.x;
      const dz = next.z - live.z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.06) {
        live.path.shift();
        if (live.path.length === 0 && live.pending) {
          const id = live.pending;
          live.pending = null;
          activate(id);
        }
      } else {
        dirX = dx / distance;
        dirZ = dz / distance;
        // Slow down for the last few centimetres so the character does not overshoot.
        wanted = live.path.length === 1 ? Math.min(1, distance / 0.35 + 0.25) : 1;
      }
    }

    // 2. Move with collisions.
    const targetSpeed = wanted * PLAYER.speed;
    live.speed += (targetSpeed - live.speed) * Math.min(1, delta * 12);
    if (live.speed > 0.02 && (dirX !== 0 || dirZ !== 0)) {
      const step = live.speed * delta;
      const before = { x: live.x, z: live.z };
      const moved = moveWithCollisions(live.x, live.z, dirX * step, dirZ * step);
      live.x = moved.x;
      live.z = moved.z;
      const travelled = Math.hypot(live.x - before.x, live.z - before.z);
      // Give up on a path when something keeps blocking it.
      if (live.path.length > 0 && travelled < step * 0.2) {
        blocked.current += delta;
        if (blocked.current > 0.5) {
          live.path = [];
          live.pending = null;
          blocked.current = 0;
        }
      } else {
        blocked.current = 0;
      }
      live.heading += shortestAngle(live.heading, Math.atan2(dirX, dirZ)) * Math.min(1, delta * 12);
    } else if (wanted === 0) {
      live.speed *= 0.6;
    }

    // 3. Face the object being opened, or the one the character is standing next to after arriving.
    const facingId = state.activeId || (state.cvOpen ? 'cv' : null);
    if (facingId) {
      const target = getInteractable(facingId);
      const angle = Math.atan2(target.focus[0] - live.x, target.focus[2] - live.z);
      live.heading += shortestAngle(live.heading, angle) * Math.min(1, delta * 8);
    }

    // 4. Which object is within reach?
    let nearId = null;
    let nearDistance = NEAR_DISTANCE;
    for (const item of INTERACTABLES) {
      const distance = Math.hypot(item.approach.x - live.x, item.approach.z - live.z);
      if (distance < nearDistance) {
        nearDistance = distance;
        nearId = item.id;
      }
    }
    if (nearId !== state.nearId) useRoom.setState({ nearId });

    // 5. Pose.
    const speedRatio = Math.min(1, live.speed / PLAYER.speed);
    walkPhase.current += delta * (4 + speedRatio * 7) * speedRatio;
    const swing = Math.sin(walkPhase.current) * 0.75 * speedRatio;
    const t = clock.elapsedTime;
    const breathe = Math.sin(t * 1.8) * (1 - speedRatio);

    root.current.position.set(live.x, 0, live.z);
    root.current.rotation.y = live.heading;
    body.current.position.y = Math.abs(Math.sin(walkPhase.current)) * 0.035 * speedRatio + breathe * 0.006;
    body.current.rotation.z = Math.sin(walkPhase.current) * 0.03 * speedRatio;
    legLeft.current.rotation.x = swing;
    legRight.current.rotation.x = -swing;
    armLeft.current.rotation.x = -swing * 0.8;
    armRight.current.rotation.x = swing * 0.8;
    armLeft.current.rotation.z = 0.08 + breathe * 0.015;
    armRight.current.rotation.z = -0.08 - breathe * 0.015;
    head.current.rotation.y = Math.sin(t * 0.6) * 0.12 * (1 - speedRatio);
    head.current.rotation.x = breathe * 0.02;
  });

  return (
    <group ref={root} position={[PLAYER.start.x, 0, PLAYER.start.z]}>
      <group ref={body}>
        {/* Legs */}
        {[
          [legLeft, -0.115],
          [legRight, 0.115],
        ].map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 0.5, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <boxGeometry args={[0.185, 0.44, 0.2]} />
              <meshStandardMaterial color={TROUSERS} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.455, 0.035]} castShadow>
              <boxGeometry args={[0.19, 0.09, 0.28]} />
              <meshStandardMaterial color={SHOES} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.49, 0.035]}>
              <boxGeometry args={[0.195, 0.025, 0.285]} />
              <meshStandardMaterial color="#f2f0e8" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Torso: white T-shirt */}
        <mesh geometry={torsoGeometry} position={[0, 0.74, 0]} castShadow>
          <meshStandardMaterial color={SHIRT} roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.515, 0]}>
          <boxGeometry args={[0.44, 0.07, 0.25]} />
          <meshStandardMaterial color={TROUSERS} roughness={0.9} />
        </mesh>

        {/* Arms */}
        {[
          [armLeft, -0.3],
          [armRight, 0.3],
        ].map(([ref, x]) => (
          <group key={x} ref={ref} position={[x, 0.93, 0]}>
            <mesh position={[0, -0.08, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.085, 0.19, 10]} />
              <meshStandardMaterial color={SHIRT} roughness={0.95} />
            </mesh>
            <mesh position={[0, -0.29, 0]} castShadow>
              <capsuleGeometry args={[0.058, 0.2, 3, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Neck and head */}
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[0.075, 0.08, 0.1, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.8} />
        </mesh>
        <group ref={head} position={[0, 1.27, 0]}>
          <mesh castShadow scale={[1, 1.04, 1]}>
            <sphereGeometry args={[0.25, 18, 14]} />
            <meshStandardMaterial color={SKIN} roughness={0.8} />
          </mesh>
          {/* Eyes, brows and a small smile */}
          {[-0.09, 0.09].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.0, 0.228]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#1c1410" roughness={0.4} />
              </mesh>
              <mesh position={[x, 0.065, 0.236]} rotation={[0, 0, x > 0 ? -0.12 : 0.12]}>
                <boxGeometry args={[0.07, 0.016, 0.02]} />
                <meshStandardMaterial color={HAIR} roughness={0.9} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, -0.095, 0.232]}>
            <boxGeometry args={[0.07, 0.014, 0.015]} />
            <meshStandardMaterial color="#a8624e" roughness={0.8} />
          </mesh>
          {[-0.248, 0.248].map((x) => (
            <mesh key={x} position={[x, -0.01, 0]}>
              <sphereGeometry args={[0.045, 8, 6]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
          ))}

          {/* Hair: a cap, a longer back, and tufts for the wavy, slightly messy top */}
          <mesh position={[0, 0.115, -0.05]} scale={[1.06, 0.76, 1.02]} castShadow>
            <icosahedronGeometry args={[0.268, 2]} />
            <meshStandardMaterial color={HAIR} roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0, -0.04, -0.125]} scale={[1.16, 1.05, 0.9]}>
            <icosahedronGeometry args={[0.2, 1]} />
            <meshStandardMaterial color={HAIR} roughness={0.95} flatShading />
          </mesh>
          {HAIR_TUFTS.map(([x, y, z, radius], index) => (
            <mesh key={index} position={[x, y, z]} rotation={[index * 0.7, index * 1.3, index * 0.4]} castShadow={index < 7}>
              <icosahedronGeometry args={[radius, 1]} />
              <meshStandardMaterial color={HAIR} roughness={0.95} flatShading />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
