'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { SpinnerIcon, CheckIcon, BackIcon, SpreadsheetIcon } from '@/components/ui/icons';
import { formatCep, onlyNumbers } from '@/lib/utils';
import { api } from '@/lib/api';

// ── Tipos Públicos ─────────────────────────────────────────────────────────
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

// ── Tipos Internos ─────────────────────────────────────────────────────────
interface ColumnMapping {
  cep: string;
  addressFull: string; // coluna com rua + número na mesma célula
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: string;
  lng: string;
}

interface DetectedPlatform {
  name: string;
  emoji: string;
  color: string;
}

interface PlatformTemplate {
  name: string;
  emoji: string;
  color: string;
  /** Todos os padrões devem estar presentes para reconhecer a plataforma */
  fingerprint: RegExp[];
  /** Padrões para encontrar o nome exato da coluna em cada campo */
  columnPatterns: Partial<Record<keyof ColumnMapping, RegExp>>;
}

// ── Templates de Plataformas Conhecidas ────────────────────────────────────
const PLATFORM_TEMPLATES: PlatformTemplate[] = [
  {
    name: 'Shopee Express',
    emoji: '🧡',
    color: '#EE4D2D',
    fingerprint: [/destination\s*address/i, /zipcode|postal\s*code/i],
    columnPatterns: {
      addressFull: /destination\s*address/i,
      cep: /zipcode|postal\s*code/i,
      neighborhood: /^bairro$/i,
      city: /^city$/i,
      lat: /^latitude$/i,
      lng: /^longitude$/i,
    },
  },
  {
    name: 'Mercado Livre',
    emoji: '💛',
    color: '#F5A623',
    fingerprint: [/destinatario|recipient|comprador/i, /cep|zip|postal/i],
    columnPatterns: {
      street: /logradouro|rua|street|endereco|endereço/i,
      number: /^(numero|número|nro|num\b|n\.)$/i,
      complement: /complemento|comp\b|apto/i,
      neighborhood: /bairro/i,
      city: /cidade|city|municipio/i,
      state: /^(uf|estado|state)$/i,
      cep: /cep|zip|postal/i,
    },
  },
  {
    name: 'iFood',
    emoji: '❤️',
    color: '#EA1D2C',
    fingerprint: [/endere.o\s*completo|full\s*address/i, /cep|zip|postal/i],
    columnPatterns: {
      addressFull: /endere.o\s*completo|full\s*address/i,
      complement: /complemento/i,
      cep: /cep|zip|postal/i,
      city: /cidade|city/i,
      neighborhood: /bairro/i,
    },
  },
];

const EMPTY_MAPPING: ColumnMapping = {
  cep: '',
  addressFull: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  lat: '',
  lng: '',
};

// ── Helpers de Parsing ─────────────────────────────────────────────────────

/**
 * Separa o campo "Destination Address" da Shopee nos três componentes.
 *
 * Padrão: "Rua X, numero, complemento_ou_observacao"
 *
 * Regras (alinhadas com dados reais da planilha):
 *  - 1ª vírgula delimita o fim do logradouro
 *  - Segmento entre 1ª e 2ª vírgula é sempre o número da residência
 *  - Tudo após a 2ª vírgula vai para complemento (inclui observações do entregador)
 *  - Sem vírgulas: usa regex para separar rua e número pelo último bloco numérico
 */
function parseAddressFull(address: string): { street: string; number: string; complement: string } {
  const trimmed = address.trim();

  // Caso padrão Shopee: "Rua X, 123" ou "Rua X, 123, Complemento"
  const parts = trimmed.split(',');
  if (parts.length >= 2) {
    const street = parts[0].trim();
    const number = parts[1].trim();
    // Tudo a partir do índice 2 é complemento (apto, bloco, observação, etc.)
    const complement = parts.slice(2).join(',').trim();
    return { street, number, complement };
  }

  // Sem vírgula: tenta separar pelo último bloco numérico no final
  // Ex: "Rua das Flores 123" → rua="Rua das Flores", numero="123"
  const spaceMatch = trimmed.match(/^(.*\D)\s+(\d+\S*)$/);
  if (spaceMatch) {
    return { street: spaceMatch[1].trim(), number: spaceMatch[2].trim(), complement: '' };
  }

  return { street: trimmed, number: '', complement: '' };
}

