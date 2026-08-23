import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export const runtime = "nodejs"

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

function verifyPassword(password: string, hash: string): boolean {
  if (hash.includes(":")) {
    const parts = hash.split(":")
    if (parts.length === 3) {
      const iterations = parseInt(parts[0], 10)
      const salt = parts[1]
      const storedHash = parts[2]
      const computed = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha256").toString("hex")
      return timingSafeEqual(computed, storedHash)
    }
  }
  const computed = crypto.createHash("sha256").update(password).digest("hex")
  return timingSafeEqual(computed, hash)
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }
    const adminUsername = process.env.ECOFLOW_ADMIN_USERNAME ?? "admin"
    const adminPasswordHash = process.env.ECOFLOW_ADMIN_PASSWORD_HASH ?? ""
    const adminSecret = process.env.ECOFLOW_ADMIN_SECRET ?? ""
    if (!adminPasswordHash) {
      return NextResponse.json({ error: "Admin credentials not configured" }, { status: 503 })
    }
    if (username !== adminUsername || !verifyPassword(password, adminPasswordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    if (!adminSecret) {
      return NextResponse.json({ error: "Admin secret not configured" }, { status: 503 })
    }
    const response = NextResponse.json({ success: true, token: adminSecret })
    response.cookies.set("ecoflow_admin_token", adminSecret, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 86400, path: "/",
    })
    return response
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set("ecoflow_admin_token", "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", maxAge: 0, path: "/",
  })
  return response
}
