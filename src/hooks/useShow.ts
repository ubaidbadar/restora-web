import { useEffect, useEffectEvent, useRef, useState } from "react";
import type ShowTools from '../types/show_tools';
import useOverlay from './useOverlay';

/** How long the "close" state lasts, so exit animations can play before unmounting. */
const EXIT_DURATION = 300;

type ShowState = "active" | "close" | "";

export default function useShow(initialState?: ShowState): ShowTools {
    const [state, setState] = useState<ShowState>(initialState || "");
    const exitTimerRef = useRef<number | undefined>(undefined);
    const isActive = state === "active";
    // What had focus when the overlay was opened; closing hands focus back to it.
    const openerRef = useRef<Element | null>(null);

    const open = () => {
        window.clearTimeout(exitTimerRef.current);
        if (!isActive) openerRef.current = document.activeElement;
        setState("active");
    };

    const close = () => {
        window.clearTimeout(exitTimerRef.current);
        setState("close");
        exitTimerRef.current = window.setTimeout(() => setState(""), EXIT_DURATION);
        if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
        openerRef.current = null;
    };

    
    const closeOnBack = useEffectEvent(close);
    useEffect(() => {
        if (!isActive) return;

        const handlePopState = () => closeOnBack();
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [isActive]);

    useEffect(() => () => window.clearTimeout(exitTimerRef.current), []);

    useOverlay(isActive, close);

    return { state, open, close };
}
