import type { Credential } from './stores/vaultStore';

/* ===== API types ===== */
export type WebMessage = {
    code: WEB_CODES;
    message: string;
};

export type LoginBody = {
    email: string;
    masterPwdHash: string;
};

export type LoginResponse = PSKBody & UserInfo;

export type SignupBody = {
    email: string;
    masterPwdHash: string;
    firstName: string;
    lastName: string;
    PSK: string;
    IV: string;
};

export type SignupResponse = WebMessage;

export type UpdateProfileBody = {
    firstName?: string;
    lastName?: string;
};

export type UserInfo = {
    email: string;
    firstName: string;
    lastName: string;
};

export type SendVerificationBody = {
    email: string;
};

export type PSKBody = {
    IV: string;
    PSK: string;
};

export type PSKResponse = PSKBody;

export type VaultBody = {
    version: number;
    lastModified: Date;
    IV: string;
    data: string;
};

export type VaultResponse = VaultBody;

export type APIResponse<T = WebMessage> = {
    data?: T;
    err?: WebMessage;
};

export type Result<T = WebMessage> =
    | {
          ok: true;
          data: T;
      }
    | {
          ok: false;
          err: WebMessage;
      };

export enum WEB_CODES {
    PSK_SAVED_SUCCESS = 100,
    VAULT_SAVED_SUCCESS,
    USERINFO_SAVED_SUCCESS,
    VERIFICATION_TOKEN_SENT = 110,
    PROFILE_VERIFIED = 120,
    VAULT_UPDATED = 130,

    LOGIN_FAILED = 300,
    SIGNUP_ERROR = 310,
    UNAUTHORIZED_ACCESS = 320,
    INVALID_VERIFICATION_TOKEN = 330,
    MISSING_PSK = 340,
    MISSING_VAULT,
    SAVE_PSK_ERROR = 350,
    SAVE_VAULT_ERROR,
    DUPLICATE_PSK = 360,
    DUPLICATE_VAULT,
    VAULT_LOWER_VERSION = 370,
    VAULT_OLDER_DATE,

    SYNTAX_BAD_REQUEST = 600,
    LOGIN_BAD_REQUEST,
    SIGNUP_BAD_REQUEST,
    UPDATE_PROFILE_BAD_REQUEST,
    SEND_VERIFICATION_BAD_REQUEST,
    VERIFY_TOKEN_BAD_REQUEST,
    PSK_BAD_REQUEST,
    VAULT_BAD_REQUEST,

    VAULT_DECRYPTED = 800,
    LOGIN_SUCCESS,

    MISSING_DATA = 900,
    MISSING_DATA_AND_ERROR,
    FAIL_VAULT_DECRYPT,
    FAIL_VAULT_ENCRYPT,
    INVALID_API_CALL,
}

/* ===== Vault export/import types ===== */
export type ExportedPWMVault =
    | {
          exportDate: Date;
          version: number;
          lastModified: Date;
          encrypted: true;
          // hex
          IV: string;
          // base64
          data: string;
      }
    | {
          exportDate: Date;
          version: number;
          lastModified: Date;
          encrypted: false;
          credentials: Array<Credential>;
      };

// NOTE: it's a type guard, it should accept any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isExportedPWMVault(vault: any): vault is ExportedPWMVault {
    if (
        vault.exportDate instanceof Date &&
        typeof vault.version === 'number' &&
        vault.lastModified instanceof Date &&
        ((vault.encrypted === true &&
            typeof vault.IV === 'string' &&
            typeof vault.data === 'string') ||
            (vault.encrypted === false && Array.isArray(vault.credentials)))
    ) {
        return true;
    }

    return false;
}
