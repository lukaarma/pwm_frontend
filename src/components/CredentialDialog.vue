<!-- FIXME: form input have too much opacity if focused when readonly, style is confusing -->
<template>
    <v-dialog
        :model-value="show"
        :persistent="persistent"
        @click:outside="close"
        id="credentialDialog"
    >
        <v-card>
            <v-card-title class="mt-4 text-center text-h5 font-weight-light">
                {{ title }}
            </v-card-title>

            <v-card-text>
                <div class="toastContainer">
                    <Toast
                        class="copyAlert"
                        :type="toastControls.type"
                        :show="toastControls.show"
                        :msg="toastControls.msg"
                        @close="toastControls.show = false"
                    />
                </div>
                <v-form ref="form" @submit.prevent="saveChanges(false)" class="mt-8">
                    <v-text-field
                        v-model="credential.name"
                        :rules="websiteNameRules"
                        :prepend-inner-icon="mdiWeb"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        label="Website Name"
                        placeholder="Example Website"
                        required
                    />

                    <v-text-field
                        v-model="credential.username"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        label="Username"
                        :prepend-inner-icon="mdiAccountBox"
                        @click:prependInner.stop="copyToClipBoard('Username')"
                        required
                    />

                    <v-text-field
                        v-model="credential.password"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        :prepend-inner-icon="mdiLock"
                        :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                        :type="hidePassword ? 'password' : 'text'"
                        label="Password"
                        @click:prependInner.stop="copyToClipBoard('Password')"
                        @click:appendInner.stop="hidePassword = !hidePassword"
                    />

                    <v-text-field
                        v-model="credential.url"
                        :prepend-inner-icon="mdiLinkVariant"
                        :readonly="!editMode"
                        :color="editMode ? 'primary' : 'default'"
                        label="Website URL"
                        placeholder="https://exemple.com"
                        outlined
                        :append-inner-icon="mdiArrowTopRight"
                        @click:appendInner.stop="win.open(credential.url, '_blank')"
                    />
                    <v-btn type="submit" hidden />
                </v-form>
            </v-card-text>

            <v-card-actions class="mb-2 mx-4">
                <v-btn v-if="!newMode" outlined color="red" @click="showDeleteDialog = true">
                    Delete
                </v-btn>
                <v-btn
                    outlined
                    :loading="loadingPasswordCheck"
                    color="primary"
                    @click="checkPassword"
                >
                    <v-tooltip
                        v-if="$vuetify.display.mdAndUp"
                        activator="parent"
                        location="bottom"
                        class="text-center"
                    >
                        <div>Check if password was leaked from other websites</div>
                        Check the "Tools" tab for more info
                    </v-tooltip>
                    Check password
                </v-btn>
                <v-spacer />
                <v-btn v-if="editMode" outlined color="primary" @click="cancelChanges">
                    Cancel
                </v-btn>
                <v-btn
                    v-if="editMode"
                    outlined
                    color="primary"
                    :loading="loading"
                    @click="saveChanges(false)"
                >
                    Save
                </v-btn>
                <v-btn v-if="!editMode" outlined color="primary" @click="$emit('close')">
                    Close
                </v-btn>
                <v-btn v-if="!editMode" outlined color="primary" @click="editMode = true">
                    Edit
                </v-btn>
            </v-card-actions>
        </v-card>
        <!-- FIXME: message don't display on two lines -->
        <ConfirmationDialog
            :show="showDeleteDialog"
            :msg="'Are you sure you want to delete these credentials?\nThe operation cannot be undone'"
            title="Delete Credential"
            @no="showDeleteDialog = false"
            @yes="deleteCredential()"
        />

        <ConfirmationDialog
            :show="showOverrideDialog"
            :msg="`You have already used this password ${samePasswordCount} times.\nAre you sure you want to use it again?`"
            title="Duplicated password"
            @no="
                showOverrideDialog = false;
                loading = false;
            "
            @yes="saveChanges(true)"
        />
    </v-dialog>
