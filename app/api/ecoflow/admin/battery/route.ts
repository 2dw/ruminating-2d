import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

export const runtime = "nodejs"

const ECOFLOW_API_BASE = "https://api-a.ecoflow.com"

function getEnv() {
  return {
    adminSecret: process.env.ECOFLOW_ADMIN_SECRET ?? "",
    accessKey: process.env.ECOFLOW_ACCESS_KEY ?? "",
    secretKey: process.env.ECOFLOW_SECRET_KEY ?? "",
    deviceSn: process.env.ECOFLOW_DEVICE_SN ?? "",
  }
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

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

function generateSign(flatParams: Record<string, string>, nonce: string, timestamp: string, accessKey: string, secretKey: string): string {
  const bodyStr = Object.keys(flatParams).sort().map(k => `${k}=${flatParams[k]}`).join("&")
  const signStr = bodyStr + "&accessKey=" + accessKey + "&nonce=" + nonce + "&timestamp=" + timestamp
  return hmacSha256Hex(signStr, secretKey)
}

function dp3Body(params: Record<string, any>, deviceSn: string) {
  return {
    sn: deviceSn,
    cmdId: 17,
    cmdFunc: 254,
    dest: 2,
    dirDest: 1,
    dirSrc: 1,
    needAck: true,
    params,
  }
}

async function ecoflowPut(body: Record<string, any>, accessKey: string, secretKey: string) {
  const nonce = String(Math.floor(Math.random() * 900000 + 100000))
  const timestamp = String(Date.now())
  const flat = flattenForSign(body)
  const sign = generateSign(flat, nonce, timestamp, accessKey, secretKey)
  const bodyStr = JSON.stringify(body)
  const resp = await fetch(`${ECOFLOW_API_BASE}/iot-open/sign/device/quota`, {
    method: "PUT",
    headers: { "Content-Type": "application/json;charset=UTF-8", accessKey, nonce, timestamp, sign },
    body: bodyStr,
  })
  return resp.json()
}

export async function POST(request: NextRequest) {
  const env = getEnv()
  if (request.headers.get("Authorization") !== `Bearer ${env.adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { command, params } = await request.json()
    if (!command || !params) return NextResponse.json({ error: "command and params required" }, { status: 400 })
    if (!env.accessKey || !env.secretKey || !env.deviceSn) {
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

    const result = await ecoflowPut(dp3Body(dp3Params, env.deviceSn), env.accessKey, env.secretKey)

    if (result.code === "0") return NextResponse.json({ success: true, command, params })
    return NextResponse.json({ error: `EcoFlow API error: ${result.message ?? result.code}`, code: result.code }, { status: 500 })
  } catch (e: any) { return NextResponse.json({ error: "Command failed" }, { status: 500 }) }
}

export async function GET(request: NextRequest) {
  const env = getEnv()
  if (request.headers.get("Authorization") !== `Bearer ${env.adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    if (!env.accessKey || !env.secretKey || !env.deviceSn) {
      return NextResponse.json({ error: "EcoFlow credentials not configured" }, { status: 503 })
    }
    const nonce = String(Math.floor(Math.random() * 900000 + 100000))
    const timestamp = String(Date.now())
    const sign = generateSign({ sn: env.deviceSn }, nonce, timestamp, env.accessKey, env.secretKey)
    const resp = await fetch(`${ECOFLOW_API_BASE}/iot-open/sign/device/quota/all?sn=${env.deviceSn}`, {
      headers: { accessKey: env.accessKey, nonce, timestamp, sign },
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
