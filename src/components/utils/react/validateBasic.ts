type TRule = string | {
    eval(value: unknown): string | false,
    required?: string,
}

export const validateBasic = <T extends string>(values: Record<T, unknown>, rules: Partial<Record<T, TRule>>) => {
    const errors: string[] = [];
    Object.keys(rules).forEach(key => {
        let rule: Partial<TRule> = rules[key];
        if (typeof rule === "string") rule = { required: rule };

        if (rule.required && (!(key in values) || (!values[key] && values[key] !== 0))) {
            errors.push(rule.required);
        } else if ("eval" in rule) {
            const errorMsg = rule.eval(values[key]);
            if (errorMsg) errors.push(errorMsg);
        }
    });
    return errors;
}
