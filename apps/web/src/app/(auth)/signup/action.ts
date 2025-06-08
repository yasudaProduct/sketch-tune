'use server'

import { users } from "@/lib/hono-client"

export async function singUp(name: string, email: string, password: string) {

    const res = await users.$post({
        json: {
            name: name,
            email: email,
            password: password,
        }
    })

    if (res.status !== 200) {
        const message = await res.json();
        return {
            isSuccess: false,
            error: { message: message },
        }
    }

    const res2 = await users[":email"].$get({ param: { email: email } });

    if (res2.status !== 200) {
        const message = await res2.json();
        return {
            isSuccess: false,
            error: { message: message },
        }
    }

    const newUser = await res2.json();

    return {
        isSuccess: true,
        user: newUser,
    }
}