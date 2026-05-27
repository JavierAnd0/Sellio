import { describe, expect, it } from 'vitest';

import { deriveSlug } from './organization.entity';

describe('deriveSlug', () => {
  it('convierte nombre simple a slug en minúsculas', () => {
    expect(deriveSlug('Mi Negocio')).toBe('mi-negocio');
  });

  it('reemplaza espacios múltiples con un solo guion', () => {
    expect(deriveSlug('Café   de   Barrio')).toBe('cafe-de-barrio');
  });

  it('elimina acentos y caracteres especiales del español', () => {
    expect(deriveSlug('Panadería Ñoño')).toBe('panaderia-nono');
  });

  it('elimina caracteres no alfanuméricos excepto guiones', () => {
    expect(deriveSlug('Tienda & More!')).toBe('tienda-more');
  });

  it('no deja guiones al inicio ni al final', () => {
    expect(deriveSlug('  --Hola Mundo--  ')).toBe('hola-mundo');
  });

  it('trunca a máximo 40 caracteres', () => {
    const longName = 'Este es un nombre de negocio extremadamente largo';
    const result = deriveSlug(longName);
    expect(result.length).toBeLessThanOrEqual(40);
  });

  it('retorna fallback para nombre vacío', () => {
    expect(deriveSlug('')).toBe('mi-negocio');
  });

  it('retorna fallback para nombre solo con caracteres especiales', () => {
    expect(deriveSlug('!!!')).toBe('mi-negocio');
  });

  it('maneja nombres con números', () => {
    expect(deriveSlug('Tienda 24/7')).toBe('tienda-24-7');
  });

  it('convierte a minúsculas correctamente', () => {
    expect(deriveSlug('EMPRESA ABC')).toBe('empresa-abc');
  });
});
