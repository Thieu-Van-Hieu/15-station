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
    res.status(statusCode).json(data);
    return;
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}
