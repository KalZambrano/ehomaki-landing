import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { DISHES } from "@/const/experienciaDishes";
import type { Dish } from "@/types/experienciaVR";
import "./ExperienciaVR.css";

/**
 * <ExperienciaVR />
 * Recorrido virtual en primera persona: el comensal está sentado a la mesa,
 * puede mirar alrededor arrastrando, abrir la carta y pedir un plato. Al
 * elegir uno, el plato anterior es retirado y el nuevo se sirve con una
 * pequeña animación + un sello de confirmación.
 *
 * Pensado para montarse con `client:only="react"` en Astro, ya que depende
 * por completo de WebGL/canvas y no tiene sentido renderizarlo en servidor.
 */
export default function ExperienciaVR() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [currentDishId, setCurrentDishId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Elige tu primer plato");
  const [statusActive, setStatusActive] = useState(false);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const [zoomedDish, setZoomedDish] = useState<Dish | null>(null);

  // Guardamos en un ref las funciones de la escena que el JSX necesita invocar
  // (servir/retirar platos, cerrar el zoom), para no acoplar React state a la
  // lógica de Three.js.
  const sceneApiRef = useRef<{
    serve: (dish: Dish) => Promise<void>;
    hideHint: () => void;
    closeZoom: () => void;
  } | null>(null);

  const showStamp = useCallback((dish: Dish) => {
    setToast({ text: `${dish.nombre} servido en tu mesa`, key: Date.now() });
    window.clearTimeout((showStamp as any)._t);
    (showStamp as any)._t = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const handleSelect = useCallback(
    async (dish: Dish) => {
      if (busy || dish.id === currentDishId || !sceneApiRef.current) return;
      setBusy(true);
      setStatusActive(true);
      setStatusText(`Preparando ${dish.nombre}…`);
      await sceneApiRef.current.serve(dish);
      setCurrentDishId(dish.id);
      showStamp(dish);
      setStatusText(`Disfrutando ${dish.nombre}`);
      setStatusActive(false);
      setBusy(false);
    },
    [busy, currentDishId, showStamp]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    /* ---------------- ESCENA BASE ---------------- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if ("outputColorSpace" in renderer) {
      (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1c140d);
    scene.fog = new THREE.Fog(0x1c140d, 5, 12);

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.05,
      50
    );
    camera.rotation.order = "YXZ";
    const SEAT = new THREE.Vector3(0, 1.02, 0.35);
    camera.position.copy(SEAT);
    const BASE_PITCH = THREE.MathUtils.degToRad(-11);

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    /* ---------------- LUCES ---------------- */
    scene.add(new THREE.AmbientLight(0x5a4a3a, 1.35));

    const key = new THREE.DirectionalLight(0xfff0d2, 0.95);
    key.position.set(1.5, 3, 1.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    // Luz focal cálida sobre la mesa: hace que el plato servido destaque
    // claramente frente al resto de la sala, como en un restaurante real.
    const tableSpot = new THREE.SpotLight(0xffd8a0, 3.2, 5, THREE.MathUtils.degToRad(38), 0.45, 1.4);
    tableSpot.position.set(0.3, 2.35, 0.15);
    tableSpot.castShadow = true;
    tableSpot.shadow.mapSize.set(1024, 1024);
    scene.add(tableSpot);
    scene.add(tableSpot.target);

    // Luz de relleno suave cerca del comensal para que la escena no quede plana.
    const fillLight = new THREE.PointLight(0xffb37a, 0.5, 5, 2);
    fillLight.position.set(0, 1.6, 0.9);
    scene.add(fillLight);

    function chochin(x: number, y: number, z: number, color: number, scale = 1) {
      const g = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.13 * scale, 16, 14),
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.85,
          roughness: 0.55,
        })
      );
      body.scale.set(1, 1.25, 1);
      g.add(body);

      // costillas de bambú
      const ribMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.7 });
      for (let i = 0; i < 5; i++) {
        const rib = new THREE.Mesh(
          new THREE.TorusGeometry(0.132 * scale, 0.004, 6, 20),
          ribMat
        );
        rib.rotation.x = Math.PI / 2;
        rib.rotation.y = (i / 5) * Math.PI;
        rib.scale.y = 1.25;
        g.add(rib);
      }

      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.045 * scale, 0.03, 12), ribMat);
      capTop.position.y = 0.17 * scale;
      g.add(capTop);
      const capBottom = capTop.clone();
      capBottom.position.y = -0.17 * scale;
      g.add(capBottom);

      const tassel = new THREE.Mesh(
        new THREE.ConeGeometry(0.012 * scale, 0.09 * scale, 8),
        new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.6 })
      );
      tassel.position.y = -0.22 * scale;
      g.add(tassel);

      const light = new THREE.PointLight(color, 1.1, 4.5, 2);
      light.position.set(0, 0, 0);
      g.add(light);

      g.position.set(x, y, z);
      scene.add(g);
      return g;
    }
    chochin(-1.3, 2.15, -1.6, 0xff7a3c, 1.1);
    chochin(1.3, 2.15, -1.6, 0xff7a3c, 1.1);
    chochin(0, 2.4, 0.75, 0xff8f5c, 1.3);

    /* ---------------- SALA ---------------- */
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x35251a, roughness: 0.8 });
    const woodMid = new THREE.MeshStandardMaterial({ color: 0x5a3c28, roughness: 0.7 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2e2115, roughness: 0.92 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), woodDark);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), wallMat);
    backWall.position.set(0, 2.5, -3.2);
    scene.add(backWall);

    const sideWallL = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), wallMat);
    sideWallL.position.set(-4, 2.5, 0);
    sideWallL.rotation.y = Math.PI / 2;
    scene.add(sideWallL);

    const sideWallR = sideWallL.clone();
    sideWallR.position.set(4, 2.5, 0);
    sideWallR.rotation.y = -Math.PI / 2;
    scene.add(sideWallR);

    const noren = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x2f2118, roughness: 0.9 })
    );
    noren.position.set(0, 2.0, -3.18);
    scene.add(noren);
    const norenStripe = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.5 })
    );
    norenStripe.position.set(0, 2.35, -3.17);
    scene.add(norenStripe);

    /* ---------------- DECORACIÓN JAPONESA ---------------- */
    function shojiPanel(x: number, y: number, z: number, rotY: number) {
      const g = new THREE.Group();
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 2.1),
        new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.85, transparent: true, opacity: 0.92 })
      );
      g.add(panel);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.7 });
      for (let i = -1; i <= 1; i++) {
        const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 2.1, 0.02), frameMat);
        vBar.position.set(i * 0.5, 0, 0.011);
        g.add(vBar);
      }
      for (let j = -2; j <= 2; j++) {
        const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.025, 0.02), frameMat);
        hBar.position.set(0, j * 0.42, 0.011);
        g.add(hBar);
      }
      const border = new THREE.Mesh(new THREE.BoxGeometry(1.56, 2.16, 0.03), frameMat);
      border.position.z = -0.005;
      g.add(border);
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      scene.add(g);
      return g;
    }
    shojiPanel(-2.4, 1.55, -3.15, 0);
    shojiPanel(2.4, 1.55, -3.15, 0);

    function bambooCorner(x: number, z: number) {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.17, 0.35, 20),
        new THREE.MeshStandardMaterial({ color: 0x3a2b1c, roughness: 0.8 })
      );
      pot.position.set(x, 0.175, z);
      pot.castShadow = true;
      scene.add(pot);

      const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4c7a3f, roughness: 0.6 });
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x6fa855,
        roughness: 0.6,
        side: THREE.DoubleSide,
      });
      const heights = [1.9, 2.3, 1.6, 2.1];
      heights.forEach((h, i) => {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, h, 10), stalkMat);
        const ox = (Math.random() - 0.5) * 0.18;
        const oz = (Math.random() - 0.5) * 0.18;
        stalk.position.set(x + ox, h / 2 + 0.32, z + oz);
        stalk.rotation.z = (Math.random() - 0.5) * 0.06;
        stalk.castShadow = true;
        scene.add(stalk);

        for (let k = 0; k < 4; k++) {
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 4), leafMat);
          leaf.scale.set(0.35, 1, 1);
          leaf.position.set(
            x + ox + (Math.random() - 0.5) * 0.15,
            h * (0.55 + k * 0.11) + 0.32,
            z + oz + (Math.random() - 0.5) * 0.15
          );
          leaf.rotation.z = Math.random() * Math.PI * 2;
          leaf.rotation.x = Math.PI / 2.4;
          scene.add(leaf);
        }
      });
    }
    bambooCorner(-3.35, -2.6);

    function manekiNekoShelf(x: number, y: number, z: number, rotY: number) {
      const g = new THREE.Group();
      const shelf = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.04, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x3a2617, roughness: 0.7 })
      );
      g.add(shelf);
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.1, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x241a13, roughness: 0.8 })
      );
      bracket.position.set(0, -0.07, 0);
      g.add(bracket);

      // maneki-neko estilizado
      const cat = new THREE.Group();
      const white = new THREE.MeshStandardMaterial({ color: 0xf5f1e6, roughness: 0.5 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), white);
      body.scale.set(1, 1.15, 0.85);
      body.position.y = 0.09;
      cat.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 12), white);
      head.position.set(0, 0.19, 0.01);
      cat.add(head);
      const earMat = white;
      [-1, 1].forEach((s) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.03, 8), earMat);
        ear.position.set(s * 0.035, 0.235, 0.01);
        cat.add(ear);
      });
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.06, 4, 8), white);
      arm.position.set(0.055, 0.2, 0.02);
      arm.rotation.z = -0.3;
      cat.add(arm);
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.055, 0.008, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xb33a2e, roughness: 0.5 })
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.14;
      cat.add(collar);
      const bell = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.3, metalness: 0.6 })
      );
      bell.position.set(0, 0.13, 0.055);
      cat.add(bell);
      cat.traverse((m) => {
        if ((m as THREE.Mesh).isMesh) (m as THREE.Mesh).castShadow = true;
      });
      cat.position.set(-0.16, 0.02, 0);
      g.add(cat);

      // mini bonsái
      const bonsai = new THREE.Group();
      const bpot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.04, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0x8a3a2a, roughness: 0.6 })
      );
      bpot.position.y = 0.02;
      bonsai.add(bpot);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.012, 0.09, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a2416, roughness: 0.7 })
      );
      trunk.position.y = 0.08;
      trunk.rotation.z = 0.15;
      bonsai.add(trunk);
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0x5a8a45, roughness: 0.7 })
      );
      foliage.scale.set(1.3, 0.7, 1.3);
      foliage.position.y = 0.14;
      bonsai.add(foliage);
      bonsai.position.set(0.15, 0.02, 0);
      g.add(bonsai);

      g.position.set(x, y, z);
      g.rotation.y = rotY;
      scene.add(g);
      return g;
    }
    manekiNekoShelf(-3.85, 1.15, -1.2, Math.PI / 2);

    /* ---------------- MESA ---------------- */
    const TABLE_TOP_Y = 0.78;
    tableSpot.target.position.set(0, TABLE_TOP_Y, -0.4);
    const table = new THREE.Group();
    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 40), woodMid);
    tableTop.position.y = TABLE_TOP_Y;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    table.add(tableTop);
    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.12, TABLE_TOP_Y, 16),
      woodDark
    );
    tableLeg.position.y = TABLE_TOP_Y / 2;
    table.add(tableLeg);
    table.position.set(0, 0, -0.55);
    scene.add(table);

    const placemat = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1f2a1e, roughness: 0.8 })
    );
    placemat.rotation.x = -Math.PI / 2;
    placemat.position.set(0, TABLE_TOP_Y + 0.026, -0.15);
    scene.add(placemat);

    const chopsticks = new THREE.Group();
    for (let i = 0; i < 2; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.24, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a2416 })
      );
      stick.rotation.z = Math.PI / 2;
      stick.position.set(0, TABLE_TOP_Y + 0.035, -0.05 + i * 0.025);
      chopsticks.add(stick);
    }
    scene.add(chopsticks);

    const soyDish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.05, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 })
    );
    soyDish.position.set(0.22, TABLE_TOP_Y + 0.036, -0.15);
    scene.add(soyDish);

    /* ---------------- PLATOS PROCEDURALES ---------------- */
    function addTopping(pieceGroup: THREE.Group, dish: Dish) {
      const t = dish.topping;
      if (!t) return;
      if (t.style === "drape") {
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.5 })
        );
        cap.scale.set(1.15, 0.55, 1.15);
        cap.position.y = 0.0225;
        cap.rotation.y = Math.random() * Math.PI;
        pieceGroup.add(cap);
      } else if (t.style === "crispy") {
        for (let i = 0; i < 4; i++) {
          const strip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.003, 0.003, 0.045, 6),
            new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.4 })
          );
          strip.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.8;
          strip.rotation.y = Math.random() * Math.PI;
          strip.position.set(
            (Math.random() - 0.5) * 0.02,
            0.03 + Math.random() * 0.012,
            (Math.random() - 0.5) * 0.02
          );
          pieceGroup.add(strip);
        }
      } else if (t.style === "sauceCap") {
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.036, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({ color: t.color, roughness: 0.25, metalness: 0.05 })
        );
        cap.scale.set(1.05, 0.4, 1.05);
        cap.position.y = 0.021;
        pieceGroup.add(cap);
      }
    }

    function buildMakiPiece(dish: Dish) {
      const g = new THREE.Group();
      const rice = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.032, 0.045, 20),
        new THREE.MeshStandardMaterial({ color: dish.riceColor ?? 0xf5f1e6, roughness: 0.95 })
      );
      g.add(rice);
      const nori = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0335, 0.0335, 0.046, 20, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x1f2a1e, roughness: 0.85, side: THREE.DoubleSide })
      );
      g.add(nori);

      if (dish.fillingColor2) {
        const outer = new THREE.Mesh(
          new THREE.CircleGeometry(0.02, 16),
          new THREE.MeshStandardMaterial({ color: dish.fillingColor, roughness: 0.5 })
        );
        outer.rotation.x = -Math.PI / 2;
        outer.position.y = 0.0226;
        g.add(outer);
        const inner = new THREE.Mesh(
          new THREE.CircleGeometry(0.011, 14),
          new THREE.MeshStandardMaterial({ color: dish.fillingColor2, roughness: 0.5 })
        );
        inner.rotation.x = -Math.PI / 2;
        inner.position.y = 0.0228;
        g.add(inner);
      } else {
        const filling = new THREE.Mesh(
          new THREE.CircleGeometry(0.02, 16),
          new THREE.MeshStandardMaterial({ color: dish.fillingColor, roughness: 0.5 })
        );
        filling.rotation.x = -Math.PI / 2;
        filling.position.y = 0.0226;
        g.add(filling);
      }

      addTopping(g, dish);
      g.traverse((m) => {
        if ((m as THREE.Mesh).isMesh) (m as THREE.Mesh).castShadow = true;
      });
      return g;
    }

    function addPlateDrizzle(plateGroup: THREE.Group, dish: Dish) {
      const d = dish.drizzle;
      if (!d || d.style !== "zigzag") return;
      const segments = 6;
      for (let i = 0; i < segments; i++) {
        const t0 = (i / segments - 0.5) * 0.26;
        const seg = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.004, 0.008),
          new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.3 })
        );
        seg.position.set(t0, 0.04 + (i % 2) * 0.003, (Math.random() - 0.5) * 0.02);
        seg.rotation.y = Math.PI / 4 + (i % 2) * 0.24;
        plateGroup.add(seg);
      }
    }

    function addGarnishDots(plateGroup: THREE.Group, dish: Dish) {
      dish.garnish.forEach((g) => {
        const count = g.count ?? 5;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = 0.03 + Math.random() * 0.11;
          let mesh: THREE.Mesh;
          if (g.type === "herb") {
            mesh = new THREE.Mesh(
              new THREE.CircleGeometry(0.006, 6),
              new THREE.MeshStandardMaterial({ color: g.color, side: THREE.DoubleSide })
            );
            mesh.rotation.x = -Math.PI / 2;
          } else {
            mesh = new THREE.Mesh(
              new THREE.SphereGeometry(0.0035, 6, 6),
              new THREE.MeshStandardMaterial({ color: g.color })
            );
          }
          mesh.position.set(Math.cos(angle) * r, 0.036 + Math.random() * 0.004, Math.sin(angle) * r);
          plateGroup.add(mesh);
        }
      });
    }

    function buildPlate(dish: Dish) {
      const group = new THREE.Group();
      group.userData.dishId = dish.id;
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.17, 0.015, 36),
        new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.25, metalness: 0.15 })
      );
      plate.receiveShadow = true;
      group.add(plate);

      const n = 6;
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const r = 0.09;
        const piece = buildMakiPiece(dish);
        piece.position.set(Math.cos(angle) * r, 0.0325, Math.sin(angle) * r);
        piece.rotation.y = angle + Math.PI / 6;
        group.add(piece);
      }

      addPlateDrizzle(group, dish);
      addGarnishDots(group, dish);

      const wasabi = new THREE.Mesh(
        new THREE.SphereGeometry(0.017, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x8fae4e, roughness: 0.6 })
      );
      wasabi.position.set(-0.12, 0.02, 0.12);
      group.add(wasabi);
      const ginger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.004, 16),
        new THREE.MeshStandardMaterial({ color: 0xe8a3b0, roughness: 0.5 })
      );
      ginger.position.set(0.12, 0.016, 0.12);
      group.add(ginger);

      return group;
    }

    function disposeGroup(g: THREE.Object3D) {
      g.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
    }

    /* ---------------- SERVICIO EN MESA ---------------- */
    const TABLE_POS = new THREE.Vector3(0, TABLE_TOP_Y + 0.023, -0.4);
    const SIDE_ENTRY = new THREE.Vector3(-1.35, TABLE_TOP_Y + 0.16, -0.4);

    function ease(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function tweenPosition(obj: THREE.Object3D, to: THREE.Vector3, duration: number, bob?: boolean) {
      return new Promise<void>((resolve) => {
        const from = obj.position.clone();
        const start = performance.now();
        function step(now: number) {
          if (disposed) return resolve();
          const t = Math.min((now - start) / duration, 1);
          const e = ease(t);
          obj.position.lerpVectors(from, to, e);
          if (bob) obj.position.y += Math.sin(t * Math.PI) * 0.05;
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    }

    function wait(ms: number) {
      return new Promise<void>((r) => setTimeout(r, ms));
    }

    let currentPlate: THREE.Group | null = null;

    function tableThud() {
      const startY = camPos.y;
      const start = performance.now();
      function step(now: number) {
        if (disposed) return;
        const t = Math.min((now - start) / 180, 1);
        camPos.y = startY - Math.sin(t * Math.PI) * 0.012;
        if (t < 1) requestAnimationFrame(step);
        else camPos.y = startY;
      }
      requestAnimationFrame(step);
    }

    async function removeCurrent() {
      if (!currentPlate) return;
      const g = currentPlate;
      currentPlate = null;
      await tweenPosition(g, new THREE.Vector3(TABLE_POS.x, SIDE_ENTRY.y, TABLE_POS.z), 200);
      if (disposed) return;
      await tweenPosition(g, SIDE_ENTRY.clone(), 620, true);
      if (disposed) return;
      scene.remove(g);
      disposeGroup(g);
    }

    async function serveDish(dish: Dish) {
      if (isZoomed) zoomOut();
      if (currentPlate) {
        await removeCurrent();
        if (disposed) return;
        await wait(450);
        if (disposed) return;
      }
      const g = buildPlate(dish);
      g.position.copy(SIDE_ENTRY);
      scene.add(g);
      await tweenPosition(g, new THREE.Vector3(TABLE_POS.x, SIDE_ENTRY.y, TABLE_POS.z), 620, true);
      if (disposed) return;
      await tweenPosition(g, TABLE_POS.clone(), 260);
      if (disposed) return;
      tableThud();
      currentPlate = g;
    }

    sceneApiRef.current = {
      serve: serveDish,
      hideHint: () => setHintVisible(false),
      closeZoom: () => zoomOut(),
    };

    /* ---------------- CÁMARA: mirada + zoom cinematográfico ---------------- */
    // Estado absoluto de cámara (no relativo): tanto el arrastre normal como
    // el zoom cinematográfico escriben aquí, y animate() solo lee estos valores.
    const camPos = SEAT.clone();
    let camYaw = 0;
    let camPitch = BASE_PITCH;
    const BASE_FOV = 50;
    let isZoomed = false;
    let camAnimId = 0;

    const YAW_LIMIT = THREE.MathUtils.degToRad(58);
    const PITCH_MIN = BASE_PITCH + THREE.MathUtils.degToRad(-28);
    const PITCH_MAX = BASE_PITCH + THREE.MathUtils.degToRad(20);

    function lookRotation(fromPos: THREE.Vector3, toPos: THREE.Vector3) {
      // Fórmula directa derivada de la misma convención que usamos al renderizar
      // (camera.rotation.set(pitch, yaw, 0) con order 'YXZ' → forward =
      // (-cos(pitch)·sin(yaw), sin(pitch), -cos(pitch)·cos(yaw))). Se despeja
      // pitch/yaw a partir del vector dirección para evitar cualquier
      // ambigüedad de convención de ejes.
      const dir = new THREE.Vector3().subVectors(toPos, fromPos).normalize();
      const pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));
      const yaw = Math.atan2(-dir.x, -dir.z);
      return { yaw, pitch };
    }

    function animateCamera(
      toPos: THREE.Vector3,
      toYaw: number,
      toPitch: number,
      toFov: number,
      duration: number
    ) {
      cancelAnimationFrame(camAnimId);
      const fromPos = camPos.clone();
      const fromYaw = camYaw;
      const fromPitch = camPitch;
      const fromFov = camera.fov;
      const start = performance.now();
      function step(now: number) {
        if (disposed) return;
        const t = Math.min((now - start) / duration, 1);
        const e = ease(t);
        camPos.lerpVectors(fromPos, toPos, e);
        camYaw = THREE.MathUtils.lerp(fromYaw, toYaw, e);
        camPitch = THREE.MathUtils.lerp(fromPitch, toPitch, e);
        camera.fov = THREE.MathUtils.lerp(fromFov, toFov, e);
        camera.updateProjectionMatrix();
        if (t < 1) camAnimId = requestAnimationFrame(step);
      }
      camAnimId = requestAnimationFrame(step);
    }

    function zoomToPlate(dish: Dish) {
      if (isZoomed || !currentPlate) return;
      isZoomed = true;
      const plateCenter = TABLE_POS.clone().add(new THREE.Vector3(0, 0.03, 0));

      // Dirección horizontal desde el plato hacia el asiento del comensal,
      // rotada un poco para lograr un ángulo de tres cuartos más cinematográfico
      // que mirar el plato de frente.
      const towardSeat = new THREE.Vector3().subVectors(SEAT, plateCenter);
      towardSeat.y = 0;
      towardSeat.normalize();
      const rotatedDir = towardSeat.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(24));

      const zoomPos = plateCenter
        .clone()
        .add(rotatedDir.multiplyScalar(0.38))
        .add(new THREE.Vector3(0, 0.24, 0));

      const { yaw, pitch } = lookRotation(zoomPos, plateCenter);
      animateCamera(zoomPos, yaw, pitch, 32, 950);
      setZoomedDish(dish);
      setHintVisible(false);
    }

    function zoomOut() {
      if (!isZoomed) return;
      isZoomed = false;
      animateCamera(SEAT.clone(), 0, BASE_PITCH, BASE_FOV, 750);
      setZoomedDish(null);
    }

    /* ---------------- CONTROLES DE MIRADA + SELECCIÓN DE PLATO ---------------- */
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;
    let moved = false;

    function onDown(x: number, y: number) {
      dragging = true;
      lastX = x;
      lastY = y;
      downX = x;
      downY = y;
      moved = false;
    }
    function onMove(x: number, y: number) {
      if (!dragging || isZoomed) return;
      const dx = x - lastX;
      const dy = y - lastY;
      lastX = x;
      lastY = y;
      if (Math.abs(x - downX) > 6 || Math.abs(y - downY) > 6) moved = true;
      camYaw = THREE.MathUtils.clamp(camYaw - dx * 0.0028, -YAW_LIMIT, YAW_LIMIT);
      camPitch = THREE.MathUtils.clamp(camPitch - dy * 0.0028, PITCH_MIN, PITCH_MAX);
      sceneApiRef.current?.hideHint();
    }

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function handleTap(x: number, y: number) {
      if (isZoomed) {
        zoomOut();
        return;
      }
      if (!currentPlate) return;
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((x - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((y - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(currentPlate, true);
      if (hits.length > 0) {
        const dish = DISHES.find((d) => d.id === currentPlate?.userData.dishId);
        if (dish) zoomToPlate(dish);
      }
    }

    function onUp(x: number, y: number) {
      dragging = false;
      if (!moved) handleTap(x, y);
    }
    function pointerDown(e: PointerEvent) {
      canvas.setPointerCapture(e.pointerId);
      onDown(e.clientX, e.clientY);
    }
    function pointerMove(e: PointerEvent) {
      onMove(e.clientX, e.clientY);
      if (!dragging && currentPlate) {
        const rect = canvas.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        const hits = raycaster.intersectObject(currentPlate, true);
        canvas.style.cursor = hits.length > 0 ? "pointer" : "grab";
      }
    }
    function pointerUp(e: PointerEvent) {
      onUp(e.clientX, e.clientY);
    }

    canvas.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);

    /* ---------------- BUCLE DE RENDER ---------------- */
    let rafId = 0;
    function animate() {
      if (disposed) return;
      camera.position.copy(camPos);
      camera.rotation.set(camPitch, camYaw, 0);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }
    animate();

    /* ---------------- FIN DE CARGA ---------------- */
    const loadTimer = window.setTimeout(() => setLoading(false), 500);

    /* ---------------- LIMPIEZA ---------------- */
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(camAnimId);
      window.clearTimeout(loadTimer);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="evr-root">
      <div className={`evr-loading${loading ? "" : " evr-hidden"}`}>
        <div className="evr-loading-kanji">福</div>
        <div className="evr-loading-label">Preparando la sala</div>
        <div className="evr-loading-bar" />
      </div>

      <canvas ref={canvasRef} className="evr-canvas" />

      <div className={`evr-vignette${zoomedDish ? " evr-visible" : ""}`} />

      <div className="evr-kanji-watermark" style={{ opacity: menuOpen || zoomedDish ? 0 : 1 }}>
        寿司
      </div>

      <div className="evr-hud">
        <a className="evr-back-btn" href="/">
          ← Volver al sitio
        </a>
        {!zoomedDish && (
          <>
            <div className="evr-plaque">
              <div className="evr-plaque-name">Ehomakis</div>
              <div className="evr-plaque-tag">Recorrido virtual</div>
            </div>
            <button className="evr-menu-toggle" onClick={() => setMenuOpen(true)}>
              <span className="evr-menu-toggle-kj">膳</span>
              Carta
            </button>
          </>
        )}
      </div>

      <div className={`evr-hint${hintVisible && !zoomedDish ? "" : " evr-hidden"}`}>
        <span className="evr-hint-icon" /> Arrastra para mirar alrededor · toca el plato para verlo de cerca
      </div>

      <aside className={`evr-panel${menuOpen ? " evr-open" : ""}${busy ? " evr-serving" : ""}`}>
        <div className="evr-panel-header">
          <div className="evr-panel-name">La Carta</div>
          <div className="evr-panel-sub">Elige un plato y te lo servimos en la mesa</div>
          <button className="evr-panel-close" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>
        <div className={`evr-status${statusActive ? "" : " evr-idle"}`}>
          <span className="evr-status-dot" />
          <span>{statusText}</span>
        </div>
        <div className="evr-list">
          {DISHES.map((dish) => (
            <div
              key={dish.id}
              className={`evr-card${dish.id === currentDishId ? " evr-active" : ""}`}
              onClick={() => handleSelect(dish)}
            >
              <img
                src={dish.img}
                alt={dish.nombre}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = "0";
                }}
              />
              <div className="evr-card-info">
                <div className="evr-card-cat">
                  <span className="evr-card-cat-kj">{dish.kanji}</span>
                  {dish.categoria}
                </div>
                <div className="evr-card-nombre">{dish.nombre}</div>
                {dish.precio ? <div className="evr-card-price">S/ {dish.precio}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {zoomedDish && (
        <div className="evr-zoom-panel">
          <button
            className="evr-panel-close evr-zoom-close"
            onClick={() => sceneApiRef.current?.closeZoom()}
          >
            ✕
          </button>
          <div className="evr-zoom-cat">
            <span className="evr-card-cat-kj">{zoomedDish.kanji}</span>
            {zoomedDish.categoria}
          </div>
          <div className="evr-zoom-nombre">{zoomedDish.nombre}</div>
          <p className="evr-zoom-ing">{zoomedDish.ingredientes}</p>
          {zoomedDish.precio ? <div className="evr-zoom-price">S/ {zoomedDish.precio}</div> : null}
          <div className="evr-zoom-hint">Toca el plato de nuevo para volver</div>
        </div>
      )}

      {toast ? (
        <div className="evr-toast evr-visible evr-stamped" key={toast.key}>
          <div className="evr-toast-stamp">承</div>
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
