export interface ProjectMilestone {
  date: string
  title: string
  description: string
  location?: string
}

export interface SubProject {
  id: string
  title: string
  summary?: string
  journey?: string
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
  subprojects?: SubProject[]
}

export const creativeProjectOverrides: Record<string, CreativeProjectConfig> = {
  "highschool-turbine": {
    title: "Catch the Wind",
    tags: ["sustainability", "engineering", "DIY", "renewable energy"],
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
        location: "High School, Hong Kong",
      },
      {
        date: "High School",
        title: "The Build",
        description:
          "Designed, carved and assembled a wind turbine from carbon fiber, undertaking the full engineering lifecycle from concept to fabrication.",
        location: "High School, Hong Kong",
      },
      {
        date: "High School",
        title: "What It Meant",
        description:
          "Though limited by the resources available to a high school student, the experience proved foundational. It established the trajectory for a lifelong commitment to building technologies that democratize access to clean energy.",
        location: "High School, Hong Kong",
      },
    ],
  },
  "edible-science-experiments": {
    title: "Edible Science Experiments",
    tags: ["food science", "nutrition", "gastronomy", "DIY"],
    description:
      "Optimizing the Venn diagram of nutrient density and gastronomical bliss points through hands-on kitchen experimentation.",
    inspiration: {
      narrative:
        "Food is both sustenance and art. These experiments explore the intersection of nutritional science and culinary delight, pushing the boundaries of what healthy food can taste like.",
    },
    mission: {
      narrative:
        "Optimizing the Venn diagram of nutrient density and gastronomical bliss points. Every experiment is a step toward food that nourishes the body while delighting the palate.",
    },
    subprojects: [
      {
        id: "protein-cheese",
        title: "Protein Powered Melty Cheese",
      },
      {
        id: "cruciferous-homesteading",
        title: "Cruciferous Homesteading",
      },
    ],
  },
  "tunneling-visions-into-graphite-cellulose-and-lignin": {
    title: "Tunneling Visions",
    tags: ["drawing", "art", "renewable energy", "women empowerment"],
    description:
      "Collecting the planet's inspirations and using my pencil to serve as their megaphone.",
    inspiration: {
      narrative:
        "Drawing is a form of tunneling into the subconscious, extracting visions that words cannot capture. Each piece channels the stories of those who inspire change.",
    },
    mission: {
      narrative:
        "Collecting the planet's inspirations and using my pencil to serve as their megaphone. Through graphite, cellulose, and lignin, these drawings amplify voices of empowerment and revolution.",
    },
    subprojects: [
      {
        id: "women-renewable-energy",
        title: "Women Empowering with Renewable Energy",
        summary: "Inspired by Barefoot Grandmothers",
      },
      {
        id: "feminine-revolution",
        title: "Feminine Revolution",
        summary: "Inspired by Sola-Afghanistan and the women who make up half the sky",
      },
    ],
  },
}

export function getCreativeProjectConfig(id: string): CreativeProjectConfig | undefined {
  return creativeProjectOverrides[id]
}
