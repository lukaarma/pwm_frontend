import type { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';

// define your typings for the store state
export type User = {
    firstName: string;
    secretKey: CryptoKey | null;
};

// define injection key
export const userStoreKey: InjectionKey<Store<User>> = Symbol();

// Create a new store instance.
export const userStore = createStore<User>({
    state: {
        firstName: '',
        secretKey: null,
    },
    mutations: {
        setFirstName(state, newFirstName: string) {
            state.firstName = newFirstName;
        },
        setSecretKey(state, newSecretKey: CryptoKey) {
            state.secretKey = newSecretKey;
        },
        logout(state) {
            state.firstName = '';
            state.secretKey = null;
        },
    },
});

export function useUserStore() {
    return baseUseStore(userStoreKey);
}
