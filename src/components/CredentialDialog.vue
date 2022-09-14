<!--
    TODO: understand wtf is going on with the width of this component other than MAGIC
    TODO: [MOBILE] reduce Y-margin on the form
    FIXME: form input have too much opacity if focused when readonly, style is confusing
-->
<template>
    <v-dialog :model-value="show" :persistent="editMode" @click:outside="clickOutsideHandler">
        <v-card>
            <v-card-title class="mt-4 text-center">
                <span class="text-h5">{{ title }}</span>
            </v-card-title>

            <v-card-text class="pa-0">
                <v-container>
                    <div class="toastContainer">
                        <Toast
                            class="copyAlert"
                            :type="toastType"
                            :show="showToast"
                            :msg="toastMsg"
                            @close="showToast = false"
                        />
                    </div>
                    <v-form ref="form" @submit.prevent="saveChanges" class="mt-8">
                        <v-row>
                            <v-col class="py-0" cols="12">
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
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="credential.username"
                                    :readonly="!editMode"
                                    :color="editMode ? 'primary' : 'default'"
                                    label="Username"
                                    :prepend-inner-icon="mdiAccountBox"
                                    @click:prependInner="copyToClipBoard('Username')"
                                    required
                                />
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="credential.password"
                                    :readonly="!editMode"
                                    :color="editMode ? 'primary' : 'default'"
                                    :prepend-inner-icon="mdiLock"
                                    :append-inner-icon="hidePassword ? mdiEyeOff : mdiEye"
                                    :type="hidePassword ? 'password' : 'text'"
                                    label="Password"
                                    @click:prependInner="copyToClipBoard('Password')"
                                    @click:appendInner="hidePassword = !hidePassword"
                                />
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="credential.url"
                                    :prepend-inner-icon="mdiLinkVariant"
                                    :readonly="!editMode"
                                    :color="editMode ? 'primary' : 'default'"
                                    label="Website URL"
                                    placeholder="https://exemple.com"
                                    outlined
                                    :append-inner-icon="mdiArrowTopRight"
                                    @click:appendInner="win.open(credential.url, '_blank')"
                                />
                            </v-col>
                        </v-row>
                        <v-btn type="submit" hidden />
                    </v-form>
                </v-container>
            </v-card-text>

            <v-card-actions class="mb-2 mx-4">
                <v-btn v-if="!newMode" outlined color="red" @click="showConfirmationDialog = true">
                    Delete
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
                    @click="saveChanges"
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
        <Confirm
            :show="showConfirmationDialog"
            @no="showConfirmationDialog = false"
            @yes="deleteCredential()"
        />
    </v-dialog>
</template>

<style lang="scss">
@use '@/styles.scss';

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

import Confirm from '@/components/ConfirmationDialog.vue';
import Toast from '@/components/ToastComponent.vue';
import { sendVault } from '@/services/vault';
import { VAULT_A, VAULT_M, useVaultStore } from '@/stores/vaultStore';

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

// DOM controls
const hidePassword = ref(true);
const newMode = ref(props.index === -1);
const editMode = ref(props.index === -1);
const showToast = ref(false);
const toastMsg = ref('');
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('error');
const showConfirmationDialog = ref(false);
const loading = ref(false);

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
function cancelChanges() {
    if (newMode.value) {
        emit('close');
    } else {
        credential.value = {
            name: vaultStore.state.credentials[index.value].name,
            url: vaultStore.state.credentials[index.value].url,
            username: vaultStore.state.credentials[index.value].username,
            password: vaultStore.state.credentials[index.value].password,
        };
    }

    editMode.value = false;
}

async function saveChanges() {
    if (editMode.value) {
        loading.value = true;

        const validation = await form.value?.validate();

        if (validation?.valid) {
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
                // if cloud save ok, and new mode close prompt
                console.debug('[CREDENTIAL] Save successful');
                editMode.value = false;
                if (props.index === -1) {
                    newMode.value = false;
                }
            } else {
                console.debug(`[CREDENTIAL] Save failed: [${res.err.code}] ${res.err.message}`);
                toastType.value = 'error';
                showToast.value = true;
                toastMsg.value = res.err.message;
            }
        } else {
            console.debug(
                `[saveChanges] Validation error: ${validation?.errors[0].errorMessages[0]}`
            );
            // Print validation error on Error Toast
            toastMsg.value = validation?.errors[0].errorMessages[0] ?? 'Error';
            toastType.value = 'warning';
            showToast.value = true;
        }

        loading.value = false;
        emit('close');
    }
}

async function deleteCredential() {
    showConfirmationDialog.value = false;
    vaultStore.commit(VAULT_M.DELETE_CREDENTIAL, index.value);

    // then send to backend
    const res = await sendVault();

    if (res.ok) {
        // if cloud save ok, and new mode close prompt
        console.debug('[CREDENTIAL] Deletion success');
        emit('close');
    } else {
        console.debug(`[CREDENTIAL] Deletion failed: [${res.err.code}] ${res.err.message}`);
        toastType.value = 'error';
        showToast.value = true;
        toastMsg.value = res.err.message;
    }
}

function clickOutsideHandler() {
    if (!editMode.value) {
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

    toastType.value = 'info';
    toastMsg.value = field + ' copied';
    showToast.value = true;

    timeout = setTimeout(() => {
        showToast.value = false;
    }, 1500);
}
</script>
