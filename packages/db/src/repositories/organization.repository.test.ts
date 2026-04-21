import { describe, expect, it } from 'vitest';
import { orgRowToEntity } from './organization.repository';

const baseRow = {
  id: 'org-123',
  slug: 'mi-negocio',
  name: 'Mi Negocio S.A.',
  logo_url: null,
  primary_color: '#E8341A',
  country: 'CO',
  timezone: 'America/Bogota',
  plan: 'free' as const,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

describe('orgRowToEntity', () => {
  it('mapea correctamente snake_case → camelCase', () => {
    const entity = orgRowToEntity(baseRow);
    expect(entity.id).toBe('org-123');
    expect(entity.slug).toBe('mi-negocio');
    expect(entity.name).toBe('Mi Negocio S.A.');
    expect(entity.logoUrl).toBeNull();
    expect(entity.primaryColor).toBe('#E8341A');
    expect(entity.country).toBe('CO');
    expect(entity.timezone).toBe('America/Bogota');
    expect(entity.plan).toBe('free');
  });

  it('convierte created_at y updated_at a objetos Date', () => {
    const entity = orgRowToEntity(baseRow);
    expect(entity.createdAt).toBeInstanceOf(Date);
    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.createdAt.toISOString()).toBe('2024-01-15T10:00:00.000Z');
  });

  it('mapea logo_url cuando tiene valor', () => {
    const rowWithLogo = { ...baseRow, logo_url: 'https://cdn.example.com/logo.png' };
    const entity = orgRowToEntity(rowWithLogo);
    expect(entity.logoUrl).toBe('https://cdn.example.com/logo.png');
  });

  it('mapea plan elite correctamente', () => {
    const eliteRow = { ...baseRow, plan: 'elite' as const };
    const entity = orgRowToEntity(eliteRow);
    expect(entity.plan).toBe('elite');
  });

  it('el resultado tiene exactamente las propiedades esperadas', () => {
    const entity = orgRowToEntity(baseRow);
    const keys = Object.keys(entity).sort();
    expect(keys).toEqual(
      ['country', 'createdAt', 'id', 'logoUrl', 'name', 'plan', 'primaryColor', 'slug', 'timezone', 'updatedAt'].sort(),
    );
  });
});
