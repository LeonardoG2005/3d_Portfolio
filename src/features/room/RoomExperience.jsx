import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, useCallback, useEffect, useRef, useState } from 'react';
import { PCFShadowMap, WebGPURenderer } from 'three/webgpu';
import { useT } from '../../i18n/index.jsx';
import { isCoarsePointer } from '../../lib/capabilities.js';
import Character from './Character.jsx';
import { getInteractable } from './config.js';
import Joystick from './controls/Joystick.jsx';
import { useKeyboard } from './controls/useKeyboard.js';
import Environment from './scene/Environment.jsx';
import { PALETTES } from './scene/palette.js';
import { CameraRig, ClickFloor, Interactables, LabelProjector } from './SceneSystems.jsx';
import { live, resetLive, useRoom } from './store.js';
import RoomHud from './ui/RoomHud.jsx';

const IDLE_AFTER_MS = 20000;

class SceneBoundary extends Component {
  componentDidCatch() {
    this.props.onError();
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  state = { failed: false };
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Lowers the rendering cost once if the frame rate is poor, and reports when it stays poor.
function PerformanceWatch({ onDowngrade, onStruggle }) {
  const { setDpr } = useThree();
  const sample = useRef({ time: 0, frames: 0, stage: 0, warmup: 1.5 });

  useFrame((_, delta) => {
    const s = sample.current;
    if (s.warmup > 0) {
      s.warmup -= delta;
      return;
    }
    // A long gap means the tab was throttled or paused, not that the device is slow.
    if (delta > 0.25) {
      s.time = 0;
      s.frames = 0;
      return;
    }
    s.time += delta;
    s.frames += 1;
    if (s.time < 3) return;
    const fps = s.frames / s.time;
    s.time = 0;
    s.frames = 0;
    if (fps < 32 && s.stage === 0) {
      s.stage = 1;
      s.warmup = 1;
      setDpr(1);
      onDowngrade();
    } else if (fps < 20 && s.stage === 1) {
      s.stage = 2;
      onStruggle();
    }
  });
  return null;
}

function Exposure({ value }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMappingExposure = value;
  }, [gl, value]);
  return null;
}

/**
 * The interactive 3D room. Loaded lazily: nothing in this folder is part of the main bundle.
 *   theme:       'dark' | 'light'
 *   rendererPref 'webgpu' | 'webgl'  (WebGPU is tried first; its renderer falls back to WebGL 2 by itself)
 *   onNavigate:  (path) => void       called when an object is opened
 *   onFail:      () => void           called when the GPU cannot be used or is lost
 */
export default function RoomExperience({ theme, rendererPref, onNavigate, onFail }) {
  const t = useT();
  const surface = useRef(null);
  const [ready, setReady] = useState(false);
  const [awake, setAwake] = useState(true);
  const [hidden, setHidden] = useState(document.hidden);
  const [lowQuality, setLowQuality] = useState(false);
  const [struggling, setStruggling] = useState(false);
  const activeId = useRoom((state) => state.activeId);
  const failed = useRef(false);

  useKeyboard();

  const fail = useCallback(() => {
    if (failed.current) return;
    failed.current = true;
    onFail();
  }, [onFail]);

  // Fresh state every time the room is mounted.
  useEffect(() => {
    resetLive();
    return resetLive;
  }, []);

  // Render continuously while there is activity, on demand when idle, never in a hidden tab.
  useEffect(() => {
    live.wake = () => {
      live.lastInput = performance.now();
      setAwake(true);
    };
    live.wake();
    const timer = window.setInterval(() => {
      const busy = live.path.length > 0 || live.speed > 0.05 || useRoom.getState().activeId;
      if (!busy && performance.now() - live.lastInput > IDLE_AFTER_MS) setAwake(false);
    }, 2000);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      live.wake = () => {};
    };
  }, []);

  // Opening an object: let the camera ease in, then change the page.
  useEffect(() => {
    if (!activeId) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => onNavigate(getInteractable(activeId).route), reduced ? 80 : 720);
    return () => window.clearTimeout(timer);
  }, [activeId, onNavigate]);

  const createRenderer = useCallback(
    async (props) => {
      try {
        const renderer = new WebGPURenderer({
          ...props,
          antialias: true,
          alpha: true,
          forceWebGL: rendererPref !== 'webgpu',
        });
        await renderer.init();
        const isWebGPU = renderer.backend?.isWebGPUBackend === true;
        useRoom.setState({ backend: isWebGPU ? 'WebGPU' : 'WebGL 2' });
        if (isWebGPU) {
          renderer.backend.device?.lost?.then((info) => {
            if (info?.reason !== 'destroyed') fail();
          });
        } else {
          props.canvas?.addEventListener?.('webglcontextlost', (event) => {
            event.preventDefault();
            fail();
          });
        }
        return renderer;
      } catch (error) {
        console.warn('[room] The 3D renderer could not start, switching to the simple view.', error);
        fail();
        // Never resolves: the component is about to be unmounted by the fallback.
        return new Promise(() => {});
      }
    },
    [rendererPref, fail],
  );

  const palette = PALETTES[theme] || PALETTES.dark;
  const coarse = isCoarsePointer();

  return (
    <div
      ref={surface}
      className="absolute inset-0 touch-none select-none overflow-hidden"
      onPointerDown={() => live.wake()}
      onPointerMove={() => live.wake()}
    >
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <SceneBoundary onError={fail}>
          <Canvas
            orthographic
            shadows={lowQuality ? false : { enabled: true, type: PCFShadowMap }}
            dpr={[1, coarse ? 1.5 : 1.75]}
            frameloop={hidden ? 'never' : awake ? 'always' : 'demand'}
            camera={{ position: [12, 11.3, 12], zoom: 60, near: 0.1, far: 80 }}
            gl={createRenderer}
            onCreated={() => setReady(true)}
            role="img"
            aria-label={t('room.canvas_label')}
          >
            <Exposure value={palette.exposure} />
            <CameraRig />
            <Environment theme={theme} shadows={!lowQuality} />
            <Character />
            <Interactables />
            <ClickFloor />
            <LabelProjector />
            <PerformanceWatch onDowngrade={() => setLowQuality(true)} onStruggle={() => setStruggling(true)} />
          </Canvas>
        </SceneBoundary>
      </div>

      {!ready && (
        <div className="absolute inset-0 grid place-items-center" role="status">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="h-2 w-2 animate-ping rounded-full bg-accent" />
            {t('room.loading')}
          </div>
        </div>
      )}

      <Joystick surfaceRef={surface} />
      <RoomHud ready={ready} struggling={struggling} />
    </div>
  );
}
