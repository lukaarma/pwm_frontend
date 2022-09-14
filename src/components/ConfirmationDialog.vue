<template>
    <v-row justify="center">
        <v-dialog :model-value="show" persistent>
            <v-card>
                <v-card-title>
                    <span class="text-h5">Delete</span>
                </v-card-title>
                <v-card-text class="text-center">
                    <p>Are you sure you want to delete these credentials?</p>
                    <p>The operation cannot be undone</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" text @click="$emit('no')"> No </v-btn>
                    <v-btn type="submit" color="success" text @click="$emit('yes')"> Yes </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script setup lang="ts">
// Vue internals
defineProps<{
    show: boolean;
}>();
defineEmits<{
    (e: 'no'): void;
    (e: 'yes'): void;
}>();
</script>
