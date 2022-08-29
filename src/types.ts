/* ===== API types ===== */

export type WebMessage = {
    code: number;
    message: string;
};

export type LoginBody = {
    email: string;
    masterPwdHash: string;
};

export type LoginResponse = {
    firstName: string;
    PSK: string;
    IV: string;
};

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

export type SendVerificationBody = {
    email: string;
};

export type ProtSymKeyBody = {
    IV: string;
    data: string;
};

export type APIResponse<T = WebMessage> = {
    data?: T;
    err?: WebMessage;
};

export type Result =
    | {
          ok: true;
          data?: WebMessage;
      }
    | {
          ok: false;
          err: WebMessage;
      };