</template>

<style lang="scss">
@use '@/styles.scss';

/* BUG: there is a bug report (https://github.com/vuetifyjs/vuetify/issues/15403) open
in the Vuetify repo because dialog max-width is not working correctly.
Solution: we hijack the default overlay css only on this form (thanks to the ID)*/
#credentialDialog > .v-overlay__content {
    // default css
    max-height: calc(100% - 48px);
    margin: 24px;
    display: flex;
    flex-direction: column;
    // our addition
    max-width: 650px;
    width: 100%;
}

.copyAlert {
    position: absolute;
    width: 100%;
    transform: translate(0, -60%);
}
</style>

<script setup lang="ts">
import {
    mdiLock,
    mdiEye,
    mdiEyeOff,
    mdiAccountBox,
    mdiArrowTopRight,
    mdiLinkVariant,
    mdiWeb,
} from '@mdi/js';
import { computed, ref, watch } from 'vue';
import type vuetify from 'vuetify/components';

import ConfirmationDialog from '@/components/ConfirmationDialog.vue';
import Toast, { type ToastControls } from '@/components/ToastComponent.vue';
import { sendVault } from '@/services/vault';
import { VAULT_A, VAULT_M, useVaultStore } from '@/stores/vaultStore';
import { checkPWNEDPassword } from '@/services/API';

// NOTE: Vue gives error with window
const win = window;

// Vue internals
const props = defineProps<{
    show: boolean;
    index: number;
}>();
const emit = defineEmits<{
    (e: 'close'): void;
}>();

// internal logic
const vaultStore = useVaultStore();
const index = ref(props.index);
const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

let timeout: number;
const timeoutLength = 2000;

const samePasswordCount = ref(0);
const samePasswordMax = 2;

// DOM controls
const hidePassword = ref(true);
const newMode = ref(props.index === -1);
const editMode = ref(props.index === -1);
const toastControls = ref<ToastControls>({
    show: false,
    msg: '',
    type: 'info',
});

const showDeleteDialog = ref(false);
const showOverrideDialog = ref(false);

const loading = ref(false);
const loadingPasswordCheck = ref(false);
const persistent = computed(() => {
    return (
        editMode.value &&
        !(
            newMode.value &&
            credential.value.name === '' &&
            credential.value.url === '' &&
            credential.value.username === '' &&
            credential.value.password === ''
        )
    );
});

// form logic
const websiteNameRules = [(name: string) => !!name || 'Website name is required'];

// page data bindings
// NOTE: don't reference data[index] directly! It WILL change the store
const credential = ref({
    name: '',
    url: '',
    username: '',
    password: '',
});
const title = computed(() => {
    if (newMode.value) {
        return 'Create new Credential';
    } else if (editMode.value) {
        return 'Edit Credential';
    } else {
        return 'View Credential';
    }
});

// trigger on load to set correct values of DOM logic and data bindings
watch(props, (newProps) => {
    resetErrors();
    index.value = newProps.index;

    if (newProps.show) {
        editMode.value = index.value === -1;
        newMode.value = editMode.value;

        // NOTE: don't reference data[index] directly! It WILL change the store
        credential.value = {
            name: newMode.value ? '' : vaultStore.state.credentials[index.value].name,
            url: newMode.value ? '' : vaultStore.state.credentials[index.value].url,
            username: newMode.value ? '' : vaultStore.state.credentials[index.value].username,
            password: newMode.value ? '' : vaultStore.state.credentials[index.value].password,
        };
    }
});

// handlers
async function deleteCredential() {
    showDeleteDialog.value = false;
    vaultStore.commit(VAULT_M.DELETE_CREDENTIAL, index.value);

    // then send to backend
    const res = await sendVault();

    if (res.ok) {
        // if cloud save ok, and new mode close prompt
        console.debug('[CREDENTIAL] Deletion success');
        emit('close');
    } else {
        console.debug(`[CREDENTIAL] Deletion failed: [${res.err.code}] ${res.err.message}`);
        toastControls.value.type = 'error';
        toastControls.value.show = true;
        toastControls.value.msg = res.err.message;
    }
}

