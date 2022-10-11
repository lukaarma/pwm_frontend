import { configStore } from '@/stores/configStore';

const lowercasePool = 'abcdefghijklmnopqrstuvwxyz';
const uppercasePool = lowercasePool.toUpperCase();
const numbersPool = '0123456789';
const symbolsPool = '!@#$%^&*';

export function filterNumbers(ev: KeyboardEvent) {
    if (isNaN(parseInt(ev.key, 10))) {
        console.debug('[filterNumbers] NaN, preventing...');
        ev.preventDefault();
    }
}

enum PASSWORD_PLACEHOLDERS {
    LOWER_CASE,
    UPPER_CASE,
    NUMBERS,
    SYMBOLS,
    COMBINED,
}

export function generatePassword(): string {
    const placeholders = [];
    const config = configStore.state.pwdGen;
    const combinedPool =
        (configStore.getters.lowerCaseSelected ? lowercasePool : '') +
        (configStore.getters.upperCaseSelected ? uppercasePool : '') +
        (configStore.getters.numbersSelected ? numbersPool : '') +
        (configStore.getters.symbolsSelected ? symbolsPool : '');

    // 5% hardcoded lowercase/uppercase
    const lowerCaseCount = configStore.getters.lowerCaseSelected
        ? Math.floor((config.passwordLength * 5) / 100)
        : 0;
    const upperCaseCount = configStore.getters.upperCaseSelected
        ? Math.floor((config.passwordLength * 5) / 100)
        : 0;
    const numbersCount = configStore.getters.numbersSelected
        ? Math.floor((config.passwordLength * config.numbersPercentage) / 100)
        : 0;
    const symbolsCount = configStore.getters.symbolsSelected
        ? Math.floor((config.passwordLength * config.symbolsPercentage) / 100)
        : 0;
    const combinedCount =
        config.passwordLength - lowerCaseCount - upperCaseCount - numbersCount - symbolsCount;

    for (let i = 0; i < lowerCaseCount; i++) {
        placeholders.push(PASSWORD_PLACEHOLDERS.LOWER_CASE);
    }
    for (let i = 0; i < upperCaseCount; i++) {
        placeholders.push(PASSWORD_PLACEHOLDERS.UPPER_CASE);
    }
    for (let i = 0; i < numbersCount; i++) {
        placeholders.push(PASSWORD_PLACEHOLDERS.NUMBERS);
    }
    for (let i = 0; i < symbolsCount; i++) {
        placeholders.push(PASSWORD_PLACEHOLDERS.SYMBOLS);
    }
    for (let i = 0; i < combinedCount; i++) {
        placeholders.push(PASSWORD_PLACEHOLDERS.COMBINED);
    }

    for (let i = placeholders.length - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * i);

        [placeholders[i], placeholders[j]] = [placeholders[j], placeholders[i]];
    }

    return placeholders
        .map((placeholder) => {
            switch (placeholder) {
                case PASSWORD_PLACEHOLDERS.LOWER_CASE:
                    return lowercasePool.charAt(Math.floor(Math.random() * lowercasePool.length));

                case PASSWORD_PLACEHOLDERS.UPPER_CASE:
                    return uppercasePool.charAt(Math.floor(Math.random() * uppercasePool.length));

                case PASSWORD_PLACEHOLDERS.NUMBERS:
                    return numbersPool.charAt(Math.floor(Math.random() * numbersPool.length));

                case PASSWORD_PLACEHOLDERS.SYMBOLS:
                    return symbolsPool.charAt(Math.floor(Math.random() * symbolsPool.length));

                case PASSWORD_PLACEHOLDERS.COMBINED:
                    return combinedPool.charAt(Math.floor(Math.random() * combinedPool.length));

                default:
                    console.error('[generatePassword] Invalid placeholder present!');
                    return '';
            }
        })
        .join('');
}
