import type { InferResponseType } from "hono/client";
import { hc } from "hono/client";
import { helloRoute, tracksRoute } from "@/app/api/[[...route]]/route";

const baseUrl = "http://localhost:3000";

const helloClient = hc<typeof helloRoute>(baseUrl);
export const hello = helloClient.api.hello.$post;
export type HelloResType = InferResponseType<typeof hello, 200>;
export type HelloReqErrType = InferResponseType<typeof hello, 400>;

const tracksClient = hc<typeof tracksRoute>(baseUrl);
export const tracks = tracksClient.api.tracks.$get;
export type TracksResType = InferResponseType<typeof tracks, 200>;
