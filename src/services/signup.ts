import API from './API';
import utils, { deriveMKeMPH, encryptSK } from './cryptoUtils';
import type { Result } from '@/types';

export default async function ({
    email,
    password,
    firstName,
    lastName,
}: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}): Promise<Result> {
    console.debug('[SIGNUP] Start signup sequence');

    const IV = window.crypto.getRandomValues(new Uint8Array(16));
    const SK = window.crypto.getRandomValues(new Uint8Array(32));

    return await deriveMKeMPH(email, password)
        .then(async ({ MK, MPH }) => {
            return await MPH.then(async (masterPwdHash): Promise<Result> => {
                console.debug('[SIGNUP] Got MPH, generating PSK');

                const res = await API.signup({
                    email,
                    masterPwdHash: utils.toHex(masterPwdHash),
                    firstName,
                    lastName,
                    PSK: utils.toHex(await encryptSK(IV, MK, SK)),
                    IV: utils.toHex(IV),
                });

                if (!res.data) {
                    return {
                        ok: false,
                        err: res.err ?? {
                            code: 999,
                            message: 'Missing data and error!',
                        },
                    };
                }

                console.debug('[SIGNUP] API call success, user in verification...');

                return {
                    ok: true,
                    data: res.data,
                };
            });
        })
        .catch((err: Error) => {
            console.debug('[SIGNUP] Caught error:');
            console.dir(err);

            return {
                ok: false,
                err: {
                    code: 999,
                    message: err.message,
                },
            };
        });
}
