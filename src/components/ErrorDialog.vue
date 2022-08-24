<template>
    <v-dialog :model-value="show" @click:outside="$emit('close')">
        <v-card class="pa-4">
            <v-card-title class="text-h5"> Error </v-card-title>
            <v-card-text>{{ msg }}</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="purple" @click="$emit('close')"> Close </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
defineProps<{
    msg: string;
    show: boolean;
}>();

defineEmits<{ (e: 'close'): void }>();
</script>
