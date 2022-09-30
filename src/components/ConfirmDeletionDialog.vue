<template>
    <v-dialog :model-value="show" persistent id="passwordDialog">
        <v-card>
            <v-card-title class="text-center">
                <span class="text-h5">{{ title }}</span>
            </v-card-title>

            <v-card-text>
                <div class="text-center breakNewline">{{ msg }}</div>

                <v-form ref="form" @submit.prevent="deleteHandler" class="centerForm mt-8">
                    <div class="toastContainer">
                        <Toast
                            class="formToast"
                            :type="toastControls.type"
                            :show="toastControls.show"
                            :msg="toastControls.msg"
                            @close="toastControls.show = false"
                        />
                    </div>

                    <v-text-field
                        v-model="password"
                        :rules="passwordRules"
                        :prepend-inner-icon="mdiLock"
                        :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                        :type="hidePassword ? 'password' : 'text'"
                        label="Password"
                        color="primary"
                        required
                        @click:appendInner="hidePassword = !hidePassword"
                    />
                    <v-btn type="submit" hidden />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn
                    color="error"
                    text
                    @click="
                        $emit('no');
                        password = '';
                    "
                >
                    No
                </v-btn>
                <v-btn type="submit" color="success" :loading="loading" text @click="deleteHandler">
                    Yes
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss">
@use '@/styles.scss';

/* BUG: there is a bug report (https://github.com/vuetifyjs/vuetify/issues/15403) open
    in the Vuetify repo because dialog max-width is not working correctly.
    Solution: we hijack the default overlay css only on this form (thanks to the ID)*/
#passwordDialog > .v-overlay__content {
    // default css
    max-height: calc(100% - 48px);
    margin: 24px;
    display: flex;
    flex-direction: column;
    // our addition
    max-width: 650px;
    width: 100%;
}
</style>

<script setup lang="ts">
import { mdiLock, mdiEyeOff, mdiEye } from '@mdi/js';
import { ref } from 'vue';

import Toast, { type ToastControls } from '@/components/ToastComponent.vue';
import API from '@/services/API';
import cryptoUtils, { deriveMKeMPH } from '@/services/cryptoUtils';
import { logout } from '@/services/utils';
import { localStorageVaultKey } from '@/services/vault';
import { localStorageConfigKey } from '@/stores/configStore';
import { useUserStore } from '@/stores/userStore';
import { DELETE_SELECTION, WEB_CODES, type APIResponse } from '@/types';

const props = defineProps<{
    show: boolean;
    deleteSelection: DELETE_SELECTION;
}>();
const emit = defineEmits<{
    (e: 'no'): void;
    (e: 'success'): void;
}>();
const userStore = useUserStore();

const msg = `Please confirm your Master Password to delete your ${props.deleteSelection}.\nThis operation cannot be undone.`;
const title = `Delete ${props.deleteSelection}`;

const password = ref('');
const hidePassword = ref(true);
const loading = ref(false);

const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
    timeout: undefined,
    timeoutLength: 2000,
});

const passwordRules = [(psw: string) => !!psw || 'Password is required'];

async function deleteHandler() {
    loading.value = true;
    console.debug('[ConfirmPassword] Creating MPH');

    await deriveMKeMPH(userStore.state.email, password.value).then(async ({ MPH }) => {
        const masterPasswordHash = cryptoUtils.toHex(await MPH);
        console.debug('[ConfirmPassword] Got MPH, closing dialogs');

        let res: APIResponse | undefined;

        switch (props.deleteSelection) {
            case DELETE_SELECTION.VAULT:
                res = await API.deleteVault(masterPasswordHash);
                break;

            case DELETE_SELECTION.ACCOUNT:
                res = await API.deleteUser(masterPasswordHash);
                break;

            default:
                console.error(`[deleteHandler] Invalid delete selection ${props.deleteSelection}`);
                res = undefined;

                break;
        }
        console.log(res);

        if (res && res.data) {
            switch (res.data.code) {
                case WEB_CODES.VAULT_DELETED:
                    toastControls.value.show = false;
                    password.value = '';
                    localStorage.removeItem(localStorageVaultKey);
                    emit('success');
                    break;

                case WEB_CODES.ACCOUNT_DELETED:
                    localStorage.removeItem(localStorageVaultKey);
                    localStorage.removeItem(localStorageConfigKey);
                    logout();
                    break;

                default:
                    console.error(
                        `[deleteHandler] Uncaught data code ${res.data.code} with message ${res.data.message}`
                    );
                    break;
            }
        } else if (res && res.err) {
            switch (res.err.code) {
                case WEB_CODES.WRONG_PASSWORD:
                    toastControls.value.msg = 'Wrong password';
                    toastControls.value.type = 'error';
                    toastControls.value.show = true;
                    break;

                case WEB_CODES.MISSING_VAULT:
                    toastControls.value.msg = 'Vault not found';
                    toastControls.value.type = 'warning';
                    toastControls.value.show = true;
                    break;

                default:
                    console.error(
                        `[deleteHandler] Uncaught error code ${res.err.code} with message ${res.err.message}`
                    );
                    break;
            }
            loading.value = false;
        }
    });
}
</script>
