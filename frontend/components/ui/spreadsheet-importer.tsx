'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { SpinnerIcon, CheckIcon, BackIcon, SpreadsheetIcon } from '@/components/ui/icons';
import { formatCep, onlyNumbers } from '@/lib/utils';
import { api } from '@/lib/api';

export interface ImportedAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

interface SpreadsheetImporterProps {
  onImportStops: (stops: ImportedAddress[]) => void;
  onClose: () => void;
}

interface ColumnMapping {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function SpreadsheetImporter({ onImportStops, onClose }: SpreadsheetImporterProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [parsedItems, setParsedItems] = useState<
    (ImportedAddress & { selected: boolean; valid: boolean; rawRowIndex: number })[]
  >([]);

  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auto-Detect Matching Headers ──────────────────────────────────────────
  const autoDetectColumns = (cols: string[]) => {
    const findCol = (pattern: RegExp) => cols.find((c) => pattern.test(c.trim())) || '';

    const newMap: ColumnMapping = {
      cep: findCol(/cep|zip|codigo_postal|postal_code/i),
      street: findCol(/rua|street|logradouro|endereco|endereço|address|destino_rua/i),
      number: findCol(/numero|número|num|nº|number|nro|casa/i),
      complement: findCol(/complemento|comp|apto|apt|bloco/i),
      neighborhood: findCol(/bairro|neighborhood|district|bair/i),
      city: findCol(/cidade|city|municipio|município/i),
      state: findCol(/^uf$|estado|state/i),
    };

    setMapping(newMap);
  };

  // ── Handle File Reading ───────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];

        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

        if (jsonRows.length === 0) {
          alert('A planilha selecionada está vazia.');
          return;
        }

        const detectedHeaders = Object.keys(jsonRows[0]);
        setHeaders(detectedHeaders);
        setRawRows(jsonRows);
        autoDetectColumns(detectedHeaders);
        setStep('mapping');
      } catch (err) {
        alert('Erro ao ler a planilha. Certifique-se de que é um arquivo CSV ou XLSX válido.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // ── Process Rows based on Mapping ─────────────────────────────────────────
  const handleConfirmMapping = async () => {
    setStep('preview');
    setEnriching(true);
    setEnrichProgress(0);

    const items: (ImportedAddress & { selected: boolean; valid: boolean; rawRowIndex: number })[] =
      [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      let rawCep = String(row[mapping.cep] || '');
      let cleanCep = onlyNumbers(rawCep).slice(0, 8);

      let street = String(row[mapping.street] || '').trim();
      let number = String(row[mapping.number] || '').trim();
      let complement = String(row[mapping.complement] || '').trim();
      let neighborhood = String(row[mapping.neighborhood] || '').trim();
      let city = String(row[mapping.city] || '').trim();
      let state = String(row[mapping.state] || '').trim().toUpperCase();

      let lat = 0;
      let lng = 0;

      // Se temos CEP válido (8 dígitos), tenta auto-completar dados faltantes e buscar coordenadas
      if (cleanCep.length === 8) {
        try {
          const cepRes = await fetch(`https://cep.awesomeapi.com.br/json/${cleanCep}`);
          if (cepRes.ok) {
            const cepData = await cepRes.json();
            street = street || cepData.address || '';
            neighborhood = neighborhood || cepData.district || '';
            city = city || cepData.city || '';
            state = state || cepData.state || '';
            if (cepData.lat && cepData.lng) {
              lat = parseFloat(cepData.lat) || 0;
              lng = parseFloat(cepData.lng) || 0;
            }
          }
        } catch {
          // Fallback se a AwesomeAPI falhar
          if (!street || !city || !state || !neighborhood) {
            try {
              const res = await api.cep.lookup(cleanCep);
              if (res) {
                street = street || res.street;
                neighborhood = neighborhood || res.neighborhood;
                city = city || res.city;
                state = state || res.state;
              }
            } catch {}
          }
        }
      }

      const isValid = (cleanCep.length === 8 || (street.length > 0 && city.length > 0)) && number.length > 0;

      items.push({
        cep: cleanCep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        lat,
        lng,
        selected: isValid,
        valid: isValid,
        rawRowIndex: i,
      });

      setEnrichProgress(Math.round(((i + 1) / rawRows.length) * 100));
    }

    setParsedItems(items);
    setEnriching(false);
  };

  // ── Toggle Item Selection ────────────────────────────────────────────────
  const toggleItemSelect = (index: number) => {
    setParsedItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item)),
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedItems((prev) => prev.map((item) => ({ ...item, selected: select && item.valid })));
  };

