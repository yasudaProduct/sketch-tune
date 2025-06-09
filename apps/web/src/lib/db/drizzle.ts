import { env } from '../../../env'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import * as schema from '@/lib/db/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'


if (!env.AUTH_DRIZZLE_URL) {
    throw new Error(`AUTH_DRIZZLE_URL is not defined ${env.AUTH_DRIZZLE_URL}`)
}

export const db = env.NODE_ENV === "development" ?
    drizzle(postgres(env.AUTH_DRIZZLE_URL, { max: 1 }), { schema }) :
    drizzleNeon(env.AUTH_DRIZZLE_URL, { schema })
