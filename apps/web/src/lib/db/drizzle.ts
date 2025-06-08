import { env } from '../../../env'
import * as schema from '@/lib/db/schema'
import { drizzle } from 'drizzle-orm/neon-http'


if (!env.AUTH_DRIZZLE_URL) {
    throw new Error(`AUTH_DRIZZLE_URL is not defined ${env.AUTH_DRIZZLE_URL}`)
}

export const db = drizzle(env.AUTH_DRIZZLE_URL, { schema })
