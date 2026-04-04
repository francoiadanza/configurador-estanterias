// app/page.js
"use client";

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, Grid } from '@react-three/drei';
import Estanteria3D from '@/components/Estanteria3D';
import {
  LayoutGrid, Package, Wrench, Ruler, Plus,
  ShoppingCart, Trash2, ChevronDown, Check, MessageCircle, Move3d
} from 'lucide-react';

// ─── Sidebar data ─────────────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: 'estanterias', label: 'Estanterías',        Icon: LayoutGrid, sub: ['Góndolas','Guardarropas','Lockers','Panel Ranurado'] },
  { id: 'racks',       label: 'Racks Industriales',  Icon: Package,    sub: [] },
  { id: 'estanrack',   label: 'Estanrack',           Icon: Wrench,     sub: [] },
  { id: 'rieles',      label: 'Rieles y Ménsulas',   Icon: Ruler,      sub: [] },
  { id: 'otros',       label: 'Otros',               Icon: Plus,       sub: [] },
];

// ─── SelectPill ───────────────────────────────────────────────────────────────
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

// ─── NumberInput ──────────────────────────────────────────────────────────────
function NumberInput({ label, value, onChange, min = 0 }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <input type="number" min={min} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition hover:bg-white" />
    </div>
  );
}

// ─── ToggleCard ───────────────────────────────────────────────────────────────
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

