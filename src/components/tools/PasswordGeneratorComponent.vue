<template>
    <v-card elevation="4" class="cardBackground">
        <v-card-title class="text-center text-h4 mt-2 mb-4 font-weight-light breakNewline">
            Secure Password Generator
        </v-card-title>

        <v-card-text>
            <v-form @submit.prevent="regenerate" fluid class="centerForm mt-4">
                <div class="toastContainer">
                    <Toast
                        class="formToast passwordToast"
                        :type="toastControls.type"
                        :show="toastControls.show"
                        :msg="toastControls.msg"
                        @close="toastControls.show = false"
                    />
                </div>

                <div class="d-flex passwordBox">
                    <p class="passwordText">
                        <span v-for="(char, index) in password" :key="index" :class="color(char)">{{
                            char
                        }}</span>
                    </p>

                    <v-spacer />

                    <v-icon
                        :icon="mdiContentCopy"
                        class="passwordCopyIcon my-auto"
                        @click.stop="copyToClipBoard"
                    />
                </div>

                <v-container class="pa-0" id="passwordGeneratorContainer">
                    <!-- SWITCH ROW MOBILE/DESKTOP -->
                    <v-row>
                        <v-col>
                            <v-chip-group
                                v-model="chipSelection"
                                mandatory
                                multiple
                                column
                                class="d-flex justify-space-around"
                            >
                                <v-chip
                                    :value="PASSWORD_OPTIONS.LOWER_CASE"
                                    :text="PASSWORD_OPTIONS.LOWER_CASE"
                                    filter
                                    color="green"
                                />

                                <v-chip
                                    :value="PASSWORD_OPTIONS.UPPER_CASE"
                                    :text="PASSWORD_OPTIONS.UPPER_CASE"
                                    filter
                                    color="green"
                                />

                                <v-responsive v-show="$vuetify.display.mobile" width="100%" />

                                <v-chip
                                    :value="PASSWORD_OPTIONS.NUMBERS"
                                    :text="PASSWORD_OPTIONS.NUMBERS"
                                    filter
                                    color="green"
                                />
                                <v-chip
                                    :value="PASSWORD_OPTIONS.SYMBOLS"
                                    :text="PASSWORD_OPTIONS.SYMBOLS"
                                    filter
                                    color="green"
                                />
                            </v-chip-group>
                        </v-col>
                    </v-row>

                    <!-- MOBILE SIZE CONTROLS -->
                    <template v-if="$vuetify.display.mobile">
                        <v-row no-gutters class="mt-4">
                            <v-col>
                                <v-text-field
                                    v-model.number="passwordLength"
                                    type="tel"
                                    label="Password length"
                                    @keypress="filterNumbers"
                                    @focusout="regenerate"
                                />
                            </v-col>
                        </v-row>

                        <v-row no-gutters>
                            <v-col>
                                <v-text-field
                                    v-model.number="numbersPercentage"
                                    type="tel"
                                    label="Numbers %"
                                    suffix="%"
                                    :disabled="!configStore.getters.numbersSelected"
                                    @keypress="filterNumbers"
                                    @focusout="regenerate"
                                />
                            </v-col>

                            <v-col cols="1"></v-col>

                            <v-col>
                                <v-text-field
                                    v-model.number="symbolsPercentage"
                                    type="tel"
                                    label="Symbols %"
                                    suffix="%"
                                    :disabled="!configStore.getters.symbolsSelected"
                                    @keypress="filterNumbers"
                                    @focusout="regenerate"
                                />
                            </v-col>
                        </v-row>
                    </template>

                    <!-- DESKTOP SIZE CONTROLS -->
                    <template v-else>
                        <v-row no-gutters class="mt-4">
                            <v-col>
                                <div class="text-overline">Password length</div>
                                <v-slider
                                    v-model="passwordLength"
                                    :min="passwordMinLength"
                                    :max="passwordMaxLength"
                                    step="1"
                                    @update:modelValue="regenerate"
                                    color="primary"
                                >
                                    <template v-slot:prepend>
                                        <span class="scrollbarStart">{{ passwordLength }}</span>
                                    </template>
                                    <template v-slot:append>
                                        <span class="scrollbarEnd">
                                            Max {{ passwordMaxLength }}
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row no-gutters>
                            <v-col>
                                <div class="text-overline">Numbers percentage</div>
                                <v-slider
                                    v-model="numbersPercentage"
                                    :min="configStore.getters.numbersSelected ? 5 : 0"
                                    :max="numbersMaxPercentage"
                                    :step="percentageStep"
                                    :disabled="!configStore.getters.numbersSelected"
                                    :readonly="numbersOnly"
                                    @update:modelValue="regenerate"
                                    color="primary"
                                >
                                    <template v-slot:prepend>
                                        <span class="scrollbarStart">
                                            {{ numbersPercentage }}%
                                        </span>
                                    </template>
                                    <template v-slot:append>
                                        <span class="scrollbarEnd">
                                            Max {{ numbersMaxPercentage }}%
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>

                        <v-row no-gutters>
                            <v-col>
                                <div class="text-overline">Symbols percentage</div>
                                <v-slider
                                    v-model="symbolsPercentage"
                                    :min="configStore.getters.symbolsSelected ? 5 : 0"
                                    :max="symbolsMaxPercentage"
                                    :step="percentageStep"
                                    :disabled="!configStore.getters.symbolsSelected"
                                    :readonly="symbolsOnly"
                                    @update:modelValue="regenerate"
                                    color="primary"
                                >
                                    <template v-slot:prepend>
                                        <span class="scrollbarStart">
                                            {{ symbolsPercentage }}%
                                        </span>
                                    </template>
                                    <template v-slot:append>
                                        <span class="scrollbarEnd">
                                            Max {{ symbolsMaxPercentage }}%
                                        </span>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                    </template>

                    <div
                        class="mb-4 d-flex"
                        :class="[$vuetify.display.mobile ? 'justify-space-between' : 'justify-end']"
                    >
                        <v-btn @click="reset" size="large" color="secondary"> Reset </v-btn>
                        <v-btn
                            class="ml-4"
                            type="submit"
                            :loading="loading"
                            size="large"
                            color="primary"
                        >
                            Regenerate
                        </v-btn>
                    </div>
                </v-container>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<style lang="scss">
