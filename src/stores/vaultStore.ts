import type { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store } from 'vuex';

// define your typings for the store state

export type Credential = {
    name: string;
    url: string;
    username: string;
    password: string;
};

type MInsertCredential = {
    index: number;
    credential: Credential;
};

type MUpdateCredential = {
    index: number;
    newIndex?: number;
    credential: Credential;
};

type CredentialUpdateAction = {
    index: number;
    credential: Credential;
};

export type VaultStore = {
    version: number;
    lastModified: Date;
    IV: Uint8Array;
    credentials: Array<Credential>;
};

// define injection key
export const vaultKey: InjectionKey<Store<VaultStore>> = Symbol();

// mutations/actions names
export const VAULT_M = {
    INSERT_CREDENTIAL: 'insertCredential',
    BULK_INSERT_CREDENTIAL: 'bulkInsertCredential',
    UPDATE_CREDENTIAL: 'updateCredential',
    DELETE_CREDENTIAL: 'deleteCredential',
    SET_VAULT: 'setVault',
    LOGOUT: 'logout',
};

export const VAULT_A = {
    SET_CREDENTIAL: 'setCredential',
};

// Create a new store instance.
export const vaultStore = createStore<VaultStore>({
    state: {
        version: 0,
        lastModified: new Date(),
        IV: new Uint8Array(),
        credentials: [],
    },
    getters: {
        getCredentials: (state) => (filter: string, page: number, itemsPerPage: number) => {
            let filtered: Array<number>;
            filter = filter.toLowerCase();

            if (filter === '') {
                filtered = [...state.credentials.keys()];
            } else {
                filtered = state.credentials.reduce((result, cred, index) => {
                    if (
                        cred.name.toLowerCase().match(filter) ||
                        cred.username.toLowerCase().match(filter)
                    ) {
                        result.push(index);
                    }

                    return result;
                }, [] as Array<number>);
            }

            return {
                list: filtered.slice(itemsPerPage * (page - 1), itemsPerPage * page),
                pageCount: Math.ceil(filtered.length / itemsPerPage) || 1,
            };
        },
    },
    mutations: {
        insertCredential(state, insert: MInsertCredential) {
            state.credentials.splice(insert.index, 0, insert.credential);

            state.version++;
            state.lastModified = new Date();
            window.crypto.getRandomValues(state.IV);
        },
        bulkInsertCredential(state, credentials: Array<Credential>) {
            state.credentials = state.credentials.concat(credentials);
            state.credentials.sort((a, b) => a.name.localeCompare(b.name));

            state.version++;
            state.lastModified = new Date();
            window.crypto.getRandomValues(state.IV);
        },
        updateCredential(state, update: MUpdateCredential) {
            if (update.newIndex) {
                // delete at current index
                state.credentials.splice(update.index, 1);
                // insert at new index
                state.credentials.splice(update.newIndex, 0, update.credential);
            } else {
                state.credentials[update.index] = update.credential;
            }

            state.version++;
            state.lastModified = new Date();
            window.crypto.getRandomValues(state.IV);
        },
        deleteCredential(state, index: number) {
            state.credentials.splice(index, 1);

            state.version++;
            state.lastModified = new Date();
            window.crypto.getRandomValues(state.IV);
        },
        setVault(state, newVault: Partial<VaultStore>) {
            state.version = newVault.version ?? state.version;
            state.lastModified = newVault.lastModified ?? state.lastModified;
            state.IV = newVault.IV ?? state.IV;
            state.credentials = newVault.credentials ?? state.credentials;

            if (newVault.credentials) {
                state.credentials.sort((a, b) => a.name.localeCompare(b.name));
            }
        },
        logout(state) {
            state.version = 0;
            state.lastModified = new Date();
            state.IV = new Uint8Array();
            state.credentials = [];
        },
    },
    actions: {
        setCredential({ state, commit }, update: CredentialUpdateAction): number {
            let newIndex = undefined;

            console.debug(`[VAULT_STORE] Requested update for index ${update.index}`);

            // if new credential or name updated we find the new index
            if (
                update.index === -1 ||
                update.credential.name !== state.credentials[update.index].name
            ) {
                for (
                    newIndex = 0;
                    newIndex < state.credentials.length &&
                    state.credentials[newIndex].name.localeCompare(update.credential.name) < 0;
                    newIndex++
                );
            }

            // if new insert, else update
            if (update.index === -1) {
                console.debug(`[VAULT_STORE] Inserting credential at ${newIndex}`);

                commit(VAULT_M.INSERT_CREDENTIAL, {
                    index: newIndex,
                    // NOTE: must use deep copy to disconnect ref in dialog from credential in vault
                    credential: { ...update.credential },
                });
            } else {
                console.debug(
                    `[VAULT_STORE] Updating credential at ${update.index} to ${newIndex}`
                );

                commit(VAULT_M.UPDATE_CREDENTIAL, {
                    index: update.index,
                    newIndex,
                    // NOTE: must use deep copy to disconnect ref in dialog from credential in vault
                    credential: { ...update.credential },
                });
            }

            return newIndex ?? update.index;
        },
    },
});

export function useVaultStore() {
    return baseUseStore(vaultKey);
}
