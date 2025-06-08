import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import z from "zod";

const schema = z.object({
    name: z.string().min(1).max(20),
    email: z.string().email(),
    password: z.string().min(8).max(20),
})

export const app = new Hono()
    .get("/:email", async (c) => {
        const email = c.req.param("email");

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        return c.json(
            user ? {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
            } : {
                user: null,
            }
        );
    })
    .post("/", zValidator("json", schema), async (c) => {
        const body = c.req.valid("json");

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        })

        if (existingUser) {
            return c.json({ message: "User already exists" }, 400);
        }

        const hashedPassword = await bcrypt.hash(body.password, 12)

        await db.insert(users).values({
            name: body.name,
            email: body.email,
            hashedPassword: hashedPassword,
        })

        return c.json({ message: "User created" }, 200);
    });

export type UsersAPIType = typeof app; 