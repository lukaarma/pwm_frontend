<template>
    <v-card color="purple ma-2" theme="dark">
        <v-row class="ma-2">
            <v-card-title class="text-h5">
                {{ credential.websiteName }}
            </v-card-title>
            <v-btn text color="primary" @click="$emit('openDialog', index)">Edit</v-btn>
        </v-row>
        <v-card-subtitle>{{ credential.username }}</v-card-subtitle>
    </v-card>
</template>

<script setup lang="ts">
import { useVaultStore } from '@/stores/vaultStore';
import { readonly } from 'vue';

const props = defineProps<{
    index: number;
}>();

defineEmits<{
    (e: 'openDialog', index: number): void;
}>();

const vaultStore = useVaultStore();

const credential = readonly(vaultStore.state.data[props.index]);
</script>
