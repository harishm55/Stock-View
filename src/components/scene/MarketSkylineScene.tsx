import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { StockQuote, CandleData, SceneMode, HeightMetric } from '../../types/stock.ts';
import {
  createContactShadowTexture,
  createGridFloorTexture,
  buildStockMonolith,
  _targetCamPos,
  _targetLookAt,
  _currentLookAt
} from './proceduralGraphics.ts';
import { buildCandlestickCorridor } from './candlestickCorridor.ts';

interface MarketSkylineSceneProps {
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  sceneMode: SceneMode;
  heightMetric: HeightMetric;
  sectorFilter: string;
  candles: CandleData[];
  cameraPreset: 'overview' | 'top' | 'focus' | 'cinematic';
  isAutoRotate: boolean;
}

export const MarketSkylineScene: React.FC<MarketSkylineSceneProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  sceneMode,
  heightMetric,
  sectorFilter,
  candles,
  cameraPreset,
  isAutoRotate
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep state across renders without recreating Three scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const monolithsGroupRef = useRef<THREE.Group | null>(null);
  const corridorGroupRef = useRef<THREE.Group | null>(null);
  const orbitGalaxyGroupRef = useRef<THREE.Group | null>(null);
  const contactShadowTexRef = useRef<THREE.CanvasTexture | null>(null);

  // Animation & Transition tracking
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 32, 48));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 6, 0));
  const isTransitioningCameraRef = useRef<boolean>(true);

  // Keep latest callbacks in ref to avoid stale closures
  const onSelectStockRef = useRef(onSelectStock);
  onSelectStockRef.current = onSelectStock;

  const selectedStockRef = useRef(selectedStock);
  selectedStockRef.current = selectedStock;

  // Initialize Scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Setup Three.js Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // 3. Scene and Fog (Horizon matched deep navy)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = new THREE.Color(0x060a12);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x060a12, 0.012);

    // 4. Studio Environment Reflection via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 32, 48);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip beneath floor
    controls.minDistance = 6;
    controls.maxDistance = 140;
    controls.target.set(0, 6, 0);

    // Cancel scripted camera transitions when user starts interacting
    controls.addEventListener('start', () => {
      isTransitioningCameraRef.current = false;
    });

    // 6. Balanced Studio Lighting Rig (≤ 3 Shadow Casters)
    // Key Light: Warm directional light
    const keyLight = new THREE.DirectionalLight(0xfff5eb, 2.4);
    keyLight.position.set(35, 55, 30);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 130;
    const d = 45;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Fill Light: Cool sky/ground HemisphereLight
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 1.2);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    // Subtle Rim Light: Cool blue backlight
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-35, 25, -35);
    scene.add(rimLight);

    // 7. Ground Grid Floor with Procedural Texture
    const floorTexture = createGridFloorTexture();
    floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const floorGeom = new THREE.PlaneGeometry(180, 180);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.85,
      metalness: 0.2,
      depthWrite: true
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Pre-create shared procedural contact shadow texture
    const contactShadowTex = createContactShadowTexture();
    contactShadowTexRef.current = contactShadowTex;

    // Groups for different modes
    const monolithsGroup = new THREE.Group();
    monolithsGroup.name = 'monolithsGroup';
    scene.add(monolithsGroup);
    monolithsGroupRef.current = monolithsGroup;

    const corridorGroup = new THREE.Group();
    corridorGroup.name = 'corridorGroup';
    scene.add(corridorGroup);
    corridorGroupRef.current = corridorGroup;

    const orbitGalaxyGroup = new THREE.Group();
    orbitGalaxyGroup.name = 'orbitGalaxyGroup';
    scene.add(orbitGalaxyGroup);
    orbitGalaxyGroupRef.current = orbitGalaxyGroup;

    // 8. Raycasting for interactive selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(monolithsGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !((obj as any).stockData || (obj as any).parentGroup)) {
          obj = obj.parent;
        }
        const foundStock = (obj as any)?.stockData || (obj as any)?.parentGroup?.stockData;
        if (foundStock) {
          onSelectStockRef.current(foundStock);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop with Exponential Damping & Software WebGL Pacing
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);

      // Smooth exponential camera transition
      if (isTransitioningCameraRef.current) {
        camera.position.lerp(targetCamPosRef.current, 1 - Math.exp(-4.5 * dt));
        controls.target.lerp(targetLookAtRef.current, 1 - Math.exp(-4.5 * dt));
        if (camera.position.distanceTo(targetCamPosRef.current) < 0.2) {
          isTransitioningCameraRef.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      if (domElement.parentElement) {
        domElement.parentElement.removeChild(domElement);
      }
    };
  }, []);

  // Update Monoliths when stocks, metrics, or selection changes
  useEffect(() => {
    const monolithsGroup = monolithsGroupRef.current;
    const shadowTex = contactShadowTexRef.current;
    if (!monolithsGroup || !shadowTex) return;

    // Clear old children safely
    while (monolithsGroup.children.length > 0) {
      const child = monolithsGroup.children[0];
      monolithsGroup.remove(child);
    }

    if (sceneMode !== 'skyline') {
      monolithsGroup.visible = false;
      return;
    }
    monolithsGroup.visible = true;

    // Filter stocks
    const filtered = stocks.filter(s => {
      if (sectorFilter === 'ALL') return true;
      if (sectorFilter === 'TECH') return s.sector === 'Technology';
      if (sectorFilter === 'FIN') return s.sector === 'Financial Services';
      if (sectorFilter === 'CNSM') return s.sector === 'Consumer Cyclical';
      if (sectorFilter === 'INDEX') return s.sector === 'Indices';
      return true;
    });

    // Layout in a majestic 5x3 or 4x4 financial district grid
    const cols = 5;
    const spacingX = 7.5;
    const spacingZ = 7.5;

    filtered.forEach((stock, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const isSelected = selectedStock?.symbol === stock.symbol;

      const monolith = buildStockMonolith(stock, heightMetric, isSelected, shadowTex);
      const posX = (col - (cols - 1) / 2) * spacingX;
      const posZ = (row - 1.2) * spacingZ;

      monolith.position.set(posX, 0, posZ);
      monolithsGroup.add(monolith);
    });
  }, [stocks, heightMetric, selectedStock?.symbol, sceneMode, sectorFilter]);

  // Update Candlestick Corridor mode
  useEffect(() => {
    const corridorGroup = corridorGroupRef.current;
    if (!corridorGroup) return;

    while (corridorGroup.children.length > 0) {
      const child = corridorGroup.children[0];
      corridorGroup.remove(child);
    }

    if (sceneMode !== 'corridor' || !selectedStock) {
      corridorGroup.visible = false;
      return;
    }
    corridorGroup.visible = true;

    const newCorridor = buildCandlestickCorridor(candles, selectedStock);
    corridorGroup.add(newCorridor);
  }, [sceneMode, selectedStock?.symbol, candles]);

  // Update Orbit Galaxy mode
  useEffect(() => {
    const orbitGroup = orbitGalaxyGroupRef.current;
    const shadowTex = contactShadowTexRef.current;
    if (!orbitGroup || !shadowTex) return;

    while (orbitGroup.children.length > 0) {
      orbitGroup.remove(orbitGroup.children[0]);
    }

    if (sceneMode !== 'orbit') {
      orbitGroup.visible = false;
      return;
    }
    orbitGroup.visible = true;

    // Center Sun: Market S&P 500 Core
    const coreGeom = new THREE.SphereGeometry(3.5, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.8
    });
    const coreSphere = new THREE.Mesh(coreGeom, coreMat);
    coreSphere.position.set(0, 4.5, 0);
    orbitGroup.add(coreSphere);

    // Concentric orbit rings by Beta/Risk
    const ringRadii = [12, 22, 32];
    ringRadii.forEach(r => {
      const ringGeom = new THREE.RingGeometry(r - 0.1, r + 0.1, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x1e3a8a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.05;
      orbitGroup.add(ringMesh);
    });

    // Distribute stocks in orbits
    stocks.slice(0, 14).forEach((stock, idx) => {
      const radius = stock.beta > 1.8 ? 32 : stock.beta > 1.0 ? 22 : 12;
      const angle = (idx / 14) * Math.PI * 2;
      const monolith = buildStockMonolith(stock, 'changePercent', selectedStock?.symbol === stock.symbol, shadowTex);
      monolith.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      orbitGroup.add(monolith);
    });
  }, [sceneMode, stocks, selectedStock?.symbol]);

  // Handle Camera Presets & Focus on Selected Stock
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
      controlsRef.current.autoRotateSpeed = 1.0;
    }

    if (cameraPreset === 'overview') {
      targetCamPosRef.current.set(0, 34, 46);
      targetLookAtRef.current.set(0, 5, 0);
      isTransitioningCameraRef.current = true;
    } else if (cameraPreset === 'top') {
      targetCamPosRef.current.set(0, 58, 2);
      targetLookAtRef.current.set(0, 0, 0);
      isTransitioningCameraRef.current = true;
    } else if (cameraPreset === 'cinematic') {
      targetCamPosRef.current.set(-28, 14, 28);
      targetLookAtRef.current.set(0, 6, 0);
      isTransitioningCameraRef.current = true;
    } else if (cameraPreset === 'focus' && selectedStock && sceneMode === 'skyline') {
      // Find position of selected monolith
      const monolithsGroup = monolithsGroupRef.current;
      if (monolithsGroup) {
        for (const child of monolithsGroup.children) {
          if ((child as any).stockData?.symbol === selectedStock.symbol) {
            targetCamPosRef.current.set(child.position.x + 8, 12, child.position.z + 14);
            targetLookAtRef.current.set(child.position.x, 6, child.position.z);
            isTransitioningCameraRef.current = true;
            break;
          }
        }
      }
    } else if (sceneMode === 'corridor') {
      targetCamPosRef.current.set(16, 14, 24);
      targetLookAtRef.current.set(0, 7, 0);
      isTransitioningCameraRef.current = true;
    }
  }, [cameraPreset, selectedStock, sceneMode, isAutoRotate]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
};