.passwordToast {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
}

.scrollbarStart {
    display: inline-block;
    width: 3rem;
}
.scrollbarEnd {
    display: inline-block;
    width: 5rem;
    text-align: right;
}

// override default Vuetify style
#passwordGeneratorContainer .v-input__prepend {
    margin-inline-end: 8px;
}

.passwordBox {
    max-width: 500px;
    margin: 0px auto 16px;
    border-width: 1px;
    border-style: solid;
    border-radius: 8px;
    white-space: pre-wrap;
    word-break: break-all;
    word-wrap: break-word;
}

.passwordText {
    margin: 16px 8px 16px 16px;
}

.passwordNumber {
    color: #9c27b0;
}
.passwordSymbol {
    color: #4caf50;
}

.passwordCopyIcon {
    min-width: 32px;
    min-height: 32px;
    margin: auto 8px;
}

.v-theme--light {
    & .passwordBox {
        border-color: #a4a4a4;
    }

    & .passwordCopyIcon {
        color: #757575;
    }
}

.v-theme--dark {
    & .passwordBox {
        border-color: white;
    }

    & .passwordCopyIcon {
        color: #999999;
    }
}
</style>

<script setup lang="ts">
import { mdiContentCopy } from '@mdi/js';
import { ref, computed, watch } from 'vue';

import Toast, { type ToastControls } from '@/components/overlays/ToastComponent.vue';
import { filterNumbers, generatePassword } from '@/services/tools';
import {
    useConfigStore,
    passwordMinLength,
    passwordMaxLength,
    percentageStep,
    CONFIG_M,
} from '@/stores/configStore';
import { PASSWORD_OPTIONS } from '@/types';

const configStore = useConfigStore();

// DOM
const loading = ref(false);
const toastControls = ref<ToastControls>({
    show: false,
    msg: 'Password copied',
    type: 'info',
    timeout: undefined,
    timeoutLength: 2000,
});

// bind configStore items to reactive elements
const chipSelection = computed({
    get() {
        return configStore.state.pwdGen.chipSelection;
    },
    set(newValue) {
        configStore.commit(CONFIG_M.EDIT_PWD_GEN_CONFIG, { chipSelection: newValue });
    },
});
const numbersOnly = computed(
    () => chipSelection.value.length === 1 && chipSelection.value[0] === PASSWORD_OPTIONS.NUMBERS
);
const symbolsOnly = computed(
    () => chipSelection.value.length === 1 && chipSelection.value[0] === PASSWORD_OPTIONS.SYMBOLS
);

const password = ref('');
const passwordLength = computed({
    get() {
        return configStore.state.pwdGen.passwordLength;
    },
    set(newValue) {
        configStore.commit(CONFIG_M.EDIT_PWD_GEN_CONFIG, { passwordLength: newValue });
    },
});

