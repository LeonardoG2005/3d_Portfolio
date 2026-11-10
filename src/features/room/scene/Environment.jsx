import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Matrix4, Vector3 } from 'three/webgpu';
import { createBuilder, seeded } from './builder.js';
import { buildRoomGeometry } from './layout.js';
import { PALETTES } from './palette.js';
import { codeScreenTexture, heatmapTexture, skyTexture } from './textures.js';

// Disposes a GPU resource when it is replaced or the scene unmounts.
function useDisposable(factory, deps) {
  const resource = useMemo(factory, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => resource.dispose(), [resource]);
  return resource;
}

function StaticRoom({ palette }) {
  const geometry = useDisposable(() => buildRoomGeometry(palette), [palette]);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.88} metalness={0} />
    </mesh>
  );
}

// Neon sign: a monitor outline with </> inside. `thickness` lets the same shape be reused as a soft halo.
function neonGeometry(thickness) {
  const b = createBuilder();
  const t = thickness;
  const depth = 0.03;
  // Screen outline
  b.box(0, 0.31, 0, 1.0 + t, t, depth, '#fff');
  b.box(0, -0.31, 0, 1.0 + t, t, depth, '#fff');
  b.box(-0.5, 0, 0, t, 0.62, depth, '#fff');
  b.box(0.5, 0, 0, t, 0.62, depth, '#fff');
  // Neck and stand
  b.box(0, -0.4, 0, t, 0.16, depth, '#fff');
  b.box(0, -0.48, 0, 0.42, t, depth, '#fff');
  // </>
  const small = t * 0.85;
  b.box(-0.27, 0.065, 0, 0.2, small, depth, '#fff', [0, 0, 0.748]);
  b.box(-0.27, -0.065, 0, 0.2, small, depth, '#fff', [0, 0, -0.748]);
  b.box(0, 0, 0, 0.34, small, depth, '#fff', [0, 0, 1.212]);
  b.box(0.27, 0.065, 0, 0.2, small, depth, '#fff', [0, 0, -0.748]);
  b.box(0.27, -0.065, 0, 0.2, small, depth, '#fff', [0, 0, 0.748]);
  return b.build();
}

function NeonSign({ palette, theme }) {
  const tube = useDisposable(() => neonGeometry(0.04), []);
  const halo = useDisposable(() => neonGeometry(0.13), []);
  const light = useRef();
  const haloMaterial = useRef();

  // Very subtle flicker so the sign feels alive.
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flicker = 0.94 + Math.sin(t * 3.1) * 0.04 + (Math.sin(t * 47) > 0.985 ? -0.25 : 0);
    if (light.current) light.current.intensity = palette.neonIntensity * flicker;
    if (haloMaterial.current) haloMaterial.current.opacity = (theme === 'dark' ? 0.2 : 0.12) * flicker;
  });

  return (
    <group position={[-1.2, 2.62, -3.94]}>
      <mesh position={[0, -0.06, -0.035]}>
        <boxGeometry args={[1.3, 1.02, 0.03]} />
        <meshStandardMaterial color={theme === 'dark' ? '#161c18' : '#2a322d'} roughness={0.9} />
      </mesh>
      <mesh geometry={halo} position={[0, 0, 0.005]}>
        <meshBasicMaterial ref={haloMaterial} color="#17e04f" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={tube} position={[0, 0, 0.02]}>
        <meshBasicMaterial color={theme === 'dark' ? '#5dff8d' : '#19c44b'} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, -0.1, 0.7]} color="#22e05a" intensity={palette.neonIntensity} distance={5} decay={2} />
    </group>
  );
}

