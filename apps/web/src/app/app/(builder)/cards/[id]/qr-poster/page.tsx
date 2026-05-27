import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import QRCode from 'qrcode';

import { PosterActionBar } from '@/components/cards/poster-action-bar';

import { createClient } from '@sellio/db/server';
import {
  SupabaseCardRepository,
  SupabaseOrganizationRepository,
} from '@sellio/db/repositories';

interface QRPosterPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Flyer QR de Tarjeta · Sellio',
  description: 'Imprime el póster QR para que tus clientes se registren y acumulen puntos.',
};

export default async function QRPosterPage({ params }: QRPosterPageProps) {
  const { id } = await params;

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) redirect('/login');

  const [org, card] = await Promise.all([
    new SupabaseOrganizationRepository().findByOwner(user.id),
    new SupabaseCardRepository().findById(id),
  ]);

  if (!org) redirect('/app/dashboard');
  if (!card || card.orgId !== org.id) notFound();

  // Cards app URL for QR scan destination
  const cardsBaseUrl = process.env.NEXT_PUBLIC_CARDS_URL || 'http://localhost:3001';
  const checkInUrl = `${cardsBaseUrl}/check-in/${org.slug}`;

  // Get primary color
  const cardDesign = (card.design ?? {}) as Record<string, unknown>;
  const primaryColor = String(cardDesign.primaryColor || org.primaryColor || '#E8341A');

  // Generate high quality QR code as a Data URL with matching brand color blocks
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: primaryColor, // Custom brand-colored QR code
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Error generating QR code for poster:', err);
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0A0A0A] font-sans antialiased pb-16 print:bg-white print:pb-0">
      
      {/* Action Bar (Hidden on print) */}
      <PosterActionBar cardId={id} qrCodeDataUrl={qrCodeDataUrl} orgSlug={org.slug} />

      {/* Poster Container */}
      <div className="max-w-xl mx-auto mt-6 px-4 print:mt-0 print:px-0">
        
        {/* Printable Poster */}
        <div 
          className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.07)] print:shadow-none print:border-none flex flex-col items-center relative aspect-[1/1.414] w-full"
          style={{ borderColor: `${primaryColor}15` }}
        >
          {/* Top Colored Header Block */}
          <div 
            className="w-full pt-12 pb-14 px-8 flex flex-col items-center justify-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}F0, ${primaryColor})`,
            }}
          >
            {/* Subtle background circles for premium graphic layout */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
              <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-white blur-3xl animate-pulse" />
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-black blur-3xl" />
            </div>

            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white bg-white/15 border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-md mb-3 shadow-inner">
              Programa de Lealtad
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight max-w-md drop-shadow-sm">
              {card.name}
            </h1>
            <p className="text-[10px] font-black tracking-[0.2em] text-white/70 uppercase mt-2">
              {org.name}
            </p>
          </div>

          {/* Floating Logo Badge */}
          <div className="relative -mt-8 z-10">
            {org.logoUrl ? (
              <img 
                src={org.logoUrl} 
                alt={org.name} 
                className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center font-display font-black text-xl text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                style={{ backgroundColor: primaryColor }}
              >
                {org.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* Body Content Block */}
          <div className="flex-1 w-full flex flex-col items-center px-10 py-6 justify-between">
            
            {/* QR Code Container */}
            <div className="flex flex-col items-center my-auto">
              <div 
                className="relative p-5 rounded-[36px] bg-white border flex items-center justify-center transition-transform hover:scale-105 duration-500 shadow-[0_16px_48px_rgba(0,0,0,0.04)]"
                style={{ 
                  borderColor: `${primaryColor}20`,
                  boxShadow: `0 20px 60px ${primaryColor}10`
                }}
              >
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Código QR de Check-in" 
                    className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-2xl"
                  />
                ) : (
                  <div className="w-52 h-52 sm:w-60 sm:h-60 bg-gray-50 animate-pulse rounded-2xl" />
                )}

                {/* Center overlay brand icon (Razor sharp branding) */}
                <div className="absolute w-11 h-11 bg-white rounded-xl border-2 border-white shadow-md flex items-center justify-center p-0.5 overflow-hidden">
                  <div 
                    className="w-full h-full rounded-lg flex items-center justify-center font-display font-black text-white text-[11px]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    S
                  </div>
                </div>
              </div>

              {/* Status pulse badge */}
              <div className="mt-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-100 shadow-inner">
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.18em]">Escanea para acumular visitas</span>
              </div>
            </div>

            {/* Instruction Columns */}
            <div className="w-full border-t border-gray-100 pt-6 grid grid-cols-3 gap-3">
              {/* Column 1 */}
              <div 
                className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center"
                style={{ backgroundColor: `${primaryColor}06` }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  1
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Escanea</span>
                  <span className="text-[9px] text-gray-400 font-medium block leading-tight mt-0.5">Apunta tu cámara al QR</span>
                </div>
              </div>
              
              {/* Column 2 */}
              <div 
                className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center"
                style={{ backgroundColor: `${primaryColor}06` }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  2
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Regístrate</span>
                  <span className="text-[9px] text-gray-400 font-medium block leading-tight mt-0.5">Completa tus datos</span>
                </div>
              </div>

              {/* Column 3 */}
              <div 
                className="flex flex-col items-center gap-2 p-3 rounded-2xl text-center"
                style={{ backgroundColor: `${primaryColor}06` }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  3
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Gana</span>
                  <span className="text-[9px] text-gray-400 font-medium block leading-tight mt-0.5">{card.rewardDescription}</span>
                </div>
              </div>
            </div>

            {/* Watermark branded label */}
            <div className="mt-4 flex items-center gap-1.5 text-[8px] font-bold tracking-[0.25em] text-gray-300 uppercase">
              <span>Powered by</span>
              <span className="text-gray-400 font-black">Sellio.co</span>
            </div>
          </div>
        </div>

      </div>

      {/* Global CSS overrides for page prints */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          /* Hide default headers/footers in browsers */
          @page {
            margin: 0;
            size: auto;
          }
          /* Ensure content layout covers full A4/A5 space */
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:mt-0 {
            margin-top: 0 !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
        }
      `}} />
    </div>
  );
}
