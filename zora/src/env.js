export const findConfigurationValue = (name) => {
    if (isNode) {
        return process.env[name];
    } else if (isDeno) {
        return Deno.env.get(name);
    } else if (isBrowser) {
        return window[name];
    }
};

export const isNode = typeof process !== 'undefined';
export const isBrowser = typeof window !== 'undefined';
export const isDeno = typeof Deno !== 'undefined';
