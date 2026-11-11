import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Vector3 } from 'three/webgpu';
import { INTERACTABLES, ROOM, getInteractable } from './config.js';
import { live, requestInteract, useRoom, walkTo } from './store.js';

const OFFSET = new Vector3(12, 9.2, 12); // isometric viewing direction, about 31 degrees above the floor

// Orthographic camera that keeps the room in frame, follows the character and eases toward an object being opened.
export function CameraRig() {
  const { camera, size } = useThree();
  const target = useRef(new Vector3(0, 1.1, 0));
  const zoom = useRef(0);
  const wanted = useMemo(() => new Vector3(), []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { activeId } = useRoom.getState();

    // Zoom that fits the whole room, with a floor so phones do not get a tiny scene.
    const fit = Math.min(size.width / 13.2, size.height / 10.4);
    const base = Math.max(fit, 44);
    // The less of the room fits, the more the camera follows the character.
    const follow = fit >= 44 ? 0.3 : 0.92;

    let wantedZoom = base;
    if (activeId) {
      const focus = getInteractable(activeId).focus;
      wanted.set(focus[0], focus[1], focus[2]);
      wantedZoom = base * 1.45;
    } else {
      // On tall screens look a little higher so the room sits lower, clear of the intro text.
      wanted.set(live.x * follow, size.height > size.width * 1.2 ? 2.1 : 1.1, live.z * follow);
    }

    const ease = 1 - Math.exp(-delta * (activeId ? 3.2 : 4.5));
    if (zoom.current === 0) {
      zoom.current = wantedZoom;
      target.current.copy(wanted);
    }
    target.current.lerp(wanted, ease);
    zoom.current += (wantedZoom - zoom.current) * ease;

    camera.position.copy(target.current).add(OFFSET);
    camera.lookAt(target.current);
    if (Math.abs(camera.zoom - zoom.current) > 0.001) {
      camera.zoom = zoom.current;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

// Invisible floor that turns a click or tap into a walk target.
export function ClickFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.001, 0]}
      visible={false}
      onClick={(event) => {
        // event.delta is how far the pointer travelled: ignore drags (joystick, accidental swipes).
        if (event.delta > 8) return;
        walkTo(event.point.x, event.point.z);
      }}
    >
      <planeGeometry args={[ROOM.half * 2, ROOM.half * 2]} />
      <meshBasicMaterial />
    </mesh>
  );
}

function Marker({ item }) {
  const mesh = useRef();
  const material = useRef();
  const ring = useRef();

  useFrame(({ clock }) => {
    const { nearId, hoverId, focusId, activeId } = useRoom.getState();
    const highlighted = nearId === item.id || hoverId === item.id || focusId === item.id || activeId === item.id;
    const t = clock.elapsedTime + item.label[0];
    mesh.current.position.y = item.label[1] - 0.12 + Math.sin(t * 2) * 0.05;
    mesh.current.rotation.y = t * 1.2;
    const scale = highlighted ? 1.5 : 1;
    mesh.current.scale.setScalar(mesh.current.scale.x + (scale - mesh.current.scale.x) * 0.15);
    material.current.opacity += ((highlighted ? 1 : 0.55) - material.current.opacity) * 0.15;
    ring.current.material.opacity += ((highlighted ? 0.7 : 0) - ring.current.material.opacity) * 0.15;
    ring.current.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
  });

  return (
    <>
      <mesh ref={mesh} position={item.label}>
        <octahedronGeometry args={[0.075, 0]} />
        <meshBasicMaterial ref={material} color="#4dff86" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {/* Ring on the floor where the character will stand */}
      <mesh ref={ring} position={[item.approach.x, 0.012, item.approach.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.36, 28]} />
        <meshBasicMaterial color="#2fce5b" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

// Click volumes, floating markers and floor rings for every interactive object.
export function Interactables() {
  const { gl } = useThree();
  return INTERACTABLES.map((item) => (
    <group key={item.id}>
      <mesh
        position={item.hit.center}
        visible={false}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta > 8) return;
          requestInteract(item.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          useRoom.setState({ hoverId: item.id });
          gl.domElement.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (useRoom.getState().hoverId === item.id) useRoom.setState({ hoverId: null });
          gl.domElement.style.cursor = '';
        }}
      >
        <boxGeometry args={item.hit.size} />
        <meshBasicMaterial />
      </mesh>
      <Marker item={item} />
    </group>
  ));
}

// Keeps the DOM label positioned over the highlighted object.
export function LabelProjector() {
  const { camera, size } = useThree();
  const point = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const element = live.labelElement;
    if (!element) return;
    const { nearId, hoverId, focusId, activeId } = useRoom.getState();
    const id = activeId || hoverId || focusId || nearId;
    if (!id) return;
    const item = getInteractable(id);
    point.set(item.label[0], item.label[1] + 0.12, item.label[2]).project(camera);
    const x = (point.x * 0.5 + 0.5) * size.width;
    const y = (-point.y * 0.5 + 0.5) * size.height;
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
  });
  return null;
}
