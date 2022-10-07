import type { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';

// define your typings for the store state
type ConfigStore = {
    darkMode: boolean;
    itemsPerPage: number
};

export const localStorageConfigKey = 'PWMConfig';
// define injection key
export const configKey: InjectionKey<Store<ConfigStore>> = Symbol();

// Create a new store instance.
export const configStore = createStore<ConfigStore>({
    state() {
        const config: ConfigStore = {
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            itemsPerPage: 25
        };

        console.log('[CONFIG] Loading initial config from local storage');

        const stored = JSON.parse(localStorage.getItem(localStorageConfigKey) || 'null');
        if (stored) {
            if (typeof stored.darkMode === 'boolean') {
                config.darkMode = stored.darkMode;
            }
            if (typeof stored.itemsPerPage === 'number') {
                config.itemsPerPage = stored.itemsPerPage
            }
        }

        localStorage.setItem('PWMConfig', JSON.stringify(config));

        console.log('[CONFIG] Saving initial config to local storage');

        return config;
    },
    mutations: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
        },
        setItemsPerPage(state, itemsPerPage: number) {
            state.itemsPerPage = itemsPerPage
        }
    },
});

configStore.subscribe((_, state) => {
    console.log('[CONFIG] Config changed, saving to local storage');
    localStorage.setItem(localStorageConfigKey, JSON.stringify(state));
});

export function useConfigStore() {
    return baseUseStore(configKey);
}
