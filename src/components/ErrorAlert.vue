<template>
    <v-slide-y-reverse-transition duration="300">
        <v-alert :model-value="show" type="error">{{ msg }}</v-alert>
    </v-slide-y-reverse-transition>
</template>

<script setup lang="ts">
defineProps<{
    msg: string;
    show: boolean;
}>();
</script>
