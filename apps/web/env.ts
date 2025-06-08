import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(['development', 'production']),
        AUTH_SECRET: z.string(),
        NEXTAUTH_URL: z.string().url(),
        AUTH_DRIZZLE_URL: z.string().url(),
        GITHUB_ID: z.string(),
        GITHUB_SECRET: z.string()
    },
    client: {
        //　NEXT_PUBLIC_APP_URL: z.string().url(),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        AUTH_SECRET: process.env.AUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        AUTH_DRIZZLE_URL: process.env.AUTH_DRIZZLE_URL,
        GITHUB_ID: process.env.GITHUB_ID,
        GITHUB_SECRET: process.env.GITHUB_SECRET,
        // NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
});
