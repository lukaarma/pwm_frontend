<!--
    TODO: understand wtf is going on with the width of this component other than MAGIC
    FIXME: form input have too much opacity if focused when readonly, style is confusing
-->
<template>
    <v-dialog :model-value="show" :persistent="editMode" @click:outside="clickOutsideHandler">
        <v-card class="pa-4">
            <v-card-title class="text-center">
                <span class="text-h5">{{ title }} | {{ index }}</span>
            </v-card-title>

            <v-card-text>
                <v-container class="mt-8">
                    <v-form ref="form" @submit.prevent="">
                        <v-row>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="credential.name"
                                    :rules="websiteNameRules"
                                    :prepend-inner-icon="mdiWeb"
                                    :readonly="!editMode"
                                    label="Website Name"
                                    placeholder="Example Website"
                                    required
                                />
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="credential.username"
                                    :readonly="!editMode"
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
                                    label="Website URL"
                                    placeholder="https://exemple.com"
                                    outlined
                                    :append-inner-icon="mdiArrowTopRight"
                                    @click:appendInner="win.open(credential.url, '_blank')"
                                />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-container>
                <small>*indicates required field</small>
            </v-card-text>

            <v-card-actions v-if="editMode">
                <v-spacer />
                <v-btn outlined color="primary" @click="cancelChanges"> Cancel </v-btn>
                <v-btn outlined color="primary" @click="saveChanges" :loading="loading">
                    Save
                </v-btn>
            </v-card-actions>

            <v-card-actions v-else>
                <v-spacer />
                <v-btn outlined color="primary" @click="$emit('close')"> Close </v-btn>
                <v-btn outlined color="primary" @click="editMode = true"> Edit </v-btn>
            </v-card-actions>
        </v-card>
        <Toast
            class="copyAlert"
            :type="toastType"
            :show="showToast"
            :msg="toastMsg"
            @close="showToast = false"
        />
    </v-dialog>
</template>

<style>
.copyAlert {
    position: absolute;
    bottom: 0;
    width: 100%;
    transform: translate(0, 110%);
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VAULT_A, useVaultStore } from '@/stores/vaultStore';
import { sendVault } from '@/services/vault';
import Toast from '@/components/ToastComponent.vue';
import type vuetify from 'vuetify/components';
import {
    mdiLock,
    mdiEye,
    mdiEyeOff,
    mdiAccountBox,
    mdiArrowTopRight,
    mdiLinkVariant,
    mdiWeb,
} from '@mdi/js';

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
    loading.value = true;

    const validation = await form.value?.validate();

    if (validation?.valid) {
        // if valid save in store
        index.value = await vaultStore.dispatch(VAULT_A.SET_CREDENTIAL, {
            index: index.value,
            credential: credential.value,
        });

        console.log(
            `[CREDENTIAL] ${newMode.value ? 'Added new' : 'Updated'} credential at ${index.value}`
        );

        // then send to backend
        const res = await sendVault();

        if (res.ok) {
            // if cloud save ok, and new mode close prompt
            console.debug('[CREDENTIAL] Save successful');
        } else {
            console.debug(`[CREDENTIAL] Save failed: [${res.err.code}] ${res.err.message}`);
            toastType.value = 'error';
            showToast.value = true;
            toastMsg.value = res.err.message;
        }
    } else {
        console.debug(`[saveChanges] Validation error: ${validation?.errors[0].errorMessages[0]}`);
        // Print validation error on Error Toast
        toastMsg.value = validation?.errors[0].errorMessages[0] ?? 'Error';
        toastType.value = 'warning';
        showToast.value = true;
    }

    editMode.value = false;
    loading.value = false;
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
