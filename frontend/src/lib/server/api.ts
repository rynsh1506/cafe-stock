export interface BackendResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  errorMessage?: string;
  errorCode?: string;
}

type InternalApiHandler = (request: Request) => Promise<Response>;

export async function callBackendApi<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    idempotencyKey?: string;
    body?: Record<string, unknown>;
  } = {},
): Promise<BackendResponse<T>> {
  const baseUrl =
    process.env.BACKEND_INTERNAL_URL ||
    `http://127.0.0.1:${process.env.PORT || "3000"}`;
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }

  const request = new Request(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const inProcessHandler = (globalThis as Record<string, unknown>)
    .__CAFESTOCK_API_HANDLER as InternalApiHandler | undefined;

  const response = inProcessHandler
    ? await inProcessHandler(request)
    : await fetch(request);

  const rawJson = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    const errObj = rawJson.error as
      { code?: string; message?: string } | undefined;
    return {
      ok: false,
      status: response.status,
      errorCode: errObj?.code ?? "API_ERROR",
      errorMessage:
        errObj?.message ?? `Request failed with status ${response.status}`,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: rawJson as T,
  };
}
