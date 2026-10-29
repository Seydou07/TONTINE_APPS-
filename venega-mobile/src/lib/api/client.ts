import { API_URL, REQUEST_TIMEOUT_MS } from './config';
import { clearTokens, getTokens, setTokens } from './session';
import type { Tokens } from './session';

/** Erreur d'API avec un message prêt à afficher à l'utilisateur (en français). */
export class ApiError extends Error {
  constructor(
    message: string,
    /** Code HTTP ; 0 = pas de réponse (réseau coupé, délai dépassé). */
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const NETWORK_MESSAGE = 'Connexion impossible. Vérifiez votre réseau et réessayez.';
const SERVER_MESSAGE = 'Le service est momentanément indisponible. Réessayez dans un instant.';
const TOO_MANY_MESSAGE = 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Joindre le jeton d'accès (true par défaut). */
  auth?: boolean;
};

async function send(path: string, { method = 'GET', body, auth = true }: Options, token?: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  } finally {
    clearTimeout(timer);
  }
}

/** Message d'erreur NestJS (`message` peut être une chaîne ou une liste de validations). */
async function errorFrom(res: Response): Promise<ApiError> {
  if (res.status >= 500) return new ApiError(SERVER_MESSAGE, res.status);
  if (res.status === 429) return new ApiError(TOO_MANY_MESSAGE, res.status);
  try {
    const data = await res.json();
    const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
    if (typeof msg === 'string' && msg) return new ApiError(msg, res.status);
  } catch {
    // corps vide ou non JSON
  }
  return new ApiError('La demande n’a pas abouti. Réessayez.', res.status);
}

let refreshing: Promise<Tokens | null> | null = null;

/** Un seul rafraîchissement à la fois, même si plusieurs requêtes échouent ensemble. */
function refreshTokens(refreshToken: string): Promise<Tokens | null> {
  refreshing ??= (async () => {
    try {
      const res = await send('/auth/refresh', { method: 'POST', body: { refreshToken }, auth: false });
      if (!res.ok) {
        await clearTokens();
        return null;
      }
      const tokens = (await res.json()) as Tokens;
      await setTokens(tokens);
      return tokens;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/**
 * Appel JSON à l'API. Sur 401, tente une fois de rafraîchir la session puis rejoue la requête.
 * Lève toujours une `ApiError` en cas d'échec.
 */
export async function apiRequest<T>(path: string, options: Options = {}): Promise<T> {
  const tokens = options.auth === false ? null : await getTokens();
  let res = await send(path, options, tokens?.accessToken);

  if (res.status === 401 && tokens?.refreshToken) {
    const renewed = await refreshTokens(tokens.refreshToken);
    if (renewed) res = await send(path, options, renewed.accessToken);
  }

  if (!res.ok) throw await errorFrom(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
