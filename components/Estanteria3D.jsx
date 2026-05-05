// components/Estanteria3D.jsx
import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// ─── Dimensiones físicas FIJAS (metros) ──────────────────────────────────────
const ANCHO         = 0.90;
const ESTANTE_T     = 0.014;
const LABIO_H       = 0.028;
const LABIO_T       = 0.005;
const BARRA_H       = 0.022;
const BARRA_T       = 0.012;
const REFUERZO_H    = 0.015;
const REFUERZO_T    = 0.030;

// Parante sizes por tipo (metros)
const PARANTE_DIMS = {
  fino:       { w: 0.040, d: 0.040 },
  grueso:     { w: 0.050, d: 0.050 },
  industrial: { w: 0.070, d: 0.070 },
};

// ─── Ajuste manual de los pilares GLB ────────────────────────────────────────
// Modificá estos valores para mover / rotar los pilares hasta que encajen
const PILAR_OFFSET_X  = -0.040;  // desplazamiento lateral   (+ = derecha, - = izquierda)
const PILAR_OFFSET_Y  =  0.000;  // desplazamiento vertical  (+ = arriba,  - = abajo)
const PILAR_OFFSET_Z  =  0.000;  // desplazamiento en fondo  (+ = atrás,   - = adelante)
//              delantera-izq  delantera-der  trasera-izq  trasera-der
const ROT_FL  =  180;          // dirX=-1  dirZ=-1
const ROT_FR  =  180;          // dirX=+1  dirZ=-1
const ROT_BL  =   90;          // dirX=-1  dirZ=+1
const ROT_BR  =   90;          // dirX=+1  dirZ=+1

// ─── Materiales ───────────────────────────────────────────────────────────────
function useMats() {
  return useMemo(() => {
    const grafito = new THREE.MeshStandardMaterial({
      color:           new THREE.Color('#8a9198'),
      metalness:       0.90,
      roughness:       0.25,
      envMapIntensity: 1.5,
    });
    const estanteSup = new THREE.MeshStandardMaterial({
      color:           new THREE.Color('#8a9198'),
      metalness:       0.90,
      roughness:       0.25,
      envMapIntensity: 1.2,
    });
    const perfMat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color('#1a1d22'),
      metalness: 0.20,
      roughness: 0.85,
    });
    return { grafito, estanteSup, perfMat };
  }, []);
}

// ─── Pilar individual (modelo GLB) ───────────────────────────────────────────
function Pilar({ posX, posZ, dirX, rot, alto }) {
  const modelPath = alto > 2.1 ? '/models/barra233.glb' : '/models/barra200.glb';
  const { scene } = useGLTF(modelPath);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);

    clone.position.set(
      -(box.min.x + box.max.x) / 2,
      -box.min.y,
      -(box.min.z + box.max.z) / 2
    );

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = child.material.clone();
        child.material.color.set('#8a9198');
        child.material.metalness = 0.90;
        child.material.roughness = 0.25;
        child.material.side = THREE.DoubleSide;
      }
    });
    return clone;
  }, [scene]);

  return (
    <group position={[posX + PILAR_OFFSET_X * dirX, PILAR_OFFSET_Y, posZ + PILAR_OFFSET_Z]} scale={[dirX, 1, 1]}>
      <primitive object={clonedScene} rotation={[0, (rot * Math.PI) / 180, 0]} />
    </group>
  );
}

useGLTF.preload('/models/barra200.glb');
useGLTF.preload('/models/barra233.glb');

// ─── Estante ──────────────────────────────────────────────────────────────────
function Estante({ posY, profundidad, pilarW, pilarD, kgEstante, mats }) {
  const { grafito, estanteSup } = mats;

  const largo     = ANCHO - pilarW * 2;
  const prof      = profundidad - pilarD * 2;
  const refuerzos = kgEstante <= 50 ? 1 : 2;

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

      {/* Refuerzos: corren de lado a lado (eje X), distribuidos en profundidad (eje Z) */}
      {Array.from({ length: refuerzos }, (_, i) => {
        const paso = prof / (refuerzos + 1);
        const z = -prof / 2 + paso * (i + 1);
        return (
          <mesh key={i} material={grafito} castShadow position={[0, -(REFUERZO_H / 2), z]}>
            <boxGeometry args={[largo, REFUERZO_H, REFUERZO_T]} />
          </mesh>
        );
      })}
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

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Estanteria3D({ config }) {
  const mats = useMats();

  const alto = config.alto / 100;
  const prof = config.profundidad / 100;
  const n    = config.estantes;

  const paranteKey = (config.parante || 'fino').toLowerCase();
  const { w: pilarW, d: pilarD } = PARANTE_DIMS[paranteKey] || PARANTE_DIMS.fino;

  const px = ANCHO / 2 - pilarW / 2;
  const pz = prof  / 2 - pilarD / 2;

  const posicionesY = useMemo(() => {
    const techo  = alto - ESTANTE_T;
    const espacio = techo / (n - 1);
    return Array.from({ length: n }, (_, i) => i * espacio);
  }, [alto, n]);

  return (
    <group>
      {/* 4 pilares */}
      <Pilar posX={-px} posZ={-pz} dirX={-1} rot={ROT_FL} alto={alto} />
      <Pilar posX={ px} posZ={-pz} dirX={ 1} rot={ROT_FR} alto={alto} />
      <Pilar posX={-px} posZ={ pz} dirX={-1} rot={ROT_BL} alto={alto} />
      <Pilar posX={ px} posZ={ pz} dirX={ 1} rot={ROT_BR} alto={alto} />

      {/* Estantes */}
      {posicionesY.map((y, i) => (
        <Estante key={i} posY={y} profundidad={prof} pilarW={pilarW} pilarD={pilarD} kgEstante={config.kgEstante} mats={mats} />
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
