'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, CreditCard, Users, Zap, CheckCircle2, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface DashboardTourProps {
  orgName: string;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export function DashboardTour({ orgName }: DashboardTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Confetti particles state
  const [particles, setParticles] = useState<Particle[]>([]);

  // Simulation States for each step
  const [activeMiniTab, setActiveMiniTab] = useState<'tarjetas' | 'clientes' | 'settings'>('tarjetas');
  const [miniCardColor, setMiniCardColor] = useState('#E8341A');
  const [simulatedVisits, setSimulatedVisits] = useState(0);
  const [simulatedPoints, setSimulatedPoints] = useState(0);
  const [checklistSecondCheck, setChecklistSecondCheck] = useState(false);
  const [simulatedActivities, setSimulatedActivities] = useState<string[]>([]);
  
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Confetti Trigger helper
  const triggerConfetti = () => {
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: Math.random() + i,
      x: Math.random() * 80 + 10, // keep inside bounds
      y: Math.random() * -10 - 5,
      color: ['#E8341A', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 6)]!,
      size: Math.random() * 10 + 6,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1800);
  };

  // Steps configuration
  const steps = [
    {
      title: `¡Te damos la bienvenida, ${orgName}! 👋`,
      subtitle: 'Comienza hoy a fidelizar clientes',
      description: 'Queremos ayudarte a lanzar tu programa de lealtad en menos de 5 minutos. Haz clic en "Probar Confeti" para celebrar tu registro o en "Siguiente" para conocer el panel.',
      icon: <Sparkles size={24} className="text-[#E8341A]" />,
      selector: null,
      illustration: (
        <div className="flex h-32 w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF5F4] to-[#FDF0EE] dark:from-[#22100A] dark:to-[#1A0A05] border border-coral/10 p-3 gap-2">
          <div className="text-center">
            <div className="font-display text-2xl font-black text-[#E8341A] tracking-wider mb-0.5">Sellio.co</div>
            <div className="text-[9px] text-muted font-bold tracking-widest uppercase">Tu marca. Tus clientes.</div>
          </div>
          <button
            onClick={triggerConfetti}
            className="rounded-lg bg-[#E8341A] hover:bg-[#D02B13] text-white text-[10px] font-bold px-3 py-1.5 transition-all active:scale-95 shadow-sm mt-1"
          >
            🎉 Probar Confeti
          </button>
        </div>
      ),
    },
    {
      title: '📁 Menú de Navegación',
      subtitle: 'Acceso a todas las funciones',
      description: 'Interactúa con el menú simulado abajo para ver qué se muestra en cada pantalla sin salir de esta guía interactiva.',
      icon: <Users size={24} className="text-[#E8341A]" />,
      selector: '#tour-sidebar',
      illustration: (
        <div className="flex h-32 w-full border border-border/10 rounded-2xl overflow-hidden bg-surface-2/40">
          {/* Mini Sidebar */}
          <div className="w-1/3 border-r border-border/10 bg-surface p-2 flex flex-col gap-1">
            <div className="text-[7px] font-bold uppercase tracking-wider text-muted/60 px-1 mb-1">Menú</div>
            {(['tarjetas', 'clientes', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveMiniTab(tab);
                  triggerConfetti();
                }}
                className={[
                  'text-left text-[9px] font-bold px-2 py-1 rounded transition-colors',
                  activeMiniTab === tab 
                    ? 'bg-[#E8341A]/10 text-[#E8341A]' 
                    : 'text-muted hover:bg-surface-2'
                ].join(' ')}
              >
                {tab === 'tarjetas' && '🎴 Tarjetas'}
                {tab === 'clientes' && '👥 Clientes'}
                {tab === 'settings' && '⚙️ Config.'}
              </button>
            ))}
          </div>
          {/* Mini Screen Content */}
          <div className="flex-1 p-2 bg-surface-2/20 flex flex-col justify-center items-center text-center">
            {activeMiniTab === 'tarjetas' && (
              <div className="animate-fade-in flex flex-col items-center">
                <span className="text-xs">🎴</span>
                <div className="text-[9px] font-black text-fg mt-0.5">Mis Tarjetas</div>
                <div className="text-[8px] text-muted">1 tarjeta activa</div>
              </div>
            )}
            {activeMiniTab === 'clientes' && (
              <div className="animate-fade-in flex flex-col items-center w-full px-1">
                <span className="text-xs">👥</span>
                <div className="text-[9px] font-black text-fg mt-0.5">Clientes Registrados</div>
                <table className="w-full text-[7px] text-muted mt-1 border-t border-border/10">
                  <tbody>
                    <tr className="border-b border-border/10"><td className="py-0.5 text-left font-bold text-fg">Juan Pérez</td><td className="text-right">4 pts</td></tr>
                    <tr><td className="py-0.5 text-left font-bold text-fg">Ana Gómez</td><td className="text-right">8 pts</td></tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeMiniTab === 'settings' && (
              <div className="animate-fade-in flex flex-col items-center">
                <span className="text-xs">⚙️</span>
                <div className="text-[9px] font-black text-fg mt-0.5">Ajustes Generales</div>
                <div className="text-[8px] text-muted">Habeas Data: Activo</div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '🎨 Tu Tarjeta Digital',
      subtitle: 'Diseña la tarjeta de puntos',
      description: 'Elige un color para tu tarjeta digital en los círculos de abajo para ver cómo cambia la personalización de tu marca.',
      icon: <CreditCard size={24} className="text-[#E8341A]" />,
      selector: '#tour-card-banner',
      illustration: (
        <div className="flex h-32 w-full flex-col items-center justify-center rounded-2xl bg-[#EAE7DF]/30 dark:bg-surface-2/40 border border-border/10 p-3 gap-2">
          {/* Card Preview */}
          <div
            className="w-48 h-20 rounded-xl p-2.5 flex flex-col justify-between shadow-lg relative overflow-hidden transition-colors duration-500 text-white"
            style={{ backgroundColor: miniCardColor }}
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-4 -mt-4" />
            <div>
              <div className="text-[6px] font-bold uppercase tracking-widest opacity-80">{orgName}</div>
              <div className="text-[9px] font-extrabold tracking-tight mt-0.5">Tarjeta de Puntos</div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[8px] opacity-90">⭐⭐⭐⭐⭐</span>
              <span className="text-[9px] font-black tabular-nums">0 / 10 pts</span>
            </div>
          </div>
          {/* Colors Selector */}
          <div className="flex gap-2">
            {['#E8341A', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'].map((color) => (
              <button
                key={color}
                onClick={() => {
                  setMiniCardColor(color);
                  triggerConfetti();
                }}
                className={[
                  'w-5.5 h-5.5 rounded-full border-2 transition-all active:scale-90',
                  miniCardColor === color ? 'border-fg scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                ].join(' ')}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '📊 Indicadores Clave',
      subtitle: 'Estadísticas del negocio',
      description: 'Haz clic en "Simular visita" para observar cómo se incrementan las métricas y los puntos acumulados al instante.',
      icon: <Zap size={24} className="text-[#E8341A]" />,
      selector: '#tour-stats',
      illustration: (
        <div className="flex h-32 w-full flex-col justify-between rounded-2xl bg-[#EAE7DF]/30 dark:bg-surface-2/40 border border-border/10 p-3 gap-2">
          {/* Stats board */}
          <div className="flex gap-3 flex-1 items-center justify-center">
            <div className="flex flex-col items-center p-1.5 bg-surface border border-border/10 rounded-xl shadow-sm text-center flex-1">
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">Clientes</span>
              <span className="text-sm font-black text-fg">12</span>
            </div>
            <div className="flex flex-col items-center p-1.5 bg-surface border border-border/10 rounded-xl shadow-sm text-center flex-1">
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">Puntos</span>
              <span className="text-sm font-black text-[#E8341A]">{120 + simulatedPoints}</span>
            </div>
            <div className="flex flex-col items-center p-1.5 bg-surface border border-border/10 rounded-xl shadow-sm text-center flex-1">
              <span className="text-[8px] font-bold text-muted uppercase tracking-wider">Visitas</span>
              <span className="text-sm font-black text-fg">{simulatedVisits}</span>
            </div>
          </div>
          {/* Action Trigger */}
          <button
            onClick={() => {
              setSimulatedVisits((v) => v + 1);
              setSimulatedPoints((p) => p + 10);
              triggerConfetti();
            }}
            className="w-full rounded-xl bg-[#E8341A]/10 border border-[#E8341A]/20 hover:bg-[#E8341A]/20 text-[#E8341A] font-bold text-[10px] py-1.5 transition-all active:scale-95"
          >
            ➕ Simular visita de cliente (+10 pts)
          </button>
        </div>
      ),
    },
    {
      title: '📋 Guía de Primeros Pasos',
      subtitle: 'Tu lista de tareas pendientes',
      description: 'Haz clic en el botón de abajo para simular que completas el primer escaneo de prueba y ver cómo avanza tu progreso.',
      icon: <CheckCircle2 size={24} className="text-[#E8341A]" />,
      selector: '#tour-checklist',
      illustration: (
        <div className="flex h-32 w-full flex-col justify-between rounded-2xl bg-[#EAE7DF]/30 dark:bg-surface-2/40 border border-border/10 p-3 gap-2">
          {/* Checklist progress */}
          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[9px] font-bold text-muted">
              <span>Progreso Onboarding</span>
              <span className="text-[#E8341A] font-black">{checklistSecondCheck ? '100%' : '50%'}</span>
            </div>
            <div className="h-2 w-full bg-border/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#E8341A] rounded-full transition-all duration-500"
                style={{ width: checklistSecondCheck ? '100%' : '50%' }}
              />
            </div>
            <div className="flex flex-col gap-1 mt-1 text-[9px] font-semibold text-fg">
              <div className="flex items-center gap-1.5 text-muted/60 line-through">
                <span className="text-emerald-500 text-[10px]">✓</span> Crear tarjeta de lealtad
              </div>
              <div className={checklistSecondCheck ? 'flex items-center gap-1.5 text-muted/60 line-through' : 'flex items-center gap-1.5'}>
                <span className={checklistSecondCheck ? 'text-emerald-500 text-[10px]' : 'text-muted/40 text-[10px]'}>
                  {checklistSecondCheck ? '✓' : '○'}
                </span>
                Hacer primer check-in de prueba
              </div>
            </div>
          </div>
          {/* Action Trigger */}
          <button
            onClick={() => {
              setChecklistSecondCheck((c) => !c);
              triggerConfetti();
            }}
            className="w-full rounded-xl bg-[#E8341A] hover:bg-[#D02B13] text-white font-bold text-[10px] py-1.5 transition-all active:scale-95 shadow-sm"
          >
            {checklistSecondCheck ? '🔄 Reiniciar checklist' : '🎯 Completar tarea de prueba'}
          </button>
        </div>
      ),
    },
    {
      title: '⚡ Actividad en Tiempo Real',
      subtitle: 'Eventos de tus clientes',
      description: 'Haz clic en "Simular escaneo" para simular la llegada en vivo de clientes escaneando el código QR de tu local.',
      icon: <Sparkles size={24} className="text-[#E8341A]" />,
      selector: '#tour-activity',
      illustration: (
        <div className="flex h-32 w-full flex-col justify-between rounded-2xl bg-[#EAE7DF]/30 dark:bg-surface-2/40 border border-border/10 p-3 gap-2">
          {/* Activity List */}
          <div className="flex-1 flex flex-col justify-center gap-1.5 overflow-hidden">
            {simulatedActivities.length === 0 ? (
              <div className="text-center text-[9px] text-muted py-2 font-medium italic">Sin actividad simulada aún</div>
            ) : (
              simulatedActivities.map((act, idx) => (
                <div 
                  key={idx} 
                  className="animate-slide-in-right flex items-center gap-2 bg-surface px-2 py-1 rounded-lg border border-border/10 shadow-sm text-[8px] font-bold text-fg truncate"
                >
                  {act}
                </div>
              ))
            )}
          </div>
          {/* Action Trigger */}
          <button
            onClick={() => {
              const names = ['Carlos Gómez', 'Sofía Restrepo', 'Daniela Tobón', 'Mateo Henao', 'Laura Ospina'];
              const name = names[Math.floor(Math.random() * names.length)]!;
              const pts = [1, 2, 5][Math.floor(Math.random() * 3)]!;
              const time = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              setSimulatedActivities((prev) => [
                `🔔 ${name} sumó +${pts} pt${pts > 1 ? 's' : ''} a las ${time}`,
                ...prev.slice(0, 1) // keep max 2 items in history
              ]);
              triggerConfetti();
            }}
            className="w-full rounded-xl bg-[#E8341A]/10 border border-[#E8341A]/20 hover:bg-[#E8341A]/20 text-[#E8341A] font-bold text-[10px] py-1.5 transition-all active:scale-95"
          >
            📲 Simular escaneo QR de cliente
          </button>
        </div>
      ),
    },
  ];

  // Auto trigger if not completed previously
  useEffect(() => {
    const completed = localStorage.getItem('sellio-tour-completed');
    let timer: NodeJS.Timeout;
    if (completed !== 'true') {
      timer = setTimeout(() => setIsOpen(true), 1200);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Listen to manual triggers
  useEffect(() => {
    const handleStartTour = () => {
      setStep(0);
      setIsOpen(true);
    };
    window.addEventListener('start-sellio-tour', handleStartTour);
    return () => window.removeEventListener('start-sellio-tour', handleStartTour);
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll to element & measure bounding box
  useEffect(() => {
    if (!isOpen) return;

    let cleanup: (() => void) | undefined = undefined;
    const currentStep = steps[step];

    if (currentStep && currentStep.selector) {
      const element = document.querySelector(currentStep.selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const measure = () => {
          const rect = element.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,
          });
        };

        // Measure immediately and in increments during animation
        measure();
        const t1 = setTimeout(measure, 150);
        const t2 = setTimeout(measure, 350);
        const t3 = setTimeout(measure, 500);

        cleanup = () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }

    return cleanup;
  }, [step, isOpen]);

  // Recalculate target positions on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      const currentStep = steps[step];
      if (currentStep && currentStep.selector) {
        const element = document.querySelector(currentStep.selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,
          });
        }
      }
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [step, isOpen]);

  if (!isOpen) return null;

  const currentStep = steps[step] ?? steps[0]!;

  const handleClose = () => {
    localStorage.setItem('sellio-tour-completed', 'true');
    setIsOpen(false);
  };

  return (
    <>
      {/* Embedded CSS styles for dynamic custom animations */}
      <style>{`
        @keyframes tour-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(240px) rotate(720deg) scale(0.4); opacity: 0; }
        }
        .animate-tour-fall {
          animation: tour-fall 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>

      {/* Click blocker backdrop layer */}
      <div 
        className="fixed inset-0 z-30 cursor-default pointer-events-auto" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }} 
      />

      {/* High-fidelity Vector SVG Mask for Spotlight (Hardware-accelerated, crisp on all zooms) */}
      {targetRect && (
        <svg className="fixed inset-0 w-full h-full z-40 pointer-events-none transition-all duration-300">
          <defs>
            <mask id="tour-spotlight-mask">
              {/* White background: preserves backdrop visibility */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black rounded rect: punches a clean hole in the backdrop */}
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="16"
                ry="16"
                fill="black"
                className="transition-all duration-300"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(13, 11, 9, 0.72)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>
      )}

      {/* Vector border outline on top of SVG mask */}
      {targetRect && (
        <div
          className="fixed z-[42] rounded-2xl border-4 border-[#E8341A] transition-all duration-300 pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Centered Backdrop (only for step 1 / Welcome modal which has no target selector) */}
      {!targetRect && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300" />
      )}

      {/* Corner-docked non-overlapping Tooltip Card */}
      <div
        ref={tooltipRef}
        className={[
          'z-50 bg-surface border border-border/40 shadow-2xl flex flex-col transition-all duration-300 ease-out relative overflow-hidden',
          isMobile
            ? 'fixed inset-x-4 bottom-4 w-auto rounded-3xl' // Mobile bottom sheet
            : !targetRect
              ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] rounded-3xl' // Welcome card centered
              : currentStep.selector === '#tour-activity'
                ? 'fixed left-[284px] bottom-6 w-[380px] rounded-3xl' // Docked next to sidebar when highlighting activity
                : 'fixed right-6 bottom-6 w-[380px] rounded-3xl', // Default bottom-right corner docking
        ].join(' ')}
      >
        {/* Confetti Particles Container */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-tour-fall"
              style={{
                left: `${p.x}%`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.id % 2 === 0 ? '50%' : '2px',
                transform: `rotate(${p.id * 30}deg)`,
              }}
            />
          ))}
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-coral/10 dark:bg-coral/5 border border-coral/10 text-[#E8341A]">
              {currentStep.icon}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#E8341A]">
                Guía Interactiva
              </p>
              <h3 className="text-[11px] font-bold text-muted leading-none mt-0.5">
                Paso {step + 1} de {steps.length}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-border/20 text-muted transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-3 flex flex-col gap-4">
          <div>
            <h2 className="font-display text-lg font-black text-fg tracking-tight leading-tight">
              {currentStep.title}
            </h2>
            {currentStep.subtitle && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mt-0.5">
                {currentStep.subtitle}
              </p>
            )}
          </div>

          {/* Interactive Simulator Area */}
          <div className="relative z-10">
            {currentStep.illustration}
          </div>

          <p className="text-[13px] text-muted leading-relaxed font-medium">
            {currentStep.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="border-t border-border/10 mt-2 px-6 py-4 flex items-center justify-between bg-surface-2/20 rounded-b-3xl">
          <button
            onClick={handleClose}
            className="text-[11px] font-bold uppercase tracking-wider text-muted hover:text-fg transition-colors"
          >
            Omitir
          </button>
          
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-2.5 rounded-xl border border-border/40 hover:bg-border/15 text-fg transition-all"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-[#E8341A] hover:bg-[#D02B13] px-4 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-coral/10 transition-all active:scale-95"
              >
                Siguiente <ChevronRight size={12} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="rounded-xl bg-[#E8341A] hover:bg-[#D02B13] px-5 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-coral/10 transition-all active:scale-95"
              >
                ¡Listo, comenzar!
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
