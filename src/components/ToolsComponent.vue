<template>
    <v-form fluid class="centerForm mt-8 px-8">
        <h1 class="text-center mb-8">Generate Secure Password</h1>

        <v-textarea
            label="Password"
            outlined
            auto-grow
            rows="1"
            row-height="5"
            v-model="password"
            readonly
        />
        <v-slider
            class="mt-4"
            v-model="length"
            thumb-label
            step="1"
            min="8"
            max="128"
            color="primary"
            label="color"
            @input="generate"
        ></v-slider>
        <v-row>
            <v-switch
                v-model="uppercase"
                label="Uppercase"
                color="success"
                value="success"
                hide-details
            />
            <v-switch
                v-model="lowercase"
                label="Lowercase"
                color="success"
                value="success"
                hide-details
            />
            <v-switch
                v-model="numbers"
                label="Numbers"
                color="success"
                value="success"
                hide-details
            />
            <v-switch
                v-model="special"
                label="Special characters"
                color="success"
                value="success"
                hide-details
            />
        </v-row>
        <div class="text-right my-4">
            <v-btn @click="clear" size="large"> Clear </v-btn>
            <v-btn @click="generate" :loading="loading" size="large" color="purple">
                Generate
            </v-btn>
        </div>
        <Toast
            class="mb-4"
            :type="toastType"
            :show="showToast"
            :msg="toastMsg"
            @close="showToast = false"
        />
    </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Toast from '@/components/ToastComponent.vue';

const password = ref('');

const uppercase = ref(true);
const lowercase = ref(true);
const numbers = ref(true);
const special = ref(true);
const length = ref(40);

const loading = ref(false);
const showToast = ref(false);
const toastMsg = ref('');
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('success');

async function generate() {
    // FIXME: deprecated method 'substr'
    password.value = Math.random().toString(16).substr(2, length.value);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"£$%&/()=?^"';

    let str = '';
    for (let i = 0; i < length.value; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    password.value = str;
}

function clear() {
    password.value = '';
}
</script>
