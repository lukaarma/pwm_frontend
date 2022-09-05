import { createRouter, createWebHistory } from 'vue-router';

import { userStore } from '@/stores/userStore';
import HomeView from '@/views/HomeView.vue';

const whitelist = ['/', '/login', '/signup', '/sendVerification'];

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
            path: '/sendVerification',
            name: 'SendVerification',
            component: () => import('@/views/SendVerificationView.vue'),
        },
        {
            path: '/profile',
            name: 'Profile',
            component: () => import('@/views/ProfileView.vue'),
        },
        {
            path: '/vault',
            name: 'Vault',
            component: () => import('@/views/VaultView.vue'),
        },
    ],
});

router.beforeEach((to) => {
    if (whitelist.includes(to.path) || userStore.state.authHeader) {
        return true;
    }
    console.debug(`[ROUTER] User not authenticated, navigation to '${to.path}' blocked`);

    return '/login';
});

export default router;
