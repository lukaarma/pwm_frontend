<template>
    <v-slide-y-reverse-transition v-show="show" duration="300">
        <v-alert type="error">{{ msg }}</v-alert>
    </v-slide-y-reverse-transition>
</template>

<script setup lang="ts">
defineProps<{
    msg: string;
    show: boolean;
}>();
</script>
