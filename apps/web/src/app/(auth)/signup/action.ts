'use server'

import { db } from "@/lib/db/drizzle"
import { eq } from "drizzle-orm"
import { users } from "@/lib/db/schema"
import bcrypt from "bcryptjs"

export async function singUp(name: string, email: string, password: string) {

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    })

    if (existingUser) {
        return {
            isSuccess: false,
            error: { message: 'User already exists' },
        }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const [newUser] = await db
        .insert(users)
        .values({
            name: name,
            email: email,
            hashedPassword: hashedPassword,
        })
        .returning()

    return {
        isSuccess: true,
        user: newUser,
    }
}