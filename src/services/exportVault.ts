import { encryptExportedVault } from '@/services/cryptoUtils';
import { vaultStore } from '@/stores/vaultStore';
import type { ExportedPWMVault } from '@/types';


export async function exportJSON(encrypted = false, password?: string): Promise<ExportedPWMVault> {
    const exportDate = new Date();

    if (encrypted && !password) {
        throw new Error('Requested encrypted export but no password provided!');
    }

    if (encrypted && password) {
        return {
            exportDate,
            version: vaultStore.state.version,
            lastModified: vaultStore.state.lastModified,
            encrypted,
            ...(await encryptExportedVault(password, exportDate.toUTCString())),
        };
    } else if (encrypted && !password) {
        throw new Error('Requested encrypted export but no password provided!');
    } else {
        // NOTE: useless but Typescript didn't recognize this
        encrypted = false;

        return {
            exportDate,
            version: vaultStore.state.version,
            lastModified: vaultStore.state.lastModified,
            encrypted,
            credentials: vaultStore.state.credentials,
        };
    }
}
