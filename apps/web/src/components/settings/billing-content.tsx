'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, cn } from '@sellio/ui';
import { Check, Loader2 } from 'lucide-react';

import { createCheckoutSessionAction } from '@/actions/billing/billing.actions';

interface BillingContentProps {
  currentPlan: string;
}

export function BillingContent({ currentPlan }: BillingContentProps) {
  const [activeTab, setActiveTab] = useState('plan');
  const [loadingPlan, setLoadingPlan] = useState<'basic' | 'elite' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const sessionSuccess = searchParams.get('session') === 'success';
  const sessionCancel = searchParams.get('session') === 'cancel';
  const isExpired = searchParams.get('expired') === 'true';

  const handleUpgrade = async (planId: 'basic' | 'elite') => {
    setLoadingPlan(planId);
    setError(null);

    try {
      const result = await createCheckoutSessionAction(planId);
      if (result.ok) {
        window.location.href = result.url;
      } else {
        setError(result.error);
        setLoadingPlan(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar el checkout de Wompi.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="rounded-2xl bg-surface shadow-sm border border-border/10 p-8">
      <div className="mb-8">
        <h2 className="font-display text-[28px] font-black tracking-tight text-fg mb-1">
          Facturación
        </h2>
        <p className="text-[15px] text-muted">
          Gestiona tu plan, método de pago y facturas.
        </p>
      </div>

      {sessionSuccess && (
        <Alert variant="success" className="mb-6">
          ¡Pago realizado con éxito! Tu suscripción se actualizará en unos instantes.
        </Alert>
      )}

      {sessionCancel && (
        <Alert variant="error" className="mb-6">
          El proceso de pago fue cancelado. No se realizaron cobros.
        </Alert>
      )}

      {isExpired && (
        <Alert variant="error" className="mb-6">
          Tu periodo de prueba ha expirado. Por favor, selecciona un plan para continuar usando Sellio.
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <div className="inline-flex bg-surface-2 rounded-xl p-1.5 mb-10">
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            "px-6 py-2.5 text-[15px] font-bold rounded-lg transition-all",
            activeTab === 'plan' 
              ? "bg-surface text-fg shadow-sm"
              : "text-muted hover:text-fg"
          )}
        >
          Plan
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={cn(
            "px-6 py-2.5 text-[15px] font-bold rounded-lg transition-all",
            activeTab === 'payment' 
              ? "bg-surface text-fg shadow-sm"
              : "text-muted hover:text-fg"
          )}
        >
          Método de pago
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={cn(
            "px-6 py-2.5 text-[15px] font-bold rounded-lg transition-all",
            activeTab === 'invoices' 
              ? "bg-surface text-fg shadow-sm"
              : "text-muted hover:text-fg"
          )}
        >
          Facturas
        </button>
      </div>

      {activeTab === 'plan' && (
        <div>
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter (Free) */}
            <div className={cn(
              "rounded-3xl border p-8 flex flex-col transition-all",
              currentPlan === 'free' ? "border-2 border-fg shadow-md bg-surface" : "border-border/20 shadow-sm"
            )}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs font-black tracking-widest text-muted uppercase">Gratuito</h3>
                  {currentPlan === 'free' && (
                    <span className="bg-fg text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full">
                      ACTUAL
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-muted">$</span>
                  <span className="text-[52px] font-black leading-none tracking-tighter text-fg">
                    0
                  </span>
                  <span className="text-muted font-medium">/mes</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <FeatureItem text="1 tarjeta de lealtad activa" />
                <FeatureItem text="Hasta 50 clientes registrados" />
                <FeatureItem text="1 sucursal de negocio" />
                <FeatureItem text="Soporte básico por correo" />
              </div>

              <button disabled className="w-full py-3.5 rounded-xl bg-surface-2 text-muted font-bold text-[15px] cursor-not-allowed">
                {currentPlan === 'free' ? 'Plan actual' : 'Incluido'}
              </button>
            </div>

            {/* Basic (Pro) */}
            <div className={cn(
              "rounded-3xl border p-8 flex flex-col transition-all",
              currentPlan === 'basic' ? "border-2 border-fg shadow-md bg-surface" : "border-border/20 shadow-sm"
            )}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs font-black tracking-widest text-muted uppercase">Basic</h3>
                  {currentPlan === 'basic' && (
                    <span className="bg-fg text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full">
                      ACTUAL
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-muted">$</span>
                  <span className="text-[52px] font-black leading-none tracking-tighter text-fg">
                    35.000
                  </span>
                  <span className="text-muted font-medium">/mes</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <FeatureItem text="3 tarjetas de lealtad activas" />
                <FeatureItem text="Hasta 500 clientes registrados" />
                <FeatureItem text="3 sucursales de negocio" />
                <FeatureItem text="Analytics del dashboard básico" />
                <FeatureItem text="Soporte por correo prioritario" />
              </div>

              <button 
                onClick={() => handleUpgrade('basic')}
                disabled={currentPlan === 'basic' || loadingPlan !== null}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all",
                  currentPlan === 'basic'
                    ? "bg-surface-2 text-muted cursor-not-allowed"
                    : "bg-[#E8341A] hover:bg-[#D02B13] text-white active:scale-[0.98]"
                )}
              >
                {loadingPlan === 'basic' && <Loader2 size={16} className="animate-spin" />}
                {currentPlan === 'basic' ? 'Plan actual' : 'Pagar con Wompi'}
              </button>
            </div>

            {/* Elite (Business) */}
            <div className={cn(
              "rounded-3xl border p-8 flex flex-col transition-all",
              currentPlan === 'elite' ? "border-2 border-fg shadow-md bg-surface" : "border-border/20 shadow-sm"
            )}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs font-black tracking-widest text-muted uppercase">Elite</h3>
                  {currentPlan === 'elite' && (
                    <span className="bg-fg text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full">
                      ACTUAL
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-muted">$</span>
                  <span className="text-[52px] font-black leading-none tracking-tighter text-fg">
                    95.000
                  </span>
                  <span className="text-muted font-medium">/mes</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <FeatureItem text="Tarjetas de lealtad ilimitadas" />
                <FeatureItem text="Clientes registrados ilimitados" />
                <FeatureItem text="Sucursales de negocio ilimitadas" />
                <FeatureItem text="Analytics avanzado en tiempo real" />
                <FeatureItem text="Acceso a la API pública de Sellio" />
                <FeatureItem text="Soporte dedicado 24/7" />
              </div>

              <button 
                onClick={() => handleUpgrade('elite')}
                disabled={currentPlan === 'elite' || loadingPlan !== null}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all",
                  currentPlan === 'elite'
                    ? "bg-surface-2 text-muted cursor-not-allowed"
                    : "bg-[#E8341A] hover:bg-[#D02B13] text-white active:scale-[0.98]"
                )}
              >
                {loadingPlan === 'elite' && <Loader2 size={16} className="animate-spin" />}
                {currentPlan === 'elite' ? 'Plan actual' : 'Pagar con Wompi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="py-10 text-center text-muted">
          <p>Configuración de método de pago automático administrado directamente por Wompi al realizar tu pago.</p>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="py-10 text-center text-muted">
          <p>No tienes facturas generadas. Tus facturas se mostrarán aquí una vez realices tu primer pago.</p>
        </div>
      )}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 rounded-full bg-coral/10 p-1">
        <Check size={12} strokeWidth={4} className="text-[#E8341A]" />
      </div>
      <span className="text-[15px] font-medium text-fg leading-tight">{text}</span>
    </div>
  );
}
