import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { createHmac } from "crypto"

export const runtime = "nodejs"

const ECOFLOW_API_BASE = "https://api-a.ecoflow.com"
const BUCKET = "ecoflow-history"
const SCHEDULES_KEY = "config/schedules.json"

const LAT = 37.8716
const LON = -122.2727
const BATTERY_CAPACITY_WH = 4096
const BATTERY_EFFICIENCY = 0.90

const SUMMER_PEAK = 0.52
const SUMMER_OFF = 0.28
const WINTER_PEAK = 0.43
const WINTER_OFF = 0.26

const isSummer = (d: Date) => d.getMonth() >= 5 && d.getMonth() <= 8
const isPeak = (d: Date) => d.getHours() >= 16 && d.getHours() < 21
const getRate = (d: Date) => isSummer(d) ? (isPeak(d) ? SUMMER_PEAK : SUMMER_OFF) : (isPeak(d) ? WINTER_PEAK : WINTER_OFF)

function getEnv() {
  return {
    adminSecret: process.env.ECOFLOW_ADMIN_SECRET ?? "",
    accessKey: process.env.ECOFLOW_ACCESS_KEY ?? "",
    secretKey: process.env.ECOFLOW_SECRET_KEY ?? "",
    deviceSn: process.env.ECOFLOW_DEVICE_SN ?? "",
    r2AccountId: process.env.R2_ACCOUNT_ID ?? "",
    r2AccessKeyId: process.env.ECOFLOW_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "",
    r2SecretAccessKey: process.env.ECOFLOW_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "",
  }
}

function getR2Client(env: ReturnType<typeof getEnv>) {
  if (!env.r2AccountId || !env.r2AccessKeyId || !env.r2SecretAccessKey) return null
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  })
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

export interface ScheduleTask {
  id: string
  name: string
  enabled: boolean
  startTime: string
  endTime: string
  actionType: "ac_discharge" | "ac_charge" | "solar_charge" | "dc_discharge"
  actionDetail?: string
  minSocCondition?: number
  targetSocCutoff?: number
  repeatDays: number[]
  priority: number
}

export interface OptimizationProfile {
  strategy: "arbitrage" | "solar" | "resilience" | "health" | "multi_objective"
  minSoc: number
  maxSoc: number
  backupReserve: number
  cyclingPenaltyWeight: number
  solarWeight: number
  arbitrageWeight: number
  resilienceWeight: number
}

