'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/*
 * Outils d'animation de la page d'accueil, sans dépendance :
 * IntersectionObserver + classes CSS (voir landing.css).
 */


/** true si l'utilisateur a demandé moins d'animations. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/** Devient (et reste) true quand l'élément entre à l'écran. */
export function useInView<T extends Element>(threshold = 0.35): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold]);
  return [ref, inView];
}

/** Répète `tick` toutes les `ms` tant que `active` est vrai (et sans mouvement réduit). */
export function useTicker(active: boolean, ms: number, tick: () => void) {
  const reduced = useReducedMotion();
  const saved = useRef(tick);
  saved.current = tick;
  useEffect(() => {
    if (!active || reduced) return;
    const id = window.setInterval(() => {
      // Onglet caché : on ne fait rien (économie de batterie).
      if (document.visibilityState === 'visible') saved.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [active, ms, reduced]);
}

/** Compteur qui monte jusqu'à `target` quand `start` devient vrai. */
export function useCountUp(target: number, start: boolean, duration = 1400): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, reduced]);
  return value;
}

/** Valeur affichée qui glisse en douceur vers `target` à chaque changement. */
export function useTweened(target: number, duration = 900): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    if (reduced) {
      current.current = target;
      setValue(target);
      return;
    }
    const from = current.current;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const v = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);
  return value;
}

/**
 * Observe tous les éléments `[data-reveal]` de la page et leur ajoute
 * `data-shown` quand ils entrent à l'écran. Rendu une seule fois.
 */
export function RevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const showAll = () => nodes.forEach((n) => n.setAttribute('data-shown', ''));

    // Hydratation tardive (réseau lent) : la sécurité CSS a déjà tout affiché,
    // on ne masque pas à nouveau le contenu.
    const late = performance.now() > 2800;
    if (late || typeof IntersectionObserver === 'undefined') {
      showAll();
      root.classList.add('lp-hydrated');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-shown', '');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    root.classList.add('lp-hydrated');
    return () => io.disconnect();
  }, []);
  return null;
}
