import React, { useEffect, useRef } from 'react';

interface RotatingEarthProps {
  size?: number;
  className?: string;
  showLabels?: boolean;
}

type LonLat = [number, number];

// Simplified cartographic continent & island polygons [longitude, latitude]
const LANDMASSES: LonLat[][] = [
  // North America
  [
    [-168, 65], [-162, 70], [-140, 70], [-125, 72], [-95, 74], [-80, 70],
    [-65, 62], [-55, 52], [-66, 44], [-75, 35], [-81, 25], [-83, 30],
    [-90, 29], [-97, 26], [-96, 19], [-88, 21], [-83, 14], [-78, 8],
    [-84, 9], [-92, 15], [-105, 20], [-112, 28], [-117, 32], [-124, 40],
    [-125, 49], [-136, 58], [-152, 60], [-164, 55], [-168, 65]
  ],
  // Greenland
  [
    [-52, 60], [-42, 60], [-32, 68], [-18, 76], [-25, 82], [-50, 82],
    [-68, 77], [-56, 68], [-52, 60]
  ],
  // South America
  [
    [-78, 9], [-72, 12], [-62, 10], [-50, 1], [-35, -6], [-38, -14],
    [-40, -22], [-48, -28], [-53, -34], [-62, -41], [-66, -50], [-68, -55],
    [-74, -52], [-73, -42], [-71, -30], [-70, -18], [-77, -12], [-81, -5],
    [-78, 2], [-78, 9]
  ],
  // Europe (continental + Iberia + Italy + Scandinavia)
  [
    [-9, 37], [-9, 43], [-2, 43], [-4, 48], [2, 51], [8, 54], [10, 57],
    [5, 60], [10, 65], [18, 70], [28, 71], [40, 68], [55, 68], [60, 62],
    [50, 52], [44, 43], [36, 45], [29, 41], [24, 38], [22, 37], [19, 40],
    [16, 38], [13, 42], [9, 44], [5, 43], [0, 39], [-5, 36], [-9, 37]
  ],
  // Great Britain & Ireland
  [
    [-6, 50], [-5, 55], [-3, 58], [-1, 56], [1, 52], [-2, 50], [-6, 50]
  ],
  // Africa
  [
    [-6, 36], [10, 37], [12, 33], [24, 32], [32, 31], [34, 27], [38, 20],
    [43, 12], [51, 12], [48, 4], [41, -2], [40, -11], [35, -20], [32, -27],
    [26, -34], [18, -34], [14, -22], [12, -12], [9, -1], [8, 4], [2, 6],
    [-8, 5], [-14, 10], [-17, 15], [-16, 22], [-10, 30], [-6, 36]
  ],
  // Madagascar
  [
    [44, -25], [47, -25], [50, -15], [49, -12], [44, -17], [44, -25]
  ],
  // Asia + Arabian Peninsula + India + Southeast Asia
  [
    [35, 36], [42, 41], [52, 40], [58, 48], [60, 62], [75, 72], [105, 76],
    [140, 72], [175, 66], [164, 56], [142, 54], [135, 44], [128, 35],
    [122, 39], [121, 31], [116, 23], [108, 20], [109, 12], [104, 2],
    [100, 5], [98, 14], [91, 22], [85, 20], [80, 13], [77.5, 8.1],
    [73, 18], [68, 23], [60, 25], [56, 26], [51, 24], [56, 22], [59, 21],
    [53, 16], [44, 13], [39, 21], [35, 29], [35, 36]
  ],
  // Japan
  [
    [130, 32], [135, 34], [141, 38], [145, 44], [140, 42], [136, 36], [130, 32]
  ],
  // Indonesia / Sumatra & Java & Borneo
  [
    [95, 5], [105, -2], [106, -7], [114, -8], [104, -6], [95, 5]
  ],
  [
    [109, 2], [118, 5], [117, -3], [110, -3], [109, 2]
  ],
  // Australia
  [
    [114, -22], [123, -17], [131, -12], [137, -13], [142, -11], [146, -18],
    [153, -27], [150, -36], [141, -38], [134, -34], [124, -34], [115, -34],
    [113, -26], [114, -22]
  ]
];

// Dedicated highlighted landmasses for Sri Lanka & Palestine
const SRI_LANKA_POLY: LonLat[] = [
  [80.0, 9.8], [80.8, 9.4], [81.8, 7.8], [81.6, 6.2],
  [80.4, 5.9], [79.8, 7.0], [79.7, 8.6], [80.0, 9.8]
];

