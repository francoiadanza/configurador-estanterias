// app/test-estanterias/page.jsx
// Versión de prueba que replica los controles reales del configurador de Mundo Estanterías
// para que Franco pueda testear el render 3D con las opciones exactas del sitio.
"use client";

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Grid } from '@react-three/drei';
import Estanteria3D from '@/components/Estanteria3D';
import { Move3d, ChevronDown, Check } from 'lucide-react';

// ─── Helpers UI ───────────────────────────────────────────────────────────────
function SelectPill({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition cursor-pointer hover:bg-white">
          {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function ToggleCard({ label, sub, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left w-full ${
        checked ? 'border-blue-400 bg-blue-50/70 shadow-sm' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
      }`}>
      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
        checked ? 'bg-blue-500' : 'border-2 border-slate-300'
      }`}>
        {checked && <Check size={11} strokeWidth={3.5} className="text-white" />}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-slate-700 leading-tight">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </button>
  );
}

function NumberInput({ label, value, onChange, min = 0, max = 100 }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <input type="number" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition hover:bg-white" />
    </div>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Cargando…</span>
      </div>
    </Html>
  );
}

// ─── Cotas ────────────────────────────────────────────────────────────────────
function Cotas({ config }) {
  const altoM = config.alto / 100;
  const badge = "flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-slate-200 px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap select-none pointer-events-none text-[11px] font-bold text-slate-600";
  return (
    <>
      <Html position={[0, altoM + 0.14, 0]} center distanceFactor={6} zIndexRange={[10,10]}>
        <div className={badge}>↔ 90 cm</div>
      </Html>
      <Html position={[-0.65, altoM / 2, 0]} center distanceFactor={6} zIndexRange={[10,10]}>
        <div className={badge} style={{ transform: 'rotate(-90deg)' }}>↕ {config.alto} cm</div>
      </Html>
      <Html position={[0.62, altoM * 0.2, config.profundidad / 200]} center distanceFactor={6} zIndexRange={[10,10]}>
        <div className={badge}>⟵ {config.profundidad} cm</div>
      </Html>
    </>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'estanterias', label: 'Estanterías' },
  { id: 'estanrack', label: 'Estanrack' },
];

// ─── PÁGINA TEST ──────────────────────────────────────────────────────────────
export default function TestEstanterias() {
  const [tab, setTab] = useState('estanterias');

  // ─── State Estanterías (replica exacta del configurador real) ───
  const [profundidad, setProfundidad] = useState("30");
  const [peso, setPeso] = useState("50");
  const [parante, setParante] = useState("fino");
  const [altura, setAltura] = useState("200");
  const [estantes, setEstantes] = useState("5");
  const [cantidad, setCantidad] = useState("1");
  const [extraFondo, setExtraFondo] = useState(false);
  const [extraLaterales, setExtraLaterales] = useState("0");
  const [escuadraCant, setEscuadraCant] = useState("0");
  const [regatonCant, setRegatonCant] = useState("0");

  // ─── State Estanrack ───
  const [erkViga, setErkViga] = useState("120");
  const [erkProf, setErkProf] = useState("60");
  const [erkAltura, setErkAltura] = useState("200");
  const [erkTramos, setErkTramos] = useState(1);
  const [erkExtensiones, setErkExtensiones] = useState(0);
  const [erkPisoTipo, setErkPisoTipo] = useState("sin");
  const [erkPisos, setErkPisos] = useState(2);

  // ─── Config 3D derivado ───
  const config3D = tab === 'estanterias'
    ? {
        alto: parseInt(altura),
        profundidad: parseInt(profundidad),
        estantes: parseInt(estantes),
        kgEstante: parseInt(peso),
        conFondo: extraFondo,
        conLaterales: parseInt(extraLaterales) > 0,
        regatones: parseInt(regatonCant),
        parante: parante,
      }
    : {
        // Estanrack: mapeo simplificado para el componente 3D existente
        // TODO: Franco — acá hay que crear un componente Estanrack3D dedicado
        alto: parseInt(erkAltura),
        profundidad: parseInt(erkProf),
        estantes: parseInt(String(erkPisos)),
        conFondo: false,
        conLaterales: false,
        regatones: 0,
      };

  const altoM = config3D.alto / 100;

  // Parante auto-select por peso (lógica real del configurador)
  function baseParante(pesoVal) {
    const p = parseInt(pesoVal) || 50;
    if (p >= 150) return "industrial";
    if (p >= 65) return "grueso";
    return "fino";
  }

  function handlePesoChange(newPeso) {
    setPeso(newPeso);
    setParante(baseParante(newPeso));
    setAltura("200");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* TOPBAR */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', height: 56 }}
        className="flex items-center px-6 gap-3 shrink-0 z-20">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <span className="text-white text-xs font-bold">ME</span>
        </div>
        <span className="font-extrabold text-sm" style={{ color: '#0f172a', letterSpacing: '-0.3px' }}>Mundo Estanterías</span>
        <div style={{ width: 1, height: 16, background: '#e2e8f0', margin: '0 4px' }} />
        <span className="text-sm font-medium" style={{ color: '#64748b' }}>Test 3D — Datos reales del configurador</span>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3 w-full" style={{ maxWidth: 1600, margin: '0 auto' }}>

        {/* PANEL CONFIGURACIÓN */}
        <div style={{
          width: 360, minWidth: 360, background: '#fff',
          borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: tab === t.id ? '#fff' : '#f8fafc',
                  color: tab === t.id ? '#2563eb' : '#64748b',
                  borderBottom: tab === t.id ? '2px solid #2563eb' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ═══ ESTANTERÍAS ═══ */}
            {tab === 'estanterias' && (
              <>
                <section>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Dimensiones</p>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectPill label="Profundidad" value={profundidad} onChange={v => {
                      setProfundidad(v);
                      if (v === "60" && peso === "50") handlePesoChange("65");
                    }}
                      options={[{value:"30",label:'30 cm'},{value:"42",label:'42 cm'},{value:"60",label:'60 cm'}]} />
                    <SelectPill label="Altura" value={altura} onChange={v => setAltura(v)}
                      options={[
                        {value:"200",label:'200 cm'},
                        {value:"233",label:'233 cm' + (parante !== "grueso" ? ' (solo grueso)' : '')},
                      ]} />
                    <SelectPill label="Kg/estante" value={peso} onChange={v => handlePesoChange(v)}
                      options={[50,65,80,90,100,120,150].map(n=>({
                        value:String(n),
                        label:`${n} kg` + (n === 50 && profundidad === "60" ? ' (no disp.)' : '')
                      }))} />
                    <SelectPill label="Parante" value={parante} onChange={v => {
                      setParante(v);
                      if (v !== "grueso" && altura === "233") setAltura("200");
                    }}
                      options={[
                        {value:"fino",label:'Fino'},
                        {value:"grueso",label:'Grueso'},
                        {value:"industrial",label:'Industrial'},
                      ]} />
                  </div>
                </section>

                <section>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Estructura</p>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectPill label="Estantes" value={estantes} onChange={v => setEstantes(v)}
                      options={[5,6,7,8,9,10,11,12,13].map(n=>({value:String(n),label:`${n} estantes`}))} />
                    <SelectPill label="Unidades" value={cantidad} onChange={v => setCantidad(v)}
                      options={[1,2,3,4,5,6,8,10].map(n=>({value:String(n),label:`${n}`}))} />
                  </div>
                </section>

                <section>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Extras</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput label="Escuadras" value={parseInt(escuadraCant)} onChange={v => setEscuadraCant(String(v))} />
                    <NumberInput label="Regatones" value={parseInt(regatonCant)} onChange={v => setRegatonCant(String(v))} />
                  </div>
                </section>

                <section>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Accesorios</p>
                  <div className="flex flex-col gap-2">
                    <ToggleCard label="Fondo metálico" sub="Panel trasero incluido"
                      checked={extraFondo} onChange={v => setExtraFondo(v)} />
                    <ToggleCard label="Laterales metálicos" sub="Paneles laterales"
                      checked={parseInt(extraLaterales) > 0} onChange={v => setExtraLaterales(v ? "2" : "0")} />
                  </div>
                  {parseInt(extraLaterales) > 0 && (
                    <div className="mt-3">
                      <SelectPill label="Cantidad laterales" value={extraLaterales} onChange={v => setExtraLaterales(v)}
                        options={[{value:"1",label:'1 lateral'},{value:"2",label:'2 laterales'}]} />
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ═══ ESTANRACK ═══ */}
            {tab === 'estanrack' && (
              <>
                <section>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Dimensiones</p>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectPill label="Largo de viga" value={erkViga} onChange={v => setErkViga(v)}
                      options={[{value:"120",label:'120 cm'},{value:"150",label:'150 cm'},{value:"180",label:'180 cm'}]} />
                    <SelectPill label="Profundidad" value={erkProf} onChange={v => setErkProf(v)}
                      options={[{value:"60",label:'60 cm'},{value:"90",label:'90 cm'}]} />
                    <SelectPill label="Altura bastidor" value={erkAltura} onChange={v => setErkAltura(v)}
                      options={[{value:"200",label:'200 cm'},{value:"240",label:'240 cm'},{value:"300",label:'300 cm'}]} />
                    <NumberInput label="Pisos" value={erkPisos} onChange={v => setErkPisos(Math.max(2, Math.min(7, v)))} min={2} max={7} />
                  </div>
                </section>

                <section>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Módulos</p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput label="Tramos iniciales" value={erkTramos} onChange={v => setErkTramos(Math.max(1, v))} min={1} max={20} />
                    <NumberInput label="Extensiones" value={erkExtensiones} onChange={v => setErkExtensiones(Math.max(0, v))} min={0} max={20} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    Tramo = 2 bastidores + {erkPisos}×2 vigas. Extensión = 1 bastidor + {erkPisos}×2 vigas (comparte bastidor).
                  </p>
                </section>

                <section>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Tipo de piso</p>
                  <SelectPill label="Piso" value={erkPisoTipo} onChange={v => setErkPisoTipo(v)}
                    options={[
                      {value:"sin",label:'Sin piso (solo estructura)'},
                      {value:"melamina",label:'Melamina'},
                      {value:"tablilla300",label:'Tablilla 300 kg'},
                      {value:"tablilla500",label:'Tablilla 500 kg'},
                    ]} />
                </section>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-700 leading-relaxed">
                  <strong>Nota para Franco:</strong> El componente Estanteria3D actual no tiene un render específico
                  para Estanrack. Se necesita crear un <code>Estanrack3D.jsx</code> con vigas horizontales, bastidores
                  con perforaciones tipo gota, y pisos intercambiables. Mientras tanto se muestra una aproximación con
                  el modelo de estantería usando las dimensiones del estanrack.
                </div>
              </>
            )}
          </div>

          {/* Footer info */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Resumen:</strong> {tab === 'estanterias'
                ? `${cantidad}x · ${altura}×90×${profundidad}cm · ${estantes} est. · ${peso}kg · Par. ${parante}${extraFondo ? ' · Fondo' : ''}${parseInt(extraLaterales) > 0 ? ` · ${extraLaterales} lat.` : ''}`
                : `Viga ${erkViga}cm · ${erkProf}×${erkAltura}cm · ${erkPisos} pisos · ${erkTramos} tramo(s) + ${erkExtensiones} ext.`
              }
            </p>
          </div>
        </div>

        {/* VISUALIZADOR 3D */}
        <div style={{
          flex: 1, minWidth: 0, background: '#fff',
          borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
            border: '1px solid #e2e8f0', borderRadius: 999,
            padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#64748b',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', pointerEvents: 'none'
          }}>
            <Move3d size={12} /> Arrastrá para rotar · Scroll para zoom
          </div>

          {tab === 'estanrack' && (
            <div style={{
              position: 'absolute', top: 16, left: 16, zIndex: 10,
              background: 'rgba(245, 158, 11, 0.9)', backdropFilter: 'blur(8px)',
              borderRadius: 999, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#fff',
            }}>
              Estanrack (modelo aproximado — falta componente dedicado)
            </div>
          )}

          <div style={{ flex: 1, cursor: 'grab' }} className="active:cursor-grabbing">
            <Canvas
              camera={{ position: [1.8, altoM * 0.6, 2.5], fov: 42 }}
              shadows
              gl={{ antialias: true, toneMapping: 4 }}
            >
              <color attach="background" args={['#f8fafc']} />
              <fog attach="fog" args={['#f8fafc', 8, 20]} />

              <Environment preset="warehouse" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[4, 8, 4]} intensity={1.4} castShadow
                shadow-mapSize={[2048,2048]} shadow-camera-near={0.1}
                shadow-camera-far={20} shadow-camera-left={-2}
                shadow-camera-right={2} shadow-camera-top={4} shadow-camera-bottom={-0.5} />
              <directionalLight position={[-3, 5, -3]} intensity={0.4} />
              <pointLight position={[0, altoM + 1, 1]} intensity={0.3} color="#ffffff" />

              <Suspense fallback={<Loader />}>
                <group position={[0, -(altoM / 2), 0]}>
                  <Estanteria3D config={config3D} />
                  <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4}
                    blur={2} far={altoM * 1.2} color="#334155" />
                </group>

                <Grid
                  position={[0, -(altoM / 2), 0]}
                  args={[6, 6]}
                  cellSize={0.1} cellThickness={0.5} cellColor="#cbd5e1"
                  sectionSize={0.5} sectionThickness={1} sectionColor="#94a3b8"
                  fadeDistance={4} fadeStrength={1}
                  followCamera={false} infiniteGrid={false}
                />

                <Cotas config={config3D} />
              </Suspense>

              <OrbitControls
                makeDefault
                minPolarAngle={0.05}
                maxPolarAngle={Math.PI / 2 - 0.02}
                minDistance={0.8}
                maxDistance={10}
                enablePan={true}
                panSpeed={0.6}
                rotateSpeed={0.8}
                zoomSpeed={1.2}
                target={[0, 0, 0]}
              />
            </Canvas>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
            {tab === 'estanterias' ? (
              <>
                <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, margin: 0 }}>Estantería metálica</h3>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.6 }}>
                  {cantidad}x · {altura}×90×{profundidad} cm · {estantes} estantes · {peso} kg/est · Parante {parante}
                  {extraFondo ? ' · Con fondo' : ''}
                  {parseInt(extraLaterales) > 0 ? ` · ${extraLaterales} lateral(es)` : ''}
                  {parseInt(regatonCant) > 0 ? ` · ${regatonCant} regatones` : ''}
                  {parseInt(escuadraCant) > 0 ? ` · ${escuadraCant} escuadras` : ''}
                </p>
              </>
            ) : (
              <>
                <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, margin: 0 }}>Estanrack</h3>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.6 }}>
                  Viga {erkViga} cm · {erkProf}×{erkAltura} cm · {erkPisos} pisos · {erkTramos} tramo(s) + {erkExtensiones} ext.
                  {erkPisoTipo !== "sin" ? ` · Piso: ${erkPisoTipo}` : ' · Sin piso'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
