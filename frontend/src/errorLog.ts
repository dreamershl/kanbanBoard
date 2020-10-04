const name = "console";

export default function errorLog(...args: any[]) {
    const log = window[name];

    if (log && log.error) (log.error as any).apply(log, args);
}

export function warnLog(...args: any[]) {
    const log = window[name];

    if (log && log.warn) (log.warn as any).apply(log, args);
}
