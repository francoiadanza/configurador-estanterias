// components/Estanteria3D.jsx
import { useMemo } from 'react';
import * as THREE from 'three';

// ─── Dimensiones físicas FIJAS (metros) ──────────────────────────────────────
const ANCHO         = 0.90;   // ancho total exterior
const GROSOR_CHAPA  = 0.0025; // 2.5 mm — espesor de chapa real
const PILAR_W       = 0.040;  // ancho de la cara frontal del pilar
const PILAR_D       = 0.040;  // profundidad de la cara lateral del pilar
const ESTANTE_T     = 0.014;  // espesor del estante (14 mm)
const LABIO_H       = 0.028;  // altura del labio colgante del estante
const LABIO_T       = 0.005;  // espesor del labio
const BARRA_H       = 0.022;  // alto del travesaño rectangular
const BARRA_T       = 0.012;  // profundidad del travesaño
const PERF_H        = 0.012;  // alto de cada perforación oval
const PERF_W        = 0.006;  // ancho de cada perforación oval
const PERF_PASO     = 0.040;  // CADA 4 CM

// NUEVAS MEDIDAS: Refuerzo central debajo del estante
const REFUERZO_H    = 0.015;  // alto del nervio central (1.5 cm)
const REFUERZO_T    = 0.030;  // ancho del nervio central (3 cm, plano y chato)

// ─── Materiales ───────────────────────────────────────────────────────────────
function useMats() {
  return useMemo(() => {
    const grafito = new THREE.MeshStandardMaterial({
      color:           new THREE.Color('#525a56'),
      metalness:       0.92,
      roughness:       0.22,
      envMapIntensity: 1.5,
    });
    const estanteSup = new THREE.MeshStandardMaterial({
      color:           new THREE.Color('#464d58'),
      metalness:       0.85,
      roughness:       0.30,
      envMapIntensity: 1.2,
    });
    const perfMat = new THREE.MeshStandardMaterial({
      color:    new THREE.Color('#1a1d22'),
      metalness:0.20,
      roughness:0.85,
    });
    return { grafito, estanteSup, perfMat };
  }, []);
}

