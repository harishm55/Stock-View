import * as THREE from 'three';
import { StockQuote, HeightMetric } from '../../types/stock.ts';

// Pre-allocated reusable helpers for render loop and math
export const _vec3 = new THREE.Vector3();
export const _targetCamPos = new THREE.Vector3();
export const _targetLookAt = new THREE.Vector3();
export const _currentLookAt = new THREE.Vector3();
export const _colorA = new THREE.Color();
export const _colorB = new THREE.Color();

/**
 * Creates a procedural soft radial contact shadow texture using HTML5 Canvas.
 * Zero external 404 dependencies.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.45)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a procedural glowing cyber-financial grid floor texture
 */
export function createGridFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep dark navy backdrop
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, size, size);

  // Grid line accents
  ctx.strokeStyle = 'rgba(30, 58, 138, 0.35)'; // Blue 900
  ctx.lineWidth = 1.5;

  const step = 32;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Major accent lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)'; // Cyan 400
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();

  // Financial crosshair node dots
  ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
  for (let x = 0; x <= size; x += step * 2) {
    for (let y = 0; y <= size; y += step * 2) {
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a high-fidelity billboard label canvas texture showing ticker, price, and % change
 */
export function createStockLabelTexture(stock: StockQuote, isSelected: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  const isUp = stock.change >= 0;
  const primaryColor = isUp ? '#10b981' : '#f43f5e';
  const bgColor = isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(8, 12, 20, 0.88)';
  const borderColor = isSelected ? '#38bdf8' : isUp ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)';

  // Rounded rectangle card
  const r = 16;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(320 - r, 0);
  ctx.quadraticCurveTo(320, 0, 320, r);
  ctx.lineTo(320, 140 - r);
  ctx.quadraticCurveTo(320, 140, 320 - r, 140);
  ctx.lineTo(r, 140);
  ctx.quadraticCurveTo(0, 140, 0, 140 - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = isSelected ? 4 : 2;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // Top header: Symbol + Sector
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(stock.symbol, 20, 48);

  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  const shortSector = stock.sector === 'Technology' ? 'TECH' : stock.sector === 'Financial Services' ? 'FIN' : stock.sector === 'Consumer Cyclical' ? 'CNSM' : stock.sector;
  ctx.fillText(shortSector, 200, 44);

  // Price line
  ctx.font = 'bold 34px "JetBrains Mono", monospace';
  ctx.fillStyle = '#f8fafc';
  const currencySymbol = stock.currency === 'INR' ? '₹' : '$';
  ctx.fillText(`${currencySymbol}${stock.price.toFixed(2)}`, 20, 102);

  // Percent change pill badge
  const pctStr = `${isUp ? '+' : ''}${stock.changePercent.toFixed(2)}%`;
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  ctx.fillStyle = primaryColor;
  ctx.fillText(pctStr, 185, 102);

  // Subtle bottom accent glow strip
  ctx.fillStyle = primaryColor;
  ctx.fillRect(16, 128, 288, 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Calculates height for a stock monolith based on metric
 */
export function calculateMonolithHeight(stock: StockQuote, metric: HeightMetric): number {
  switch (metric) {
    case 'marketCap':
      // Market cap between $50B and $3500B -> height between 3.5 and 18 units
      return Math.max(3.5, Math.min(20, Math.log10(Math.max(10, stock.marketCap)) * 4.8));
    case 'volume':
      // Volume between 5M and 100M -> height between 3 and 16 units
      return Math.max(3, Math.min(18, (stock.volume / 10000000) * 1.8 + 2.5));
    case 'changePercent':
      // Magnitude of daily change -> height between 3.5 and 16 units
      return Math.max(3.5, Math.min(16, Math.abs(stock.changePercent) * 2.5 + 3.5));
    case 'peRatio':
      return Math.max(3, Math.min(18, (stock.peRatio / 6) + 3));
    default:
      return 8;
  }
}

/**
 * Builds a Composite 5-Part Procedural 3D Stock Monolith (THREE.Group)
 * Strict adherence to Three.js Guidelines:
 * - 3–12 distinct parts: Base pedestal, Fluted Column Core, Glowing Indicator Inset, Collar Rings, Apex Spire
 * - Varied roughness (>= 0.25 difference) & metalness between adjacent parts
 * - Ground contact shadow plane beneath
 * - Bottom-center pivot (flush with ground at y = 0)
 */
export function buildStockMonolith(
  stock: StockQuote,
  heightMetric: HeightMetric,
  isSelected: boolean,
  contactShadowTexture: THREE.CanvasTexture
): THREE.Group {
  const group = new THREE.Group();
  group.name = `stock-${stock.symbol}`;
  (group as any).stockData = stock;

  const height = calculateMonolithHeight(stock, heightMetric);
  const width = 2.4;
  const depth = 2.4;
  const isUp = stock.change >= 0;

  // Colors
  const accentColorHex = isUp ? 0x10b981 : 0xf43f5e;
  const emissiveHex = isUp ? 0x059669 : 0xe11d48;
  const titaniumColor = isSelected ? 0x223654 : 0x1e293b;

  // 1. Part 1: Primary Silhouette - Heavy Beveled Base Pedestal
  // Metalness: 0.85, Roughness: 0.22 (Reflective dark titanium)
  const baseGeom = new THREE.CylinderGeometry(width * 0.85, width * 0.95, 0.7, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: titaniumColor,
    metalness: 0.85,
    roughness: 0.22,
  });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.y = 0.35;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Part 2: Primary Silhouette - Fluted Architectural Monolith Shaft
  // Metalness: 0.35, Roughness: 0.72 (Contrast with base by >= 0.5 roughness difference!)
  const shaftGeom = new THREE.BoxGeometry(width, height, depth);
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Slate 900
    metalness: 0.35,
    roughness: 0.72,
  });
  const shaftMesh = new THREE.Mesh(shaftGeom, shaftMat);
  shaftMesh.position.y = 0.7 + height / 2;
  shaftMesh.castShadow = true;
  shaftMesh.receiveShadow = true;
  group.add(shaftMesh);

  // 3. Part 3: Secondary Read - Internal Glowing Crystal Core Inset (Vertical Status Channel)
  // Highly emissive crystal pillar inset into the tower face
  const coreGeom = new THREE.BoxGeometry(width * 0.35, height * 0.92, depth + 0.08);
  const coreMat = new THREE.MeshStandardMaterial({
    color: accentColorHex,
    emissive: emissiveHex,
    emissiveIntensity: isSelected ? 1.4 : 0.75,
    roughness: 0.15,
    metalness: 0.1,
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  coreMesh.position.y = 0.7 + height / 2;
  group.add(coreMesh);

  // 4. Part 4: Secondary Read - Horizontal Metallic Collar Rings (Support/Resistance Level Indicators)
  // Metalness: 0.95, Roughness: 0.15 (Anisotropic-like brushed steel)
  const ringGeom = new THREE.CylinderGeometry(width * 0.75, width * 0.75, 0.2, 8, 1, true);
  const ringMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0x38bdf8 : 0x64748b,
    metalness: 0.95,
    roughness: 0.15,
    side: THREE.DoubleSide
  });

  const ring1 = new THREE.Mesh(ringGeom, ringMat);
  ring1.position.y = 0.7 + height * 0.4;
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeom, ringMat);
  ring2.position.y = 0.7 + height * 0.75;
  group.add(ring2);

  // 5. Part 5: Accent Detail - Apex Spire Beacon (Illuminated crown prism)
  const spireGeom = new THREE.ConeGeometry(width * 0.32, 1.4, 4);
  const spireMat = new THREE.MeshStandardMaterial({
    color: isSelected ? 0x38bdf8 : accentColorHex,
    emissive: isSelected ? 0x0284c7 : emissiveHex,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0.5
  });
  const spireMesh = new THREE.Mesh(spireGeom, spireMat);
  spireMesh.position.y = 0.7 + height + 0.7;
  spireMesh.rotation.y = Math.PI / 4;
  group.add(spireMesh);

  // 6. Ground Radial Contact Shadow Plane (Flush at y = 0.01 to prevent floating)
  const shadowGeom = new THREE.PlaneGeometry(width * 3.2, depth * 3.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTexture,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.015;
  group.add(shadowMesh);

  // 7. Floating 3D Holographic Label Billboard
  const labelTexture = createStockLabelTexture(stock, isSelected);
  const labelMat = new THREE.SpriteMaterial({
    map: labelTexture,
    transparent: true,
    depthTest: false
  });
  const labelSprite = new THREE.Sprite(labelMat);
  labelSprite.scale.set(4.2, 1.8, 1);
  labelSprite.position.y = 0.7 + height + 2.4;
  labelSprite.name = 'label';
  group.add(labelSprite);

  // Invisible simplified raycast bounding box for high-performance raycasting
  const hitBoxGeom = new THREE.BoxGeometry(width * 1.4, height + 3.8, depth * 1.4);
  const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitBox = new THREE.Mesh(hitBoxGeom, hitBoxMat);
  hitBox.position.y = (height + 3.8) / 2;
  hitBox.name = 'hitbox';
  (hitBox as any).parentGroup = group;
  group.add(hitBox);

  return group;
}
