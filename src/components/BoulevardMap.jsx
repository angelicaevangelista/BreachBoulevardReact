import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Interface';
import { createHoneyModel, disposeScene } from './honey-model';
const positions = [
  [-5, -3],
  [0, -3],
  [5, -3],
  [-5, 3],
  [0, 3],
  [5, 3],
];
const colors = ['#ffad65', '#9fcde1', '#b8c9ff', '#a4dfbf', '#c6b5ed', '#ffdba5'];
const fallbackPins = positions.map(([x, z]) => ({
  left: 50 + (x - z) * 3,
  top: 48 + (x + z) * 2.67 - 10,
}));
const iso = (x, z, y = 0) => `${500 + (x - z) * 30},${290 + (x + z) * 16 - y * 30}`;
function MapFallback() {
  return (
    <svg className="bb-town-fallback" viewBox="0 0 1000 600" aria-hidden="true">
      <polygon
        points={`${iso(-8, -5.4, -0.6)} ${iso(8, -5.4, -0.6)} ${iso(8, 5.4, -0.6)} ${iso(-8, 5.4, -0.6)}`}
        fill="#152b40"
        stroke="#405168"
        strokeWidth="5"
      />
      <polygon
        points={`${iso(-8, -5.4)} ${iso(8, -5.4)} ${iso(8, 5.4)} ${iso(-8, 5.4)}`}
        fill="#294052"
      />
      <path d={`M${iso(-8, 0)} L${iso(8, 0)}`} stroke="#0e1f30" strokeWidth="55" />
      {[-5, 0, 5].map((x) => (
        <path key={x} d={`M${iso(x, -5.1)} L${iso(x, 5.1)}`} stroke="#0e1f30" strokeWidth="28" />
      ))}
      <path
        d={`M${iso(-8, 0)} L${iso(8, 0)}`}
        stroke="#ffc08b"
        strokeWidth="3"
        strokeDasharray="12 15"
      />
      {positions.map(([x, z], i) => (
        <g key={i}>
          <polygon
            points={`${iso(x - 1, z - 1)} ${iso(x + 1, z - 1)} ${iso(x + 1, z + 1)} ${iso(x - 1, z + 1)}`}
            fill="#344e5c"
          />
          <polygon
            points={`${iso(x - 0.7, z - 0.7)} ${iso(x + 0.7, z - 0.7)} ${iso(x + 0.7, z + 0.7)} ${iso(x - 0.7, z + 0.7)}`}
            fill={colors[i]}
          />
          <polygon
            points={`${iso(x - 0.7, z - 0.7, 1.8)} ${iso(x + 0.7, z - 0.7, 1.8)} ${iso(x + 0.7, z + 0.7, 1.8)} ${iso(x - 0.7, z + 0.7, 1.8)}`}
            fill={colors[i]}
          />
          <polygon
            points={`${iso(x + 0.7, z - 0.7)} ${iso(x + 0.7, z + 0.7)} ${iso(x + 0.7, z + 0.7, 1.8)} ${iso(x + 0.7, z - 0.7, 1.8)}`}
            fill={colors[i]}
            opacity=".8"
          />
          <polygon
            points={`${iso(x - 0.7, z + 0.7)} ${iso(x + 0.7, z + 0.7)} ${iso(x + 0.7, z + 0.7, 1.8)} ${iso(x - 0.7, z + 0.7, 1.8)}`}
            fill={colors[i]}
            opacity=".6"
          />
        </g>
      ))}
    </svg>
  );
}
export default function BoulevardMap({ streets, onOpen }) {
  const host = useRef(null),
    action = useRef(onOpen),
    highlight = useRef(null);
  action.current = onOpen;
  const [pins, setPins] = useState(fallbackPins),
    [ready, setReady] = useState(false),
    [hovered, setHovered] = useState(null),
    [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  const redrawRef = useRef(() => {});
  pausedRef.current = paused;
  useEffect(() => {
    redrawRef.current();
  }, [paused, hovered]);
  const available = Boolean(streets?.length);
  useEffect(() => {
    if (!available || !host.current || typeof window.WebGLRenderingContext === 'undefined') return;
    let disposed = false,
      cleanup = () => {};
    const element = host.current;
    import('three')
      .then((T) => {
        if (disposed) return;
        let renderer;
        try {
          renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'low-power',
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
        renderer.setClearColor(0, 0);
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        const scene = new T.Scene(),
          camera = new T.OrthographicCamera(-12, 12, 8, -8, 0.1, 100);
        camera.position.set(17, 20, 23);
        camera.lookAt(0, 0, 0);
        scene.add(new T.HemisphereLight('#fff3e4', '#7895b3', 2.8));
        const light = new T.DirectionalLight('#fff1d3', 3.5);
        light.position.set(-6, 15, 10);
        scene.add(light);
        const back = new T.DirectionalLight('#aecbff', 1.2);
        back.position.set(6, 7, -10);
        scene.add(back);
        const material = (color, extra = {}) =>
          new T.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
        const ground = material('#253d50'),
          road = material('#101d2b'),
          curb = material('#476172'),
          stripe = material('#ffc18b'),
          windowMat = material('#ffedbe', { emissive: '#d39438', emissiveIntensity: 0.12 }),
          navy = material('#33465c'),
          mint = material('#9bd3bd'),
          purple = material('#afa1d3');
        const box = (parent, x, y, z, w, h, d, mat) => {
          const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
          mesh.position.set(x, y, z);
          parent.add(mesh);
          return mesh;
        };
        const sphere = (parent, x, y, z, r, mat) => {
          const mesh = new T.Mesh(new T.SphereGeometry(r, 20, 14), mat);
          mesh.position.set(x, y, z);
          parent.add(mesh);
          return mesh;
        };
        const cylinder = (parent, x, y, z, rt, rb, h, mat) => {
          const mesh = new T.Mesh(new T.CylinderGeometry(rt, rb, h, 24), mat);
          mesh.position.set(x, y, z);
          parent.add(mesh);
          return mesh;
        };
        box(scene, 0, -0.5, 0, 18, 0.8, 12, navy);
        box(scene, 0, -0.06, 0, 17.8, 0.12, 11.8, ground);
        box(scene, 0, 0.02, 0, 17.5, 0.08, 1.65, road);
        [-5, 0, 5].forEach((x) => box(scene, x, 0.025, 0, 1.15, 0.08, 11.5, road));
        for (let x = -8; x <= 8; x += 0.8)
          if (![-5, 0, 5].some((k) => Math.abs(x - k) < 0.8))
            box(scene, x, 0.07, 0, 0.4, 0.025, 0.055, stripe);
        [-5, 0, 5].forEach((x) => {
          [-1, 1].forEach((side) => {
            for (let i = -2; i <= 2; i++)
              box(scene, x + i * 0.18, 0.08, side * 1.05, 0.1, 0.025, 0.38, windowMat);
          });
        });
        function tree(parent, x, z, scale = 1) {
          cylinder(parent, x, 0.3 * scale, z, 0.055 * scale, 0.08 * scale, 0.6 * scale, navy);
          sphere(parent, x, 0.85 * scale, z, 0.4 * scale, mint);
          sphere(parent, x - 0.18 * scale, 0.7 * scale, z, 0.27 * scale, mint);
        }
        const groups = [];
        positions.forEach(([x, z], i) => {
          const group = new T.Group();
          group.position.set(x, 0, z);
          const paint = material(colors[i]);
          box(group, 0, 0.11, 0, 3.5, 0.2, 3.5, curb);
          box(group, 0, 0.23, 0, 3.25, 0.06, 3.25, ground);
          if (i === 0) {
            box(group, 0, 1.05, 0, 1.65, 1.6, 1.5, paint);
            box(group, 0, 1.95, 0, 1.9, 0.2, 1.75, windowMat);
            box(group, 0, 0.55, 0.79, 0.4, 0.6, 0.05, navy);
            for (const y of [1, 1.5])
              for (const x of [-0.48, 0.48]) box(group, x, y, 0.78, 0.28, 0.23, 0.05, windowMat);
            cylinder(group, 1.1, 1.2, 0.6, 0.035, 0.035, 2, navy);
            box(group, 1.35, 2, 0.6, 0.5, 0.32, 0.04, paint);
          }
          if (i === 1) {
            cylinder(group, 0, 0.7, 0, 0.85, 0.95, 0.9, paint);
            sphere(group, 0, 1.2, 0, 0.82, navy);
            const dish = new T.Mesh(
              new T.SphereGeometry(0.58, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
              windowMat
            );
            dish.rotation.z = -0.55;
            dish.position.set(0.1, 1.6, 0.1);
            group.add(dish);
            cylinder(group, 0.1, 2.08, 0.1, 0.025, 0.025, 0.5, navy);
            sphere(group, 0.1, 2.32, 0.1, 0.07, paint);
          }
          if (i === 2) {
            box(group, -0.45, 0.85, 0, 1.1, 1.25, 1.35, paint);
            box(group, 0.5, 1.15, -0.3, 1, 1.85, 1.4, navy);
            for (let y = 0.6; y < 1.9; y += 0.35)
              box(group, 0.5, y, 0.425, 0.65, 0.13, 0.04, windowMat);
            box(group, -0.45, 0.95, 0.71, 0.7, 0.48, 0.06, navy);
            for (let j = 0; j < 3; j++)
              box(group, -0.6 + j * 0.16, 0.95, 0.75, 0.07, 0.09, 0.02, mint);
          }
          if (i === 3) {
            box(group, 0, 0.32, 0, 2.9, 0.12, 2.9, mint);
            tree(group, -0.75, -0.7, 1.1);
            tree(group, 0.85, -0.4, 0.85);
            tree(group, 0.1, 0.85, 0.65);
            box(group, -0.6, 0.6, 0.7, 0.85, 0.12, 0.3, windowMat);
            box(group, -0.6, 0.4, 0.7, 0.65, 0.35, 0.12, navy);
          }
          if (i === 4) {
            box(group, 0, 0.95, 0, 1.7, 1.45, 1.4, paint);
            box(group, 0, 0.97, 0.75, 1.2, 1.05, 0.13, navy);
            const lock = new T.Mesh(new T.TorusGeometry(0.35, 0.09, 10, 28, Math.PI), windowMat);
            lock.position.set(0, 1.9, 0.05);
            group.add(lock);
            cylinder(group, 0, 0.98, 0.86, 0.17, 0.17, 0.1, windowMat).rotation.x = Math.PI / 2;
            box(group, -1.1, 0.7, -0.6, 0.35, 0.95, 0.35, purple);
            box(group, 1.1, 0.9, -0.6, 0.35, 1.35, 0.35, purple);
          }
          if (i === 5) {
            cylinder(group, 0, 0.6, 0, 0.8, 1, 0.7, paint);
            cylinder(group, 0, 1.05, 0, 0.57, 0.85, 0.25, windowMat);
            const model = createHoneyModel(T);
            model.bee.scale.setScalar(0.58);
            model.bee.position.y = 1.9;
            group.add(model.bee);
            group.userData.bee = model.bee;
          }
          if (i !== 3) {
            tree(group, -1.2, -1.1, 0.55);
            tree(group, 1.2, 1.1, 0.5);
          }
          group.traverse((object) => {
            object.userData.streetId = i;
          });
          scene.add(group);
          groups.push(group);
        });
        for (const x of [-7.4, -2.5, 2.5, 7.4])
          for (const z of [-1.15, 1.15]) {
            cylinder(scene, x, 0.6, z, 0.03, 0.035, 1.1, navy);
            sphere(scene, x, 1.18, z, 0.11, windowMat);
          }
        const car = new T.Group();
        box(car, 0, 0.23, 0, 0.75, 0.3, 0.4, material('#ffab65'));
        box(car, 0, 0.42, 0, 0.38, 0.2, 0.36, windowMat);
        [-0.23, 0.23].forEach((x) =>
          [-0.22, 0.22].forEach(
            (z) => (cylinder(car, x, 0.12, z, 0.09, 0.09, 0.05, navy).rotation.x = Math.PI / 2)
          )
        );
        car.position.z = 0.38;
        scene.add(car);
        element.appendChild(renderer.domElement);
        function resize() {
          const { width, height } = element.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          const aspect = width / height;
          const halfHeight = Math.max(7.3, 11.4 / aspect);
          camera.left = -halfHeight * aspect;
          camera.right = halfHeight * aspect;
          camera.top = halfHeight;
          camera.bottom = -halfHeight;
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld();
          setPins(
            positions.map(([x, z]) => {
              const p = new T.Vector3(x, 2.6, z).project(camera);
              return { left: (p.x + 1) * 50, top: (1 - p.y) * 50 };
            })
          );
          renderer.render(scene, camera);
        }
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
        observer?.observe(element);
        window.addEventListener('resize', resize);
        resize();
        setReady(true);
        const raycaster = new T.Raycaster(),
          pointer = new T.Vector2();
        function pick(event) {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.set(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            (-(event.clientY - rect.top) / rect.height) * 2 + 1
          );
          raycaster.setFromCamera(pointer, camera);
          return raycaster.intersectObjects(groups, true)[0]?.object?.userData.streetId;
        }
        const move = (event) => {
          const index = pick(event);
          highlight.current = index ?? null;
          setHovered(index ?? null);
          renderer.domElement.style.cursor = index === undefined ? 'grab' : 'pointer';
        };
        const click = (event) => {
          const index = pick(event);
          if (index !== undefined) action.current(streets[index].id);
        };
        const leave = () => {
          highlight.current = null;
          setHovered(null);
        };
        renderer.domElement.addEventListener('pointermove', move);
        renderer.domElement.addEventListener('pointerleave', leave);
        renderer.domElement.addEventListener('click', click);
        let frame = 0,
          visible = true;
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        function render(time = 0) {
          const animate = !reduced?.matches && !pausedRef.current;
          groups.forEach((group, index) => {
            const target = highlight.current === index ? 0.12 : 0;
            group.position.y += (target - group.position.y) * 0.12;
            if (group.userData.bee)
              group.userData.bee.position.y = 1.9 + (animate ? Math.sin(time * 0.002) * 0.08 : 0);
          });
          if (animate) car.position.x = ((time * 0.0007) % 16) - 8;
          renderer.render(scene, camera);
          if (visible && !reduced?.matches && !pausedRef.current)
            frame = requestAnimationFrame(render);
        }
        const redraw = () => {
          cancelAnimationFrame(frame);
          render(performance.now());
        };
        redrawRef.current = redraw;
        reduced?.addEventListener?.('change', redraw);
        const visibility =
          typeof IntersectionObserver === 'undefined'
            ? null
            : new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
                cancelAnimationFrame(frame);
                if (visible) redraw();
              });
        visibility?.observe(element);
        render();
        cleanup = () => {
          cancelAnimationFrame(frame);
          redrawRef.current = () => {};
          reduced?.removeEventListener?.('change', redraw);
          observer?.disconnect();
          visibility?.disconnect();
          window.removeEventListener('resize', resize);
          renderer.domElement.removeEventListener('pointermove', move);
          renderer.domElement.removeEventListener('pointerleave', leave);
          renderer.domElement.removeEventListener('click', click);
          disposeScene(scene);
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setReady(false);
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, [available]);
  const selected = streets?.[hovered ?? 0];
  return (
    <section className="bb-boulevard" aria-labelledby="boulevard-title">
      <div className="bb-boulevard-heading">
        <div>
          <span className="bb-eyebrow">
            <Icon name="spark" size={14} /> THE NEIGHBORHOOD IS OPEN
          </span>
          <h2 id="boulevard-title">
            Welcome to the Boulevard<span className="bb-orange">.</span>
          </h2>
          <p>Six streets. A whole community of curious minds. Pick a landmark and come on in.</p>
        </div>
        <span className="bb-town-badge">
          <span className="bb-status-dot" /> Your little cyber city
        </span>
      </div>
      <div className="bb-town-stage">
        <div ref={host} className="bb-town-canvas" aria-hidden="true" />
        {!ready && <MapFallback />}
        <div className="bb-town-address" aria-hidden="true">
          <span>EST. FOR THE CURIOUS</span>
          <strong>BREACH BLVD.</strong>
        </div>
        {streets?.map((street, index) => (
          <button
            key={street.id}
            type="button"
            className={`bb-street-card bb-town-pin ${hovered === index ? 'is-active' : ''}`}
            style={{
              left: `${pins[index].left}%`,
              top: `${pins[index].top}%`,
              '--street-color': colors[index],
            }}
            aria-label={`Visit ${street.name}, ${street.posts ?? 0} posts`}
            onPointerEnter={() => {
              highlight.current = index;
              setHovered(index);
            }}
            onPointerLeave={() => {
              highlight.current = null;
              setHovered(null);
            }}
            onFocus={() => {
              highlight.current = index;
              setHovered(index);
            }}
            onBlur={() => {
              highlight.current = null;
              setHovered(null);
            }}
            onClick={() => onOpen(street.id)}
          >
            <span className="bb-town-pin-icon">
              <Icon name={street.icon} size={17} />
            </span>
            <strong>{street.name}</strong>
            <small>
              {street.posts ?? 0} {street.posts === 1 ? 'post' : 'posts'}
            </small>
          </button>
        ))}
        {!streets && (
          <p className="bb-town-loading" role="status">
            Opening the neighborhood…
          </p>
        )}
        <button
          type="button"
          className="bb-town-motion"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? 'Play little city' : 'Pause little city'}
        </button>
      </div>
      <div className="bb-town-caption">
        <div>
          <span className="bb-stat-icon">
            <Icon name={selected?.icon || 'spark'} />
          </span>
          <div>
            <h3>{selected?.name || 'Find your people.'}</h3>
            <p>{selected?.tagline || 'Choose a street to meet the community.'}</p>
          </div>
        </div>
        {selected && (
          <button className="bb-button bb-button-soft" onClick={() => onOpen(selected.id)}>
            Walk in
            <Icon name="arrow" size={16} />
          </button>
        )}
      </div>
    </section>
  );
}