function buildMappingFromTemplate(cols: string[], template: PlatformTemplate): ColumnMapping {
  const findCol = (pattern?: RegExp) =>
    pattern ? cols.find((c) => pattern.test(c.trim())) ?? '' : '';
  return {
    cep: findCol(template.columnPatterns.cep),
    addressFull: findCol(template.columnPatterns.addressFull),
    street: findCol(template.columnPatterns.street),
    number: findCol(template.columnPatterns.number),
    complement: findCol(template.columnPatterns.complement),
    neighborhood: findCol(template.columnPatterns.neighborhood),
    city: findCol(template.columnPatterns.city),
    state: findCol(template.columnPatterns.state),
    lat: findCol(template.columnPatterns.lat),
    lng: findCol(template.columnPatterns.lng),
  };
}

function autoDetectGeneric(cols: string[]): ColumnMapping {
  const find = (pat: RegExp) => cols.find((c) => pat.test(c.trim())) ?? '';
  return {
    cep: find(/cep|zip|zipcode|postal|c\.e\.p/i),
    addressFull: find(/endere.o\s*completo|full\s*address|destination\s*address/i),
    street: find(/^(rua|street|logradouro|endereco|endereço|destino_rua)$/i),
    number: find(/^(numero|número|num|nº|number|nro|casa|n\.)$/i),
    complement: find(/complemento|comp\b|apto|apt\b|bloco/i),
    neighborhood: find(/bairro|neighborhood|district/i),
    city: find(/^(cidade|city|municipio|município)$/i),
    state: find(/^(uf|estado|state)$/i),
    lat: find(/^(lat|latitude)$/i),
    lng: find(/^(lng|lon|longitude|long)$/i),
  };
}

// ── Integração Groq ────────────────────────────────────────────────────────
const GROQ_API_KEY =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GROQ_API_KEY : undefined;

