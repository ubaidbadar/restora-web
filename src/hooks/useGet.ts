import { useCallback, useEffect, useState } from 'react';
import type { AxiosRequestConfig } from 'axios';
import api from '../config/api';
import getCache from '../store/get_cache';
import useOutboxStore from '../store/outbox_store';
import toast from '../utils/toast';
import getAxiosMessage from '../utils/get_axios_message';

type UseGetOptions = AxiosRequestConfig & {
    active?: boolean;
};

type GetState<T> = {
    loading: boolean;
    data?: T;
    error?: string;
};

type Request = {
    id: number;
    options: AxiosRequestConfig;
    delay: number;
};

const pending = new Map<string, Promise<unknown>>();


export default function useGet<T = unknown>(url: string, { active, ...initialOptions }: UseGetOptions = {}) {
    const [state, setState] = useState<GetState<T>>(() => {
        const data = getCache.get(getCache.keyOf(url, initialOptions)) as T | undefined;
        return { loading: !active && data === undefined, data };
    });
    const [request, setRequest] = useState<Request>({ id: 0, options: initialOptions, delay: 0 });

    const get = useCallback((override: AxiosRequestConfig = {}, delay = 0) => {
        setRequest(r => ({
            id: r.id + 1,
            delay,
            options: { ...r.options, ...override, params: override.params ? { ...r.options.params, ...override.params } : r.options.params },
        }));
    }, []);

    useEffect(() => {
        if (!active) get();
    }, [active, get]);

    useEffect(() => {
        if (request.id === 0) return;
        let current = true;
        let unsubscribe = () => { };

        const timer = setTimeout(() => {
            const key = getCache.keyOf(url, request.options);
            const cached = getCache.get(key) as T | undefined;
            setState(s => ({ ...s, data: cached ?? s.data, loading: cached === undefined, error: undefined }));

            let promise = pending.get(key);
            if (!promise) {
                promise = api<T>({ method: 'GET', url, ...request.options }).then(res => res.data);
                pending.set(key, promise);
                promise
                    .then(data => getCache.set(key, data), err => (err.response || (cached === undefined && useOutboxStore.getState().online)) && toast.error(getAxiosMessage(err)))
                    .finally(() => pending.delete(key));
            }

            promise
                .then(data => current && setState(s => ({ ...s, loading: false, data: data as T })))
                .catch(err => current && setState(s => ({ ...s, loading: false, error: getAxiosMessage(err) })));

            unsubscribe = getCache.subscribe(changed => changed === key && current && setState(s => ({ ...s, data: getCache.get(key) as T })));
        }, request.delay);

        return () => {
            current = false;
            clearTimeout(timer);
            unsubscribe();
        };
    }, [url, request]);

    // Changes the cached answer; every screen showing it (this one too) updates, and the next visit shows the change.
    const update = useCallback((updater: (currentData: T | undefined) => T | undefined) => {
        getCache.update(getCache.keyOf(url, request.options), updater);
    }, [url, request.options]);

    return { ...state, options: request.options, get, update };
}
