export function JSONDateParser(_: string, value: unknown) {
    const ISORegex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

    if (typeof value === 'string' && ISORegex.test(value)) {
        return new Date(value);
    }

    return value;
}