  // ── Final Import Trigger ─────────────────────────────────────────────────
  const handleFinalImport = () => {
    const selectedStops = parsedItems
      .filter((i) => i.selected)
      .map(({ selected, valid, rawRowIndex, ...stop }) => stop);

    if (selectedStops.length === 0) {
      alert('Selecione ao menos 1 endereço válido para importar.');
      return;
    }

    onImportStops(selectedStops);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl p-5 space-y-4 max-h-[90vh] flex flex-col relative overflow-hidden"
        style={{
          background: 'rgba(22, 22, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.18)', color: '#A78BFA' }}
            >
              <SpreadsheetIcon size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Importar Planilha de Entregas
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Suporta XLSX, XLS e CSV de qualquer plataforma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl press-effect text-xs text-muted hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            ✕
          </button>
        </div>

        {/* ── STEP 1: UPLOAD ── */}
        {step === 'upload' && (
          <div className="space-y-5 py-4 flex-1 flex flex-col justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-brand-500/40 hover:border-brand-400 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 press-effect space-y-3"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(79,70,229,0.04) 100%)' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-brand-500/20 text-brand-300">
                <SpreadsheetIcon size={36} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Clique ou arraste sua planilha aqui
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Formatos aceitos: <strong>.xlsx, .xls, .csv</strong>
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: COLUMN MAPPING ── */}
        {step === 'mapping' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                <SpreadsheetIcon size={16} />
                {fileName} ({rawRows.length} linhas encontradas)
              </span>
              <button
                onClick={() => setStep('upload')}
                className="text-xs text-muted hover:text-white underline"
              >
                Trocar arquivo
              </button>
            </div>

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Verifique a correspondência das colunas da sua planilha com os campos do RotaFácil:
            </p>

            {/* Form de Mapeamento */}
            <div className="space-y-2.5 text-xs">
              {[
                { label: 'CEP *', key: 'cep', req: true },
                { label: 'Número *', key: 'number', req: true },
                { label: 'Rua / Logradouro', key: 'street', req: false },
                { label: 'Bairro', key: 'neighborhood', req: false },
                { label: 'Cidade', key: 'city', req: false },
                { label: 'UF / Estado', key: 'state', req: false },
                { label: 'Complemento', key: 'complement', req: false },
              ].map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between p-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {field.label}
                  </span>
                  <select
                    value={(mapping as any)[field.key]}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="max-w-[200px] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none truncate"
                    style={{
                      background: '#1E1E38',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: (mapping as any)[field.key] ? '#A78BFA' : 'var(--text-muted)',
                    }}
                  >
                    <option value="">-- Não mapear --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full mt-4" onClick={handleConfirmMapping}>
              Analisar e pré-visualizar entregas →
            </Button>
          </div>
        )}

        {/* ── STEP 3: PREVIEW & ENRICH ── */}
        {step === 'preview' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            {enriching ? (
              <div className="py-12 text-center space-y-3">
                <SpinnerIcon size={32} className="text-brand-500 mx-auto" />
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Processando endereços e validando CEPs... ({enrichProgress}%)
                </p>
                <div className="w-48 h-2 bg-surface-3 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-brand-500 transition-all duration-200"
                    style={{ width: `${enrichProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs flex-shrink-0">
                  <span className="font-semibold text-brand-300">
                    Conferência ({parsedItems.filter((i) => i.selected).length} selecionadas de{' '}
                    {parsedItems.length})
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSelectAll(true)}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      Marcar todas
                    </button>
                    <button
                      onClick={() => toggleSelectAll(false)}
                      className="text-xs text-muted hover:underline"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                {/* Tabela de Pre visualização */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px] max-h-[300px]">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => item.valid && toggleItemSelect(idx)}
                      className={`p-2.5 rounded-xl flex items-start gap-3 border transition-all cursor-pointer ${
                        item.selected
                          ? 'bg-brand-500/10 border-brand-500/40'
                          : 'bg-white/5 border-white/5 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        disabled={!item.valid}
                        onChange={() => toggleItemSelect(idx)}
                        className="mt-1 rounded accent-brand-500"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {item.street || 'Rua não identificada'}, {item.number || 'S/N'}
                          {item.complement && ` (${item.complement})`}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                          {item.neighborhood && `${item.neighborhood}, `}
                          {item.city} {item.state && `— ${item.state}`} {item.cep && `(CEP: ${formatCep(item.cep)})`}
                        </p>
                      </div>
                      {!item.valid && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold flex-shrink-0">
                          Incompleto
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/10 flex-shrink-0">
                  <button
                    onClick={() => setStep('mapping')}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold press-effect"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                  >
                    Voltar
                  </button>

                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleFinalImport}
                    disabled={parsedItems.filter((i) => i.selected).length === 0}
                  >
                    <CheckIcon className="mr-1.5" size={16} />
                    Adicionar {parsedItems.filter((i) => i.selected).length} paradas à rota
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
