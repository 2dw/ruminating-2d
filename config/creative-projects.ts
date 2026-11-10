export interface ProjectMilestone {
  date: string
  title: string
  description: string
  location?: string
  /** Two-letter flag drawn next to the location pin. Omit for no flag. */
  flag?: "cn" | "us"
  /**
   * When set, the milestone becomes a jump target: clicking it focuses the
   * matching star cluster and scrolls to its photos. Must match a
   * `starClusters[].id` on the same config, otherwise the milestone stays plain.
   */
  clusterId?: string
}

export interface SubProject {
  id: string
  title: string
  summary?: string
  journey?: string
  mediaPrefix?: string
  mediaFilter?: string[]
}

/**
 * One cluster in a star-grouped constellation: photos from a subfolder of the
 * project prefix, shown together and labelled with where and when it happened.
 * `folder` is relative to the project's own R2 prefix, so the parent path is
 * only ever written in one place (the auto-discovered prefix).
 */
export interface ProjectStarCluster {
  id: string
  label: string
  date: string
  /** Short rooftop/setting note shown under the label, e.g. "Steep asphalt-shingle roof". */
  detail?: string
  /** Subfolder relative to the project's own R2 prefix. Omit when the cluster's photos live directly in the project root folder (use mediaFilter to pick them out of the shared folder). */
  folder?: string
  mediaFilter?: string[]
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
  starClusters?: ProjectStarCluster[]
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
        flag: "cn",
      },
      {
        date: "High School",
        title: "The Build",
        description:
          "Designed, carved and assembled a wind turbine from carbon fiber, undertaking the full engineering lifecycle from concept to fabrication.",
        location: "High School, Hong Kong",
        flag: "cn",
      },
      {
        date: "High School",
        title: "What It Meant",
        description:
          "Though limited by the resources available to a high school student, the experience proved foundational. It established the trajectory for a lifelong commitment to building technologies that democratize access to clean energy.",
        location: "High School, Hong Kong",
        flag: "cn",
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
        summary: "The science of sodium citrate and fat-free cheese sauces",
        journey:
          "Fat-free cheese refuses to melt smoothly, the casein proteins seize without fat's lubrication. Sodium citrate, made from vinegar and baking soda, changes everything: it emulsifies the proteins, turning a clumpy failure into a rich, creamy, thermoreversible sauce.",
        mediaPrefix: "projects/edible science experiments/",
        mediaFilter: ["cheese", "sodium", "melty", "protein", "DIY melty"],
      },
      {
        id: "cruciferous-homesteading",
        title: "Cruciferous Homesteading",
        summary: "Growing and cooking with cruciferous vegetables",
        mediaPrefix: "projects/edible science experiments/cruciferous-homesteading/",
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
    milestones: [
      {
        date: "2023",
        title: "Women and Watts",
        description:
          "Inspired by Barefoot Grandmothers — women empowering communities with renewable energy. Graphite on paper, signed 2023.",
        clusterId: "women-and-watts",
      },
      {
        date: "2024",
        title: "Women Fight Back",
        description:
          "Inspired by Sola-Afghanistan and the women who make up half the sky. Graphite on paper, signed 2024.",
        clusterId: "women-fight-back",
      },
    ],
    starClusters: [
      {
        id: "women-and-watts",
        label: "Women and Watts",
        date: "2023",
        detail: "Graphite on paper",
        mediaFilter: ["women and watts"],
      },
      {
        id: "women-fight-back",
        label: "Women Fight Back",
        date: "2024",
        detail: "Graphite on paper",
        mediaFilter: ["women fight back"],
      },
    ],
  },
  "grid-alternatives-habitat-for-humanity": {
    title: "Rooftops for Neighbors",
    subtitle: "Three volunteer solar installs, 2007",
    tags: ["solar", "volunteering", "community solar", "nonprofit", "installation"],
    description:
      "Volunteer solar installations completed with Grid Alternatives and Habitat for Humanity between May and September of 2007: a flat gravel roof in San Bruno, a steep shingle pitch in Yolo County, and a brand new Habitat build in Santa Cruz.",
    inspiration: {
      narrative:
        "Solar is only ever installed on an actual roof, and the roofs that would benefit the most are frequently the last in line. Grid Alternatives and Habitat for Humanity were both working to open that line up, pairing volunteer labor with homes that needed it, and I wanted to learn the trade with my hands rather than from a manual.",
    },
    mission: {
      narrative:
        "These were long days of carrying rails up ladders, torquing mounts in the sun, and landing the final connection in a garage, given freely beside crews of neighbors. Nearly two decades on, every array in this set is still lowering somebody's electric bill, and the habit of building access one rooftop at a time has stayed with me ever since.",
    },
    milestones: [
      {
        date: "May 26, 2007",
        title: "The Flat Roof",
        description:
          "The first install of the set went onto a flat tar-and-gravel roof above a hillside neighborhood. Rails were laid low across the gravel and the modules bolted down row by row, with the crew in matching volunteer shirts by the time the array was producing.",
        location: "San Bruno, California",
        flag: "us",
        clusterId: "san-bruno",
      },
      {
        date: "July 28, 2007",
        title: "The Steep Pitch",
        description:
          "Midsummer moved the work to a steep asphalt-shingle roof in Yolo County, where everyone clipped into fall-arrest harnesses before stepping onto the pitch. Rails were leveled and torqued through the heat, and the inverter came open at the end of the day for commissioning.",
        location: "Yolo County, California",
        flag: "us",
        clusterId: "yolo-county",
      },
      {
        date: "September 8, 2007",
        title: "The New Build",
        description:
          "The final install landed on a freshly shingled Habitat build in Santa Cruz. Modules went up the ladder by hand, and the day closed in the garage with a string inverter, an AC disconnect, and the panel tie-in that put the system into service.",
        location: "Santa Cruz, California",
        flag: "us",
        clusterId: "santa-cruz",
      },
    ],
    starClusters: [
      {
        id: "san-bruno",
        label: "San Bruno",
        date: "May 26, 2007",
        detail: "Flat tar-and-gravel roof",
        folder: "San Bruno 5-26-07",
      },
      {
        id: "yolo-county",
        label: "Yolo County",
        date: "July 28, 2007",
        detail: "Steep asphalt-shingle roof",
        folder: "Yolo County 7-28-07",
      },
      {
        id: "santa-cruz",
        label: "Santa Cruz",
        date: "September 8, 2007",
        detail: "New-build shingle roof",
        folder: "Habitat Santa Cruz 9-8-07",
      },
    ],
  },
}

export function getCreativeProjectConfig(id: string): CreativeProjectConfig | undefined {
  return creativeProjectOverrides[id]
}
