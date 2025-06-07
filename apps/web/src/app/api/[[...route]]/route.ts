import { Hono } from "hono";
import { handle } from "hono/vercel";
import { app as hello } from "./hello";
import { app as tracks } from "./tracks";
// basePath は API ルートのベースパスを指定します
// 以降、新たに生やす API ルートはこのパスを基準に追加されます
const app = new Hono().basePath("/api");

export const helloRoute = app.route("/hello", hello);
export const tracksRoute = app.route("/tracks", tracks);

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
