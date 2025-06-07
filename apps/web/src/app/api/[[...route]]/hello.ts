import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const inputSchema = z.object({
    name: z.string(),
});

export const app = new Hono().post(
    "/",
    zValidator("json", inputSchema),
    async (c) => {
        try {
            const { name } = c.req.valid("json");
            console.log(name);
            return c.json({ message: `Hello, ${name}!` });
        } catch (error) {
            console.error(error);
            return c.json({ message: "Bad Request" }, 400);
        }
    },
);
