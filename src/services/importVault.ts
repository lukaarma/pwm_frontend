import { isExportedBitWardenVault, isExportedPWMVault } from '@/types';
import { decryptExportedVault } from '@/services/cryptoUtils';
import { JSONDateParser } from '@/services/utils';
import { type Credential, vaultStore, VAULT_M } from '@/stores/vaultStore';
import { urlProtocolRegex } from '@/services/utils';

export async function importNativeJSON(file: File, password: string, encryptedSelection: boolean) {
    let parsedImport;
    let credentials: Array<Credential>;
    console.debug('[IMPORT_NATIVE] Importing PWM JSON file format');

    // try JSON parse of import file
    try {
        parsedImport = JSON.parse(await file.text(), JSONDateParser);
    } catch (_) {
        throw new Error('Invalid JSON file! \nPlease check that you have the correct file selected!');
    }

    // if valid JSON check for valid PWM format
    if (isExportedPWMVault(parsedImport)) {
        console.debug('[IMPORT_NATIVE] Valid ExportedPWMVault provided');

        // if encrypted decrypt
        if (encryptedSelection) {
            if (parsedImport.encrypted) {
                console.debug('[IMPORT_NATIVE] Decrypting vault');
                credentials = await decryptExportedVault(
                    password,
                    parsedImport.exportDate.toUTCString(),
                    parsedImport.IV,
                    parsedImport.data
                );
            } else {
                throw new Error('The JSON file was not encrypted! Please select a correct file or a correct provider');
            }
        } else {
            if (!parsedImport.encrypted) {
                credentials = parsedImport.credentials;
            } else {
                throw new Error(
                    'The JSON file was encrypted! Please select a correct file or a correct provider'
                );
            }
        }

        credentials.forEach((cred) => {
            cred.name ??= 'Imported';
            if (cred.url && !urlProtocolRegex.test(cred.url)) {
                cred.url = `http://${cred.url}`;
            }
        });

        vaultStore.commit(VAULT_M.BULK_INSERT_CREDENTIAL, credentials);
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
        const credentials = parsedImport.items.map((item) => {
            let url = item.login.uris[0].uri ?? '';

            if (url && !urlProtocolRegex.test(url)) {
                url = `http://${url}`;
            }

            return {
                name: item.name ?? 'Imported',
                url,
                username: item.login.username,
                password: item.login.password,
            } as Credential;
        });

        vaultStore.commit(VAULT_M.BULK_INSERT_CREDENTIAL, credentials);
    } else {
        throw new Error(
            'The JSON provided is not in the BitWarden format! Please check that you have the correct file selected!'
        );
    }
}