const PALESTINE_POLY: LonLat[] = [
  [34.2, 31.3], [35.1, 33.1], [35.6, 33.1], [35.5, 31.2],
  [34.9, 29.5], [34.2, 31.3]
];

const BEACONS: {
  name: string;
  lon: number;
  lat: number;
  phaseOffset: number;
  side: 'left' | 'right';
  verticalBias: number;
}[] = [
  { name: 'PALESTINE', lon: 35.23, lat: 31.95, phaseOffset: 0.9, side: 'left', verticalBias: -0.58 },
  { name: 'SRI LANKA', lon: 80.77, lat: 7.87, phaseOffset: 0, side: 'right', verticalBias: 0.45 },
];

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function projectPoint(lonDeg: number, latDeg: number, lambda0: number, sinPhi0: number, cosPhi0: number): Vec3 {
  const phi = (latDeg * Math.PI) / 180;
  const lambda = (lonDeg * Math.PI) / 180;
  const dLambda = lambda - lambda0;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const x0 = cosPhi * Math.sin(dLambda);
  const y0 = sinPhi;
  const z0 = cosPhi * Math.cos(dLambda);

  return {
    x: x0,
    y: y0 * cosPhi0 - z0 * sinPhi0,
    z: y0 * sinPhi0 + z0 * cosPhi0,
  };
}

// Clip a 3D polygon to the visible hemisphere (z >= 0)
function clipPolygonToFrontHemisphere(points: Vec3[]): Vec3[] {
  if (points.length === 0) return [];
  const output: Vec3[] = [];
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const prev = points[(i + points.length - 1) % points.length];
    const currIn = curr.z >= 0;
    const prevIn = prev.z >= 0;

    if (currIn !== prevIn) {
      const denom = prev.z - curr.z;
      const t = denom === 0 ? 0.5 : prev.z / denom;
      const ix = prev.x + t * (curr.x - prev.x);
      const iy = prev.y + t * (curr.y - prev.y);
      const len = Math.hypot(ix, iy) || 1;
      output.push({ x: ix / len, y: iy / len, z: 0 });
    }
    if (currIn) {
      output.push(curr);
    }
  }
  return output;
}

