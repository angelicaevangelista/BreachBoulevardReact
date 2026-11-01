import React, { useEffect, useRef, useState } from 'react';
import HoneyBee from './HoneyBee';

const COLORS = {
  orange: 0xff8a1f,
  navy: 0x1d2b4f,
  cream: 0xfff3dc,
  podBlue: 0x8197b8,
  blush: 0xff9aae,
  gold: 0xffc83d,
};

function roundedRect(THREE, width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function starShape(THREE, radius) {
  const k = radius * 0.12;
  const shape = new THREE.Shape();
  shape.moveTo(0, radius);
  shape.quadraticCurveTo(k, k, radius, 0);
  shape.quadraticCurveTo(k, -k, 0, -radius);
  shape.quadraticCurveTo(-k, -k, -radius, 0);
  shape.quadraticCurveTo(-k, k, 0, radius);
  return shape;
}

function buildBee(THREE, owned) {
  const own = (object) => {
    owned.push(object);
    return object;
  };
  const material = (color, options = {}) =>
    own(
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.36,
        metalness: 0.02,
        clearcoat: 0.8,
        clearcoatRoughness: 0.18,
        ...options,
      }),
    );
  const mesh = (geometry, mat) => new THREE.Mesh(own(geometry), mat);

  const orangeMat = material(COLORS.orange);
  const navyMat = material(COLORS.navy, { roughness: 0.45 });
  const creamMat = material(COLORS.cream, { roughness: 0.28 });
  const podMat = material(COLORS.podBlue, { roughness: 0.22, metalness: 0.3 });
  const blushMat = material(COLORS.blush, { roughness: 0.6, clearcoat: 0 });
  const eyeMat = own(new THREE.MeshBasicMaterial({ color: 0xfff8e6 }));
  const highlightMat = own(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const sparkleMat = own(
    new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: 0.95 }),
  );

  const bee = new THREE.Group();

  const body = mesh(new THREE.SphereGeometry(1, 48, 36), orangeMat);
  body.scale.set(1.05, 0.98, 0.95);
  body.position.y = -0.1;
  bee.add(body);

  const belt = mesh(new THREE.TorusGeometry(0.9, 0.09, 16, 64), navyMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = -0.52;
  bee.add(belt);

  const headShape = roundedRect(THREE, 1.8, 1.4, 0.5);
  const head = mesh(
    new THREE.ExtrudeGeometry(headShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.06,
      bevelSegments: 6,
      curveSegments: 18,
    }),
    creamMat,
  );
  head.position.set(0, 0.5, 0.66);
  bee.add(head);

  const screen = mesh(
    new THREE.ExtrudeGeometry(roundedRect(THREE, 1.46, 1.02, 0.36), {
      depth: 0.03,
      bevelEnabled: false,
      curveSegments: 18,
    }),
    navyMat,
  );
  screen.position.set(0, 0.5, 0.86);
  bee.add(screen);

  const eyeGeometry = new THREE.SphereGeometry(0.22, 24, 16);
  const highlightGeometry = new THREE.SphereGeometry(0.055, 12, 10);
  const eyes = [];
  [-0.36, 0.36].forEach((x) => {
    const eye = new THREE.Group();
    eye.position.set(x, 0.55, 0.9);
    const glow = mesh(eyeGeometry, eyeMat);
    glow.scale.set(0.9, 1.2, 0.45);
    eye.add(glow);
    const highlight = mesh(highlightGeometry, highlightMat);
    highlight.position.set(0.05, 0.07, 0.1);
    eye.add(highlight);
    eyes.push(eye);
    bee.add(eye);
  });

  const smile = mesh(new THREE.TorusGeometry(0.2, 0.035, 12, 32, Math.PI), eyeMat);
  smile.rotation.z = Math.PI;
  smile.position.set(0, 0.22, 0.92);
  bee.add(smile);

  const blushGeometry = new THREE.SphereGeometry(0.13, 16, 12);
  [-0.64, 0.64].forEach((x) => {
    const blush = mesh(blushGeometry, blushMat);
    blush.scale.set(1.3, 0.8, 0.3);
    blush.position.set(x, 0.2, 0.86);
    bee.add(blush);
  });

  [-1, 1].forEach((side) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 0.45, 1.1, 0.5),
      new THREE.Vector3(side * 0.7, 1.7, 0.3),
      new THREE.Vector3(side * 0.95, 2.0, 0.2),
    );
    bee.add(mesh(new THREE.TubeGeometry(curve, 24, 0.04, 8, false), navyMat));
    const tip = mesh(new THREE.SphereGeometry(0.11, 20, 14), creamMat);
    tip.position.set(side * 0.95, 2.0, 0.2);
    bee.add(tip);
  });

  const pods = [];
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 1.0, 0.2, -0.35);
    const pod = mesh(new THREE.CapsuleGeometry(0.22, 0.5, 8, 16), podMat);
    pod.rotation.z = Math.PI / 2;
    pivot.add(pod);
    pods.push(pivot);
    bee.add(pivot);
  });

  [-1, 1].forEach((side) => {
    const arm = mesh(new THREE.CapsuleGeometry(0.14, 0.4, 6, 12), orangeMat);
    arm.position.set(side * 1.12, -0.25, 0.25);
    arm.rotation.z = side * -0.6;
    bee.add(arm);

    const foot = mesh(new THREE.SphereGeometry(1, 20, 14), navyMat);
    foot.scale.set(0.3, 0.16, 0.4);
    foot.position.set(side * 0.45, -1.08, 0.3);
    bee.add(foot);
  });

  const sparkles = [
    { x: 1.5, y: 1.25, z: 0.6, phase: 0 },
    { x: -1.45, y: 0.95, z: 0.7, phase: 2.1 },
    { x: 1.25, y: -0.75, z: 0.8, phase: 4.2 },
  ].map(({ x, y, z, phase }) => {
    const star = mesh(new THREE.ShapeGeometry(starShape(THREE, 0.16)), sparkleMat);
    star.position.set(x, y, z);
    star.userData.phase = phase;
    bee.add(star);
    return star;
  });

  return { bee, body, eyes, pods, sparkles };
}