async function groqChat(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('NEXT_PUBLIC_GROQ_API_KEY não configurada');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      max_tokens: 512,
    }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function groqMapColumns(headers: string[]): Promise<Partial<ColumnMapping>> {
  const prompt = `Você é um assistente de mapeamento de colunas para um app de entregas brasileiro.
Colunas disponíveis: ${JSON.stringify(headers)}

Retorne APENAS um JSON válido (sem markdown) mapeando cada campo ao nome exato da coluna:
{"cep":"","addressFull":"","street":"","number":"","complement":"","neighborhood":"","city":"","state":"","lat":"","lng":""}

- cep: código postal/CEP
- addressFull: endereço completo (rua + número na mesma coluna)
- street: somente o logradouro/rua
- number: somente o número do imóvel
- complement: complemento (apto, bloco, etc.)
- neighborhood: bairro
- city: cidade
- state: UF/estado
- lat: latitude
- lng: longitude
Use "" se não encontrar.`;
  try {
    const raw = await groqChat(prompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as Partial<ColumnMapping>;
  } catch {}
  return {};
}

async function groqParseRow(row: Record<string, unknown>): Promise<Partial<ImportedAddress> | null> {
  const prompt = `Extraia os campos de endereço brasileiro desta linha de planilha.
Dados: ${JSON.stringify(row)}

Retorne APENAS um JSON válido:
{"cep":"","street":"","number":"","complement":"","neighborhood":"","city":"","state":""}
Use "" para campos ausentes.`;
  try {
    const raw = await groqChat(prompt);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as Partial<ImportedAddress>;
  } catch {}
  return null;
}

// ── Componente Principal ───────────────────────────────────────────────────
export function SpreadsheetImporter({ onImportStops, onClose }: SpreadsheetImporterProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform | null>(null);
  const [isGroqMapping, setIsGroqMapping] = useState(false);
  const [mapping, setMapping] = useState<ColumnMapping>(EMPTY_MAPPING);

  const [parsedItems, setParsedItems] = useState<
    (ImportedAddress & { selected: boolean; valid: boolean; rawRowIndex: number })[]
  >([]);

  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [enrichStatus, setEnrichStatus] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contagem de selecionados memoizada — evita 3× computações idênticas por render
  const selectedCount = useMemo(
    () => parsedItems.filter((i) => i.selected).length,
    [parsedItems],
  );

  // ── Leitura do arquivo ───────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

        if (jsonRows.length === 0) {
          alert('A planilha selecionada está vazia.');
          return;
        }

        const cols = Object.keys(jsonRows[0]);
        setHeaders(cols);
        setRawRows(jsonRows);

        // Camada 1 — Template de plataforma conhecida
        const matched = PLATFORM_TEMPLATES.find((t) =>
          t.fingerprint.every((fp) => cols.some((c) => fp.test(c.trim()))),
        );
        if (matched) {
          setDetectedPlatform({ name: matched.name, emoji: matched.emoji, color: matched.color });
          setMapping(buildMappingFromTemplate(cols, matched));
          setStep('mapping');
          return;
        }

        // Camada 2 — Auto-detect genérico
        const generic = autoDetectGeneric(cols);
        const hasMinimum = generic.cep || generic.addressFull || generic.street;
        if (hasMinimum) {
          setDetectedPlatform(null);
          setMapping(generic);
          setStep('mapping');
          return;
        }

        // Camada 3 — Groq como fallback
        if (GROQ_API_KEY) {
          setIsGroqMapping(true);
          setMapping(generic);
          setStep('mapping');
          try {
            const groqResult = await groqMapColumns(cols);
            setMapping((prev) => ({
              ...prev,
              ...Object.fromEntries(
                Object.entries(groqResult).map(([k, v]) => [k, v ?? '']),
              ),
            }));
            setDetectedPlatform({ name: 'IA mapeou', emoji: '🤖', color: '#7C3AED' });
          } catch {
            /* usuário ajusta manualmente */
          }
          setIsGroqMapping(false);
        } else {
          setDetectedPlatform(null);
          setMapping(generic);
          setStep('mapping');
        }
      } catch {
        alert('Erro ao ler a planilha. Certifique-se de que é um arquivo CSV ou XLSX válido.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // ── Processamento das linhas após confirmar mapeamento ───────────────────
  const handleConfirmMapping = async () => {
    setStep('preview');
    setEnriching(true);
    setEnrichProgress(0);

    type ParsedItem = ImportedAddress & { selected: boolean; valid: boolean; rawRowIndex: number };

    // Cache de CEP — evita chamadas repetidas para o mesmo CEP (comum em condomínios)
    const cepCache = new Map<
      string,
      { street: string; neighborhood: string; city: string; state: string; lat: number; lng: number }
    >();

    const processRow = async (row: Record<string, unknown>, index: number): Promise<ParsedItem> => {
      let rawCep = onlyNumbers(String(row[mapping.cep] ?? '')).slice(0, 8);
      let street = '';
      let number = '';
      let complement = String(row[mapping.complement] ?? '').trim();
      let neighborhood = String(row[mapping.neighborhood] ?? '').trim();
      let city = String(row[mapping.city] ?? '').trim();
      let state = String(row[mapping.state] ?? '')
        .trim()
        .toUpperCase()
        .slice(0, 2);
      let lat = mapping.lat ? parseFloat(String(row[mapping.lat] ?? '0')) || 0 : 0;
      let lng = mapping.lng ? parseFloat(String(row[mapping.lng] ?? '0')) || 0 : 0;

      if (mapping.addressFull && row[mapping.addressFull]) {
        const parsed = parseAddressFull(String(row[mapping.addressFull]));
        street = parsed.street;
        number = parsed.number;
        if (!complement && parsed.complement) complement = parsed.complement;
      } else {
        street = String(row[mapping.street] ?? '').trim();
        number = String(row[mapping.number] ?? '').trim();
      }

      // Só faz chamada HTTP externa à API de CEP se faltar informação essencial de endereço/coordenada da planilha
      const needsCepLookup =
        rawCep.length === 8 && (!street || !city || !neighborhood || (!lat && !lng));

      if (needsCepLookup) {
        const hit = cepCache.get(rawCep);
        if (hit) {
          // Reutiliza resultado já buscado para o mesmo CEP
          street = street || hit.street;
          neighborhood = neighborhood || hit.neighborhood;
          city = city || hit.city;
          state = state || hit.state;
          if (!lat || !lng) { lat = hit.lat; lng = hit.lng; }
        } else {
          try {
            const cepRes = await fetch(`https://cep.awesomeapi.com.br/json/${rawCep}`);
            if (cepRes.ok) {
              const d = await cepRes.json();
              const entry = {
                street: d.address || '',
                neighborhood: d.district || '',
                city: d.city || '',
                state: d.state || '',
                lat: parseFloat(d.lat) || 0,
                lng: parseFloat(d.lng) || 0,
              };
              cepCache.set(rawCep, entry);
              street = street || entry.street;
              neighborhood = neighborhood || entry.neighborhood;
              city = city || entry.city;
              state = state || entry.state;
              if (!lat || !lng) { lat = entry.lat; lng = entry.lng; }
            }
          } catch {
            try {
              const res = await api.cep.lookup(rawCep);
              if (res) {
                const entry = {
                  street: res.street,
                  neighborhood: res.neighborhood,
                  city: res.city,
                  state: res.state,
                  lat: 0,
                  lng: 0,
                };
                cepCache.set(rawCep, entry);
                street = street || entry.street;
                neighborhood = neighborhood || entry.neighborhood;
                city = city || entry.city;
                state = state || entry.state;
              }
            } catch {}
          }
        }
      }

      const isValid =
        (rawCep.length === 8 || (street.length > 0 && city.length > 0)) && number.length > 0;

      if (!isValid && GROQ_API_KEY) {
        try {
          const groqResult = await groqParseRow(row);
          if (groqResult) {
            rawCep = groqResult.cep ? onlyNumbers(groqResult.cep).slice(0, 8) : rawCep;
            street = groqResult.street || street;
            number = groqResult.number || number;
            neighborhood = groqResult.neighborhood || neighborhood;
            city = groqResult.city || city;
            state = groqResult.state?.toUpperCase().slice(0, 2) || state;
          }
        } catch {}
      }

      const finalValid =
        (rawCep.length === 8 || (street.length > 0 && city.length > 0)) && number.length > 0;

      return {
        cep: rawCep, street, number, complement, neighborhood, city, state, lat, lng,
        selected: finalValid, valid: finalValid, rawRowIndex: index,
      };
    };

    // Lotes de 5 paralelos — reduz tempo de ~30s para ~6s para 84 entregas
    const BATCH_SIZE = 5;
    const allItems: ParsedItem[] = [];

    for (let batchStart = 0; batchStart < rawRows.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, rawRows.length);
      setEnrichStatus(`Processando ${batchStart + 1}–${batchEnd} de ${rawRows.length}…`);

      const batchResults = await Promise.all(
        rawRows.slice(batchStart, batchEnd).map((row, i) => processRow(row, batchStart + i)),
      );
      allItems.push(...batchResults);
      setEnrichProgress(Math.round((batchEnd / rawRows.length) * 100));

      // Delay entre lotes para respeitar rate limits da AwesomeAPI
      if (batchEnd < rawRows.length) {
        await new Promise<void>((r) => setTimeout(r, 150));
      }
    }

    setParsedItems(allItems);
    setEnriching(false);
    setEnrichStatus('');
  };

  // ── Seleção na preview ───────────────────────────────────────────────────
  const toggleItemSelect = useCallback((rawRowIndex: number) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.rawRowIndex === rawRowIndex ? { ...item, selected: !item.selected } : item)),
    );
  }, []);

  const toggleSelectAll = useCallback((select: boolean) => {
    setParsedItems((prev) => prev.map((item) => ({ ...item, selected: select && item.valid })));
  }, []);

  // ── Importação final ─────────────────────────────────────────────────────
  const handleFinalImport = useCallback(() => {
    const selected = parsedItems
      .filter((i) => i.selected)
      .map(({ selected: _s, valid: _v, rawRowIndex: _r, ...stop }) => stop);

    if (selected.length === 0) {
      alert('Selecione ao menos 1 endereço válido para importar.');
      return;
    }

    onImportStops(selected);
    onClose();
  }, [parsedItems, onImportStops, onClose]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl p-5 space-y-4 max-h-[90vh] flex flex-col relative overflow-hidden"
        style={{
          background: 'rgba(22, 22, 42, 0.97)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Header ── */}
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
                Shopee, Mercado Livre, iFood e planilhas genéricas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl press-effect text-xs"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* ── STEP 1: UPLOAD ── */}
        {step === 'upload' && (
          <div className="space-y-5 py-4 flex-1 flex flex-col justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 press-effect space-y-3"
              style={{
                borderColor: 'rgba(124,58,237,0.4)',
                background:
                  'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(79,70,229,0.04) 100%)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}
              >
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

              {/* Plataformas suportadas */}
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                {PLATFORM_TEMPLATES.map((t) => (
                  <span
                    key={t.name}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: `${t.color}22`,
                      color: t.color === '#F5A623' ? '#F5A623' : t.color,
                      border: `1px solid ${t.color}44`,
                    }}
                  >
                    {t.emoji} {t.name}
                  </span>
                ))}
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: 'rgba(124,58,237,0.15)',
                    color: '#A78BFA',
                    border: '1px solid rgba(124,58,237,0.3)',
                  }}
                >
                  🤖 Genérica (IA)
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: MAPEAMENTO DE COLUNAS ── */}
        {step === 'mapping' && (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {/* Info do arquivo */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#A78BFA' }}>
                <SpreadsheetIcon size={14} />
                {fileName} ({rawRows.length} linhas)
              </span>
              <button
                onClick={() => setStep('upload')}
                className="text-xs underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Trocar arquivo
              </button>
            </div>

            {/* Badge da plataforma detectada */}
            {isGroqMapping ? (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
              >
                <SpinnerIcon size={14} className="animate-spin" style={{ color: '#A78BFA' }} />
                <span className="text-xs font-medium" style={{ color: '#A78BFA' }}>
                  IA analisando as colunas da planilha…
                </span>
              </div>
            ) : detectedPlatform ? (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl animate-fade-up"
                style={{
                  background: `${detectedPlatform.color}18`,
                  border: `1px solid ${detectedPlatform.color}40`,
                }}
              >
                <span className="text-base">{detectedPlatform.emoji}</span>
                <div>
                  <p className="text-xs font-bold" style={{ color: detectedPlatform.color }}>
                    {detectedPlatform.name} detectada!
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Colunas mapeadas automaticamente. Revise abaixo se necessário.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Verifique a correspondência das colunas da sua planilha:
              </p>
            )}

            {/* Formulário de Mapeamento */}
            <div className="space-y-2 text-xs">
              {[
                { label: 'CEP *', key: 'cep', req: true },
                { label: 'Endereço Completo (rua + nº juntos)', key: 'addressFull', req: false },
                { label: 'Número *', key: 'number', req: true },
                { label: 'Rua / Logradouro', key: 'street', req: false },
                { label: 'Bairro', key: 'neighborhood', req: false },
                { label: 'Cidade', key: 'city', req: false },
                { label: 'UF / Estado', key: 'state', req: false },
                { label: 'Complemento', key: 'complement', req: false },
                { label: 'Latitude', key: 'lat', req: false },
                { label: 'Longitude', key: 'lng', req: false },
              ].map((field) => {
                const value = (mapping as unknown as Record<string, string>)[field.key] ?? '';
                const isMapped = !!value;
                return (
                  <div
                    key={field.key}
                    className="flex items-center justify-between p-2.5 rounded-xl transition-all"
                    style={{
                      background: isMapped
                        ? 'rgba(124,58,237,0.08)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isMapped ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <span
                      className="font-medium truncate mr-2 max-w-[130px]"
                      style={{ color: isMapped ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                      {field.label}
                    </span>
                    <select
                      value={value}
                      onChange={(e) =>
                        setMapping((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="max-w-[180px] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none truncate"
                      style={{
                        background: '#1E1E38',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: isMapped ? '#A78BFA' : 'var(--text-muted)',
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
                );
              })}
            </div>

            <Button size="lg" className="w-full mt-2" onClick={handleConfirmMapping}>
              Analisar e pré-visualizar entregas →
            </Button>
          </div>
        )}

        {/* ── STEP 3: PREVIEW & ENRICH ── */}
        {step === 'preview' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            {enriching ? (
              <div className="py-12 text-center space-y-4">
                <SpinnerIcon
                  size={32}
                  className="mx-auto animate-spin"
                  style={{ color: '#A78BFA' }}
                />
                <div className="space-y-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Processando entregas… ({enrichProgress}%)
                  </p>
                  {enrichStatus && (
                    <p className="text-xs animate-pulse-soft" style={{ color: 'var(--text-muted)' }}>
                      {enrichStatus}
                    </p>
                  )}
                </div>
                <div
                  className="w-52 h-2 rounded-full mx-auto overflow-hidden"
                  style={{ background: 'var(--surface-3)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${enrichProgress}%`,
                      background: 'linear-gradient(90deg, #7C3AED, #4F46E5)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Resumo */}
                <div className="flex items-center justify-between text-xs flex-shrink-0">
                  <span className="font-semibold" style={{ color: '#A78BFA' }}>
                    Conferência ({selectedCount} selecionadas de {parsedItems.length})
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleSelectAll(true)}
                      className="text-xs hover:underline"
                      style={{ color: '#A78BFA' }}
                    >
                      Marcar todas
                    </button>
                    <button
                      onClick={() => toggleSelectAll(false)}
                      className="text-xs hover:underline"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                {/* Lista de itens */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px] max-h-[300px]">
                  {parsedItems.map((item) => (
                    <div
                      key={item.rawRowIndex}
                      onClick={() => item.valid && toggleItemSelect(item.rawRowIndex)}
                      className={`p-2.5 rounded-xl flex items-start gap-3 border transition-all cursor-pointer ${
                        item.selected
                          ? 'border-purple-500/40'
                          : 'border-white/5 opacity-60'
                      }`}
                      style={{
                        background: item.selected
                          ? 'rgba(124,58,237,0.10)'
                          : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        disabled={!item.valid}
                        onChange={() => toggleItemSelect(item.rawRowIndex)}
                        className="mt-1 rounded accent-purple-500"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {item.street || 'Rua não identificada'}, {item.number || 'S/N'}
                          {item.complement && ` (${item.complement})`}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                          {item.neighborhood && `${item.neighborhood}, `}
                          {item.city}
                          {item.state && ` — ${item.state}`}
                          {item.cep && ` (CEP: ${formatCep(item.cep)})`}
                        </p>
                        {(item.lat !== 0 || item.lng !== 0) && (
                          <p className="text-[10px] mt-0.5" style={{ color: '#10D9A0' }}>
                            📍 Coordenadas disponíveis
                          </p>
                        )}
                      </div>
                      {!item.valid && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded font-semibold flex-shrink-0"
                          style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5' }}
                        >
                          Incompleto
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ações */}
                <div
                  className="flex gap-2 pt-2 border-t flex-shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
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
                    disabled={selectedCount === 0}
                  >
                    <CheckIcon className="mr-1.5" size={16} />
                    Adicionar {selectedCount} paradas à rota
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
