// render3d/Estanteria3D.jsx
// Origen: https://github.com/francoiadanza/configurador-estanterias
// Adaptado para Mundo Estanterías — parante variable + refuerzos por kg
import { useMemo } from 'react';
import * as THREE from 'three';

// ─── Dimensiones físicas FIJAS (metros) ──────────────────────────────────────
const ANCHO         = 0.90;
const GROSOR_CHAPA  = 0.0025;
const ESTANTE_T     = 0.014;
const LABIO_H       = 0.028;
const LABIO_T       = 0.005;
const BARRA_H       = 0.022;
const BARRA_T       = 0.012;
const PERF_H        = 0.012;
const PERF_W        = 0.006;
const PERF_PASO     = 0.040;

// Refuerzo central debajo del estante
const REFUERZO_H    = 0.015;
const REFUERZO_T    = 0.030;

// Parante sizes por tipo (metros)
const PARANTE_DIMS = {
  fino:        { w: 0.040, d: 0.040 },
  grueso:      { w: 0.050, d: 0.050 },
  industrial:  { w: 0.070, d: 0.070 },
};

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
function Pilar({ posX, posZ, dirX, dirZ, alto, pilarW, pilarD, mats }) {
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
      <mesh material={grafito} castShadow receiveShadow position={[0, alto / 2, dirZ * (pilarD / 2 - GROSOR_CHAPA / 2)]}>
        <boxGeometry args={[pilarW, alto, GROSOR_CHAPA]} />
      </mesh>
      <mesh material={grafito} castShadow receiveShadow position={[dirX * (pilarW / 2 - GROSOR_CHAPA / 2), alto / 2, 0]}>
        <boxGeometry args={[GROSOR_CHAPA, alto, pilarD]} />
      </mesh>
      <mesh material={grafito} castShadow receiveShadow position={[0, alto / 2, -dirZ * (pilarD / 2 - GROSOR_CHAPA / 2)]}>
        <boxGeometry args={[pilarW, alto, GROSOR_CHAPA]} />
      </mesh>
      {perfs.map((y, i) => (
        <mesh key={i} material={perfMat} position={[0, y, dirZ * (pilarD / 2 + 0.0002)]}>
          <boxGeometry args={[PERF_W, PERF_H, GROSOR_CHAPA + 0.001]} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Estante — refuerzos según kg ─────────────────────────────────────────────
function Estante({ posY, profundidad, pilarW, pilarD, refuerzos, mats }) {
  const { grafito, estanteSup } = mats;

  const largo = ANCHO - pilarW * 2;
  const prof  = profundidad - pilarD * 2;

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
      <mesh material={grafito} castShadow position={[0, -(BARRA_H / 2), -(prof / 2 + pilarD / 2 - BARRA_T / 2)]}>
        <boxGeometry args={[largo, BARRA_H, BARRA_T]} />
      </mesh>
      {/* Barra trasera */}
      <mesh material={grafito} castShadow position={[0, -(BARRA_H / 2), (prof / 2 + pilarD / 2 - BARRA_T / 2)]}>
        <boxGeometry args={[largo, BARRA_H, BARRA_T]} />
      </mesh>

      {/* Refuerzos centrales (0, 1 o 2 según kg) */}
      {refuerzos >= 1 && (
        <mesh material={grafito} castShadow position={[0, -(REFUERZO_H / 2), refuerzos === 2 ? -prof * 0.17 : 0]}>
          <boxGeometry args={[largo, REFUERZO_H, REFUERZO_T]} />
        </mesh>
      )}
      {refuerzos >= 2 && (
        <mesh material={grafito} castShadow position={[0, -(REFUERZO_H / 2), prof * 0.17]}>
          <boxGeometry args={[largo, REFUERZO_H, REFUERZO_T]} />
        </mesh>
      )}
    </group>
  );
}

// ─── Fondo metálico ───────────────────────────────────────────────────────────
function PanelFondo({ alto, profundidad, pilarW, pilarD, mats }) {
  const largo = ANCHO - pilarW * 2;
  const prof  = profundidad - pilarD * 2;
  return (
    <mesh material={mats.grafito} receiveShadow position={[0, alto / 2, prof / 2 + pilarD - 0.003]}>
      <boxGeometry args={[largo, alto - ESTANTE_T * 2, 0.004]} />
    </mesh>
  );
}

// ─── Laterales metálicos ──────────────────────────────────────────────────────
function PanelLateral({ posX, alto, profundidad, pilarD, mats }) {
  const prof = profundidad - pilarD * 2;
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

// ─── Determinar refuerzos por kg ──────────────────────────────────────────────
function getRefuerzos(kgEstante) {
  if (kgEstante >= 100) return 2;
  if (kgEstante >= 65)  return 1;
  return 0;  // 50kg: sin refuerzo
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Estanteria3D({ config }) {
  const mats = useMats();

  const alto = config.alto / 100;
  const prof = config.profundidad / 100;
  const n    = config.estantes;

  // Parante según tipo
  const paranteKey = config.parante || 'fino';
  const { w: pilarW, d: pilarD } = PARANTE_DIMS[paranteKey] || PARANTE_DIMS.fino;

  const px = ANCHO / 2 - pilarW / 2;
  const pz = prof  / 2 - pilarD / 2;

  const refuerzos = getRefuerzos(config.kgEstante || 50);

  const posicionesY = useMemo(() => {
    const techo  = alto - ESTANTE_T;
    const espacio = techo / (n - 1);
    return Array.from({ length: n }, (_, i) => i * espacio);
  }, [alto, n]);

  return (
    <group>
      {/* 4 pilares */}
      <Pilar posX={-px} posZ={-pz} dirX={-1} dirZ={-1} alto={alto} pilarW={pilarW} pilarD={pilarD} mats={mats} />
      <Pilar posX={ px} posZ={-pz} dirX={ 1} dirZ={-1} alto={alto} pilarW={pilarW} pilarD={pilarD} mats={mats} />
      <Pilar posX={-px} posZ={ pz} dirX={-1} dirZ={ 1} alto={alto} pilarW={pilarW} pilarD={pilarD} mats={mats} />
      <Pilar posX={ px} posZ={ pz} dirX={ 1} dirZ={ 1} alto={alto} pilarW={pilarW} pilarD={pilarD} mats={mats} />

      {/* Estantes */}
      {posicionesY.map((y, i) => (
        <Estante key={i} posY={y} profundidad={prof} pilarW={pilarW} pilarD={pilarD} refuerzos={refuerzos} mats={mats} />
      ))}

      {/* Accesorios */}
      {config.conFondo && (
        <PanelFondo alto={alto} profundidad={prof} pilarW={pilarW} pilarD={pilarD} mats={mats} />
      )}
      {config.conLaterales && (
        <>
          <PanelLateral posX={-(ANCHO / 2 - pilarW - 0.003)} alto={alto} profundidad={prof} pilarD={pilarD} mats={mats} />
          <PanelLateral posX={ (ANCHO / 2 - pilarW - 0.003)} alto={alto} profundidad={prof} pilarD={pilarD} mats={mats} />
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
