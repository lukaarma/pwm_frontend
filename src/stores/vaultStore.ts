import type { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';

// define your typings for the store state

type VaultItem = {
    websiteName: string;
    url: string;
    username: string;
    password: string;
};

export type VaultStore = {
    version: number;
    lastModified: Date;
    IV: Uint8Array;
    data: Array<VaultItem>;
};

// define injection key
export const vaultKey: InjectionKey<Store<VaultStore>> = Symbol();

// Create a new store instance.
export const vaultStore = createStore<VaultStore>({
    state: {
        version: 0,
        lastModified: new Date(),
        IV: new Uint8Array(),
        data: [],
    },
    mutations: {
        setVault(state, newVault: Partial<VaultStore>) {
            state.version = newVault.version ?? state.version;
            state.lastModified = newVault.lastModified ?? state.lastModified;
            state.IV = newVault.IV ?? state.IV;
            state.data = newVault.data ?? state.data;
        },
        logout(state) {
            state.version = 0;
            state.lastModified = new Date();
            state.IV = new Uint8Array();
            state.data = [];
        },
    },
});

export function useVaultStore() {
    return baseUseStore(vaultKey);
}