// ─── Pilar individual ─────────────────────────────────────────────────────────
function Pilar({ posX, posZ, dirX, dirZ, alto, mats }) {
  const { grafito, perfMat } = mats;

  const perfs = useMemo(() => {
    const arr = [];
    let y = PERF_PASO;
    while (y < alto - PERF_PASO * 0.5) {
      arr.push(y);
      y += PERF_PASO;
    }
    return arr;
  }, [alto]);

  return (
    <group position={[posX, 0, posZ]}>
      {/* Cara frontal */}
      <mesh material={grafito} castShadow receiveShadow position={[0, alto / 2, dirZ * (PILAR_D / 2 - GROSOR_CHAPA / 2)]}>
        <boxGeometry args={[PILAR_W, alto, GROSOR_CHAPA]} />
      </mesh>
      {/* Ala interior */}
      <mesh material={grafito} castShadow receiveShadow position={[dirX * (PILAR_W / 2 - GROSOR_CHAPA / 2), alto / 2, 0]}>
        <boxGeometry args={[GROSOR_CHAPA, alto, PILAR_D]} />
      </mesh>
      {/* Ala trasera */}
      <mesh material={grafito} castShadow receiveShadow position={[0, alto / 2, -dirZ * (PILAR_D / 2 - GROSOR_CHAPA / 2)]}>
        <boxGeometry args={[PILAR_W, alto, GROSOR_CHAPA]} />
      </mesh>
      {/* Perforaciones */}
      {perfs.map((y, i) => (
        <mesh key={i} material={perfMat} position={[0, y, dirZ * (PILAR_D / 2 + 0.0002)]}>
          <boxGeometry args={[PERF_W, PERF_H, GROSOR_CHAPA + 0.001]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Estante ──────────────────────────────────────────────────────────────────
function Estante({ posY, profundidad, mats }) {
  const { grafito, estanteSup } = mats;

  const largo = ANCHO - PILAR_W * 2;
  const prof  = profundidad - PILAR_D * 2;

  return (
    <group position={[0, posY, 0]}>

      {/* Superficie plana */}
      <mesh material={estanteSup} castShadow receiveShadow position={[0, ESTANTE_T / 2, 0]}>
        <boxGeometry args={[largo, ESTANTE_T, prof]} />
      </mesh>

      {/* Labio frontal */}
      <mesh material={grafito} castShadow position={[0, -(LABIO_H / 2), -(prof / 2 + LABIO_T / 2)]}>
        <boxGeometry args={[largo, LABIO_H, LABIO_T]} />
      </mesh>

      {/* Labio trasero */}
      <mesh material={grafito} castShadow position={[0, -(LABIO_H / 2), (prof / 2 + LABIO_T / 2)]}>
        <boxGeometry args={[largo, LABIO_H, LABIO_T]} />
      </mesh>

      {/* Barra delantera */}
      <mesh material={grafito} castShadow position={[0, -(BARRA_H / 2), -(prof / 2 + PILAR_D / 2 - BARRA_T / 2)]}>
        <boxGeometry args={[largo, BARRA_H, BARRA_T]} />
      </mesh>
      
      {/* Barra trasera */}
      <mesh material={grafito} castShadow position={[0, -(BARRA_H / 2), (prof / 2 + PILAR_D / 2 - BARRA_T / 2)]}>
        <boxGeometry args={[largo, BARRA_H, BARRA_T]} />
      </mesh>

      {/* ── ¡NUEVO!: Refuerzo central (nervio) debajo del estante ── */}
      <mesh material={grafito} castShadow position={[0, -(REFUERZO_H / 2), 0]}>
        <boxGeometry args={[largo, REFUERZO_H, REFUERZO_T]} />
      </mesh>

    </group>
  );
}

// ─── Fondo metálico ───────────────────────────────────────────────────────────
function PanelFondo({ alto, profundidad, mats }) {
  const largo = ANCHO - PILAR_W * 2;
  const prof  = profundidad - PILAR_D * 2;
  return (
    <mesh material={mats.grafito} receiveShadow position={[0, alto / 2, prof / 2 + PILAR_D - 0.003]}>
      <boxGeometry args={[largo, alto - ESTANTE_T * 2, 0.004]} />
    </mesh>
  );
}

// ─── Laterales metálicos ──────────────────────────────────────────────────────
function PanelLateral({ posX, alto, profundidad, mats }) {
  const prof = profundidad - PILAR_D * 2;
  return (
    <mesh material={mats.grafito} castShadow receiveShadow position={[posX, alto / 2, 0]}>
      <boxGeometry args={[0.004, alto - ESTANTE_T * 2, prof]} />
    </mesh>
  );
}

// ─── Regatón ──────────────────────────────────────────────────────────────────
function Regaton({ posX, posZ, mat }) {
  return (
    <group position={[posX, 0, posZ]}>
      <mesh material={mat} position={[0, 0.014, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.028, 12]} />
      </mesh>
      <mesh material={mat} position={[0, -0.002, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.006, 16]} />
      </mesh>
    </group>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Estanteria3D({ config }) {
  const mats = useMats();

  const alto = config.alto / 100;
  const prof = config.profundidad / 100;
  const n    = config.estantes;

  const px = ANCHO / 2 - PILAR_W / 2;
  const pz = prof  / 2 - PILAR_D / 2;

  const posicionesY = useMemo(() => {
    const techo  = alto - ESTANTE_T;
    const espacio = techo / (n - 1);
    return Array.from({ length: n }, (_, i) => i * espacio);
  }, [alto, n]);

  return (
    <group>

      {/* 4 pilares */}
      <Pilar posX={-px} posZ={-pz} dirX={-1} dirZ={-1} alto={alto} mats={mats} />
      <Pilar posX={ px} posZ={-pz} dirX={ 1} dirZ={-1} alto={alto} mats={mats} />
      <Pilar posX={-px} posZ={ pz} dirX={-1} dirZ={ 1} alto={alto} mats={mats} />
      <Pilar posX={ px} posZ={ pz} dirX={ 1} dirZ={ 1} alto={alto} mats={mats} />

      {/* Estantes */}
      {posicionesY.map((y, i) => (
        <Estante key={i} posY={y} profundidad={prof} mats={mats} />
      ))}

      {/* Accesorios */}
      {config.conFondo && (
        <PanelFondo alto={alto} profundidad={prof} mats={mats} />
      )}
      {config.conLaterales && (
        <>
          <PanelLateral posX={-(ANCHO / 2 - PILAR_W - 0.003)} alto={alto} profundidad={prof} mats={mats} />
          <PanelLateral posX={ (ANCHO / 2 - PILAR_W - 0.003)} alto={alto} profundidad={prof} mats={mats} />
        </>
      )}

      {/* Regatones */}
      {config.regatones > 0 && (
        <>
          <Regaton posX={-px} posZ={-pz} mat={mats.grafito} />
          <Regaton posX={ px} posZ={-pz} mat={mats.grafito} />
          <Regaton posX={-px} posZ={ pz} mat={mats.grafito} />
          <Regaton posX={ px} posZ={ pz} mat={mats.grafito} />
        </>
      )}

    </group>
  );
}