function mapActionToEcoFlowType(actionType: string): string {
  switch (actionType) {
    case "ac_discharge": return "TIME_TASK_TYPE_AC_DSG"
    case "solar_charge": return "TIME_TASK_TYPE_DC_CHG"
    case "ac_charge": return "TIME_TASK_TYPE_AC_CHG"
    case "dc_discharge": return "TIME_TASK_TYPE_DC_DSG"
    default: return "TIME_TASK_TYPE_AC_DSG"
  }
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

async function fetchSolarForecast(): Promise<number[]> {
  try {
    const forecastParams = new URLSearchParams({
      latitude: String(LAT), longitude: String(LON),
      hourly: "shortwave_radiation,cloudcover",
      forecast_days: "2", timezone: "America/Los_Angeles",
    })
    const weatherResp = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams.toString()}`)
    if (weatherResp.ok) {
      const weatherData = await weatherResp.json()
      const radiation: number[] = weatherData.hourly?.shortwave_radiation ?? []
      const cloud: number[] = weatherData.hourly?.cloudcover ?? []
      return radiation.slice(0, 24).map((rad, idx) => {
        const c = cloud[idx] ?? 0
        return Math.round(rad * 4.0 * 0.20 * 0.90 * (1 - (c / 100) * 0.7))
      })
    }
  } catch {}
  return new Array(24).fill(0)
}

function formatMinutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function daysToBitmask(repeatDays: number[]): number {
  if (!repeatDays || repeatDays.length === 0) return 127
  let mask = 0
  for (const d of repeatDays) {
    mask |= (1 << d)
  }
  return mask
}

function generateDefaultTasks(strategy: string, currentSoc: number, summer: boolean): ScheduleTask[] {
  return [
    {
      id: "task_0",
      name: "On Peak Home Discharge",
      enabled: true,
      startTime: "16:00",
      endTime: "21:05",
      actionType: "ac_discharge",
      actionDetail: "Turn on AC: AC (LV) switch",
      minSocCondition: strategy === "resilience" ? 60 : strategy === "health" ? 35 : 20,
      targetSocCutoff: strategy === "resilience" ? 50 : 20,
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      priority: 1,
    },
    {
      id: "task_1",
      name: "Solar Charging Priority",
      enabled: false,
      startTime: "05:00",
      endTime: "10:00",
      actionType: "solar_charge",
      actionDetail: "Solar/Car charging, Solar",
      minSocCondition: 0,
      targetSocCutoff: strategy === "health" ? 85 : 100,
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      priority: 2,
    },
    {
      id: "task_2",
      name: "Late Night Home Discharge",
      enabled: false,
      startTime: "21:05",
      endTime: "03:00",
      actionType: "ac_discharge",
      actionDetail: "Turn on AC: AC (LV) switch",
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      priority: 3,
    },
    {
      id: "task_3",
      name: "Overnight Off Peak Grid Charge",
      enabled: false,
      startTime: "00:00",
      endTime: "05:00",
      actionType: "ac_charge",
      actionDetail: "Grid charging off peak",
      minSocCondition: 0,
      targetSocCutoff: strategy === "health" ? 75 : strategy === "resilience" ? 90 : 70,
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      priority: 4,
    }
  ]
}

function solveScheduleOptimization(
  currentSoc: number,
  profile: OptimizationProfile,
  hourlySolar: number[]
) {
  const now = new Date()
  const hours = 24
  const typicalLoad = [350, 320, 310, 300, 310, 340, 400, 500, 520, 480, 450, 430, 420, 430, 440, 460, 500, 600, 750, 850, 800, 700, 600, 450]
  
  let soc = currentSoc
  let baselineCost = 0
  let optimizedCost = 0
  let solarCapturedWh = 0
  let peakGridOffsetWh = 0
  let totalDischargedWh = 0
  
  const hourlyTrajectory = []

  for (let h = 0; h < hours; h++) {
    const ts = new Date(now.getTime() + h * 3_600_000)
    const hourOfDay = ts.getHours()
    const rate = getRate(ts)
    const peak = isPeak(ts)
    const solarW = hourlySolar[h] ?? 0
    const loadW = typicalLoad[hourOfDay] ?? 400

    baselineCost += ((Math.max(0, loadW - solarW)) / 1000) * rate

    let batteryPowerW = 0
    let gridDrawW = 0
    let activeAction = "idle"

    if (peak) {
      if (soc > profile.minSoc && soc > profile.backupReserve) {
        const maxDischargeW = Math.min(loadW, 2400)
        batteryPowerW = -maxDischargeW
        gridDrawW = Math.max(0, loadW - maxDischargeW)
        activeAction = "discharge"
        peakGridOffsetWh += maxDischargeW
        totalDischargedWh += maxDischargeW
      } else {
        gridDrawW = loadW
        activeAction = "reserve_hold"
      }
    } else if (solarW > loadW) {
      const surplusW = solarW - loadW
      if (soc < profile.maxSoc) {
        batteryPowerW = Math.min(surplusW, 3000)
        solarCapturedWh += batteryPowerW
        activeAction = "solar_charge"
      }
      gridDrawW = 0
    } else {
      const deficitW = loadW - solarW
      if (hourOfDay >= 1 && hourOfDay <= 5 && soc < profile.backupReserve && profile.strategy !== "solar") {
        batteryPowerW = 1200
        gridDrawW = deficitW + 1200
        activeAction = "grid_charge"
      } else if (hourOfDay >= 21 && hourOfDay <= 23 && soc > profile.backupReserve + 10) {
        const eveningDsgW = Math.min(deficitW, 1000)
        batteryPowerW = -eveningDsgW
        gridDrawW = deficitW - eveningDsgW
        activeAction = "discharge"
        totalDischargedWh += eveningDsgW
      } else {
        gridDrawW = deficitW
        activeAction = "idle"
      }
    }

    const deltaWh = batteryPowerW > 0 ? batteryPowerW * BATTERY_EFFICIENCY : batteryPowerW
    soc = Math.max(profile.minSoc, Math.min(profile.maxSoc, soc + (deltaWh / BATTERY_CAPACITY_WH) * 100))
    optimizedCost += (gridDrawW / 1000) * rate

    hourlyTrajectory.push({
      hour: hourOfDay,
      timeLabel: `${String(hourOfDay).padStart(2, "0")}:00`,
      rate,
      isPeak: peak,
      solarW: Math.round(solarW),
      loadW: Math.round(loadW),
      batteryW: Math.round(batteryPowerW),
      gridW: Math.round(gridDrawW),
      soc: Math.round(soc * 10) / 10,
      action: activeAction,
    })
  }

  const dailySavings = Math.max(0, baselineCost - optimizedCost)
  const monthlySavings = dailySavings * 30
  const estimatedCycles = totalDischargedWh / BATTERY_CAPACITY_WH

  return {
    trajectory: hourlyTrajectory,
    metrics: {
      baselineCost: Math.round(baselineCost * 100) / 100,
      optimizedCost: Math.round(optimizedCost * 100) / 100,
      dailySavings: Math.round(dailySavings * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      solarCapturedKWh: Math.round((solarCapturedWh / 1000) * 10) / 10,
      peakGridOffsetKWh: Math.round((peakGridOffsetWh / 1000) * 10) / 10,
      estimatedDailyCycles: Math.round(estimatedCycles * 100) / 100,
    },
  }
}

export async function GET(request: NextRequest) {
  const env = getEnv()
  if (request.headers.get("Authorization") !== `Bearer ${env.adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const currentSoc = parseFloat(searchParams.get("soc") ?? "50")
    const strategy = (searchParams.get("strategy") ?? "multi_objective") as OptimizationProfile["strategy"]
    const summer = isSummer(new Date())

    // 1. Try to read tasks from the device
    let deviceTasks: ScheduleTask[] | null = null
    if (env.accessKey && env.secretKey && env.deviceSn) {
      try {
        const nonce = String(Math.floor(Math.random() * 900000 + 100000))
        const timestamp = String(Date.now())
        const sign = generateSign({ sn: env.deviceSn }, nonce, timestamp, env.accessKey, env.secretKey)
        const resp = await fetch(`${ECOFLOW_API_BASE}/iot-open/sign/device/quota/all?sn=${env.deviceSn}`, {
          headers: { accessKey: env.accessKey, nonce, timestamp, sign },
        })
        const data = await resp.json()
        if (data.code === "0" && data.data) {
          const d = data.data
          const parsed: ScheduleTask[] = []
          // cfgTimeTaskV2Item may be an array or single object
          const taskItems = Array.isArray(d.cfgTimeTaskV2Item) ? d.cfgTimeTaskV2Item
            : d.cfgTimeTaskV2Item ? [d.cfgTimeTaskV2Item] : []
          for (let i = 0; i < taskItems.length; i++) {
            const t = taskItems[i]
            if (!t || !t.isCfg) continue
            const timeTable = t.timeTable ?? 0
            const startMin = timeTable & 0xFFFF
            const endMin = (timeTable >> 16) & 0xFFFF
            const bitmask = t.timeParam ?? 127
            const repeatDays: number[] = []
            for (let d = 0; d < 7; d++) {
              if (bitmask & (1 << d)) repeatDays.push(d)
            }
            let actionType: ScheduleTask["actionType"] = "ac_discharge"
            if (t.taskType === "TIME_TASK_TYPE_AC_CHG") actionType = "ac_charge"
            else if (t.taskType === "TIME_TASK_TYPE_DC_CHG") actionType = "solar_charge"
            else if (t.taskType === "TIME_TASK_TYPE_DC_DSG") actionType = "dc_discharge"
            parsed.push({
              id: `device_${i}`,
              name: actionType === "ac_discharge" ? "On Peak Home Discharge"
                : actionType === "ac_charge" ? "Grid Charging"
                : actionType === "solar_charge" ? "Solar Charging"
                : "DC Output",
              enabled: Boolean(t.isEnable),
              startTime: formatMinutesToTime(startMin),
              endTime: formatMinutesToTime(endMin),
              actionType,
              repeatDays,
              priority: i + 1,
            })
          }
          if (parsed.length > 0) deviceTasks = parsed
        }
      } catch {}
    }

    // 2. Load saved data from R2
    let savedData: any = null
    const r2 = getR2Client(env)
    if (r2) {
      try {
        const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: SCHEDULES_KEY })
        const resp = await r2.send(cmd)
        const text = await resp.Body?.transformToString()
        if (text) savedData = JSON.parse(text)
      } catch {}
    }

    const defaultProfile: OptimizationProfile = {
      strategy,
      minSoc: strategy === "health" ? 30 : 20,
      maxSoc: strategy === "health" ? 85 : 100,
      backupReserve: strategy === "resilience" ? 75 : 50,
      cyclingPenaltyWeight: strategy === "health" ? 1.5 : 0.5,
      solarWeight: strategy === "solar" ? 1.5 : 1.0,
      arbitrageWeight: strategy === "arbitrage" ? 1.5 : 1.0,
      resilienceWeight: strategy === "resilience" ? 2.0 : 1.0,
    }

    const profile = savedData?.profile ?? defaultProfile
    // Priority: device tasks > R2 tasks > defaults
    const tasks = deviceTasks ?? savedData?.tasks ?? generateDefaultTasks(strategy, currentSoc, summer)

    // 3. If we read tasks from device, update R2 so it stays in sync
    if (deviceTasks && r2) {
      try {
        const cmd = new PutObjectCommand({
          Bucket: BUCKET,
          Key: SCHEDULES_KEY,
          Body: JSON.stringify({ updatedAt: new Date().toISOString(), profile, tasks: deviceTasks }, null, 2),
          ContentType: "application/json",
        })
        await r2.send(cmd)
      } catch {}
    }

    const hourlySolar = await fetchSolarForecast()

    const optimizationResult = solveScheduleOptimization(currentSoc, profile, hourlySolar)

    return NextResponse.json({
      success: true,
      currentSoc,
      isSummer: summer,
      profile,
      tasks,
      optimization: optimizationResult,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load schedules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const env = getEnv()
  if (request.headers.get("Authorization") !== `Bearer ${env.adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { profile, tasks, currentSoc = 50, syncDevice = false } = body

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Tasks array required" }, { status: 400 })
    }

    const r2 = getR2Client(env)
    if (r2) {
      try {
        const payload = JSON.stringify({
          updatedAt: new Date().toISOString(),
          profile: profile ?? {},
          tasks,
        }, null, 2)
        const cmd = new PutObjectCommand({
          Bucket: BUCKET,
          Key: SCHEDULES_KEY,
          Body: payload,
          ContentType: "application/json",
        })
        await r2.send(cmd)
      } catch (err: any) {
        console.error("Failed saving schedule to R2:", err)
      }
    }

    const deviceSyncResults: any[] = []
    if (syncDevice && env.accessKey && env.secretKey && env.deviceSn) {
      // 1. Sync Battery Limits
      const activeLimits: Record<string, any> = {}
      if (profile?.minSoc !== undefined) activeLimits.cfgMinDsgSoc = profile.minSoc
      if (profile?.maxSoc !== undefined) activeLimits.cfgMaxChgSoc = profile.maxSoc
      if (profile?.backupReserve !== undefined) {
        activeLimits.cfgEnergyBackup = {
          energyBackupStartSoc: profile.backupReserve,
          energyBackupEn: true,
        }
      }

      if (Object.keys(activeLimits).length > 0) {
        const resLimits = await ecoflowPut(dp3Body(activeLimits, env.deviceSn), env.accessKey, env.secretKey)
        deviceSyncResults.push({ target: "limits", res: resLimits })
      }

      // 2. Sync Each Task using cfgTimeTaskV2Item
      for (let i = 0; i < tasks.length; i++) {
        const task: ScheduleTask = tasks[i]
        const startMin = parseTimeToMinutes(task.startTime)
        const endMin = parseTimeToMinutes(task.endTime)
        const timeTable = (endMin << 16) | startMin
        const timeParam = daysToBitmask(task.repeatDays)
        const taskType = mapActionToEcoFlowType(task.actionType)

        const taskParamPayload = {
          cfgTimeTaskV2Item: {
            taskIndex: i,
            isCfg: true,
            isEnable: Boolean(task.enabled),
            timeMode: "TIME_TASK_MODE_PER_WEEK",
            timeParam,
            timeTable,
            taskType,
            taskParam: 0,
          }
        }

        const taskRes = await ecoflowPut(dp3Body(taskParamPayload, env.deviceSn), env.accessKey, env.secretKey)
        deviceSyncResults.push({ taskIndex: i, taskName: task.name, res: taskRes })
      }
    }

    const hourlySolar = await fetchSolarForecast()

    const optimizationResult = solveScheduleOptimization(
      currentSoc,
      profile ?? {
        strategy: "multi_objective",
        minSoc: 20,
        maxSoc: 100,
        backupReserve: 50,
        cyclingPenaltyWeight: 1.0,
        solarWeight: 1.0,
        arbitrageWeight: 1.0,
        resilienceWeight: 1.0,
      },
      hourlySolar
    )

    return NextResponse.json({
      success: true,
      message: "Schedule updated and synced to EcoFlow successfully",
      tasks,
      profile,
      deviceSyncResults,
      optimization: optimizationResult,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to update schedules" }, { status: 500 })
  }
}
