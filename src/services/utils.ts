import router from '@/router';
import { userStore } from '@/stores/userStore';
import { vaultStore, VAULT_M } from '@/stores/vaultStore';
import { localStorageVaultKey, sendVault } from '@/services/vault';

export function JSONDateParser(_: string, value: unknown) {
    const ISORegex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

    if (typeof value === 'string' && ISORegex.test(value)) {
        return new Date(value);
    }

    return value;
}

export async function logout() {
    if (localStorage.getItem(localStorageVaultKey)) {
        await sendVault();
    }
    userStore.commit('logout');
    vaultStore.commit(VAULT_M.LOGOUT);
    router.push('/login');
}

export const hasProtocolRegex = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//;
