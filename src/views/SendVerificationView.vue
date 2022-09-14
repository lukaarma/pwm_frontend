<template>
    <v-form ref="form" @submit.prevent="sendVerification" class="submitForm mt-8 px-8">
        <LogoExtended />
        <div class="text-center my-4">
            <p v-if="emailSent">
                <strong>
                    A confirmation email was sent to <i> {{ email }} </i> . <br />
                    Please check your inbox.
                </strong>
            </p>
            <p class="mt-8">
                If you did not receive any mail you can request a new verification email here.
            </p>
        </div>

        <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            :prepend-inner-icon="mdiEmail"
            required
        />

        <div class="text-center">
            <v-btn type="submit" :loading="loading" size="large" color="primary">
                Send Email
            </v-btn>
        </div>
    </v-form>
</template>

<style lang="scss">
.submitForm {
    margin: 0 auto;
    max-width: 650px;
}

.preserveNewline {
    white-space: pre-line;
}
</style>

<script setup lang="ts">
import { mdiEmail } from '@mdi/js';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import type vuetify from 'vuetify/components';

import API from '@/services/API';
import LogoExtended from '@/components/LogoExtended.vue';

const route = useRoute();
const email = ref(route.query.email?.toString() ?? '');
const emailSent = ref(!!route.query.emailSent);

const loading = ref(false);
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

const emailRules = [
    (email: string) => !!email || 'E-mail is required',
    (email: string) => /^.+@.+\..+$/.test(email) || 'E-mail must be valid',
];

async function sendVerification() {
    if ((await form.value?.validate())?.valid) {
        loading.value = true;
        const res = await API.sendVerification(email.value);

        if (!res.data) {
            return {
                ok: false,
                err: res.err ?? {
                    code: 999,
                    message: 'Missing data and error!',
                },
            };
        }
    }
    emailSent.value = true;
    loading.value = false;
}
</script>
