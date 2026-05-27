'use client';

import { useState } from 'react';

import { Button, FormField, Input } from '@sellio/ui';

import { CATEGORIES } from './palettes';

interface Step1BusinessProps {
  businessName: string;
  category: string;
  onNext: (data: { businessName: string; category: string }) => void;
}

export function Step1Business({ businessName, category, onNext }: Step1BusinessProps) {
  const [name, setName] = useState(businessName);
  const [cat, setCat] = useState(category);
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: { name?: string; category?: string } = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Ingresa el nombre de tu negocio (mínimo 2 caracteres)';
    }
    if (!cat) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext({ businessName: name.trim(), category: cat });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField
        label="Nombre del negocio"
        htmlFor="businessName"
        error={errors.name}
        required
      >
        <Input
          id="businessName"
          name="businessName"
          type="text"
          placeholder="Ej: Café Paraíso"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={!!errors.name}
        />
      </FormField>

      <FormField
        label="Categoría"
        htmlFor="category"
        error={errors.category}
        required
      >
        <select
          id="category"
          name="category"
          value={cat}
          onChange={(e) => {
            setCat(e.target.value);
            if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
          }}
          className={[
            'h-11 w-full rounded-md border bg-surface-2 px-4 text-sm text-fg outline-none transition-all',
            'focus:border-coral/50 focus:shadow-[0_0_0_3px_rgba(232,52,26,0.1)]',
            errors.category ? 'border-error' : 'border-border',
            !cat ? 'text-muted' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </FormField>

      <Button type="submit" fullWidth className="mt-2">
        Continuar
        <ArrowRightIcon />
      </Button>
    </form>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
