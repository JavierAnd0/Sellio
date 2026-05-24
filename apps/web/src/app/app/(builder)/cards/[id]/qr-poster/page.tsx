import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import QRCode from 'qrcode';

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

  // Generate high quality QR code as a Data URL
  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: '#0A0A0A',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('Error generating QR code for poster:', err);
  }

  // Get primary color
  const cardDesign = (card.design ?? {}) as Record<string, unknown>;
  const primaryColor = String(cardDesign.primaryColor || org.primaryColor || '#E8341A');

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0A0A0A] font-sans antialiased pb-12 print:bg-white print:pb-0">
      
      {/* Action Bar (Hidden on print) */}
      <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 flex items-center justify-between no-print shadow-sm">
        <Link
          href={`/app/cards/${id}`}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Volver a Detalles
        </Link>
        <div className="flex items-center gap-3">
          <a
            href={qrCodeDataUrl}
            download={`qr-${org.slug}.png`}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all shadow-sm"
          >
            <Download size={14} />
            Descargar QR
          </a>
          <button
            onClick={() => window.print()}
            type="button"
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#E8341A] hover:bg-[#D02B13] rounded-xl transition-all shadow-md"
          >
            <Printer size={14} />
            Imprimir Flyer
          </button>
        </div>
      </div>

      {/* Poster Container */}
      <div className="max-w-2xl mx-auto mt-8 px-4 print:mt-0 print:px-0">
        
        {/* Printable Poster */}
        <div 
          className="bg-white border border-gray-200/60 rounded-[32px] overflow-hidden shadow-xl print:shadow-none print:border-none flex flex-col items-center p-12 sm:p-16 text-center relative aspect-[1/1.414] w-full"
          style={{ borderColor: `${primaryColor}20` }}
        >
          {/* Subtle top indicator border */}
          <div 
            className="absolute top-0 inset-x-0 h-3" 
            style={{ backgroundColor: primaryColor }}
          />

          {/* Business branding */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {org.logoUrl ? (
              <img 
                src={org.logoUrl} 
                alt={org.name} 
                className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {org.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-medium text-gray-500 uppercase tracking-widest leading-none">
                {org.name}
              </h2>
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-gray-900 mt-2.5 max-w-lg leading-tight">
                {card.name}
              </h1>
            </div>
          </div>

          {/* Large dynamic QR Code */}
          <div className="my-auto py-8 flex flex-col items-center">
            <div 
              className="relative p-6 rounded-[40px] bg-white shadow-2xl border-4 flex items-center justify-center transition-transform hover:scale-105 duration-300"
              style={{ borderColor: `${primaryColor}15` }}
            >
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Código QR de Check-in" 
                  className="w-60 h-60 sm:w-72 sm:h-72 object-contain"
                />
              ) : (
                <div className="w-60 h-60 sm:w-72 sm:h-72 bg-gray-100 animate-pulse rounded-3xl" />
              )}

              {/* Logo inside QR code center overlay (premium look) */}
              <div className="absolute w-12 h-12 bg-white rounded-2xl border-2 border-white shadow-lg flex items-center justify-center p-1 overflow-hidden">
                <div 
                  className="w-full h-full rounded-xl flex items-center justify-center font-display font-black text-white text-[13px]"
                  style={{ backgroundColor: primaryColor }}
                >
                  S
                </div>
              </div>
            </div>

            <p className="mt-8 text-lg sm:text-xl font-bold tracking-tight text-gray-900 max-w-sm">
              Escanea con tu celular para unirte y acumular visitas
            </p>
          </div>

          {/* Step-by-step footer instructions */}
          <div className="w-full border-t border-gray-100 pt-8 mt-auto grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-inner"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
              >
                1
              </div>
              <div>
                <span className="text-[13px] font-bold text-gray-800 block">Escanea</span>
                <span className="text-[11px] text-gray-500 font-medium block leading-tight mt-0.5">Apunta tu cámara al QR</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-inner"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
              >
                2
              </div>
              <div>
                <span className="text-[13px] font-bold text-gray-800 block">Regístrate</span>
                <span className="text-[11px] text-gray-500 font-medium block leading-tight mt-0.5">Completa tus datos</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-inner"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
              >
                3
              </div>
              <div>
                <span className="text-[13px] font-bold text-gray-800 block">Gana</span>
                <span className="text-[11px] text-gray-500 font-medium block leading-tight mt-0.5">{card.rewardDescription}</span>
              </div>
            </div>
          </div>

          {/* Subtly branded watermark */}
          <div className="mt-8 text-[9px] font-bold tracking-[0.15em] text-gray-300 uppercase">
            Powered by Sellio.co
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
