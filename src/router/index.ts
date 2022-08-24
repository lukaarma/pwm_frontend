import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView,
        },
        {
            path: '/login',
            name: 'Login',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('@/views/LoginView.vue'),
        },
        {
            path: '/signup',
            name: 'Signup',
            component: () => import('@/views/SignupView.vue'),
        },
        {
            path: '/vault',
            name: 'Vault',
            component: () => import('@/views/VaultView.vue'),
        },
    ],
});

export default router;
