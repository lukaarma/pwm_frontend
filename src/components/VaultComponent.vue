<template>
    <div class="text-right">
        <v-btn icon="mdiPlus" @click="openDialog(-1)">
            New
            <v-tooltip activator="parent" location="left" class="white-text">
                Insert a new credential
            </v-tooltip>
        </v-btn>
    </div>

    <div v-for="(_, key) of vaultStore.state.credentials" :key="key">
        <Credential :index="key" @openDialog="openDialog" />
    </div>

    <CredentialDialog :show="showDialog" :index="showIndex" @close="closeDialog" />
</template>

<script setup lang="ts">
import { useVaultStore } from '@/stores/vaultStore';
import { ref } from 'vue';

import Credential from '@/components/CredentialComponent.vue';
import CredentialDialog from '@/components/CredentialDialog.vue';

const vaultStore = useVaultStore();
const showDialog = ref(false);
const showIndex = ref(-1);

function openDialog(i: number) {
    console.debug(`[VAULT] Opening dialog with index ${showIndex.value}`);
    showIndex.value = i;
    showDialog.value = true;
}

function closeDialog() {
    showDialog.value = false;
}
</script>