// ─── Cotas HTML flotantes en el espacio 3D ────────────────────────────────────
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

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function Home() {
  const [activeCat, setActiveCat]     = useState('estanterias');
  const [expandedSub, setExpandedSub] = useState(true);
  const [carrito, setCarrito]         = useState([]);

  const [config, setConfig] = useState({
    profundidad: 30, kgEstante: 50, parante: 'Fino',
    alto: 200, estantes: 9, unidades: 1,
    escuadras: 0, regatones: 0,
    conFondo: false, conLaterales: false,
  });

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }));
  const altoM = config.alto / 100;

  const agregarAlPedido = () => {
    const extras = [
      config.conFondo     && 'Fondo metálico',
      config.conLaterales && 'Laterales metálicos',
      config.escuadras > 0 && `${config.escuadras} escuadras`,
      config.regatones > 0 && `${config.regatones} regatones`,
    ].filter(Boolean);
    setCarrito(prev => [...prev, {
      id: Date.now(),
      desc:    `Estantería ${config.alto}×90×${config.profundidad} cm`,
      detalle: `${config.estantes} est · ${config.kgEstante} kg · Parante ${config.parante}`,
      extras:  extras.join(', '),
      qty:     config.unidades,
    }]);
  };

  const eliminarItem = id => setCarrito(prev => prev.filter(i => i.id !== id));
  const totalItems   = carrito.reduce((s, i) => s + i.qty, 0);

  const mensajeWA = () => {
    const lineas = carrito.map(i =>
      `• ${i.qty}x ${i.desc} (${i.detalle}${i.extras ? ` | ${i.extras}` : ''})`
    ).join('\n');
    window.open(`https://wa.me/5491100000000?text=${encodeURIComponent(`Hola! Quiero consultar por:\n${lineas}\n\nGracias!`)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── TOPBAR ── */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', height: 56 }}
        className="flex items-center px-6 gap-3 shrink-0 z-20">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
          <LayoutGrid size={14} color="white" />
        </div>
        <span className="font-extrabold text-sm" style={{ color: '#0f172a', letterSpacing: '-0.3px' }}>MetalStore</span>
        <div style={{ width: 1, height: 16, background: '#e2e8f0', margin: '0 4px' }} />
        <span className="text-sm font-medium" style={{ color: '#64748b' }}>Configurá tu producto</span>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3 w-full" style={{ maxWidth: 1800, margin: '0 auto' }}>

        {/* ── 1. SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col gap-0.5 overflow-y-auto py-1" style={{ width: 185, minWidth: 185 }}>
          {CATEGORIAS.map(({ id, label, Icon, sub }) => (
            <div key={id}>
              <button
                onClick={() => { setActiveCat(id); if (id === 'estanterias') setExpandedSub(v => !v); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                  background: activeCat === id ? '#2563eb' : 'transparent',
                  color: activeCat === id ? '#fff' : '#475569',
                  boxShadow: activeCat === id ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
                }}>
                <Icon size={16} style={{ flexShrink: 0 }} />
                {label}
              </button>
              {id === 'estanterias' && expandedSub && sub.length > 0 && (
                <div style={{ marginLeft: 12, marginTop: 2, marginBottom: 4 }} className="flex flex-col gap-0.5">
                  {sub.map(s => (
                    <button key={s} style={{
                      textAlign: 'left', padding: '6px 12px', borderRadius: 8, border: 'none',
                      background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#64748b',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* ── 2. PANEL CONFIGURACIÓN ── */}
        <div style={{
          width: 330, minWidth: 330, background: '#fff',
          borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, margin: 0 }}>Estanterías</h2>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Configurá dimensiones y accesorios</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Dimensiones */}
            <section>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Dimensiones</p>
              <div className="grid grid-cols-2 gap-3">
                <SelectPill label="Profundidad" value={config.profundidad} onChange={v => set('profundidad', Number(v))}
                  options={[{value:30,label:'30 cm'},{value:42,label:'42 cm'},{value:60,label:'60 cm'}]} />
                <SelectPill label="Altura" value={config.alto} onChange={v => set('alto', Number(v))}
                  options={[{value:200,label:'200 cm'},{value:233,label:'233 cm'}]} />
                <SelectPill label="Estantes" value={config.estantes} onChange={v => set('estantes', Number(v))}
                  options={[5,6,7,8,9,10,11,12].map(n=>({value:n,label:`${n} estantes`}))} />
                <SelectPill label="Kg / estante" value={config.kgEstante} onChange={v => set('kgEstante', Number(v))}
                  options={[{value:50,label:'50 kg'},{value:100,label:'100 kg'}]} />
              </div>
            </section>

            {/* Estructura */}
            <section>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Estructura</p>
              <div className="grid grid-cols-2 gap-3">
                <SelectPill label="Parante" value={config.parante} onChange={v => set('parante', v)} options={['Fino','Grueso']} />
                <NumberInput label="Unidades" value={config.unidades} onChange={v => set('unidades', v)} min={1} />
              </div>
            </section>

            {/* Extras */}
            <section>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Extras</p>
              <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Escuadras" value={config.escuadras} onChange={v => set('escuadras', v)} />
                <NumberInput label="Regatones" value={config.regatones} onChange={v => set('regatones', v)} />
              </div>
            </section>

            {/* Accesorios */}
            <section>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 12 }}>Accesorios</p>
              <div className="flex flex-col gap-2">
                <ToggleCard label="Fondo metálico" sub="Panel trasero incluido"
                  checked={config.conFondo} onChange={v => set('conFondo', v)} />
                <ToggleCard label="Laterales metálicos" sub="Paneles laterales incluidos"
                  checked={config.conLaterales} onChange={v => set('conLaterales', v)} />
              </div>
            </section>
          </div>

          {/* CTA */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
            <button onClick={agregarAlPedido}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff', fontWeight: 600, padding: '14px 0', borderRadius: 14,
                border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)', transition: 'all 0.15s',
              }}>
              <ShoppingCart size={16} />
              Agregar al pedido
            </button>
          </div>
        </div>

        {/* ── 3. VISUALIZADOR 3D ── */}
        <div style={{
          flex: 1, minWidth: 0, background: '#fff',
          borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
        }}>
          {/* Badge */}
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

          {/* Canvas */}
          <div style={{ flex: 1, cursor: 'grab' }} className="active:cursor-grabbing">
            <Canvas
              camera={{ position: [1.8, altoM * 0.6, 2.5], fov: 42 }}
              shadows
              gl={{ antialias: true, toneMapping: 4 /* ACESFilmic */ }}
            >
              {/* Fondo degradado suave */}
              <color attach="background" args={['#f8fafc']} />
              <fog attach="fog" args={['#f8fafc', 8, 20]} />

              {/* Iluminación */}
              <Environment preset="warehouse" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[4, 8, 4]} intensity={1.4} castShadow
                shadow-mapSize={[2048,2048]} shadow-camera-near={0.1}
                shadow-camera-far={20} shadow-camera-left={-2}
                shadow-camera-right={2} shadow-camera-top={4} shadow-camera-bottom={-0.5} />
              <directionalLight position={[-3, 5, -3]} intensity={0.4} />
              <pointLight position={[0, altoM + 1, 1]} intensity={0.3} color="#ffffff" />

              <Suspense fallback={<Loader />}>
                {/* Modelo centrado verticalmente */}
                <group position={[0, -(altoM / 2), 0]}>
                  <Estanteria3D config={config} />
                  <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4}
                    blur={2} far={altoM * 1.2} color="#334155" />
                </group>

                {/* Piso con grid sutil */}
                <Grid
                  position={[0, -(altoM / 2), 0]}
                  args={[6, 6]}
                  cellSize={0.1}
                  cellThickness={0.5}
                  cellColor="#cbd5e1"
                  sectionSize={0.5}
                  sectionThickness={1}
                  sectionColor="#94a3b8"
                  fadeDistance={4}
                  fadeStrength={1}
                  followCamera={false}
                  infiniteGrid={false}
                />

                {/* Cotas */}
                <Cotas config={config} />
              </Suspense>

              {/* OrbitControls libre — solo limitamos que no pase el suelo */}
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

          {/* Ficha descriptiva */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
            <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, margin: 0 }}>Estantería metálica</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.6 }}>
              {config.unidades}x · {config.alto}×90×{config.profundidad} cm · {config.estantes} estantes · {config.kgEstante} kg/est · Parante {config.parante}
              {config.conFondo     ? ' · Con fondo' : ''}
              {config.conLaterales ? ' · Con laterales' : ''}
              {config.regatones > 0 ? ` · ${config.regatones} regatones` : ''}
              {config.escuadras > 0 ? ` · ${config.escuadras} escuadras` : ''}
            </p>
            <a href="#" style={{ color: '#2563eb', fontSize: 11, fontWeight: 500, marginTop: 6, display: 'inline-block', textDecoration: 'none' }}>
              ¿Necesitás medidas a medida? Consultanos →
            </a>
          </div>
        </div>

        {/* ── 4. CARRITO ── */}
        <div className="hidden xl:flex" style={{
          width: 265, minWidth: 265, background: '#fff',
          borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, fontSize: 14 }}>
              <ShoppingCart size={15} /> Pedido
            </div>
            {totalItems > 0 && (
              <span style={{
                background: '#f59e0b', color: '#fff', fontSize: 11,
                fontWeight: 700, padding: '2px 8px', borderRadius: 999
              }}>{totalItems}</span>
            )}
          </div>

          {/* Items */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {carrito.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 24, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <ShoppingCart size={20} color="#cbd5e1" />
                </div>
                <p style={{ fontWeight: 600, color: '#475569', fontSize: 13, margin: 0 }}>Carrito vacío</p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Configurá y agregá productos</p>
              </div>
            ) : (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {carrito.map(item => (
                  <div key={item.id} style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
                    padding: 12, display: 'flex', gap: 8, alignItems: 'flex-start'
                  }}
                    className="group">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', margin: 0 }}>{item.qty}× {item.desc}</p>
                      <p style={{ fontSize: 11, color: '#64748b', marginTop: 3, lineHeight: 1.4 }}>{item.detalle}</p>
                      {item.extras && <p style={{ fontSize: 10, color: '#3b82f6', marginTop: 3 }}>{item.extras}</p>}
                    </div>
                    <button onClick={() => eliminarItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', flexShrink: 0, padding: 2 }}
                      className="hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: 16, borderTop: '1px solid #f1f5f9' }}>
            <button onClick={mensajeWA} disabled={carrito.length === 0}
              style={{
                width: '100%', background: '#25D366', color: '#fff',
                fontWeight: 600, padding: '12px 0', borderRadius: 14, border: 'none',
                cursor: carrito.length === 0 ? 'not-allowed' : 'pointer',
                opacity: carrito.length === 0 ? 0.4 : 1,
                fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 12px rgba(37,211,102,0.25)', transition: 'all 0.15s'
              }}>
              <MessageCircle size={16} />
              Enviar por WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
