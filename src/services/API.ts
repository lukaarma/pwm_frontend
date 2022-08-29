import axios, { AxiosError } from 'axios';

import type { LoginBody, LoginResponse, SignupBody, APIResponse, WebMessage } from '@/types';

const API = axios.create({ baseURL: 'https://dev.lukaarma.dynu.net/api' });

// FIXME: move header in vuex store
async function login(user: LoginBody): Promise<APIResponse<LoginResponse>> {
    return API.post('/user/login', user)
        .then((res) => {
            API.defaults.headers.common.authorization = res.headers.authorization;

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

export default {
    login,
    signup,
};
