"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, BarChart3, BookOpen, Users } from "lucide-react";
import { useUser } from "@/components/UserContext";
import { t } from "@/lib/i18n";

export function BottomNav() {
    const pathname = usePathname();
    const { language } = useUser();

    const navItems = [
        { href: "/chat", labelKey: "nav.chat", icon: MessageCircle },
        { href: "/stats", labelKey: "nav.stats", icon: BarChart3 },
        { href: "/library", labelKey: "nav.library", icon: BookOpen },
        { href: "/wall", labelKey: "nav.wall", icon: Users },
    ];

    return (
        <nav className="bottom-nav" aria-label="Main navigation">
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item${isActive ? " active" : ""}`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <span className="nav-icon-wrapper">
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </span>
                        {t(item.labelKey, language)}
                    </Link>
                );
            })}
        </nav>
    );
}
