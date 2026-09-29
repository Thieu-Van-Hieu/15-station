/**
 * Tiện ích xử lý HTTP Request / Response cho các Serverless Functions trong `api/`.
 * Hỗ trợ Vercel Serverless Function và Vite dev middleware.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

export interface ApiRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  body?: any;
}

export interface ApiResponse extends ServerResponse {
  status?: (statusCode: number) => ApiResponse;
  json?: (data: any) => void;
}

export async function parseRequestBody(req: ApiRequest): Promise<any> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => {
      resolve({});
    });
  });
}

export function parseQueryParams(req: ApiRequest): URLSearchParams {
  if (req.query) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(req.query)) {
      if (Array.isArray(val)) {
        for (const v of val) params.append(key, v);
      } else if (val !== undefined) {
        params.append(key, val);
      }
    }
    return params;
  }

  const url = req.url ?? "/";
  const questionIdx = url.indexOf("?");
  if (questionIdx === -1) {
    return new URLSearchParams();
  }
  return new URLSearchParams(url.slice(questionIdx + 1));
}

export function sendJson(res: ApiResponse, statusCode: number, data: any, headers?: Record<string, string>): void {
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      res.setHeader(k, v);
    }
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (typeof res.status === "function" && typeof res.json === "function") {
    const withStatus = res.status(statusCode);
    withStatus.json?.(data);
    return;
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * Token host của request: ưu tiên header `Authorization: Bearer <token>` (màn host và bàn game gửi kiểu này,
 * để token không nằm trên URL và lịch sử trình duyệt), sau đó mới tới `host` trong query hoặc body.
 */
export function hostTokenFrom(req: ApiRequest, fallback?: unknown): string | null {
  const auth = req.headers?.authorization;
  const header = Array.isArray(auth) ? auth[0] : auth;
  if (typeof header === "string" && /^Bearer\s+/i.test(header)) {
    const token = header.replace(/^Bearer\s+/i, "").trim();
    if (token) return token;
  }
  return typeof fallback === "string" && fallback.trim() ? fallback.trim() : null;
}

/** Lỗi cấu hình máy chủ (thiếu biến môi trường). Endpoint trả 503 kèm thông điệp này. */
export class ConfigError extends Error {}

