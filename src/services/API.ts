import axios, { AxiosError } from 'axios';
import { userStore } from '@/stores/userStore';

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
                return {
                    err: err.response?.data as WebMessage,
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
                return {
                    err: err.response?.data as WebMessage,
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
                return {
                    err: err.response?.data as WebMessage,
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
                return {
                    err: err.response?.data as WebMessage,
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
                return {
                    err: err.response?.data as WebMessage,
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
                return {
                    err: err.response?.data as WebMessage,
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
                return {
                    err: err.response?.data as WebMessage,
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
    updateUserInfo
};
