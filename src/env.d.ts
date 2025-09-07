// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
    // APP
    readonly APP_AUTHOR: string;
    readonly APP_FULL_NAME: string;
    readonly APP_NAME: string;
    readonly APP_VERSION: string;
    readonly APP_DESCRIPTION: string;
    readonly APP_URL: string;
    // FIREBASE
    readonly FIREBASE_API_KEY: string;
    readonly FIREBASE_AUTH_DOMAIN: string;
    readonly FIREBASE_PROJECT_ID: string;
    readonly FIREBASE_STORAGE_BUCKET: string;
    readonly FIREBASE_MESSAGING_SENDER_ID: string;
    readonly FIREBASE_APP_ID: string;
    readonly FIREBASE_MEASUREMENT_ID: string;
    // SUPABASE
    readonly SUPABASE_URL: string;
    readonly SUPABASE_KEY: string;
    readonly SUPABASE_ANON_KEY: string;
}