function Screens({ theme }) {
  const codeA = useDisposable(() => codeScreenTexture(11), []);
  const codeB = useDisposable(() => codeScreenTexture(42), []);
  const sky = useDisposable(() => skyTexture(theme), [theme]);
  const heatMaterial = useRef();

  // The activity panel shows the saved contribution snapshot when it can be loaded.
  useEffect(() => {
    let alive = true;
    let texture = heatmapTexture(null);
    if (heatMaterial.current) {
      heatMaterial.current.map = texture;
      heatMaterial.current.needsUpdate = true;
    }
    import('../../../data/contributions.snapshot.json')
      .then((module) => {
        if (!alive || !heatMaterial.current) return;
        const levels = (module.default.days || []).map((day) => day[2]);
        texture.dispose();
        texture = heatmapTexture(levels);
        heatMaterial.current.map = texture;
        heatMaterial.current.needsUpdate = true;
      })
      .catch(() => {});
    return () => {
      alive = false;
      texture.dispose();
    };
  }, []);

  return (
    <>
      {[
        [-1.78, 0.2, codeA],
        [-0.72, -0.2, codeB],
      ].map(([x, turn, map]) => (
        <group key={x} position={[x, 0, -3.7]} rotation={[0, turn, 0]}>
          <mesh position={[0, 1.3, 0.027]}>
            <planeGeometry args={[0.92, 0.52]} />
            <meshBasicMaterial map={map} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[1.0, 1.75, -3.932]}>
        <planeGeometry args={[1.04, 0.66]} />
        <meshBasicMaterial ref={heatMaterial} toneMapped={false} />
      </mesh>
      <mesh position={[2.7, 2.05, -3.985]}>
        <planeGeometry args={[1.62, 1.44]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      {/* Phone screen and PC power LED */}
      <mesh position={[3.2, 0.5435, -1.46]} rotation={[-Math.PI / 2, 0, 0.35]}>
        <planeGeometry args={[0.085, 0.18]} />
        <meshBasicMaterial color="#2fce5b" toneMapped={false} />
      </mesh>
      <mesh position={[-2.3, 0.44, -3.327]}>
        <boxGeometry args={[0.03, 0.03, 0.01]} />
        <meshBasicMaterial color="#5dff8d" toneMapped={false} />
      </mesh>
    </>
  );
}

function Lights({ palette, shadows }) {
  const sun = useRef();
  useEffect(() => {
    const light = sun.current;
    if (!light) return;
    const camera = light.shadow.camera;
    camera.left = -7;
    camera.right = 7;
    camera.top = 7;
    camera.bottom = -7;
    camera.near = 1;
    camera.far = 30;
    camera.updateProjectionMatrix();
  }, []);

  return (
    <>
      <hemisphereLight args={[palette.hemiSky, palette.hemiGround, palette.hemiIntensity]} />
      <directionalLight
        ref={sun}
        position={[6, 10, 7]}
        color={palette.sun}
        intensity={palette.sunIntensity}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
      {/* Desk lamp */}
      <pointLight position={[-2.1, 1.15, -3.5]} color={palette.lamp} intensity={palette.lampIntensity} distance={4.5} decay={2} />
      <mesh position={[-2.13, 1.22, -3.72]}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshBasicMaterial color="#fff1d0" toneMapped={false} />
      </mesh>
      {/* Floor lamp */}
      <pointLight position={[-3.3, 1.55, -0.75]} color={palette.lamp} intensity={palette.lampIntensity * 0.8} distance={5} decay={2} />
      <mesh position={[-3.65, 1.66, -0.75]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial color="#ffe6b8" toneMapped={false} />
      </mesh>
    </>
  );
}

// A few slow glowing motes, drawn as one instanced mesh.
function Motes({ theme }) {
  const mesh = useRef();
  const count = 18;
  const seeds = useMemo(() => {
    const rand = seeded(9);
    return Array.from({ length: count }, () => ({
      x: -3.4 + rand() * 6.8,
      y: 0.5 + rand() * 2.4,
      z: -3.4 + rand() * 6.8,
      phase: rand() * Math.PI * 2,
      speed: 0.25 + rand() * 0.4,
      size: 0.6 + rand() * 0.8,
    }));
  }, []);
  const matrix = useMemo(() => new Matrix4(), []);
  const scale = useMemo(() => new Vector3(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    seeds.forEach((mote, index) => {
      const pulse = (0.6 + Math.sin(t * mote.speed * 2 + mote.phase) * 0.4) * mote.size;
      matrix.makeRotationY(t * mote.speed + mote.phase);
      matrix.scale(scale.setScalar(pulse));
      matrix.setPosition(mote.x, mote.y + Math.sin(t * mote.speed + mote.phase) * 0.18, mote.z);
      mesh.current.setMatrixAt(index, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[0.035, 0]} />
      <meshBasicMaterial color={theme === 'dark' ? '#6dff9b' : '#12b445'} toneMapped={false} transparent opacity={theme === 'dark' ? 0.9 : 0.55} />
    </instancedMesh>
  );
}

export default function Environment({ theme, shadows }) {
  const palette = PALETTES[theme] || PALETTES.dark;
  return (
    <>
      <Lights palette={palette} shadows={shadows} />
      <StaticRoom palette={palette} />
      <NeonSign palette={palette} theme={theme} />
      <Screens theme={theme} />
      <Motes theme={theme} />
    </>
  );
}
