import axios, { AxiosError } from 'axios';

import { hashCredential } from '@/services/cryptoUtils';
import { userStore } from '@/stores/userStore';
import { WEB_CODES } from '@/types';
import type {
    LoginBody,
    LoginResponse,
    SignupBody,
    UserInfo,
    UpdateProfileBody,
    VaultBody,
    VaultResponse,
    APIResponse,
    WebMessage,
} from '@/types';

// FIXME: hardcoded API endpoint BAD!!!
const API = axios.create({ baseURL: 'https://dev.lukaarma.dynu.net/api' });

async function login(user: LoginBody): Promise<APIResponse<LoginResponse>> {
    return API.post('/user/login', user)
        .then((res) => {
            userStore.commit('setAuthHeader', res.headers.authorization);

            return {
                data: res.data as LoginResponse,
            };
        })
        .catch((err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 502) {
                    return {
                        err: {
                            code: WEB_CODES.SERVER_UNREACHABLE,
                            message:
                                'Error while communicating with our servers! Please try again later.',
                        },
                    };
                }
                return {
                    err: (err.response?.data as WebMessage) ?? {
                        code: err.code,
                        message: err.message,
                    },
                };
            } else {
                throw err;
            }
        });
}

async function signup(user: SignupBody): Promise<APIResponse> {
    return API.post('/user/signup', user)
        .then((res) => {
            return {
                data: res.data,
            };
        })
        .catch((err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 502) {
                    return {
                        err: {
                            code: WEB_CODES.SERVER_UNREACHABLE,
                            message:
                                'Error while communicating with our servers! Please try again later.',
                        },
                    };
                }
                return {
                    err: (err.response?.data as WebMessage) ?? {
                        code: err.code,
                        message: err.message,
                    },
                };
            } else {
                throw err;
            }
        });
}

async function sendVerification(email: string): Promise<APIResponse> {
    return API.post('/user/sendVerification', { email })
        .then((res) => {
            return {
                data: res.data,
            };
        })
        .catch((err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 502) {
                    return {
                        err: {
                            code: WEB_CODES.SERVER_UNREACHABLE,
                            message:
                                'Error while communicating with our servers! Please try again later.',
                        },
                    };
                }
                return {
                    err: (err.response?.data as WebMessage) ?? {
                        code: err.code,
                        message: err.message,
                    },
                };
            } else {
                throw err;
            }
        });
}

async function getUserInfo(): Promise<APIResponse<UserInfo>> {
    return API.get('/user/profile', { headers: { Authorization: userStore.state.authHeader } })
        .then((res) => {
            return {
                data: res.data as UserInfo,
            };
        })
        .catch((err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 502) {
                    return {
                        err: {
                            code: WEB_CODES.SERVER_UNREACHABLE,
                            message:
                                'Error while communicating with our servers! Please try again later.',
                        },
                    };
                }
                return {
                    err: (err.response?.data as WebMessage) ?? {
                        code: err.code,
                        message: err.message,
                    },
                };
            } else {
                throw err;
            }
        });
}

async function updateUserInfo(profile: UpdateProfileBody): Promise<APIResponse<UserInfo>> {
    return API.put('/user/profile', profile, {
        headers: { Authorization: userStore.state.authHeader },
    })
        .then((res) => {
            return {
                data: res.data as UserInfo,
            };
        })
        .catch((err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 502) {
                    return {
                        err: {
                            code: WEB_CODES.SERVER_UNREACHABLE,
                            message:
                                'Error while communicating with our servers! Please try again later.',
                        },
                    };
                }
                return {
                    err: (err.response?.data as WebMessage) ?? {
                        code: err.code,
                        message: err.message,
                    },
                };
            } else {
                throw err;
            }
        });
}

async function getVault(): Promise<APIResponse<VaultResponse>> {
    return API.get('/vault', { headers: { Authorization: userStore.state.authHeader } })
        .then((res) => {
            return {
                data: res.data as VaultResponse,
            };
        })
        .catch((err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 502) {
                    return {
                        err: {
                            code: WEB_CODES.SERVER_UNREACHABLE,
                            message:
                                'Error while communicating with our servers! Please try again later.',
                        },
                    };
                }
                return {
                    err: (err.response?.data as WebMessage) ?? {
                        code: err.code,
                        message: err.message,
                    },
                };
            } else {
                throw err;
            }
        });
}

async function sendVault(vault: VaultBody, createNew = false): Promise<APIResponse> {
    return API.request({
        method: createNew ? 'post' : 'put',
        url: '/vault',
        data: vault,
        headers: {
            Authorization: userStore.state.authHeader,
        },
    })
        .then((res) => {
            return {
                data: res.data,
            };
        })
        .catch((err: Error | AxiosError) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 502) {
                    return {
                        err: {
                            code: WEB_CODES.SERVER_UNREACHABLE,
                            message:
                                'Error while communicating with our servers! Please try again later.',
                        },
                    };
                }
                return {
                    err: (err.response?.data as WebMessage) ?? {
                        code: err.code,
                        message: err.message,
                    },
                };
            } else {
                throw err;
            }
        });
}

export default {
    login,
    signup,
    sendVerification,
    sendVault,
    getVault,
    getUserInfo,
    updateUserInfo,
};

export async function checkPWNEDPassword(password: string): Promise<number> {
    const hash = (await hashCredential(password)).toUpperCase();
    const hashMatch = hash.substring(5);
    console.log(hash);

    const res = await axios
        .get<string>(`https://api.pwnedpasswords.com/range/${hash.substring(0, 5)}`)
        .catch(() => {
            throw new Error('Error while sending request to HaveIBeenPwned services');
        });

    const match = res.data.split(/\r?\n/).find((line: string) => line.startsWith(hashMatch));
    return parseInt(match?.split(':')[1] ?? '0');
}
