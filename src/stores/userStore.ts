import type { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';

import type { UserInfo } from '@/types';

// NOTE: type definitions for Vuex stores must be in the same file
type UserStore = UserInfo & {
    secretKey: CryptoKey | null;
    authHeader: string;
    userInitials: string;
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
        userInitials: '',
    },
    mutations: {
        setUserInfo(state, newUserInfo: Partial<UserInfo>) {
            state.firstName = newUserInfo.firstName?.trim() ?? state.firstName;
            state.lastName = newUserInfo.lastName?.trim() ?? state.lastName;
            state.email = newUserInfo.email?.trim() ?? state.email;

            state.userInitials = state.firstName[0].toUpperCase() + state.lastName[0].toUpperCase();
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
