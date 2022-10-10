import type { InjectionKey } from 'vue';
import { createStore, Store, useStore as baseUseStore } from 'vuex';

import { PASSWORD_OPTIONS } from '@/types';

// define your typings for the store state
type ConfigStore = {
    darkMode: boolean;
    itemsPerPage: number;
    pwdGen: PasswordGeneratorConfig;
};

type PasswordGeneratorConfig = {
    chipSelection: Array<PASSWORD_OPTIONS>;
    passwordLength: number;
    numbersPercentage: number;
    symbolsPercentage: number;
};

export const localStorageConfigKey = 'PWMConfig';
export const passwordMinLength = 8;
export const passwordMaxLength = 128;
export const percentageStep = 5;
// define injection key
export const configKey: InjectionKey<Store<ConfigStore>> = Symbol();

export const CONFIG_M = {
    TOGGLE_DARK_MODE: 'toggleDarkMode',
    SET_ITEMS_PER_PAGE: 'setItemsPerPage',
    EDIT_PWD_GEN_CONFIG: 'editPwdGenConfig',
};

// Create a new store instance.
export const configStore = createStore<ConfigStore>({
    state() {
        const config: ConfigStore = {
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            itemsPerPage: 25,
            pwdGen: {
                chipSelection: [
                    PASSWORD_OPTIONS.LOWER_CASE,
                    PASSWORD_OPTIONS.UPPER_CASE,
                    PASSWORD_OPTIONS.NUMBERS,
                    PASSWORD_OPTIONS.SYMBOLS,
                ],
                passwordLength: 24,
                numbersPercentage: 10,
                symbolsPercentage: 10,
            },
        };

        console.log('[CONFIG] Loading initial config from local storage');

        const stored = JSON.parse(localStorage.getItem(localStorageConfigKey) || 'null');
        if (stored) {
            if (typeof stored.darkMode === 'boolean') {
                config.darkMode = stored.darkMode;
            }
            if (typeof stored.itemsPerPage === 'number') {
                config.itemsPerPage = stored.itemsPerPage;
            }
            if (typeof stored.pwdGen === 'object') {
                if (
                    Array.isArray(stored.pwdGen.chipSelection) &&
                    stored.pwdGen.chipSelection.every(
                        (el: unknown) =>
                            typeof el === 'string' &&
                            config.pwdGen.chipSelection.includes(el as PASSWORD_OPTIONS)
                    )
                ) {
                    config.pwdGen.chipSelection = [
                        ...new Set<PASSWORD_OPTIONS>(stored.pwdGen.chipSelection),
                    ];
                }

                if (
                    typeof stored.pwdGen.passwordLength === 'number' &&
                    stored.pwdGen.passwordLength >= passwordMinLength &&
                    stored.pwdGen.passwordLength <= passwordMaxLength
                ) {
                    config.pwdGen.passwordLength = stored.pwdGen.passwordLength;
                }

                if (
                    typeof stored.pwdGen.numbersPercentage === 'number' &&
                    stored.pwdGen.numbersPercentage >= 0 &&
                    stored.pwdGen.numbersPercentage <= 100 &&
                    stored.pwdGen.numbersPercentage % percentageStep === 0
                ) {
                    config.pwdGen.numbersPercentage = stored.pwdGen.numbersPercentage;
                }

                if (
                    typeof stored.pwdGen.symbolsPercentage === 'number' &&
                    stored.pwdGen.symbolsPercentage >= 0 &&
                    stored.pwdGen.symbolsPercentage <= 100 &&
                    stored.pwdGen.symbolsPercentage % percentageStep === 0
                ) {
                    config.pwdGen.symbolsPercentage = stored.pwdGen.symbolsPercentage;
                }
            }
        }

        localStorage.setItem('PWMConfig', JSON.stringify(config));

        console.log('[CONFIG] Saving initial config to local storage');

        return config;
    },
    getters: {
        lowerCaseSelected(state) {
            return state.pwdGen.chipSelection.includes(PASSWORD_OPTIONS.LOWER_CASE);
        },
        upperCaseSelected(state) {
            return state.pwdGen.chipSelection.includes(PASSWORD_OPTIONS.UPPER_CASE);
        },
        numbersSelected(state) {
            return state.pwdGen.chipSelection.includes(PASSWORD_OPTIONS.NUMBERS);
        },
        symbolsSelected(state) {
            return state.pwdGen.chipSelection.includes(PASSWORD_OPTIONS.SYMBOLS);
        },
    },
    mutations: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
        },
        setItemsPerPage(state, itemsPerPage: number) {
            state.itemsPerPage = itemsPerPage;
        },
        editPwdGenConfig(state, newConfig: Partial<PasswordGeneratorConfig>) {
            if (newConfig.chipSelection) {
                state.pwdGen.chipSelection = newConfig.chipSelection;
            }

            if (newConfig.passwordLength) {
                state.pwdGen.passwordLength = newConfig.passwordLength;
            }

            if (newConfig.numbersPercentage) {
                state.pwdGen.numbersPercentage = newConfig.numbersPercentage;
            }

            if (newConfig.symbolsPercentage) {
                state.pwdGen.symbolsPercentage = newConfig.symbolsPercentage;
            }
        },
    },
});

export function useConfigStore() {
    return baseUseStore(configKey);
}

let debounce: number;
const debounceTimeout = 1000;
configStore.subscribe((_, state) => {
    clearTimeout(debounce);

    debounce = setTimeout(() => {
        console.debug('[CONFIG] Config changed, saving to local storage');
        localStorage.setItem(localStorageConfigKey, JSON.stringify(state));
    }, debounceTimeout);
});