const numbersPercentage = computed({
    get() {
        if (numbersOnly.value) {
            return 100;
        } else if (!configStore.getters.numbersSelected) {
            return 0;
        } else {
            return configStore.state.pwdGen.numbersPercentage;
        }
    },
    set(newValue) {
        configStore.commit(CONFIG_M.EDIT_PWD_GEN_CONFIG, { numbersPercentage: newValue });
    },
});
const numbersMaxPercentage = computed(
    () =>
        100 -
        (configStore.getters.lowerCaseSelected ? 5 : 0) -
        (configStore.getters.upperCaseSelected ? 5 : 0) -
        (configStore.getters.symbolsSelected ? symbolsPercentage.value : 0)
);

const symbolsPercentage = computed({
    get() {
        if (symbolsOnly.value) {
            return 100;
        } else if (!configStore.getters.symbolsSelected) {
            return 0;
        } else {
            return configStore.state.pwdGen.symbolsPercentage;
        }
    },
    set(newValue) {
        configStore.commit(CONFIG_M.EDIT_PWD_GEN_CONFIG, { symbolsPercentage: newValue });
    },
});
const symbolsMaxPercentage = computed(
    () =>
        100 -
        (configStore.getters.lowerCaseSelected ? 5 : 0) -
        (configStore.getters.upperCaseSelected ? 5 : 0) -
        (configStore.getters.numbersSelected ? numbersPercentage.value : 0)
);

watch(numbersMaxPercentage, () => {
    if (numbersMaxPercentage.value > 0 && numbersPercentage.value > numbersMaxPercentage.value) {
        numbersPercentage.value = numbersMaxPercentage.value;
    }
});

watch(symbolsMaxPercentage, () => {
    if (symbolsMaxPercentage.value > 0 && symbolsPercentage.value > symbolsMaxPercentage.value) {
        symbolsPercentage.value = symbolsMaxPercentage.value;
    }
});

watch(
    () => configStore.state.pwdGen.chipSelection,
    (newSelection, oldSelection) => {
        // some chip has been activated
        if (
            newSelection.length > oldSelection.length &&
            numbersMaxPercentage.value === 0 &&
            symbolsMaxPercentage.value === 0
        ) {
            if (numbersPercentage.value >= symbolsPercentage.value) {
                numbersPercentage.value -= percentageStep;
            } else {
                symbolsPercentage.value -= percentageStep;
            }
        }

        regenerate();
    }
);

function capAndRound() {
    if (passwordLength.value < passwordMinLength) {
        passwordLength.value = passwordMinLength;
    } else if (passwordLength.value > passwordMaxLength) {
        passwordLength.value = passwordMaxLength;
    }

    if (numbersPercentage.value < 0) {
        numbersPercentage.value = 0;
    } else if (
        numbersMaxPercentage.value > 0 &&
        numbersPercentage.value > numbersMaxPercentage.value
    ) {
        numbersPercentage.value = numbersMaxPercentage.value;
    } else {
        numbersPercentage.value =
            Math.round(numbersPercentage.value / percentageStep) * percentageStep;
    }

    if (symbolsPercentage.value < 0) {
        symbolsPercentage.value = 0;
    } else if (
        symbolsMaxPercentage.value > 0 &&
        symbolsPercentage.value > symbolsMaxPercentage.value
    ) {
        symbolsPercentage.value = symbolsMaxPercentage.value;
    } else {
        symbolsPercentage.value =
            Math.round(symbolsPercentage.value / percentageStep) * percentageStep;
    }
}

async function regenerate() {
    capAndRound();

    password.value = generatePassword();
}

function reset() {
    password.value = '';

    chipSelection.value = [
        PASSWORD_OPTIONS.LOWER_CASE,
        PASSWORD_OPTIONS.UPPER_CASE,
        PASSWORD_OPTIONS.NUMBERS,
        PASSWORD_OPTIONS.SYMBOLS,
    ];

    passwordLength.value = 24;

    numbersPercentage.value = 10;
    symbolsPercentage.value = 10;

    regenerate();
}

function copyToClipBoard() {
    clearTimeout(toastControls.value.timeout);

    navigator.clipboard.writeText(password.value);
    toastControls.value.show = true;

    toastControls.value.timeout = setTimeout(() => {
        toastControls.value.show = false;
    }, toastControls.value.timeoutLength);
}

function color(char: string) {
    if (/[a-zA-Z]/.test(char)) {
        return '';
    } else if (/\d/.test(char)) {
        return 'passwordNumber';
    } else {
        return 'passwordSymbol';
    }
}

// on load, generate
regenerate();
</script>
