import { decryptExportedVault } from '@/services/cryptoUtils';
import { JSONDateParser, urlProtocolRegex } from '@/services/utils';
import { sendVault } from '@/services/vault';
import { type Credential, vaultStore, VAULT_M } from '@/stores/vaultStore';
import {
    isExportedBitWardenVault,
    isExportedPWMVault,
    PROVIDERS,
    WEB_CODES,
    type Result,
    type WebMessage,
} from '@/types';

export async function importVault(
    selectedProvider: PROVIDERS,
    file: File,
    password: string
): Promise<Result<WebMessage>> {
    // save a copy of the vault as-is, enabling restore if import is too big
    const credentials = [...vaultStore.state.credentials];

    try {
        switch (selectedProvider) {
            case PROVIDERS.PWM_ENCRYPTED:
                await importNativeJSON(file, password, true);
                break;

            case PROVIDERS.PWM:
                await importNativeJSON(file, password, false);
                break;

            case PROVIDERS.BITWARDEN:
                await importBitwardenJSON(file);
                break;

            default:
                console.error(`[importVault] Invalid provider '${selectedProvider}' selected!`);
                break;
        }

        console.debug('[importVault] Local import successful, sending vault');
        // then send to backend
        const res = await sendVault();

        if (!res.ok && res.err.code === WEB_CODES.JSON_PAYLOAD_TOO_LARGE) {
            console.debug('[importVault] Import size too large! Restoring old vault');
            vaultStore.commit(VAULT_M.SET_VAULT, { credentials: credentials });

            res.err.message = 'Vault import failed, selected file is too big!';
        }

        return res;
    } catch (err) {
        if (err instanceof Error) {
            console.error(`[importVault] Caught error! '${err.name}'`);

            return {
                ok: false,
                err: {
                    code: WEB_CODES.VAULT_IMPORT_ERROR,
                    message: err.message,
                },
            };
        }

        console.error(`[importVault] Caught something!`);
        console.error(err);

        return {
            ok: false,
            err: {
                code: WEB_CODES.VAULT_IMPORT_ERROR,
                message: 'Unexpected error during import, please contact supportF',
            },
        };
    }
}

export async function importNativeJSON(file: File, password: string, encryptedSelection: boolean) {
    let parsedImport;
    let credentials: Array<Credential>;
    console.debug('[IMPORT_NATIVE] Importing PWM JSON file format');

    // try JSON parse of import file
    try {
        parsedImport = JSON.parse(await file.text(), JSONDateParser);
    } catch (_) {
        throw new Error(
            'Invalid JSON file! \nPlease check that you have the correct file selected!'
        );
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
                throw new Error(
                    'The JSON file was not encrypted! Please select a correct file or a correct provider'
                );
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
