import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** HQ-only like admission: youyisida.com / www / local. */
function isHqHost(host: string): boolean {
  const h = (host || "").toLowerCase().split(":")[0];
  if (!h || h === "localhost" || h === "127.0.0.1") return true;
  if (h === "youyisida.com" || h === "www.youyisida.com") return true;
  return false;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (isHqHost(host)) return NextResponse.next();
  return new NextResponse(
    `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>tạm thời chưa nở hoa</title></head>
<body style="font-family:system-ui;padding:48px;text-align:center;color:#334155">
  <h1 style="font-size:1.25rem">toàn thế giới Đại học xếp hạng tạm thời hầu như đúng xuất sắc lợi ích suy nghĩ đạt tới nở hoa</h1>
  <p style="margin-top:12px"><a href="/">trở về trang chủ</a></p>
</body></html>`,
    { status: 403, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
