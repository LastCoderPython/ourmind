"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { PanicHeader } from "@/components/PanicHeader";
import { BottomNav } from "@/components/BottomNav";
import { ToastManager } from "@/components/ToastManager";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return (
            <div className="mobile-frame">
                {children}
            </div>
        );
    }

    return (
        <div className="mobile-frame">
            <div
                className="biofeedback-container"
                style={
                    {
                        "--biofeedback-color": "var(--color-mood-joyful)",
                    } as React.CSSProperties
                }
            />
            <PanicHeader />
            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1, paddingBottom: "90px" }}>
                {children}
            </main>
            <BottomNav />
            <ToastManager />
        </div>
    );
}
