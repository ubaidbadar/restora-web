import { useCallback, useEffect, useState } from 'react';
import type { AxiosRequestConfig } from 'axios';
import api from '../config/api';
import getCache from '../store/get_cache';
import useOutboxStore from '../store/outbox_store';
import toast from '../utils/toast';
import getAxiosMessage from '../utils/get_axios_message';

type UseGetOptions = AxiosRequestConfig & {
    active?: boolean;
    /** Prefer an already persisted response and avoid an unnecessary GET when opening offline-first screens. */
    cacheFirst?: boolean;
};

type GetState<T> = {
    loading: boolean;
    data?: T;
    error?: string;
};

type Request = {
    id: number;
    options: AxiosRequestConfig;
};

// Requests on their way, so two screens asking for the same thing at once make one request.
const pending = new Map<string, Promise<unknown>>();


export default function useGet<T = unknown>(url: string, { active, cacheFirst = false, ...initialOptions }: UseGetOptions = {}) {
    const [state, setState] = useState<GetState<T>>(() => {
        const data = getCache.get(getCache.keyOf(url, initialOptions)) as T | undefined;
        return { loading: !active && data === undefined, data };
    });
    const [request, setRequest] = useState<Request>({ id: 0, options: initialOptions });

    // Merges `params` too, so `get({ params: { date } })` keeps the other params.
    const get = useCallback((override: AxiosRequestConfig = {}) => {
        setRequest(r => ({
            id: r.id + 1,
            options: { ...r.options, ...override, params: override.params ? { ...r.options.params, ...override.params } : r.options.params },
        }));
    }, []);

    useEffect(() => {
        if (!active && !(cacheFirst && getCache.get(getCache.keyOf(url, initialOptions)) !== undefined)) get();
    }, [active, cacheFirst, get, url]);

    useEffect(() => {
        if (request.id === 0) return;
        let current = true;
        const key = getCache.keyOf(url, request.options);
        const cached = getCache.get(key) as T | undefined;
        setState(s => ({ ...s, data: cached ?? s.data, loading: cached === undefined, error: undefined }));

        let promise = pending.get(key);
        if (!promise) {
            promise = api<T>({ method: 'GET', url, ...request.options }).then(res => res.data);
            pending.set(key, promise);
            // Saved and reported once, however many screens are waiting for it. Without internet no toast: a screen with a
            // saved answer keeps showing it, and the offline bar already says why nothing new loads.
            promise
                .then(data => getCache.set(key, data), err => (err.response || (cached === undefined && useOutboxStore.getState().online)) && toast.error(getAxiosMessage(err)))
                .finally(() => pending.delete(key));
        }

        promise
            .then(data => current && setState(s => ({ ...s, loading: false, data: data as T })))
            .catch(err => current && setState(s => ({ ...s, loading: false, error: getAxiosMessage(err) })));

        // Shows changes made to this answer elsewhere (another screen's update, an order synced from the outbox).
        const unsubscribe = getCache.subscribe(changed => changed === key && current && setState(s => ({ ...s, data: getCache.get(key) as T })));

        return () => {
            current = false;
            unsubscribe();
        };
    }, [url, request]);

    // Changes the cached answer; every screen showing it (this one too) updates, and the next visit shows the change.
    const update = useCallback((updater: (currentData: T | undefined) => T | undefined) => {
        getCache.update(getCache.keyOf(url, request.options), updater);
    }, [url, request.options]);

    return { ...state, options: request.options, get, update };
}
