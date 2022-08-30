<template>
    <v-form ref="form" @submit.prevent="signup" class="centerForm mt-8 px-8">
        <LogoExtended class="formLogo mb-8" />

        <p class="text-center">SIGNUP</p>
        <ErrorAlert class="mb-4" :show="signupFailed" :msg="signupFailedMsg" />

        <v-text-field
            v-model="user.email"
            label="Email"
            :rules="emailRules"
            :prepend-inner-icon="mdiEmail"
            required
        />

        <v-text-field
            transition="scale-transition"
            v-model="user.password"
            label="Password"
            :type="hidePassword ? 'password' : 'text'"
            :rules="passwordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
            @click:appendInner="hidePassword = !hidePassword"
            required
        />

        <v-text-field
            v-model="user.repeatPassword"
            label="Repeat Password"
            :type="hidePassword ? 'password' : 'text'"
            :rules="repeatPasswordRules"
            :prepend-inner-icon="mdiLock"
            :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
            @click:appendInner="hidePassword = !hidePassword"
            required
        />

        <v-text-field
            v-model="user.firstName"
            label="First Name"
            type="text"
            :rules="nameRules"
            :prepend-inner-icon="mdiAccountBox"
            required
        />

        <v-text-field
            v-model="user.lastName"
            label="Last Name"
            type="text"
            :rules="nameRules"
            :prepend-inner-icon="mdiAccountBox"
            required
        />

        <div class="text-right">
            <v-btn @click="resetForm" class="mr-4" size="large"> Clear </v-btn>
            <v-btn type="submit" :loading="loading" size="large" color="purple"> Signup </v-btn>
        </div>

        <div class="text-center">
            <v-btn @click="goVerification()" size="small" text class="mt-8">
                Verification email not received? Click here!
            </v-btn>
        </div>
    </v-form>
</template>

<style lang="scss">
@import '@/styles.scss';
</style>

<script setup lang="ts">
import { mdiEmail, mdiLock, mdiEye, mdiEyeOff, mdiAccountBox } from '@mdi/js';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type vuetify from 'vuetify/components';

import ErrorAlert from '@/components/ErrorAlert.vue';
import LogoExtended from '@/components/LogoExtended.vue';
import doSignup from '@/services/signup';

const user = ref({
    email: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
});

const loading = ref(false);
const hidePassword = ref(true);
const signupFailed = ref(false);
const signupFailedMsg = ref('');

const router = useRouter();
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email) || 'E-mail must be valid',
];

const passwordRules = [
    (psw: string) => !!psw || 'Password is required',
    (psw: string) =>
        (psw.length >= 8 && psw.length <= 32) || 'Password must be between 8 and 32 characters',
    (psw: string) => /([A-Z])/.test(psw) || 'Password must contain an uppercase letter!',
    (psw: string) => /([a-z])/.test(psw) || 'Password must contain an lowercase letter!',
    (psw: string) => /([0-9])/.test(psw) || 'Password must contain a number!',
    (psw: string) => /([@$!%*?&])/.test(psw) || 'Password must contain a special character!',
];

const repeatPasswordRules = [
    (psw: string) => !!psw || 'Repeat Password is required',
    (psw: string) => psw === user.value.password || "The passwords don't match!",
];

const nameRules = [(name: string) => !!name || 'Name is required'];

async function resetForm() {
    form.value?.reset();
}

async function signup(): Promise<void> {
    signupFailed.value = false;
    loading.value = true;
    console.debug('[SignupView] Signup start');

    if ((await form.value?.validate())?.valid) {
        const res = await doSignup(user.value);

        if (res.ok) {
            console.debug('[SignupView] Signup done, redirecting...');
            goVerification(true);
        } else {
            console.debug(`[SignupView] Signup failed:  [${res.err.code}] ${res.err.message}`);
            signupFailed.value = true;
            signupFailedMsg.value = res.err.message;
            loading.value = false;
        }
    }

    loading.value = false;
}

function goVerification(sent = false) {
    console.log(sent);
    if (user.value.email) {
        router.push({
            name: 'SendVerification',
            query: { email: user.value.email, emailSent: sent ? '1' : undefined },
        });
    } else {
        router.push({ name: 'SendVerification' });
    }
}
</script>
