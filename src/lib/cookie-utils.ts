const COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  secure: import.meta.env.PROD,
  httpOnly: false,
};

export const cookieStorage = {
  get<T = string>(key: string): T | null {
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [cookieKey, ...valueParts] = cookie.trim().split('=');
        if (cookieKey === key) {
          const value = valueParts.join('=');
          try {
            return JSON.parse(decodeURIComponent(value)) as T;
          } catch {
            return value as unknown as T;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  },

  set<T = string>(key: string, value: T, days = 7): void {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      const encodedValue = encodeURIComponent(typeof value === 'string' ? value : JSON.stringify(value));
      const expiresStr = `expires=${expires.toUTCString()}`;
      const optionsStr = Object.entries(COOKIE_OPTIONS)
        .filter(([k]) => k !== 'httpOnly')
        .map(([k, v]) => `${k}=${v}`)
        .join('; ');
      document.cookie = `${key}=${encodedValue};${expiresStr};${optionsStr}`;
    } catch {
      console.error('Failed to set cookie');
    }
  },

  remove(key: string): void {
    try {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    } catch {
      console.error('Failed to remove cookie');
    }
  },

  has(key: string): boolean {
    return this.get(key) !== null;
  },
};

export function sanitizeForHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  const strValue = String(str);
  return strValue
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function maskCNPJ(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj;
  return `${cnpj.slice(0, 2)}.XXX.XXX/${cnpj.slice(12, 14)}-XX`;
}

export function maskCPF(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.XXX.XXX-${cpf.slice(9, 11)}`;
}

export function maskDocument(doc: string): string {
  if (!doc) return doc;
  const clean = doc.replace(/\D/g, '');
  if (clean.length === 14) return maskCNPJ(clean);
  if (clean.length === 11) return maskCPF(clean);
  return doc;
}
