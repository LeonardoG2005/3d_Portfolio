// One place that registers GSAP plugins. Only content pages import this,
// so the 3D home does not pay for it.
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Every animation is created inside gsap.matchMedia() with this query,
// so visitors who prefer reduced motion get the final state without movement.
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';
export const DESKTOP = '(min-width: 1024px)';

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger, useGSAP };

// Handy while developing: lets the console inspect or fast-forward animations.
if (import.meta.env.DEV) window.gsap = gsap;
