import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

export const runtime = "nodejs"

const ADMIN_SECRET = process.env.ECOFLOW_ADMIN_SECRET ?? ""
const ECOFLOW_ACCESS_KEY = process.env.ECOFLOW_ACCESS_KEY ?? ""
const ECOFLOW_SECRET_KEY = process.env.ECOFLOW_SECRET_KEY ?? ""
const ECOFLOW_DEVICE_SN = process.env.ECOFLOW_DEVICE_SN ?? ""
const ECOFLOW_API_BASE = "https://api-a.ecoflow.com"

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

function checkAuth(request: NextRequest) {
  return request.headers.get("Authorization") === `Bearer ${ADMIN_SECRET}`
}

function flattenForSign(obj: Record<string, any>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flattenForSign(v, key))
    else if (v !== undefined) out[key] = String(v)
  }
  return out
}

function hmacSha256Hex(message: string, secret: string): string {
  return createHmac("sha256", secret).update(message).digest("hex")
}

function generateSign(flatParams: Record<string, string>, nonce: string, timestamp: string): string {
  const bodyStr = Object.keys(flatParams).sort().map(k => `${k}=${flatParams[k]}`).join("&")
  const signStr = bodyStr + "&accessKey=" + ECOFLOW_ACCESS_KEY + "&nonce=" + nonce + "&timestamp=" + timestamp
  return hmacSha256Hex(signStr, ECOFLOW_SECRET_KEY)
}

function dp3Body(params: Record<string, any>) {
  return {
    sn: ECOFLOW_DEVICE_SN,
    cmdId: 17,
    cmdFunc: 254,
    dest: 2,
    dirDest: 1,
    dirSrc: 1,
    needAck: true,
    params,
  }
}

async function ecoflowPut(body: Record<string, any>) {
  const nonce = String(Math.floor(Math.random() * 900000 + 100000))
  const timestamp = String(Date.now())
  const flat = flattenForSign(body)
  const sign = generateSign(flat, nonce, timestamp)
  const bodyStr = JSON.stringify(body)
  const resp = await fetch(`${ECOFLOW_API_BASE}/iot-open/sign/device/quota`, {
    method: "PUT",
    headers: { "Content-Type": "application/json;charset=UTF-8", accessKey: ECOFLOW_ACCESS_KEY, nonce, timestamp, sign },
    body: bodyStr,
  })
  return resp.json()
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { command, params } = await request.json()
    if (!command || !params) return NextResponse.json({ error: "command and params required" }, { status: 400 })
    if (!ECOFLOW_ACCESS_KEY || !ECOFLOW_SECRET_KEY || !ECOFLOW_DEVICE_SN) {
      return NextResponse.json({ error: "EcoFlow credentials not configured" }, { status: 503 })
    }

    const dp3Params: Record<string, any> = {}
    if (command === "set_battery_limits") {
      if (params.lowerLimit !== undefined) dp3Params.cfgMinDsgSoc = params.lowerLimit
      if (params.upperLimit !== undefined) dp3Params.cfgMaxChgSoc = params.upperLimit
    } else if (command === "set_backup_reserve") {
      dp3Params.cfgEnergyBackup = { energyBackupStartSoc: params.soc, energyBackupEn: true }
    } else if (command === "set_all") {
      if (params.lowerLimit !== undefined) dp3Params.cfgMinDsgSoc = params.lowerLimit
      if (params.upperLimit !== undefined) dp3Params.cfgMaxChgSoc = params.upperLimit
      if (params.backupSoc !== undefined) dp3Params.cfgEnergyBackup = { energyBackupStartSoc: params.backupSoc, energyBackupEn: true }
    } else {
      return NextResponse.json({ error: `Unknown command: ${command}` }, { status: 400 })
    }

    const result = await ecoflowPut(dp3Body(dp3Params))

    if (result.code === "0") return NextResponse.json({ success: true, command, params })
    return NextResponse.json({ error: `EcoFlow API error: ${result.message ?? result.code}`, code: result.code }, { status: 500 })
  } catch (e: any) { return NextResponse.json({ error: "Command failed" }, { status: 500 }) }
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    if (!ECOFLOW_ACCESS_KEY || !ECOFLOW_SECRET_KEY || !ECOFLOW_DEVICE_SN) {
      return NextResponse.json({ error: "EcoFlow credentials not configured" }, { status: 503 })
    }
    const nonce = String(Math.floor(Math.random() * 900000 + 100000))
    const timestamp = String(Date.now())
    const sign = generateSign({ sn: ECOFLOW_DEVICE_SN }, nonce, timestamp)
    const resp = await fetch(`${ECOFLOW_API_BASE}/iot-open/sign/device/quota/all?sn=${ECOFLOW_DEVICE_SN}`, {
      headers: { accessKey: ECOFLOW_ACCESS_KEY, nonce, timestamp, sign },
    })
    const data = await resp.json()
    if (data.code !== "0") return NextResponse.json({ error: `EcoFlow API error: ${data.message}` }, { status: 500 })
    const d = data.data || {}
    return NextResponse.json({
      soc: d.cmsBattSoc ?? d.bmsBattSoc ?? 0,
      charge_limit_watts: clamp(d.plugInInfoAcInChgPowMax ?? 4000, 500, 4000),
      discharge_lower: d.cmsMinDsgSoc ?? 0,
      charge_upper: d.cmsMaxChgSoc ?? 100,
      backup_reserve: d.energyBackupStartSoc ?? d.backupReverseSoc ?? 50,
    })
  } catch (e: any) { return NextResponse.json({ error: "Failed to read battery state" }, { status: 500 }) }
}
