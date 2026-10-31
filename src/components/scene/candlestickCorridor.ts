import * as THREE from 'three';
import { CandleData, StockQuote } from '../../types/stock.ts';

/**
 * Builds a 3D Volumetric Candlestick Corridor for a stock
 */
export function buildCandlestickCorridor(
  candles: CandleData[],
  stock: StockQuote
): THREE.Group {
  const group = new THREE.Group();
  group.name = `corridor-${stock.symbol}`;

  if (!candles || candles.length === 0) return group;

  // Find min and max close to normalize Y axis
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let maxVol = 0;
  for (const c of candles) {
    if (c.low < minPrice) minPrice = c.low;
    if (c.high > maxPrice) maxPrice = c.high;
    if (c.volume > maxVol) maxVol = c.volume;
  }
  const priceRange = Math.max(1, maxPrice - minPrice);
  const targetHeight = 14;

  const toY = (p: number) => ((p - minPrice) / priceRange) * targetHeight + 1;

  const zSpacing = 1.6;
  const startZ = -(candles.length * zSpacing) / 2;

  const smaPoints: THREE.Vector3[] = [];

  candles.forEach((c, i) => {
    const isUp = c.close >= c.open;
    const candleColorHex = isUp ? 0x10b981 : 0xf43f5e;
    const zPos = startZ + i * zSpacing;

    const yOpen = toY(c.open);
    const yClose = toY(c.close);
    const yHigh = toY(c.high);
    const yLow = toY(c.low);

    const bodyHeight = Math.max(0.15, Math.abs(yClose - yOpen));
    const bodyCenterY = (yOpen + yClose) / 2;

    // 1. Candlestick 3D Box Body
    const bodyGeom = new THREE.BoxGeometry(1.0, bodyHeight, 0.9);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: candleColorHex,
      emissive: candleColorHex,
      emissiveIntensity: 0.25,
      roughness: 0.3,
      metalness: 0.4
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.set(0, bodyCenterY, zPos);
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 2. High-Low Upper/Lower Wick (Cylinder)
    const wickHeight = Math.max(0.1, yHigh - yLow);
    const wickGeom = new THREE.CylinderGeometry(0.04, 0.04, wickHeight, 6);
    const wickMat = new THREE.MeshStandardMaterial({
      color: candleColorHex,
      metalness: 0.8,
      roughness: 0.2
    });
    const wickMesh = new THREE.Mesh(wickGeom, wickMat);
    wickMesh.position.set(0, (yHigh + yLow) / 2, zPos);
    group.add(wickMesh);

    // 3. Volumetric Volume Pillar on ground (Y = 0)
    const volHeight = Math.max(0.2, (c.volume / (maxVol || 1)) * 3.5);
    const volGeom = new THREE.BoxGeometry(0.7, volHeight, 0.7);
    const volMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: isUp ? 0x064e3b : 0x881337,
      emissiveIntensity: 0.4,
      roughness: 0.6,
      metalness: 0.2
    });
    const volMesh = new THREE.Mesh(volGeom, volMat);
    volMesh.position.set(-2.4, volHeight / 2, zPos);
    group.add(volMesh);

    // Collect SMA curve point
    if (c.sma20) {
      smaPoints.push(new THREE.Vector3(0, toY(c.sma20), zPos));
    }
  });

  // 4. Moving Average (SMA20) 3D Glowing Ribbon / Tube
  if (smaPoints.length > 2) {
    const curve = new THREE.CatmullRomCurve3(smaPoints);
    const tubeGeom = new THREE.TubeGeometry(curve, smaPoints.length * 2, 0.1, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    group.add(tubeMesh);
  }

  // 5. Horizontal Support and Resistance Ceiling/Floor Laser Planes
  const corridorLength = candles.length * zSpacing + 4;
  const planeGeom = new THREE.PlaneGeometry(12, corridorLength);

  // Resistance level plane
  const resistMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  const resistMesh = new THREE.Mesh(planeGeom, resistMat);
  resistMesh.rotation.x = Math.PI / 2;
  resistMesh.position.set(0, toY(stock.dayHigh), 0);
  group.add(resistMesh);

  // Support level plane
  const supportMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });
  const supportMesh = new THREE.Mesh(planeGeom, supportMat);
  supportMesh.rotation.x = Math.PI / 2;
  supportMesh.position.set(0, toY(stock.dayLow), 0);
  group.add(supportMesh);

  return group;
}
