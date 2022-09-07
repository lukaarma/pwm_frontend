<template>
    <v-dialog :model-value="show" :persistent="editMode" @click:outside="clickOutsideHandler">
        <v-card class="pa-4">
            <v-card-title>
                <span class="text-h5">{{ title }}</span>
            </v-card-title>
            <v-card-text>
                <Toast
                    class="mb-4"
                    type="info"
                    :show="showToast"
                    :msg="toastMsg"
                    @close="showToast = false"
                />
                <v-container>
                    <v-form ref="form" @submit.prevent="">
                        <v-row>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="credential.websiteName"
                                    :rules="websiteNameRules"
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
                                    v-on:click="copyToClipBoard('Username', credential.username)"
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
                                    v-on:click="copyToClipBoard('Password', credential.password)"
                                    @click:appendInner="hidePassword = !hidePassword"
                                />
                            </v-col>
                            <v-col class="py-0" cols="12">
                                <v-text-field
                                    v-model="credential.url"
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
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useVaultStore } from '@/stores/vaultStore';
import Toast from '@/components/ToastComponent.vue';
import type vuetify from 'vuetify/components';
import { mdiLock, mdiEye, mdiEyeOff, mdiAccountBox, mdiArrowTopRight } from '@mdi/js';

const win = window;

const props = defineProps<{
    show: boolean;
    index: number;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const vaultStore = useVaultStore();

// DOM controls
const hidePassword = ref(true);
const newMode = ref(props.index === -1);
const editMode = ref(props.index === -1);
const showToast = ref(false);
const toastMsg = ref('');
const loading = ref(false);

watch(props, () => {
    editMode.value = props.index === -1;
    newMode.value = editMode.value;
});

const form = ref<InstanceType<typeof vuetify.VForm> | null>(null);

// rules
const websiteNameRules = [(name: string) => !!name || 'Field is required'];

// refs
// NOTE: don't reference data[index] directly! It WILL change the store

// FIXME: it doesn't work!! Cannot edit!!
const credential = computed(() => ({
    websiteName: newMode.value ? '' : vaultStore.state.data[props.index].websiteName,
    url: newMode.value ? '' : vaultStore.state.data[props.index].url,
    username: newMode.value ? '' : vaultStore.state.data[props.index].username,
    password: newMode.value ? '' : vaultStore.state.data[props.index].password,
}));

const title = computed(() => {
    if (newMode.value) {
        return 'New Credential';
    } else if (editMode.value) {
        return 'Edit Credential';
    } else {
        return 'View Credential';
    }
});

// handlers
function cancelChanges() {
    if (newMode.value) {
        emit('close');
    } else {
        credential.value.websiteName = vaultStore.state.data[props.index].websiteName;
        credential.value.url = vaultStore.state.data[props.index].url;
        credential.value.username = vaultStore.state.data[props.index].username;
        credential.value.password = vaultStore.state.data[props.index].password;
    }

    editMode.value = false;
}

async function saveChanges() {
    loading.value = true;
    // FIXME: remove fake timer
    await new Promise((r) => setTimeout(r, 1000));
    if (newMode.value) {
        null; // Insert new credential
    } else {
        null; // Update credential
    }
    editMode.value = false;
    loading.value = false;
}

function clickOutsideHandler() {
    if (!editMode.value) {
        emit('close');
    }
}

async function copyToClipBoard(field: string, textToCopy: string) {
    if (!editMode.value && !!textToCopy) {
        showToast.value = false;
        navigator.clipboard.writeText(textToCopy);
        await new Promise((r) => setTimeout(r, 200));
        toastMsg.value = field + ' copied';
        showToast.value = true;
        await new Promise((r) => setTimeout(r, 800));
        showToast.value = false;
    }
}
</script>
