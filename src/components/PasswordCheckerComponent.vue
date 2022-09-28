<template>
    <v-card elevation="4" class="cardBackground">
        <v-card-title class="text-center text-h4 mt-2 mb-4 font-weight-light">
            Password Checker
        </v-card-title>

        <v-card-text class="text-center">
            <p>
                Use this tool to check if your password was exposed in a data breach and then
                released on the web.
            </p>

            For more detailed information visit
            <a href="https://haveibeenpwned.com/Passwords" target="_blank"> Have I Been Pwned </a>
            website.
        </v-card-text>

        <v-form ref="form" @submit.prevent="check" fluid class="centerForm mb-4">
            <div class="toastContainer">
                <Toast
                    class="passwordToast"
                    type="error"
                    :show="toastControls.show"
                    :msg="toastControls.msg"
                    @close="toastControls.show = false"
                />
            </div>

            <v-text-field
                v-model="password"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                :type="hidePassword ? 'password' : 'text'"
                :rules="passwordRules"
                color="primary"
                label="Password"
                required
                @click:appendInner="hidePassword = !hidePassword"
            />

            <v-card-text v-if="matches !== -1" class="mb-2 text-center text-h5 font-weight-light">
                This password has been seen
                <strong :class="matches > 0 ? 'text-red' : 'text-green'">{{ matches }}</strong>
                times before.
            </v-card-text>

            <div class="text-right">
                <v-btn @click="clear" class="mr-4" size="large"> Clear </v-btn>
                <v-btn type="submit" :loading="loading" size="large" color="primary"> Check </v-btn>
            </div>
        </v-form>
        <v-card-text class="text-center">
            <p>
                Note: we don't keep any sensitive data on our servers. The password will be sent to
                haveibeenpwned services only on secured channels.
            </p>
            <a
                href="https://www.troyhunt.com/ive-just-launched-pwned-passwords-version-2/#cloudflareprivacyandkanonymity"
                target="_blank"
            >
                Read more about how password are secured here website.
            </a>
        </v-card-text>
    </v-card>
</template>

<style lang="scss">
@use '@/styles.scss';

.customLink {
    color: red;
}

.passwordToast {
    position: absolute;
    width: 100%;
    transform: translate(0, -120%);
}
</style>

<script setup lang="ts">
import { mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';
import { ref } from 'vue';
import type vuetify from 'vuetify/components';

import { checkPWNEDPassword } from '@/services/API';
import Toast, { type ToastControls } from '@/components/ToastComponent.vue';

// DOM content
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);
const password = ref('');
const hidePassword = ref(true);

// toast controls
const loading = ref(false);
const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
});

// rules
const passwordRules = [(psw: string) => !!psw || 'Password is required'];

// constants
const matches = ref(-1);
const APITimeoutLength = 1500;
const timeoutLength = 2000;
let timeout: number;

async function check() {
    loading.value = true;
    console.log('click');

    if ((await form.value?.validate())?.valid) {
        matches.value = await checkPWNEDPassword(password.value)
            .then((res) => {
                toastControls.value.show = false;

                return res;
            })
            .catch((err: Error) => {
                toastControls.value.type = 'error';
                toastControls.value.msg = err.message;
                toastControls.value.show = true;

                return -1;
            });

        setTimeout(() => {
            loading.value = false;
        }, APITimeoutLength);
    } else {
        clearTimeout(timeout);

        toastControls.value.type = 'error';
        toastControls.value.msg = 'Please insert a password';
        toastControls.value.show = true;

        timeout = setTimeout(() => (toastControls.value.show = false), timeoutLength);
        loading.value = false;
    }
}

function clear() {
    form.value?.reset();
    matches.value = -1;
    toastControls.value.show = false;
}
</script>
