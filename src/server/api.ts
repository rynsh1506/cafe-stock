import { app } from "@/app";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function handleApiRoute(
  req: Request,
  _url?: URL,
): Promise<Response> {
  return app.handle(req);
}
