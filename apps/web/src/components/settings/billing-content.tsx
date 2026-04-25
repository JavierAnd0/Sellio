'use client';

import { useState } from 'react';
import { cn } from '@sellio/ui';
import { Check } from 'lucide-react';

export function BillingContent() {
  const [activeTab, setActiveTab] = useState('plan');
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-border/10 p-8">
      <div className="mb-8">
        <h2 className="font-display text-[28px] font-black tracking-tight text-fg mb-1">
          Facturación
        </h2>
        <p className="text-[15px] text-muted">
          Gestiona tu plan, método de pago y facturas.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex bg-[#F1EFEB] rounded-xl p-1.5 mb-10">
        <button
          onClick={() => setActiveTab('plan')}
          className={cn(
            "px-6 py-2.5 text-[15px] font-bold rounded-lg transition-all",
            activeTab === 'plan' 
              ? "bg-white text-fg shadow-sm" 
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
              ? "bg-white text-fg shadow-sm" 
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
              ? "bg-white text-fg shadow-sm" 
              : "text-muted hover:text-fg"
          )}
        >
          Facturas
        </button>
      </div>

      {activeTab === 'plan' && (
        <div>
          {/* Billing Toggle */}
          <div className="flex items-center gap-4 mb-8">
            <span className={cn("text-[15px] font-medium transition-colors", !isAnnual ? "text-fg" : "text-muted")}>
              Mensual
            </span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 rounded-full bg-[#E8341A] transition-colors focus:outline-none"
            >
              <div 
                className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-sm",
                  isAnnual ? "left-[30px]" : "left-1"
                )}
              />
            </button>
            <span className={cn("flex items-center gap-2 text-[15px] font-medium transition-colors", isAnnual ? "text-fg" : "text-muted")}>
              Anual
              <span className="bg-[#FFEFEF] text-[#E8341A] text-xs font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="rounded-3xl border-2 border-fg p-8 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xs font-black tracking-widest text-muted uppercase">Starter</h3>
                  <span className="bg-fg text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full">
                    ACTUAL
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-muted">US$</span>
                  <span className="text-[64px] font-black leading-none tracking-tighter text-fg">
                    {isAnnual ? '5' : '7'}
                  </span>
                  <span className="text-muted font-medium">/mes</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <FeatureItem text="1 tarjeta de lealtad" />
                <FeatureItem text="50 clientes activos" />
                <FeatureItem text="1 sucursal" />
                <FeatureItem text="Soporte por email" />
              </div>

              <button disabled className="w-full py-3.5 rounded-xl bg-[#F1EFEB] text-muted font-bold text-[15px] cursor-not-allowed">
                Plan actual
              </button>
            </div>

            {/* Pro */}
            <div className="rounded-3xl border border-border/20 shadow-sm p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xs font-black tracking-widest text-muted uppercase mb-4">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-muted">US$</span>
                  <span className="text-[64px] font-black leading-none tracking-tighter text-fg">
                    {isAnnual ? '18' : '23'}
                  </span>
                  <span className="text-muted font-medium">/mes</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <FeatureItem text="3 tarjetas de lealtad" />
                <FeatureItem text="500 clientes activos" />
                <FeatureItem text="3 sucursales" />
                <FeatureItem text="Analytics básico" />
                <FeatureItem text="Soporte prioritario" />
              </div>

              <button className="w-full py-3.5 rounded-xl bg-[#E8341A] hover:bg-[#D02B13] transition-colors text-white font-bold text-[15px]">
                Cambiar a Pro
              </button>
            </div>

            {/* Business */}
            <div className="rounded-3xl border border-border/20 shadow-sm p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xs font-black tracking-widest text-muted uppercase mb-4">Business</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-muted">US$</span>
                  <span className="text-[64px] font-black leading-none tracking-tighter text-fg">
                    {isAnnual ? '50' : '63'}
                  </span>
                  <span className="text-muted font-medium">/mes</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <FeatureItem text="Tarjetas ilimitadas" />
                <FeatureItem text="Clientes ilimitados" />
                <FeatureItem text="Sucursales ilimitadas" />
                <FeatureItem text="Analytics avanzado" />
                <FeatureItem text="API access" />
                <FeatureItem text="Soporte dedicado" />
              </div>

              <button className="w-full py-3.5 rounded-xl bg-[#E8341A] hover:bg-[#D02B13] transition-colors text-white font-bold text-[15px]">
                Cambiar a Business
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="py-10 text-center text-muted">
          <p>Configuración de método de pago no disponible aún.</p>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="py-10 text-center text-muted">
          <p>No tienes facturas recientes.</p>
        </div>
      )}
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5 rounded-full bg-[#FFEFEF] p-1">
        <Check size={12} strokeWidth={4} className="text-[#E8341A]" />
      </div>
      <span className="text-[15px] font-medium text-fg leading-tight">{text}</span>
    </div>
  );
}
