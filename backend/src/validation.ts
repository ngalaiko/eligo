import { Error } from '@eligo/protocol';

export const codeNotFound = 'error.not_found';
export const codeInvalid = 'error.invalid';
export const codeRequired = 'error.required';
export const codeEmpty = 'error.empty';

type Rule = 'required' | 'empty' | any;

type Rules<Type extends Record<string, any>> = {
    [Property in keyof Type]: Rule[] | Rule;
};

export const validate = <T extends Record<string, any>>(
    v: T,
    rules: Rules<T>
): Error | undefined => {
    const keys = Object.keys(v);
    for (const key of keys) {
        for (const rule of Array.isArray(rules) ? rules[key] : [rules[key]]) {
            if (rule === undefined) {
                return undefined;
            } else if (rule === 'required') {
                if (!v[key]) {
                    return errRequired(`${key} is required`);
                } else {
                    continue;
                }
            } else if (rule === 'empty') {
                if (v[key]) {
                    return errInvalid(`${key} must be empty`);
                } else {
                    continue;
                }
            } else if (rule !== v[key]) {
                return errInvalid(`invalid ${key}`);
            } else {
                return undefined;
            }
        }
    }
    return undefined;
};

export const errNotFound = (message: string): Error => ({
    code: codeNotFound,
    message
});
export const isNotFoundErr = (err: Error) => err.code === codeNotFound;

export const errInvalid = (message: string): Error => ({
    code: codeInvalid,
    message
});
export const isInvalidErr = (err: Error) => err.code === codeInvalid;

export const errRequired = (message: string): Error => ({
    code: codeRequired,
    message
});
export const isRequiredErr = (err: Error) => err.code === codeRequired;

export const errEmpty = (message: string): Error => ({
    code: codeEmpty,
    message
});
export const isEmptyErr = (err: Error) => err.code === codeEmpty;
