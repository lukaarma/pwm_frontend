import type { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';

// define your typings for the store state
type ConfigStore = {
    darkMode: boolean;
};

const localStorageKey = 'PWMConfig';
// define injection key
export const configKey: InjectionKey<Store<ConfigStore>> = Symbol();

// Create a new store instance.
export const configStore = createStore<ConfigStore>({
    state() {
        const config: ConfigStore = {
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        };

        console.log('[CONFIG] Loading initial config from local storage');

        const stored = JSON.parse(localStorage.getItem(localStorageKey) || 'null');

        if (stored && typeof stored.darkMode === 'boolean') {
            config.darkMode = stored.darkMode;
        }

        localStorage.setItem('darkMode', JSON.stringify(config.darkMode));

        console.log('[CONFIG] Saving initial config to local storage');

        return config;
    },
    mutations: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
        },
    },
});

configStore.subscribe((_, state) => {
    console.log('[CONFIG] Config changed, saving to local storage');
    localStorage.setItem(localStorageKey, JSON.stringify(state));
});

export function useConfigStore() {
    return baseUseStore(configKey);
}
