'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to track the VisualViewport height.
 * This is used to handle the mobile keyboard overlapping the chat input.
 * When the virtual keyboard opens, the visual viewport shrinks, and this
 * hook provides the current height so the chat container can resize.
 */
export function useVisualViewport() {
    const [viewportHeight, setViewportHeight] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.visualViewport) return;

        const vv = window.visualViewport;

        const handleResize = () => {
            setViewportHeight(vv.height);
        };

        // Set initial value
        handleResize();

        vv.addEventListener('resize', handleResize);
        vv.addEventListener('scroll', handleResize);

        return () => {
            vv.removeEventListener('resize', handleResize);
            vv.removeEventListener('scroll', handleResize);
        };
    }, []);

    return viewportHeight;
}