export default function RotatingEarth({
  size = 112,
  className = '',
  showLabels = true,
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredRef = useRef(false);

  const canvasWidth = showLabels ? Math.round(size * 1.95) : size;
  const canvasHeight = size;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    // Start centered at ~56°E so both Palestine (35.2°E) and Sri Lanka (80.8°E) are prominently visible immediately
    const initialLonRad = (56 * Math.PI) / 180;
    const tiltRad = (18 * Math.PI) / 180;
    const sinPhi0 = Math.sin(tiltRad);
    const cosPhi0 = Math.cos(tiltRad);
    const startTime = performance.now();

    const drawPolygon = (poly: LonLat[], lambda0: number, cx: number, cy: number, r: number) => {
      const pts3D = poly.map(([lon, lat]) => projectPoint(lon, lat, lambda0, sinPhi0, cosPhi0));
      const clipped = clipPolygonToFrontHemisphere(pts3D);
      if (clipped.length < 3) return false;

      ctx.beginPath();
      clipped.forEach((p, idx) => {
        const px = cx + r * p.x;
        const py = cy - r * p.y;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      return true;
    };

    const drawArrowCallout = (
      label: string,
      px: number,
      py: number,
      cx: number,
      cy: number,
      r: number,
      side: 'left' | 'right',
      verticalBias: number,
      alpha: number,
      blinkOn: boolean
    ) => {
      const fontSize = Math.max(9, Math.min(12, Math.round(size * 0.095)));
      ctx.font = `800 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      const textWidth = ctx.measureText(label).width;
      const padX = Math.max(5, Math.round(size * 0.045));
      const boxH = fontSize + 7;
      const boxW = textWidth + padX * 2;

      // Anchor label cleanly outside the globe limb on left or right
      const anchorX =
        side === 'left'
          ? Math.max(boxW / 2 + 3, cx - r - boxW * 0.45 - 8)
          : Math.min(canvasWidth - boxW / 2 - 3, cx + r + boxW * 0.45 + 8);
      const anchorY = Math.max(
        boxH / 2 + 4,
        Math.min(canvasHeight - boxH / 2 - 4, cy + r * verticalBias)
      );

      const boxLeft = anchorX - boxW / 2;
      const boxTop = anchorY - boxH / 2;

      // Start line from inner edge of the label box facing the globe
      const lineStartX = side === 'left' ? boxLeft + boxW : boxLeft;
      const lineStartY = anchorY;

      // Stop arrow tip just short of the glowing marker dot
      const dx = px - lineStartX;
      const dy = py - lineStartY;
      const dist = Math.hypot(dx, dy) || 1;
      const tipGap = Math.max(4.5, size * 0.042);
      const tipX = px - (dx / dist) * tipGap;
      const tipY = py - (dy / dist) * tipGap;

      // Elbow point for clean cartographic leader line
      const elbowX = side === 'left' ? lineStartX + (tipX - lineStartX) * 0.35 : lineStartX + (tipX - lineStartX) * 0.35;
      const elbowY = lineStartY;

      ctx.save();
      ctx.globalAlpha = alpha;

      // Dark backing stroke for leader line legibility over oceans/continents
      ctx.beginPath();
      ctx.moveTo(lineStartX, lineStartY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.78)';
      ctx.lineWidth = 2.8;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Crisp arrow shaft
      ctx.beginPath();
      ctx.moveTo(lineStartX, lineStartY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = blinkOn ? '#fca5a5' : '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Arrowhead pointing directly to the country beacon
      const angle = Math.atan2(tipY - elbowY, tipX - elbowX);
      const headLen = Math.max(5.5, size * 0.055);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(
        tipX - headLen * Math.cos(angle - 0.42),
        tipY - headLen * Math.sin(angle - 0.42)
      );
      ctx.lineTo(
        tipX - headLen * Math.cos(angle + 0.42),
        tipY - headLen * Math.sin(angle + 0.42)
      );
      ctx.closePath();
      ctx.fillStyle = blinkOn ? '#ef4444' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Label tag box (crisp, non-pill editorial tag)
      ctx.fillStyle = 'rgba(12, 10, 10, 0.92)';
      ctx.strokeStyle = blinkOn ? '#ef4444' : 'rgba(220, 38, 38, 0.65)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.roundRect(boxLeft, boxTop, boxW, boxH, 3);
      ctx.fill();
      ctx.stroke();

      // Country name text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = blinkOn ? '#ffffff' : '#fecaca';
      ctx.fillText(label, anchorX, anchorY + 0.5);

      ctx.restore();
    };

    const render = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const rotationSpeed = prefersReducedMotion ? 0 : hoveredRef.current ? 0.06 : 0.2;
      const lambda0 = initialLonRad + elapsedSec * rotationSpeed;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      const r = size * 0.43;

      // Subtle atmospheric outer glow
      const atmoGlow = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.15);
      atmoGlow.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      atmoGlow.addColorStop(0.6, 'rgba(220, 38, 38, 0.14)');
      atmoGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmoGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // Clip inside globe sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Deep ocean sphere gradient
      const oceanGrad = ctx.createRadialGradient(
        cx - r * 0.32,
        cy - r * 0.32,
        r * 0.08,
        cx,
        cy,
        r * 1.05
      );
      oceanGrad.addColorStop(0, '#1e4e79');
      oceanGrad.addColorStop(0.55, '#0d2b4e');
      oceanGrad.addColorStop(1, '#040d1a');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Subtle longitude / latitude graticule
      ctx.strokeStyle = 'rgba(148, 197, 255, 0.13)';
      ctx.lineWidth = Math.max(0.5, size * 0.006);
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 10) {
          const p = projectPoint(lon, lat, lambda0, sinPhi0, cosPhi0);
          if (p.z >= 0) {
            const px = cx + r * p.x;
            const py = cy - r * p.y;
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }
      for (let lon = -150; lon <= 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -85; lat <= 85; lat += 10) {
          const p = projectPoint(lon, lat, lambda0, sinPhi0, cosPhi0);
          if (p.z >= 0) {
            const px = cx + r * p.x;
            const py = cy - r * p.y;
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // Draw world continents
      ctx.fillStyle = '#2d6a4f';
      ctx.strokeStyle = '#52b788';
      ctx.lineWidth = Math.max(0.6, size * 0.007);
      for (const poly of LANDMASSES) {
        if (drawPolygon(poly, lambda0, cx, cy, r)) {
          ctx.fill();
          ctx.stroke();
        }
      }

      // Blinking intensity (0..1 crisp pulse)
      const blinkWave = (Math.sin(elapsedSec * 5.2) + 1) / 2;

      // Highlight Palestine & Sri Lanka landmasses with blinking crimson/white outline
      const highlightFill = `rgba(239, 68, 68, ${0.55 + blinkWave * 0.45})`;
      const highlightStroke = `rgba(255, 255, 255, ${0.65 + blinkWave * 0.35})`;
      for (const special of [SRI_LANKA_POLY, PALESTINE_POLY]) {
        if (drawPolygon(special, lambda0, cx, cy, r)) {
          ctx.fillStyle = highlightFill;
          ctx.fill();
          ctx.strokeStyle = highlightStroke;
          ctx.lineWidth = Math.max(0.9, size * 0.011);
          ctx.stroke();
        }
      }

      // Specular shadow rim for 3D spherical depth
      const shadeGrad = ctx.createRadialGradient(
        cx - r * 0.35,
        cy - r * 0.35,
        r * 0.2,
        cx,
        cy,
        r
      );
      shadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      shadeGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
      shadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      ctx.fillStyle = shadeGrad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Blinking Beacons for Sri Lanka & Palestine (inside sphere clip)
      const visibleCallouts: {
        name: string;
        px: number;
        py: number;
        side: 'left' | 'right';
        verticalBias: number;
        alpha: number;
        blinkOn: boolean;
      }[] = [];

      BEACONS.forEach((beacon) => {
        const p = projectPoint(beacon.lon, beacon.lat, lambda0, sinPhi0, cosPhi0);
        if (p.z > 0.02) {
          const px = cx + r * p.x;
          const py = cy - r * p.y;
          const visibility = Math.min(1, p.z * 2.8);
          const pulse = (elapsedSec * 1.45 + beacon.phaseOffset) % 1;
          const blinkOn = Math.sin(elapsedSec * 6.0 + beacon.phaseOffset * 2) > -0.25;

          // Expanding pulse ring
          const ringRadius = Math.max(2.5, size * 0.025) + pulse * Math.max(7, size * 0.11);
          ctx.beginPath();
          ctx.arc(px, py, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(248, 113, 113, ${(1 - pulse) * 0.95 * visibility})`;
          ctx.lineWidth = Math.max(1.2, size * 0.015);
          ctx.stroke();

          // Glowing halo + center beacon
          if (blinkOn) {
            const haloRadius = Math.max(5, size * 0.08);
            const halo = ctx.createRadialGradient(px, py, 0, px, py, haloRadius);
            halo.addColorStop(0, `rgba(255, 255, 255, ${0.98 * visibility})`);
            halo.addColorStop(0.35, `rgba(239, 68, 68, ${0.92 * visibility})`);
            halo.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(px, py, haloRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(px, py, Math.max(2.2, size * 0.028), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${visibility})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(220, 38, 38, ${visibility})`;
            ctx.lineWidth = Math.max(1, size * 0.012);
            ctx.stroke();
          }

          if (showLabels && p.z > 0.06) {
            visibleCallouts.push({
              name: beacon.name,
              px,
              py,
              side: beacon.side,
              verticalBias: beacon.verticalBias,
              alpha: Math.min(1, (p.z - 0.06) * 4),
              blinkOn,
            });
          }
        }
      });

      ctx.restore(); // remove sphere clip

      // Crisp orbital crimson rim
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.lineWidth = Math.max(1.2, size * 0.018);
      ctx.stroke();

      // Draw callout words + arrows above the globe rim so text is always sharp and unobstructed
      for (const c of visibleCallouts) {
        drawArrowCallout(
          c.name,
          c.px,
          c.py,
          cx,
          cy,
          r,
          c.side,
          c.verticalBias,
          c.alpha,
          c.blinkOn
        );
      }

      ctx.restore();

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [size, canvasWidth, canvasHeight, showLabels]);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: canvasWidth, height: canvasHeight }}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      title="Rotating Earth — Palestine & Sri Lanka Highlighted"
      aria-label="Rotating Earth with arrows marking Palestine and Sri Lanka"
      role="img"
    >
      <canvas
        ref={canvasRef}
        style={{ width: canvasWidth, height: canvasHeight }}
        className="block"
      />
    </div>
  );
}