export default function HoneyBee3D({ size = 120, label = 'Honey, the platform helper bee' }) {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let disposed = false;
    let frameId = 0;
    let cleanup = () => {};

    const hasWebGL = typeof window.WebGLRenderingContext !== 'undefined';

    if (!hasWebGL) {
      setFallback(true);
      return undefined;
    }

    const reduceMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

    Promise.all([
      import('three'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ])
      .then(([THREE, { RoomEnvironment }]) => {
        if (disposed) return;

        const owned = [];
        let renderer;
        let pmrem;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
        } catch {
          setFallback(true);
          return;
        }

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size, size);
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.NeutralToneMapping;
        renderer.toneMappingExposure = 1;
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        pmrem = new THREE.PMREMGenerator(renderer);
        const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
        owned.push(envTarget);
        scene.environment = envTarget.texture;

        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(3, 5, 4);
        scene.add(key, new THREE.HemisphereLight(0xffffff, 0x445577, 0.6));

        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        camera.position.set(0, 0.2, 6.6);
        camera.lookAt(0, 0.4, 0);

        const { bee, body, eyes, pods, sparkles } = buildBee(THREE, owned);
        scene.add(bee);

        const render = (seconds) => {
          bee.position.y = Math.sin(seconds * 1.6) * 0.06;
          bee.rotation.y = Math.sin(seconds * 0.8) * 0.15;
          body.rotation.z = Math.sin(seconds * 1.2) * 0.02;
          const cycle = seconds % 3.6;
          const blink = cycle > 3.45 && cycle < 3.57 ? 0.15 : 1;
          eyes.forEach((eye) => {
            eye.scale.y = blink;
          });
          pods.forEach((pivot, index) => {
            pivot.rotation.y = Math.sin(seconds * 10 + index * Math.PI) * 0.12;
          });
          sparkles.forEach((star) => {
            const pulse = 0.7 + 0.3 * Math.sin(seconds * 3 + star.userData.phase);
            star.scale.setScalar(pulse);
          });
          renderer.render(scene, camera);
        };

        const start = performance.now();
        const frame = (now) => {
          if (disposed) return;
          render((now - start) / 1000);
          frameId = requestAnimationFrame(frame);
        };

        if (reduceMotion) {
          render(0);
        } else {
          frameId = requestAnimationFrame(frame);
        }
        setReady(true);

        cleanup = () => {
          cancelAnimationFrame(frameId);
          owned.forEach((object) => object.dispose());
          pmrem?.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setFallback(true);
      });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [size]);

  if (fallback) {
    return <HoneyBee size={size} label={label} />;
  }

  return (
    <div
      ref={hostRef}
      className={`bb-honey-3d${ready ? ' is-ready' : ''}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    />
  );
}
