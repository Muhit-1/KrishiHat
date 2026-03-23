import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function ok<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 200 });
}

export function created<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function badRequest(message: string, errors?: Record<string, string[]>) {
  return NextResponse.json({ success: false, message, errors }, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ success: false, message }, { status: 500 });
}

// Centralized API error handler
export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED") return unauthorized();
    if (error.message === "FORBIDDEN") return forbidden();
    if (error.message === "ACCOUNT_SUSPENDED") return forbidden("Account suspended");
    if (error.message === "ACCOUNT_BANNED") return forbidden("Account banned");
  }
  console.error("[API Error]", error);
  return serverError();
}