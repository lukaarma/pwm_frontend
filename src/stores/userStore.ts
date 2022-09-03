import type { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';

import type { UserInfo } from '@/types';

// NOTE: type definitions for Vuex stores must be in the same file
type UserStore = UserInfo & {
    secretKey: CryptoKey | null;
    authHeader: string;
};

// define injection key
export const userStoreKey: InjectionKey<Store<UserStore>> = Symbol();

// Create a new store instance.
export const userStore = createStore<UserStore>({
    state: {
        email: '',
        firstName: '',
        lastName: '',
        secretKey: null,
        authHeader: '',
    },
    mutations: {
        setUserInfo(state, newUserInfo: Partial<UserInfo>) {
            state.firstName = newUserInfo.firstName ?? state.firstName;
            state.lastName = newUserInfo.lastName ?? state.lastName;
            state.email = newUserInfo.email ?? state.email;
        },
        setSecretKey(state, newSecretKey: CryptoKey) {
            state.secretKey = newSecretKey;
        },
        setAuthHeader(state, newAuthHeader: string) {
            state.authHeader = newAuthHeader;
        },
        logout(state) {
            state.email = '';
            state.firstName = '';
            state.lastName = '';
            state.secretKey = null;
            state.authHeader = '';
        },
    },
});

export function useUserStore() {
    return baseUseStore(userStoreKey);
}
