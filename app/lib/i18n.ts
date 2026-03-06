"use client";
import { useCallback } from "react";
import { useStore } from "./store";
import en from "./locales/en.json";
import id from "./locales/id.json";

const locales: Record<string, typeof en> = { en, id };

type NestedKeys<T, Prefix extends string = ""> = {
    [K in keyof T]: T[K] extends Record<string, unknown>
    ? NestedKeys<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T];

export type TranslationKey = NestedKeys<typeof en>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split(".");
    let current: unknown = obj;
    for (const key of keys) {
        if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return path; // fallback to key
        }
    }
    return typeof current === "string" ? current : path;
}

export function useTranslation() {
    const locale = useStore((s) => s.locale);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>) => {
            const dict = locales[locale] || locales.en;
            let value = getNestedValue(dict as unknown as Record<string, unknown>, key);
            if (params) {
                Object.entries(params).forEach(([k, v]) => {
                    value = value.replace(`{${k}}`, String(v));
                });
            }
            return value;
        },
        [locale]
    );

    return { t, locale };
}
