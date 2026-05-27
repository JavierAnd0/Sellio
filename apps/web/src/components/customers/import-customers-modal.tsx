'use client';

import React, { useState, useTransition, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { importCustomersAction } from '@/actions/cards/customer.actions';
import { cn } from '@sellio/ui';

interface ImportCustomersModalProps {
  cardId: string;
}

interface ParsedCustomer {
  name: string;
  phone: string;
}

export function ImportCustomersModal({ cardId }: ImportCustomersModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleOpen = () => {
    setIsOpen(true);
    resetState();
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
    resetState();
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Por favor, sube un archivo con formato .csv');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setError('El archivo CSV está vacío.');
          return;
        }
        
        const rows = text
          .split(/\r?\n/)
          .map(row => row.trim())
          .filter(row => row.length > 0);
          
        if (rows.length === 0) {
          setError('El archivo CSV está vacío.');
          return;
        }

        // Parse rows and columns, handling potential quotes
        const parsedRows = rows.map(row => {
          // A basic CSV column splitter that respects quotes
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          cols.push(current.trim());
          return cols;
        });

        if (parsedRows.length === 0) {
          setError('No se pudieron procesar filas del archivo CSV.');
          return;
        }

        let headers = parsedRows[0] || [];
        let dataRows = parsedRows.slice(1);
        
        // Clean headers (remove BOM if present, remove quotes)
        headers = headers.map(h => h.replace(/^\uFEFF/, '').replace(/['"]/g, '').toLowerCase());

        // Find index of Name and Phone columns
        // We look for common Spanish and English names
        let nameIndex = headers.findIndex(h => 
          h.includes('nombre') || 
          h.includes('name') || 
          h.includes('cliente') || 
          h.includes('customer') ||
          h.includes('user') ||
          h.includes('usuario')
        );
        
        let phoneIndex = headers.findIndex(h => 
          h.includes('telefono') || 
          h.includes('teléfono') || 
          h.includes('phone') || 
          h.includes('celular') || 
          h.includes('movil') || 
          h.includes('móvil') ||
          h.includes('num') ||
          h.includes('contacto')
        );

        // Fallbacks if headers are not recognized or first line is not headers
        // If we didn't find clear indices, we guess:
        // Column 0 is Name if it contains letters, Column 1 is Phone if it has numbers
        if (nameIndex === -1 && phoneIndex === -1) {
          // If first row doesn't look like headers, treat it as data
          dataRows = parsedRows;
          nameIndex = 0;
          phoneIndex = 1;
        } else {
          if (nameIndex === -1) nameIndex = 0;
          if (phoneIndex === -1) phoneIndex = 1;
        }

        const validCustomers: ParsedCustomer[] = [];

        dataRows.forEach((row) => {
          const name = row[nameIndex] || '';
          const phone = row[phoneIndex] || '';
          
          // Simple validation: phone should have numbers and some length
          const cleanedPhone = phone.replace(/[^\d+()-\s]/g, '').trim();
          if (cleanedPhone.length >= 7) {
            validCustomers.push({
              name: name.replace(/['"]/g, '').trim() || 'Sin nombre',
              phone: cleanedPhone
            });
          }
        });

        if (validCustomers.length === 0) {
          setError('No se encontraron clientes con números de teléfono válidos (mínimo 7 dígitos).');
        } else {
          setParsedData(validCustomers);
        }
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Ocurrió un error al procesar el archivo CSV. Verifica el formato.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (parsedData.length === 0) return;
    
    startTransition(async () => {
      const res = await importCustomersAction(cardId, parsedData);
      if (res.ok) {
        setImportResult({ imported: res.imported, skipped: res.skipped });
        router.refresh();
      } else {
        setError(res.error || 'Ocurrió un error inesperado al importar.');
        if (res.imported > 0) {
          setImportResult({ imported: res.imported, skipped: res.skipped });
          router.refresh();
        }
      }
    });
  };

  return (
    <>
      {/* Import Button */}
      <button
        onClick={handleOpen}
        type="button"
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-surface-2 border border-border/30 hover:border-[#E8341A]/50 hover:bg-[#E8341A]/8 hover:text-[#E8341A] transition-all shadow-sm"
      >
        <Upload size={14} />
        Importar CSV
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-customers-title"
            className="bg-surface border border-border/40 rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-[#E8341A]" size={20} />
                <h3 id="import-customers-title" className="font-display text-lg font-bold text-fg tracking-tight">
                  Importar Clientes desde CSV
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-muted hover:text-fg p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                disabled={isPending}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              {!file && !importResult && (
                <>
                  <p className="text-sm text-muted leading-relaxed font-medium">
                    Sube un archivo CSV con tus clientes para agregarlos a esta tarjeta. El archivo debe contener al menos las columnas de <strong className="text-fg">nombre</strong> y <strong className="text-fg">teléfono</strong>.
                  </p>

                  {/* Drag Zone */}
                  <label
                    htmlFor="customer-csv-file"
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-[20px] p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                      dragActive 
                        ? "border-[#E8341A] bg-[#E8341A]/5" 
                        : "border-border/30 bg-surface-2/40 hover:border-border/60 hover:bg-surface-2/70"
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center border border-border/20 shadow-sm text-muted">
                      <Upload size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-fg">
                        Arrastra tu archivo CSV aquí o haz clic para buscar
                      </p>
                      <p className="text-xs text-muted mt-1 font-medium">
                        Solo archivos .csv de hasta 5MB
                      </p>
                    </div>
                    <input
                      id="customer-csv-file"
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Instructions / Examples */}
                  <div className="bg-surface-2/50 border border-border/10 rounded-xl p-4 text-xs font-medium">
                    <p className="text-fg mb-2">Formato de ejemplo del CSV:</p>
                    <pre className="text-muted leading-relaxed overflow-x-auto bg-black/10 p-2.5 rounded-lg border border-border/5">
                      nombre,telefono{"\n"}
                      Juan Perez,+573001234567{"\n"}
                      Maria Gomez,573009876543
                    </pre>
                  </div>
                </>
              )}

              {/* Error Alert */}
              {error && (
                <div className="flex gap-3 bg-red-950/20 border border-red-900/30 text-red-400 p-4 rounded-xl text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {/* Preview parsed data */}
              {file && parsedData.length > 0 && !importResult && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 bg-emerald-950/15 border border-emerald-900/30 text-emerald-400 p-4 rounded-xl text-sm font-medium">
                    <FileText size={18} className="shrink-0" />
                    <div>
                      Archivo <span className="font-bold text-fg">{file.name}</span> cargado.{" "}
                      Se encontraron <span className="font-bold text-fg">{parsedData.length}</span> clientes válidos.
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
                      Vista previa (primeros 5 clientes):
                    </p>
                    <div className="border border-border/20 rounded-xl overflow-x-auto bg-surface-2/30">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-surface-2/80 border-b border-border/10 text-muted font-bold">
                            <th className="px-4 py-2">Nombre</th>
                            <th className="px-4 py-2">Teléfono</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5 text-fg font-medium">
                          {parsedData.slice(0, 5).map((row, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2.5 truncate max-w-[150px]">{row.name}</td>
                              <td className="px-4 py-2.5 tabular-nums">{row.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results Success screen */}
              {importResult && (
                <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-extrabold text-fg tracking-tight">
                      Importación Completada
                    </h4>
                    <p className="text-sm text-muted mt-2 font-medium leading-relaxed max-w-sm">
                      El procesamiento de clientes ha finalizado con los siguientes resultados:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full max-w-xs mt-3">
                    <div className="bg-surface-2 border border-border/25 rounded-2xl p-4">
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Importados</span>
                      <span className="text-2xl font-black text-emerald-500 mt-1 block tabular-nums">{importResult.imported}</span>
                    </div>
                    <div className="bg-surface-2 border border-border/25 rounded-2xl p-4">
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Omitidos</span>
                      <span className="text-2xl font-black text-muted mt-1 block tabular-nums">{importResult.skipped}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/10 bg-surface-2/40 flex items-center justify-end gap-3">
              {!importResult ? (
                <>
                  <button
                    onClick={handleClose}
                    type="button"
                    className="px-4 py-2.5 text-xs font-bold text-muted hover:text-fg hover:bg-surface-2 rounded-xl transition-all"
                    disabled={isPending}
                  >
                    Cancelar
                  </button>
                  {file && parsedData.length > 0 && (
                    <button
                      onClick={handleImport}
                      type="button"
                      disabled={isPending}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#E8341A] rounded-xl hover:bg-[#E8341A]/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Importando...
                        </>
                      ) : (
                        `Importar ${parsedData.length} clientes`
                      )}
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleClose}
                  type="button"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#E8341A] rounded-xl hover:bg-[#E8341A]/90 transition-all shadow-md"
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
