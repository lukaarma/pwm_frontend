<template>
    <v-form ref="form" v-model="valid" class="w-35 mx-auto mt-16">
        <v-container>
            <v-img src="/assets/logoExtended.svg" class="mx-auto mb-8" />
            <v-text-field
                v-model="user.email"
                :rules="emailRules"
                :prepend-inner-icon="mdiAccountBox"
                label="Email"
                required
            ></v-text-field>

            <v-text-field
                v-model="user.password"
                :rules="passwordRules"
                :prepend-inner-icon="mdiLock"
                :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                :type="hidePassword ? 'password' : 'text'"
                label="Password"
                required
                @click:appendInner="hidePassword = !hidePassword"
            ></v-text-field>
            <div class="text-right">
                <v-btn
                    @click="($refs['form'] as any).reset()"
                    class="mr-4"
                    size="large"
                >
                    Clear
                </v-btn>
                <v-btn @click="doLogin" size="large" color="purple">
                    Login
                </v-btn>
            </div>
        </v-container>
    </v-form>

    <ErrorDialog
        msg="Error on Login"
        :show="loginError"
        @close="loginError = !loginError"
    />
</template>

<style>
.w-35 {
    width: 35%;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import API from '@/services/API';
import router from '@/router';
import type vuetify from 'vuetify/components';
import ErrorDialog from '@/components/ErrorDialog.vue';
import { mdiAccountBox, mdiLock, mdiEye, mdiEyeOff } from '@mdi/js';

const valid = ref(false);
const loginError = ref(false);
const hidePassword = ref(true);
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email) || 'E-mail must be valid',
];

const passwordRules = [
    (psw: string) => !!psw || 'Password is required',
    (psw: string) =>
        (psw.length >= 8 && psw.length <= 32) ||
        'Password must be between 8 and 32 characters',
    (psw: string) =>
        /([A-Z])/.test(psw) || 'Password must contain an uppercase letter!',
    (psw: string) =>
        /([a-z])/.test(psw) || 'Password must contain an lowercase letter!',
    (psw: string) => /([0-9])/.test(psw) || 'Password must cointain a number!',
    (psw: string) =>
        /([@$!%*?&])/.test(psw) ||
        'Password must cointain a special character!',
];

// INPUTS VALUE REF
const user = ref({
    email: '',
    password: '',
});

//Methods
// function validateEmail(): void {
//     if (emailRegex.test(user.value.email)) {
//         emailValid.value = true;
//     } else if (user.value.email.length) {
//         emailError.value = "This is not a valid email!";
//         emailValid.value = false;
//     } else {
//         emailError.value = "This field is required!";
//         emailValid.value = false;
//     }
// }

// function validatePassword(): void {
//     if (user.value.password.length) {
//         passwordValid.value = true;
//     } else {
//         passwordError.value = "This field is required!";
//         passwordValid.value = false;
//     }
// }

// function clearEmailError(): void {
//     emailValid.value = true;
//     emailError.value = "";
// }

// function clearPasswordError(): void {
//     passwordValid.value = true;
//     passwordError.value = "";
// }

async function doLogin() {
    if ((await form.value?.validate())?.valid) {
        await API.login(user.value);
        router.push('/vault');
    } else {
        loginError.value = true;
    }
}
</script>

<script lang="ts"></script>
