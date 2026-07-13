export interface ProjectMilestone {
  date: string
  title: string
  description: string
}

export interface CreativeProjectConfig {
  title?: string
  subtitle?: string
  description?: string
  tags?: string[]
  inspiration?: {
    narrative: string
  }
  mission?: {
    narrative: string
  }
  milestones?: ProjectMilestone[]
}

export const creativeProjectOverrides: Record<string, CreativeProjectConfig> = {
  "highschool-turbine": {
    title: "Catch the Wind",
    tags: ["sustainability", "engineering", "DIY"],
  },
}

export function getCreativeProjectConfig(id: string): CreativeProjectConfig | undefined {
  return creativeProjectOverrides[id]
}
