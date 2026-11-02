// Nameplate data for the distributed energy resources shown on the energy
// dashboard's microgrid schematic. Sources: EcoFlow published manufacturer
// specifications. Photos live in the R2 microgrid folder and are linked
// through assetUrl so the domain stays swappable in one place.
import { assetUrl } from "@/lib/assets"

export type MicrogridDerId = "solar" | "battery"

export interface DerSpecRow {
  label: string
  value: string
}

export interface DerPhotoItem {
  filename: string
  url: string
  caption: string
}

export interface MicrogridDer {
  id: MicrogridDerId
  title: string
  subtitle: string
  statusBadge: string
  accent: string
  photos: DerPhotoItem[]
  specs: DerSpecRow[]
  operatingCondition: string
}

const PHOTO_FOLDER = "projects/ecoflow%20microgrid"

const toPhotoItem = (filename: string, caption: string): DerPhotoItem => ({
  filename,
  url: assetUrl(`${PHOTO_FOLDER}/${filename}`),
  caption,
})

export const MICROGRID_DERS: Record<MicrogridDerId, MicrogridDer> = {
  solar: {
    id: "solar",
    title: "Balcony Solar Array",
    subtitle: "EcoFlow 125 W Bifacial Modular Solar Panels",
    statusBadge: "Balcony Solar Array",
    accent: "#d97706",
    photos: [
      toPhotoItem("pv_7866.jpg", "Array balcony mounting and tilt orientation"),
      toPhotoItem("pv_7873.jpg", "Bifacial TOPCon solar module cell surface"),
      toPhotoItem("pv_9387.jpg", "Array wiring, junction, and lead connections"),
    ],
    specs: [
      { label: "Array capacity", value: "375 W nominal generation" },
      { label: "Rating each", value: "125 W front · up to 155 W bifacial" },
      { label: "Cell architecture", value: "N type TOPCon monocrystalline" },
      { label: "Cell efficiency", value: "25.0% cell conversion" },
      { label: "Voltage at Pmax", value: "40.5 V Vmp per panel" },
      { label: "Current at Pmax", value: "3.09 A Imp per panel" },
      { label: "Open circuit Voc", value: "48.0 V Voc per panel" },
      { label: "Short circuit Isc", value: "3.29 A Isc per panel" },
      { label: "Dimensions each", value: "1154 × 612 × 22 mm" },
      { label: "Weight each", value: "4.2 kg (9.26 lbs)" },
      { label: "Protection", value: "IP68 waterproof and dustproof" },
      { label: "DC connection", value: "XT60 solar to DP3 low voltage port" },
    ],
    operatingCondition: "Balcony bifacial array connected directly to the Delta Pro 3 low voltage MPPT solar input port.",
  },
  battery: {
    id: "battery",
    title: "Battery Energy Storage System",
    subtitle: "EcoFlow DELTA Pro 3 Portable Power Station",
    statusBadge: "Primary Storage Asset",
    accent: "#16a34a",
    photos: [
      toPhotoItem("delta_pro_3_7869.jpg", "Delta Pro 3 front console display and ports"),
      toPhotoItem("delta_pro_3_7881.jpg", "Delta Pro 3 side profile, wheels, and handles"),
    ],
    specs: [
      { label: "Capacity", value: "4,096 Wh (4.096 kWh) LiFePO4" },
      { label: "Continuous AC output", value: "4,000 W pure sine wave" },
      { label: "Output voltages", value: "120V / 240V dual voltage built in" },
      { label: "Surge capacity", value: "6,000 W X Boost · 8,000 W peak" },
      { label: "Solar input max", value: "2,600 W across dual MPPT ports" },
      { label: "Low voltage PV port", value: "11V to 60V · 20A · 1,000 W max" },
      { label: "High voltage PV port", value: "30V to 150V · 15A · 1,600 W max" },
      { label: "Grid AC charging", value: "1,800 W at 120V · 3,000 W at 240V" },
      { label: "Cycle longevity", value: "4,000 cycles to 80% capacity" },
      { label: "Transfer switch time", value: "10 ms UPS uninterruptible switch" },
      { label: "Acoustic level", value: "30 dB ultra quiet operation" },
      { label: "Dimensions", value: "693 × 341 × 410 mm" },
      { label: "Net weight", value: "51.5 kg (113.5 lbs)" },
      { label: "Telemetry", value: "IoT Open API via HMAC SHA256" },
    ],
    operatingCondition: "Central microgrid hub coordinating balcony solar capture, peak grid avoidance, and critical load protection.",
  },
}
