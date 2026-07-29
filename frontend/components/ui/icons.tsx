import React from 'react';

/**
 * RotaFácil — Ícones SVG únicos e customizados
 * Cada ícone foi desenhado especificamente para o app.
 */

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// ══════════════════════════════════════════
// LOGO ICON — Mapa estilizado + seta de rota
// ══════════════════════════════════════════
export function LogoIcon({ className = '', size = 40, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className} {...rest}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fundo hexagonal */}
      <path
        d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z"
        fill="url(#logo-bg)"
        opacity="0.15"
      />
      {/* Pin de mapa estilizado */}
      <path
        d="M20 8C15.58 8 12 11.58 12 16C12 22 20 30 20 30C20 30 28 22 28 16C28 11.58 24.42 8 20 8Z"
        fill="url(#logo-pin)"
        opacity="0.9"
      />
      {/* Círculo interno do pin */}
      <circle cx="20" cy="16" r="3.5" fill="white" opacity="0.95" />
      {/* Seta de otimização */}
      <path
        d="M13 34 L19 29 L16 28 L22 22 L19 24 L25 18"
        stroke="url(#logo-arrow)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="logo-bg" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="logo-pin" x1="12" y1="8" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="logo-arrow" x1="13" y1="34" x2="25" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10D9A0" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ══════════════════════════════════════════
// HOME ICON — Casa moderna com telhado estilizado
// ══════════════════════════════════════════
export function HomeIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M3 10.5L12 3L21 10.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 9V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 21V16.5C9.5 15.95 9.95 15.5 10.5 15.5H13.5C14.05 15.5 14.5 15.95 14.5 16.5V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// ROUTES ICON — Três pontos conectados por linha sinuosa
// ══════════════════════════════════════════
export function RoutesIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      {/* Linha de rota */}
      <path
        d="M5 6C5 6 8 10 12 12C16 14 19 18 19 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      {/* Ponto A */}
      <circle cx="5" cy="6" r="2.5" fill="currentColor" fillOpacity="0.8" />
      <circle cx="5" cy="6" r="1.2" fill="currentColor" />
      {/* Ponto B */}
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      {/* Ponto C — pin destino */}
      <path
        d="M19 15.5C17.07 15.5 15.5 17.07 15.5 19C15.5 21.5 19 24 19 24C19 24 22.5 21.5 22.5 19C22.5 17.07 20.93 15.5 19 15.5Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
      <circle cx="19" cy="19" r="1.2" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

// ══════════════════════════════════════════
// ADD ROUTE ICON — Símbolo + com rota orbital
// ══════════════════════════════════════════
export function AddRouteIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="3 2" />
      <path
        d="M12 8V16M8 12H16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// REPORTS ICON — Gráfico de barras com tendência
// ══════════════════════════════════════════
export function ReportsIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      {/* Barras */}
      <rect x="3" y="12" width="3.5" height="9" rx="1" fill="currentColor" fillOpacity="0.5" />
      <rect x="8.5" y="7" width="3.5" height="14" rx="1" fill="currentColor" fillOpacity="0.7" />
      <rect x="14" y="9" width="3.5" height="12" rx="1" fill="currentColor" fillOpacity="0.85" />
      {/* Linha de tendência */}
      <path
        d="M4.75 13 L10.25 8 L15.75 10 L21 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
      <circle cx="21" cy="5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ══════════════════════════════════════════
// ACCOUNT ICON — Avatar minimalista com anel
// ══════════════════════════════════════════
export function AccountIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <circle cx="12" cy="8" r="3.5" fill="currentColor" fillOpacity="0.8" />
      <path
        d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        fillOpacity="0"
      />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
    </svg>
  );
}

// ══════════════════════════════════════════
// BACK ARROW — Seta para voltar estilizada
// ══════════════════════════════════════════
export function BackIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// MAP PIN — Pin de localização único
// ══════════════════════════════════════════
export function MapPinIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="9" r="3" fill="currentColor" fillOpacity="0.8" />
      <circle cx="12" cy="9" r="1.2" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

// ══════════════════════════════════════════
// LOGOUT ICON — Seta saindo por porta
// ══════════════════════════════════════════
export function LogoutIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path
        d="M7.5 17H4.17C3.52 17 3 16.48 3 15.83V4.17C3 3.52 3.52 3 4.17 3H7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13 14L17 10L13 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="17" y1="10" x2="7.5" y2="10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// CLOCK — Relógio para tempo estimado
// ══════════════════════════════════════════
export function ClockIcon({ className = '', size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} {...rest}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.5V8L10.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ══════════════════════════════════════════
// DISTANCE — Régua de distância
// ══════════════════════════════════════════
export function DistanceIcon({ className = '', size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} {...rest}>
      <circle cx="2.5" cy="8" r="1.5" fill="currentColor" />
      <circle cx="13.5" cy="8" r="1.5" fill="currentColor" />
      <line x1="4" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 1.5" />
    </svg>
  );
}

// ══════════════════════════════════════════
// FLASH — Raio para velocidade/otimização
// ══════════════════════════════════════════
export function FlashIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path
        d="M11 2L3 11.5H9.5L8 18L17 8.5H10.5L11 2Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// CHECK — Confirmação de entrega
// ══════════════════════════════════════════
export function CheckIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <circle cx="10" cy="10" r="8" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M6 10L8.5 12.5L14 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// SPINNER — Loading animado
// ══════════════════════════════════════════
export function SpinnerIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
      <path
        d="M12 3C16.97 3 21 7.03 21 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// STARS — Teste grátis / destaque
