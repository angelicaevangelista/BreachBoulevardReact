// Shared clay-style Honey model, also used as a landmark on the Boulevard.
export function createHoneyModel(T) {
  const bee = new T.Group(),
    eyes = [],
    wings = [];
  const mat = (color, extra = {}) =>
    new T.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...extra });
  const honey = mat('#ffb347'),
    amber = mat('#ef942f'),
    ink = mat('#263044'),
    cream = mat('#fff5d8'),
    blush = mat('#f5979d');
  const wing = mat('#e4f7ff', { transparent: true, opacity: 0.87, side: T.DoubleSide });
  function ball(parent, material, pos, scale) {
    const m = new T.Mesh(new T.SphereGeometry(1, 28, 20), material);
    m.position.set(...pos);
    m.scale.set(...scale);
    m.castShadow = true;
    parent.add(m);
    return m;
  }
  ball(bee, amber, [0, -0.38, 0], [0.82, 0.76, 0.72]);
  for (const [y, r] of [
    [-0.47, 0.75],
    [-0.78, 0.59],
  ]) {
    const stripe = new T.Mesh(new T.TorusGeometry(r, 0.085, 10, 48), ink);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = y;
    bee.add(stripe);
  }
  [-1, 1].forEach((side) => {
    const pivot = new T.Group();
    pivot.position.set(side * 0.72, 0.17, -0.4);
    const petal = ball(pivot, wing, [side * 0.24, 0.22, 0], [0.42, 0.67, 0.1]);
    petal.rotation.z = side * -0.6;
    bee.add(pivot);
    wings.push(pivot);
  });
  ball(bee, honey, [0, 0.43, 0.17], [0.93, 0.84, 0.79]);
  [-1, 1].forEach((side) => {
    const eye = ball(bee, ink, [side * 0.31, 0.55, 0.91], [0.12, 0.16, 0.065]);
    eyes.push(eye);
    ball(bee, cream, [side * 0.31 - 0.035, 0.595, 0.969], [0.035, 0.045, 0.016]);
    ball(bee, blush, [side * 0.57, 0.28, 0.813], [0.14, 0.075, 0.035]);
    const curve = new T.QuadraticBezierCurve3(
      new T.Vector3(side * 0.35, 1.04, 0.13),
      new T.Vector3(side * 0.48, 1.53, 0.12),
      new T.Vector3(side * 0.64, 1.58, 0.16)
    );
    bee.add(new T.Mesh(new T.TubeGeometry(curve, 16, 0.035, 8, false), ink));
    ball(bee, honey, [side * 0.64, 1.58, 0.16], [0.115, 0.115, 0.115]);
    const hand = ball(bee, honey, [side * 0.88, -0.16, 0.28], [0.18, 0.25, 0.19]);
    hand.rotation.z = side * -0.5;
    ball(bee, amber, [side * 0.36, -1.01, 0.32], [0.25, 0.14, 0.29]);
  });
  const smile = new T.QuadraticBezierCurve3(
    new T.Vector3(-0.15, 0.28, 0.961),
    new T.Vector3(0, 0.1, 1.005),
    new T.Vector3(0.15, 0.28, 0.961)
  );
  bee.add(new T.Mesh(new T.TubeGeometry(smile, 18, 0.023, 8, false), ink));
  const badge = new T.Shape();
  badge.moveTo(-0.15, 0.12);
  badge.lineTo(0, 0.18);
  badge.lineTo(0.15, 0.12);
  badge.lineTo(0.13, -0.04);
  badge.quadraticCurveTo(0.08, -0.13, 0, -0.17);
  badge.quadraticCurveTo(-0.08, -0.13, -0.13, -0.04);
  badge.closePath();
  const shield = new T.Mesh(new T.ShapeGeometry(badge), cream);
  shield.position.set(0, -0.31, 0.729);
  bee.add(shield);
  return { bee, eyes, wings };
}

export function disposeScene(root) {
  const materials = new Set(),
    geometries = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material])
      if (material) materials.add(material);
  });
  geometries.forEach((value) => value.dispose());
  materials.forEach((value) => value.dispose());
}
