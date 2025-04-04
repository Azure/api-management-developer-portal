import * as React from "react";

export const useLoadData = <T, D extends unknown[]>(load: (...args: D) => Promise<T>, deps: D): { working: boolean, data: T | undefined } => {
    const [working, setWorking] = React.useState(true);
    const [data, setData] = React.useState<T>();

    React.useEffect(() => {
        setWorking(true);
        load(...deps)
            .then(setData)
            .finally(() => setWorking(false));
    }, [load, ...deps]);

    return { working, data };
}