async function checkPassword() {
    clearTimeout(timeout);
    loadingPasswordCheck.value = true;

    if (credential.value.password !== '') {
        await checkPWNEDPassword(credential.value.password)
            .then((res) => {
                toastControls.value.type = res ? 'error' : 'success';
                toastControls.value.msg = `This password has been seen ${res} times before.`;
            })
            .catch((err: Error) => {
                toastControls.value.type = 'error';
                toastControls.value.msg = err.message;
            });
    } else {
        toastControls.value.type = 'warning';
        toastControls.value.msg = 'Please provide a password to check';
    }

    toastControls.value.show = true;

    timeout = setTimeout(() => {
        toastControls.value.show = false;
    }, timeoutLength);
    // separate timeout, we don't want this loading to be resettable
    setTimeout(() => {
        loadingPasswordCheck.value = false;
    }, timeoutLength);
}

function cancelChanges() {
    resetErrors();

    if (newMode.value) {
        emit('close');
    } else {
        editMode.value = false;

        credential.value = {
            name: vaultStore.state.credentials[index.value].name,
            url: vaultStore.state.credentials[index.value].url,
            username: vaultStore.state.credentials[index.value].username,
            password: vaultStore.state.credentials[index.value].password,
        };
    }
}

async function saveChanges(samePasswordOverride = false) {
    if (editMode.value) {
        loading.value = true;
        showOverrideDialog.value = false;

        const validation = await form.value?.validate();

        if (validation?.valid) {
            // same password check
            if (!samePasswordOverride) {
                samePasswordCount.value = vaultStore.state.credentials.filter(
                    (cred) => cred.password === credential.value.password
                ).length;

                // plus 1 to account the one we are creating
                if (samePasswordCount.value + 1 > samePasswordMax) {
                    showOverrideDialog.value = true;

                    return;
                }
            }

            // if valid save in store
            index.value = await vaultStore.dispatch(VAULT_A.SET_CREDENTIAL, {
                index: index.value,
                credential: credential.value,
            });

            console.log(
                `[CREDENTIAL] ${newMode.value ? 'Added new' : 'Updated'} credential at ${
                    index.value
                }`
            );

            // then send to backend
            const res = await sendVault();

            if (res.ok) {
                console.debug('[CREDENTIAL] Save successful');

                emit('close');
            } else {
                console.debug(`[CREDENTIAL] Save failed: [${res.err.code}] ${res.err.message}`);
                toastControls.value.type = 'error';
                toastControls.value.show = true;
                toastControls.value.msg = res.err.message;
            }
        } else {
            console.debug(
                `[saveChanges] Validation error: ${validation?.errors[0].errorMessages[0]}`
            );
            // Print validation error on Error Toast
            toastControls.value.msg = validation?.errors[0].errorMessages[0] ?? 'Error';
            toastControls.value.type = 'warning';
            toastControls.value.show = true;
        }

        loading.value = false;
    }
}

function resetErrors() {
    form.value?.resetValidation();
    toastControls.value.show = false;
}

function close() {
    if (!persistent.value) {
        emit('close');
    }
}

function copyToClipBoard(field: 'Username' | 'Password') {
    clearTimeout(timeout);

    if (editMode.value) {
        return;
    }

    switch (field) {
        case 'Username':
            navigator.clipboard.writeText(credential.value.username);
            break;

        case 'Password':
            navigator.clipboard.writeText(credential.value.password);
            break;

        default:
            console.debug('[copyToClipBoard] Invalid filed!');
            break;
    }

    toastControls.value.type = 'info';
    toastControls.value.msg = field + ' copied';
    toastControls.value.show = true;

    timeout = setTimeout(() => {
        toastControls.value.show = false;
    }, timeoutLength);
}
</script>
