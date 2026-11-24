import { createApi } from "./createApi.js";

const periodoRespaldoApi = createApi("/periodoRespaldo");

export const getRespaldosRequest = () => periodoRespaldoApi.get("/all");