// ══════════════════════════════════════════
export function StarsIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path
        d="M10 2L12.09 7.26L17.77 7.64L13.54 11.14L14.9 16.68L10 13.77L5.1 16.68L6.46 11.14L2.23 7.64L7.91 7.26L10 2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Brilho pequeno */}
      <path d="M16 1L16.6 2.5L18 3L16.6 3.5L16 5L15.4 3.5L14 3L15.4 2.5L16 1Z"
        fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}

// ══════════════════════════════════════════
// COPY — Copiar sequência
// ══════════════════════════════════════════
export function CopyIcon({ className = '', size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} {...rest}>
      <rect x="6.5" y="6.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 11.5V2.5H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ══════════════════════════════════════════
// WAZE & GOOGLE MAPS — Ícones de navegação
// ══════════════════════════════════════════
export function GoogleMapsIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <path d="M12 2C7.58 2 4 5.58 4 10C4 15.5 12 22 12 22C12 22 20 15.5 20 10C20 5.58 16.42 2 12 2Z"
        fill="url(#gm-grad)" />
      <circle cx="12" cy="10" r="3.5" fill="white" fillOpacity="0.9" />
      <defs>
        <linearGradient id="gm-grad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.4" stopColor="#34A853" />
          <stop offset="0.7" stopColor="#FBBC05" />
          <stop offset="1" stopColor="#EA4335" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function WazeIcon({ className = '', size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <ellipse cx="12" cy="13" rx="8" ry="7" fill="#33CCFF" fillOpacity="0.9" />
      <circle cx="9.5" cy="11" r="1.2" fill="#1A1A2E" />
      <circle cx="14.5" cy="11" r="1.2" fill="#1A1A2E" />
      <path d="M9.5 14.5C9.5 14.5 10.5 16 12 16C13.5 16 14.5 14.5 14.5 14.5"
        stroke="#1A1A2E" strokeWidth="1.2" strokeLinecap="round" />
      {/* Antena */}
      <path d="M16 6C16 6 17.5 4 16.5 2.5" stroke="#33CCFF" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="16.5" cy="2" r="1" fill="#33CCFF" />
    </svg>
  );
}

// ══════════════════════════════════════════
// CHEVRON RIGHT
// ══════════════════════════════════════════
export function ChevronRightIcon({ className = '', size = 16, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} {...rest}>
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ══════════════════════════════════════════
// PACKAGE — Caixinha de entrega
// ══════════════════════════════════════════
export function PackageIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z"
        fill="currentColor" fillOpacity="0.1"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 2L10 18" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.4" />
      <path d="M3 6L10 10L17 6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 4L13.5 8" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

// ══════════════════════════════════════════
// SPREADSHEET — Ícone customizado de Planilha
// ══════════════════════════════════════════
export function SpreadsheetIcon({ className = '', size = 22, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      {/* Moldura de planilha */}
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      {/* Cabeçalho da tabela */}
      <path d="M3 8.5H21" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.8" />
      {/* Divisória vertical */}
      <path d="M9.5 8.5V21" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.5" />
      {/* Linhas de dados */}
      <path d="M3 12.5H21" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="3 2" />
      <path d="M3 16.5H21" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="3 2" />
      {/* Destaque verde neon de dados */}
      <circle cx="6.2" cy="5.8" r="1.2" fill="#10D9A0" />
      <circle cx="12" cy="5.8" r="1.2" fill="#A78BFA" />
      <circle cx="17.8" cy="5.8" r="1.2" fill="#3B82F6" />
    </svg>
  );
}

// ══════════════════════════════════════════
// PLUS ICON — Símbolo + para adicionar
// ══════════════════════════════════════════
export function PlusIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ══════════════════════════════════════════
// TRASH ICON — Lixeira para remoção
// ══════════════════════════════════════════
export function TrashIcon({ className = '', size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path
        d="M3 5.5H17M8 2.5H12M7 8.5V14.5M13 8.5V14.5M4.5 5.5L5.2 16.2C5.3 16.9 5.9 17.5 6.7 17.5H13.3C14.1 17.5 14.7 16.9 14.8 16.2L15.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ══════════════════════════════════════════
// DUPLICATE ICON — Duplicar rota
// ══════════════════════════════════════════
export function DuplicateIcon({ className = '', size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path
        d="M6 13H4.5C3.7 13 3 12.3 3 11.5V4.5C3 3.7 3.7 3 4.5 3H11.5C12.3 3 13 3.7 13 4.5V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="6.5" y="6.5" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// ══════════════════════════════════════════
// EXPORT CSV ICON — Exportação de arquivo
// ══════════════════════════════════════════
export function ExportCsvIcon({ className = '', size = 18, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} {...rest}>
      <path d="M10 2.5V12M10 12L6.5 8.5M10 12L13.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 14.5V16C3.5 16.8 4.2 17.5 5 17.5H15C15.8 17.5 16.5 16.8 16.5 16V14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ══════════════════════════════════════════
// CAMERA / SCANNER ICON — Câmera e código de barras
// ══════════════════════════════════════════
export function CameraIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <path
        d="M4 7C4 5.9 4.9 5 6 5H8.5L10 3H14L15.5 5H18C19.1 5 20 5.9 20 7V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V7Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

// ══════════════════════════════════════════
// ADDRESS CARD ICON — Cartão de endereço manual
// ══════════════════════════════════════════
export function AddressCardIcon({ className = '', size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...rest}>
      <rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9H17M7 13H13M7 17H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}



