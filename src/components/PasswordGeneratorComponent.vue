<template>
    <v-card elevation="4" class="cardBackground">
        <v-card-title class="text-center text-h4 mt-2 mb-4 font-weight-light breakNewline">
            Secure Password Generator
        </v-card-title>

        <v-form @submit.prevent="generate" fluid class="centerForm mt-8">
            <v-textarea
                label="Password"
                outlined
                auto-grow
                rows="1"
                row-height="5"
                v-model="password"
                readonly
            />

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

                <!-- TODO: MOBILE SIZE CONTROLS -->
                <template v-if="$vuetify.display.mobile">
                    <v-row no-gutters class="mt-4">
                        <v-col>
                            <v-text-field
                                v-model.number="passwordLength"
                                type="tel"
                                label="Password length"
                                @keypress="filterNumbers"
                            />
                        </v-col>
                    </v-row>

                    <v-row no-gutters justify="space-between">
                        <v-btn color="primary" @click="numbersPercentage += 10"> +10 </v-btn>
                        <v-btn color="primary" :icon="mdiPlus" />
                        {{ passwordLength }}
                        <v-btn color="primary"> -1 </v-btn>
                        <v-btn color="primary"> -10 </v-btn>
                    </v-row>

                    <!-- <v-responsive width="100%" /> -->

                    <!-- <v-col> numbersMinCount {{ numbersPercentage }} </v-col>
                    <v-col> specialsMinCount {{ symbolsPercentage }} </v-col>

                    <v-responsive width="100%" />

                    <v-col> numbersMaxCount {{ numbersMaxPercentage }} </v-col>
                    <v-col> specialsMaxCount {{ symbolsMaxPercentage }} </v-col>

                    <v-responsive width="100%" /> -->
                    <v-row no-gutters>
                        <v-col>
                            <v-text-field
                                v-model.number="numbersPercentage"
                                type="tel"
                                label="Numbers percentage"
                                @keypress="filterNumbers"
                                @input="generate"
                            />
                        </v-col>

                        <!-- <v-responsive v-if="$vuetify.display.xs" width="100%" /> -->

                        <v-col>
                            <v-text-field
                                v-model.number="symbolsPercentage"
                                type="tel"
                                label="Symbols percentage"
                                @keypress="filterNumbers"
                                @input="generate"
                            />
                        </v-col>
                    </v-row>
                </template>

                <!-- DESKTOP SIZE CONTROLS -->
                <template v-else>
                    <v-row no-gutters class="mt-8">
                        <v-col>
                            <div class="text-overline">Password length</div>
                            <v-slider
                                v-model="passwordLength"
                                :min="passwordMinLength"
                                :max="passwordMaxLength"
                                step="1"
                                @input="generate"
                                color="primary"
                            >
                                <template v-slot:prepend>
                                    <span class="scrollbarStart">{{ passwordLength }}</span>
                                </template>
                                <template v-slot:append>
                                    <span class="scrollbarEnd"> Max {{ passwordMaxLength }} </span>
                                </template>
                            </v-slider>
                        </v-col>
                    </v-row>

                    <v-row no-gutters>
                        <v-col>
                            <div class="text-overline">Numbers percentage</div>
                            <v-slider
                                v-model="numbersPercentage"
                                min="0"
                                :max="numbersMaxPercentage"
                                :step="percentageStep"
                                :disabled="!configStore.getters.numbersSelected"
                                :readonly="numbersOnly"
                                @input="generate"
                                color="primary"
                            >
                                <template v-slot:prepend>
                                    <span class="scrollbarStart"> {{ numbersPercentage }}% </span>
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
                                min="0"
                                :max="symbolsMaxPercentage"
                                :step="percentageStep"
                                :disabled="!configStore.getters.symbolsSelected"
                                :readonly="symbolsOnly"
                                @input="generate"
                                color="primary"
                            >
                                <template v-slot:prepend>
                                    <span class="scrollbarStart"> {{ symbolsPercentage }}% </span>
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
            </v-container>

            <div class="text-right my-4">
                <v-btn @click="reset" size="large" color="secondary"> Reset </v-btn>
                <v-btn class="ml-4" type="submit" :loading="loading" size="large" color="primary">
                    Generate
                </v-btn>
            </div>
        </v-form>
    </v-card>
</template>

<style lang="scss">
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
</style>

<script setup lang="ts">
import { mdiPlus } from '@mdi/js';
import { ref, computed, watch } from 'vue';

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
const numbersOnly = computed(
    () => chipSelection.value.length === 1 && chipSelection.value[0] === PASSWORD_OPTIONS.NUMBERS
);
const symbolsOnly = computed(
    () => chipSelection.value.length === 1 && chipSelection.value[0] === PASSWORD_OPTIONS.SYMBOLS
);
// button loading
const loading = ref(false);

// bind configStore items to reactive elements
const chipSelection = computed({
    get() {
        return configStore.state.pwdGen.chipSelection;
    },
    set(newValue) {
        configStore.commit(CONFIG_M.EDIT_PWD_GEN_CONFIG, { chipSelection: newValue });
    },
});

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

watch(
    () => configStore.getters.symbolsSelected,
    () => {
        if (numbersPercentage.value > numbersMaxPercentage.value) {
            console.log(numbersPercentage.value, numbersMaxPercentage.value);
            numbersPercentage.value = numbersMaxPercentage.value;
        }
    }
);

watch(
    () => configStore.getters.numbersSelected,
    () => {
        if (symbolsPercentage.value > symbolsMaxPercentage.value) {
            symbolsPercentage.value = symbolsMaxPercentage.value;
        }
    }
);

// constants

// validate number input for passwordLength

function capAndRound() {
    console.debug(`[capAndRound] numbersPercentage ${numbersPercentage.value}`);
    console.debug(`[capAndRound] symbolsPercentage ${symbolsPercentage.value}`);

    if (passwordLength.value < 0) {
        passwordLength.value = 0;
    } else if (passwordLength.value > passwordMaxLength) {
        passwordLength.value = passwordMaxLength;
    }

    if (numbersPercentage.value < 0) {
        numbersPercentage.value = 0;
    } else if (numbersPercentage.value > numbersMaxPercentage.value) {
        numbersPercentage.value = numbersMaxPercentage.value;
    } else {
        numbersPercentage.value =
            Math.round(numbersPercentage.value / percentageStep) * percentageStep;
    }

    if (symbolsPercentage.value < 0) {
        symbolsPercentage.value = 0;
    } else if (symbolsPercentage.value > symbolsMaxPercentage.value) {
        symbolsPercentage.value = symbolsMaxPercentage.value;
    } else {
        symbolsPercentage.value =
            Math.round(symbolsPercentage.value / percentageStep) * percentageStep;
    }
}

async function generate() {
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
}
</script>
