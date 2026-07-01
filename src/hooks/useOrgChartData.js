import { useState, useEffect, useCallback } from 'react';
import defaultData from '../data/orgchart.json';

const STORAGE_KEY = '@Stitch:orgchart';

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function useOrgChartData() {
    const [data, setData] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setData(JSON.parse(stored));
            } catch (e) {
                console.error('Erro ao carregar organograma do localStorage:', e);
                setData(clone(defaultData));
            }
        } else {
            setData(clone(defaultData));
        }
        setLoaded(true);
    }, []);

    const save = useCallback((nextData) => {
        const clean = clone(nextData);
        clean.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
        setData(clean);
    }, []);

    const reset = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setData(clone(defaultData));
    }, []);

    const exportJson = useCallback(() => {
        return clone(data || defaultData);
    }, [data]);

    const importJson = useCallback((json) => {
        const parsed = typeof json === 'string' ? JSON.parse(json) : json;
        save(parsed);
    }, [save]);

    return { data, loaded, save, reset, exportJson, importJson };
}
