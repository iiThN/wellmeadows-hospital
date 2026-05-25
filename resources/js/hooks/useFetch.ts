import { useState, useEffect } from 'react';
import axios from 'axios';

const cache: Record<string, unknown> = {};

export function useFetch<T>(url: string, initial: T) {
    const [data, setData] = useState<T>(cache[url] as T ?? initial);
    const [loading, setLoading] = useState(!cache[url]);

    useEffect(() => {
        if (cache[url]) {
            setData(cache[url] as T);
            setLoading(false);
            return;
        }
        axios.get(url).then(r => {
            cache[url] = r.data;
            setData(r.data as T);
        }).finally(() => setLoading(false));
    }, [url]);

    return { data, loading };
}
