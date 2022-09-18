import { isExportedBitWardenVault, isExportedPWMVault } from '@/types';
import { decryptExportedVault } from '@/services/cryptoUtils';
import { JSONDateParser } from '@/services/utils';
import { type Credential, vaultStore, VAULT_A } from '@/stores/vaultStore';

export async function importNativeJSON(file: File, password: string) {
    let parsedImport;
    let credentials: Array<Credential>;
    console.debug('[IMPORT_NATIVE] Importing PWM JSON file format');

    // try JSON parse of import file
    try {
        parsedImport = JSON.parse(await file.text(), JSONDateParser);
    } catch (_) {
        throw new Error('Invalid JSON file! Please check that you have the correct file selected!');
    }

    // if valid JSON check for valid PWM format
    if (isExportedPWMVault(parsedImport)) {
        console.debug('[IMPORT_NATIVE] Valid ExportedPWMVault provided');

        // if encrypted decrypt
        if (parsedImport.encrypted) {
            console.debug('[IMPORT_NATIVE] Decrypting vault');
            credentials = await decryptExportedVault(
                password,
                parsedImport.exportDate.toUTCString(),
                parsedImport.IV,
                parsedImport.data
            );
        } else {
            credentials = parsedImport.credentials;
        }

        credentials.forEach((credential) =>
            vaultStore.dispatch(VAULT_A.SET_CREDENTIAL, {
                index: -1,
                credential,
            })
        );
    } else {
        throw new Error(
            'The JSON provided is not in the native PWM format! Please check that you have the correct file selected!'
        );
    }
}

export async function importBitwardenJSON(file: File) {
    let parsedImport;
    console.debug('[IMPORT_BITWARDEN] Importing BITWARDEN file format');

    try {
        parsedImport = JSON.parse(await file.text(), JSONDateParser);
    } catch (_) {
        throw new Error('Invalid JSON file! Please check that you have the correct file selected!');
    }

    console.debug(`[IMPORT_BITWARDEN] ${JSON.stringify(parsedImport, null, 4)}`);

    if (isExportedBitWardenVault(parsedImport)) {
        console.debug('[IMPORT_NATIVE] Valid ExportedPWMVault provided');

        parsedImport.items.forEach((item) => {
            vaultStore.dispatch(VAULT_A.SET_CREDENTIAL, {
                index: -1,
                credential: {
                    name: item.name,
                    url: item.login.uris[0].uri ?? '',
                    username: item.login.username,
                    password: item.login.password,
                },
            });
        });
    } else {
        throw new Error(
            'The JSON provided is not in the BitWarden format! Please check that you have the correct file selected!'
        );
    }
}
