import React, { useEffect, useRef, useState } from 'react';
import HoneyBee from './HoneyBee';
import { createHoneyModel, disposeScene } from './honey-model';
export default function HoneyBee3D({ size = 120, label = 'Honey, your friendly helper bee' }) {
  const hostRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false,
      cleanup = () => {};
    if (typeof window.WebGLRenderingContext === 'undefined') {
      setFallback(true);
      return;
    }
    import('three')
      .then((T) => {
        if (cancelled) return;
        let renderer;
        try {
          renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'low-power',
          });
        } catch {
          setFallback(true);
          return;
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        renderer.setSize(size, size);
        renderer.setClearColor(0, 0);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        const scene = new T.Scene(),
          camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
        camera.position.set(0.2, 0.5, 6.1);
        camera.lookAt(0, 0.25, 0);
        scene.add(new T.HemisphereLight('#fff7e6', '#67839c', 2.5));
        const light = new T.DirectionalLight('#fff8ed', 3);
        light.position.set(-3, 5, 5);
        scene.add(light);
        const rim = new T.DirectionalLight('#c3e5ff', 1.5);
        rim.position.set(3, 1, -3);
        scene.add(rim);
        const { bee, eyes, wings } = createHoneyModel(T);
        scene.add(bee);
        const shadow = new T.Mesh(
          new T.CircleGeometry(0.75, 40),
          new T.MeshBasicMaterial({ color: '#050d18', transparent: true, opacity: 0.15 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.scale.y = 0.6;
        shadow.position.y = -1.18;
        scene.add(shadow);
        host.appendChild(renderer.domElement);
        let frame = 0,
          visible = true;
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        function render(time = 0) {
          const t = time / 1000;
          bee.position.y = reduced?.matches ? 0 : Math.sin(t * 1.7) * 0.055;
          bee.rotation.y = reduced?.matches ? -0.12 : Math.sin(t * 0.7) * 0.09 - 0.12;
          const blink = !reduced?.matches && t % 5.1 > 4.94 ? 0.16 : 1;
          eyes.forEach((eye) => (eye.scale.y = 0.16 * blink));
          wings.forEach((wing, i) => {
            wing.rotation.y = reduced?.matches ? 0 : Math.sin(t * 11 + i * Math.PI) * 0.11;
          });
          renderer.render(scene, camera);
          if (visible && !reduced?.matches) frame = requestAnimationFrame(render);
        }
        const observer =
          typeof IntersectionObserver === 'undefined'
            ? null
            : new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
                cancelAnimationFrame(frame);
                if (visible) render(performance.now());
              });
        observer?.observe(host);
        function motion() {
          cancelAnimationFrame(frame);
          render(performance.now());
        }
        reduced?.addEventListener?.('change', motion);
        render();
        cleanup = () => {
          cancelAnimationFrame(frame);
          observer?.disconnect();
          reduced?.removeEventListener?.('change', motion);
          disposeScene(scene);
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!cancelled) setFallback(true);
      });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [size]);
  return fallback ? (
    <HoneyBee size={size} label={label} />
  ) : (
    <div
      className="bb-honey-3d is-ready"
      ref={hostRef}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    />
  );
}
