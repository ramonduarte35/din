/**
 * @file privacy.ts
 * @description Chamadas de API para os endpoints LGPD de privacidade e DSR.
 */

import { api } from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export interface OptInTypes {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentRecord {
  id:          string;
  version:     string;
  term:        { version: string; title: string; contentUrl: string };
  consentedAt: string;
  withdrawnAt: string | null;
  isActive:    boolean;
  optInTypes:  OptInTypes;
}

export interface ActiveTerm {
  id:         string;
  version:    string;
  title:      string;
  contentUrl: string;
  isActive:   boolean;
}

export interface ConsentsResponse {
  activeTerm: ActiveTerm | null;
  consents:   ConsentRecord[];
}

export interface DsrJobResponse {
  jobId:             string;
  status:            'PROCESSING' | 'COMPLETED' | 'FAILED';
  message:           string;
  estimatedDelivery?: string;
  statusUrl?:        string;
  retainedData?:     string[];
  logoutRequired?:   boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Funções de API
// ─────────────────────────────────────────────────────────────────────────────

/** Busca consentimentos ativos e histórico do usuário. */
export async function getConsents(): Promise<ConsentsResponse> {
  const { data } = await api.get<ConsentsResponse>('/privacy/consents');
  return data;
}

/**
 * Registra novo consentimento granular.
 * @param termId    - UUID do termo ativo
 * @param optInTypes - Preferências de consentimento
 */
export async function recordConsent(
  termId: string,
  optInTypes: OptInTypes
): Promise<ConsentRecord> {
  const { data } = await api.post<{ consent: ConsentRecord }>('/privacy/consents', {
    termId,
    optInTypes,
  });
  return data.consent;
}

/** Solicita exportação dos dados do usuário (job assíncrono). */
export async function requestDataExport(): Promise<DsrJobResponse> {
  const { data } = await api.post<DsrJobResponse>('/privacy/export-data');
  return data;
}

/** Verifica o status de um job DSR. */
export async function getDsrJobStatus(jobId: string): Promise<DsrJobResponse> {
  const { data } = await api.get<DsrJobResponse>(`/privacy/export-data/status/${jobId}`);
  return data;
}

/** Solicita anonimização completa (forget-me). */
export async function requestForgetMe(reason?: string): Promise<DsrJobResponse> {
  const { data } = await api.post<DsrJobResponse>('/privacy/forget-me', {
    confirmation: 'CONFIRMAR_EXCLUSAO',
    reason,
  });
  return data;
}
