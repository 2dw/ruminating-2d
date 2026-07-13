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
    description:
      "After witnessing the winds of Inner Mongolia and observing wind and solar technologies begin to gain traction around the world, I undertook my first endeavor: carving and assembling a wind turbine from carbon fiber.",
    inspiration: {
      narrative:
        "Sustainability and resource equity have been the driving forces throughout my life. In high school, after witnessing the winds of Inner Mongolia and observing wind and solar technologies begin to gain traction around the world, I undertook my first endeavor: carving and assembling a wind turbine from carbon fiber.",
    },
    mission: {
      narrative:
        "Engineering became the vehicle through which I could build systems that empower people with access to energy. That first turbine was far from the most efficient given the limited resources available to a high school student at the time, yet it established the foundation upon which my entire career has been built.",
    },
    milestones: [
      {
        date: "High School",
        title: "The Spark",
        description:
          "After witnessing the winds of Inner Mongolia and observing renewable energy technologies gain momentum globally, I embarked upon my first independent endeavor in sustainability.",
      },
      {
        date: "High School",
        title: "The Build",
        description:
          "Designed, carved and assembled a wind turbine from carbon fiber, undertaking the full engineering lifecycle from concept to fabrication.",
      },
      {
        date: "High School",
        title: "What It Meant",
        description:
          "Though limited by the resources available to a high school student, the experience proved foundational. It established the trajectory for a lifelong commitment to building technologies that democratize access to clean energy.",
      },
    ],
  },
}

export function getCreativeProjectConfig(id: string): CreativeProjectConfig | undefined {
  return creativeProjectOverrides[id]
}
