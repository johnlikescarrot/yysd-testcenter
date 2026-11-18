import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Temporarily HQ-only: youyisida.com / www / local. Block other tenant hosts. */
function isHqHost(host: string): boolean {
  const h = (host || "").toLowerCase().split(":")[0];
  if (!h || h === "localhost" || h === "127.0.0.1") return true;
  if (h === "youyisida.com" || h === "www.youyisida.com") return true;
  return false;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (isHqHost(host)) return NextResponse.next();

  const accept = req.headers.get("accept") || "";
  if (accept.includes("application/json") || req.nextUrl.pathname.includes("/api/")) {
    return NextResponse.json(
      { error: "AI học lên cố vấn tạm chỉ đối với YYSD cởi mở " },
      { status: 403 }
    );
  }

  return new NextResponse(
    `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title> tạm không cởi mở </title></head>
<body style="font-family:system-ui;padding:48px;text-align:center;color:#334155">
  <h1 style="font-size:1.25rem">AI học lên cố vấn tạm chỉ đối với YYSD cởi mở </h1>
  <p style="margin-top:12px"><a href="/"> Về trang chủ </a></p>
</body></html>`,
    { status: 403, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
