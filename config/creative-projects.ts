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
  cover?: string
  previewFit?: "cover" | "contain"
  clusterSectionTitle?: string
  clusterSectionSubtitle?: string
  clusterEmptyMessage?: string
  captions?: Record<string, string>
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
    cover: "San Bruno 5-26-07/516832024_0ef56d837c_b.jpg",
    clusterSectionTitle: "The Rooftops",
    clusterSectionSubtitle:
      "Every star is a photo from one of 3 volunteer installs, grouped by location and ordered by date. Jump to a rooftop from a milestone above, select one below to expand it, or click any star to open it.",
    clusterEmptyMessage: "No installation photos yet",
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
  "earning-a-dollar": {
    title: "How to Earn a Dollar",
    subtitle: "A coastal sandstone scramble and an earned dollar bill, October 2006",
    cover: "dollarstoryline.JPG",
    previewFit: "contain",
    clusterSectionTitle: "The Ascent in Photos",
    clusterSectionSubtitle:
      "Every star marks a photo from the October 7, 2006 coastal cliff climb, ordered from the beach approach to the summit crest and final bounty.",
    clusterEmptyMessage: "No climbing photos loaded",
    tags: ["rock climbing", "coastal scramble", "adventure", "storyboard", "California coast"],
    description:
      "A high-stakes coastal sandstone bluff scramble along the Pacific ocean cliffs in October 2006. Scaling the sheer chimney, scrambling loose pitches, cresting the sunlit summit, and claiming the earned reward: a signed one-dollar bill inscribed '2d, I don't kneed this anymore!'",
    inspiration: {
      narrative:
        "Sometimes the most enduring currency is not what can be spent, but what is earned through grit, friction, and an afternoon scrambling up a crumbling ocean bluff. The dare was simple, the climb was real, and the reward was permanent.",
    },
    mission: {
      narrative:
        "Tracing the vertical line from sea-level sand to the bluff crest. Every handhold tested, every foothold negotiated on loose clay and sandstone, crowned with a sweeping ocean vista and a framed keepsake that made knees and nerves worth it.",
    },
    milestones: [
      {
        date: "Oct 7, 2006 · 6:43 PM",
        title: "The Beach Approach",
        description:
          "Setting out across the broad sandy cove beneath the towering coastal bluffs, scoping out the line of ascent against the sheer cliffs.",
        location: "Coastal Beach, California",
        flag: "us",
        clusterId: "beach-approach",
      },
      {
        date: "Oct 7, 2006 · 6:56 PM",
        title: "Scoping the Base & Footing",
        description:
          "Reaching the foot of the bluff, testing the first footholds on the crumbly sandstone bench and committing to the climb.",
        location: "Bluff Base, California",
        flag: "us",
        clusterId: "base-approach",
      },
      {
        date: "Oct 7, 2006 · 7:14 PM",
        title: "The Chimney Scramble",
        description:
          "Stemming inside the narrow sandstone chimney crevice, wedging hands and shoes between opposing walls to gain elevation in the shadowed slot.",
        location: "Chimney Slot, California",
        flag: "us",
        clusterId: "chimney-scramble",
      },
      {
        date: "Oct 7, 2006 · 7:24 PM",
        title: "The Sheer Pitch & Ridge",
        description:
          "Emerging onto open sandstone faces and knife-edge gullies, picking a careful line as the golden late-afternoon sun lit the rock face.",
        location: "Upper Ridge, California",
        flag: "us",
        clusterId: "sheer-pitch",
      },
      {
        date: "Oct 7, 2006 · 7:30 PM",
        title: "Summit & Pacific Vista",
        description:
          "Pulling up over the final crest to stand triumphant on the summit ridge, smiling against the open sky and ocean horizon.",
        location: "Bluff Summit, California",
        flag: "us",
        clusterId: "summit-vista",
      },
      {
        date: "Oct 28, 2006",
        title: "The Bounty: Dollar Earned",
        description:
          "The wager settled: a Series 2003A Federal Reserve one-dollar bill inscribed '2d, I don't kneed this anymore!', forever commemorated in the 10-panel comic storyboard.",
        location: "California",
        flag: "us",
        clusterId: "the-bounty",
      },
    ],
    starClusters: [
      {
        id: "beach-approach",
        label: "Beach Approach",
        date: "Oct 7, 2006 · 6:43 PM",
        detail: "Sandy cove beneath the cliffs",
        mediaFilter: ["IMG_3016", "IMG_3019"],
      },
      {
        id: "base-approach",
        label: "Base & Footing",
        date: "Oct 7, 2006 · 6:56 PM",
        detail: "Scoping the sandstone line",
        mediaFilter: ["IMG_3026"],
      },
      {
        id: "chimney-scramble",
        label: "Chimney Scramble",
        date: "Oct 7, 2006 · 7:14 PM",
        detail: "Narrow rock crevice & stem",
        mediaFilter: ["IMG_3063", "IMG_3070", "IMG_3073"],
      },
      {
        id: "sheer-pitch",
        label: "Sheer Pitch & Ridge",
        date: "Oct 7, 2006 · 7:24 PM",
        detail: "Loose sandstone & ridge ascent",
        mediaFilter: ["IMG_3076", "IMG_3078", "IMG_3084", "IMG_3088", "IMG_3089"],
      },
      {
        id: "summit-vista",
        label: "Summit Crest",
        date: "Oct 7, 2006 · 7:30 PM",
        detail: "Standing atop the bluffs",
        mediaFilter: ["IMG_3104", "IMG_3106", "IMG_3107"],
      },
      {
        id: "the-bounty",
        label: "The Bounty",
        date: "Oct 28, 2006",
        detail: "Signed $1 bill & comic storyboard",
        mediaFilter: ["dollar"],
      },
    ],
    captions: {
      "IMG_3016.jpg": "The beginning: looking up at the towering coastal sandstone bluffs from the wide sandy beach.",
      "IMG_3019.jpg": "Walking out toward the base of the cliffs to find a route up.",
      "IMG_3026.jpg": "Starting the scramble: hands and sneakers on the lower sandstone bench.",
      "IMG_3063.jpg": "Stemming inside the steep chimney crevice, working upward between sandstone walls.",
      "IMG_3070.jpg": "Finding a foothold in the steep gully as the pitch steepens.",
      "IMG_3073.jpg": "Wedged deep in the chimney, pushing upward with both hands.",
      "IMG_3076.jpg": "Traversing out onto the open sunlit ridge, mindful of loose crumbly sandstone.",
      "IMG_3078.jpg": "Scaling higher up the golden sandstone slope toward the ridgeline.",
      "IMG_3084.jpg": "Gaining height on the exposed bluff face with the deep blue Pacific sky above.",
      "IMG_3088.jpg": "Working through the upper rock bands just below the crest.",
      "IMG_3089.jpg": "Securing handholds on the upper slope, eyes on the summit.",
      "IMG_3104.jpg": "Pulling up over the final lip onto the top ridge.",
      "IMG_3106.jpg": "Standing victorious atop the bluff ridge against the bright blue sky.",
      "IMG_3107.jpg": "Summit victory: standing on the peak, grinning after earning the dollar.",
      "dollar.jpg": "The prize: '2d, I don't kneed this anymore!' signed with ink on a Series 2003A dollar bill.",
      "dollarstoryline.JPG": "The complete comic storyboard: 'how to earn a dollar.' compiling the ascent and the dollar note.",
    },
  },
  "mission-tweedy": {
    title: "Mission: Tweedy",
    subtitle: "A road sign heist, a farewell keepsake, and high school camaraderie, 2002–2005",
    cover: "sign 11_mod.jpg",
    previewFit: "contain",
    clusterSectionTitle: "The Keepsake in Photos",
    clusterSectionSubtitle:
      "Every star marks an artifact from the Tweedy Road mission, from the front street sign to the reverse farewell letters and stop-motion frames.",
    clusterEmptyMessage: "No sign photos loaded",
    tags: ["keepsake", "street art", "Hong Kong", "high school", "nostalgia", "interactive sign"],
    description:
      "The legendary tale of the Tweed Road (陶域道) street sign in Hong Kong. After friends sneakily added a 'y' to christen it 'Tweedy Road'—only for the city to replace it—a clandestine farewell operation liberated the sign, transforming it into a cherished double-sided memory board signed by lifelong friends.",
    inspiration: {
      narrative:
        "In high school, friendship is lived in the small rebellions, inside jokes, and shared spaces that become sacred. Tweedy Road was our tribute to 2D—a little stroke of ink on a city street that turned the ordinary landscape into a personal landmark.",
    },
    mission: {
      narrative:
        "When the city replaced the altered sign, our friends took matters into their own hands: 'illegal actions have been taken just for you :)'. The liberated sign became a traveling canvas—front side bearing the bold 'Tweedy Road / 陶域道', reverse side covered in handwritten letters, photos, signatures, and reminders that 'dinosaurs crush turtles!'",
    },
    milestones: [
      {
        date: "2002",
        title: "The 'Y' Alteration",
        description:
          "Sneaking a custom 'y' onto the official Tweed Road (陶域道) street sign in Hong Kong to claim it as 'Tweedy Road' for 2D.",
        location: "Tweed Road, Hong Kong",
        flag: "cn",
        clusterId: "the-sign-front",
      },
      {
        date: "June 8, 2005",
        title: "The Swap & The Heist",
        description:
          "The municipal government noticed and replaced the sign with an unaltered one. Before graduation and parting ways, friends staged a playful operation to liberate the sign.",
        location: "Hong Kong",
        flag: "cn",
        clusterId: "the-sign-front",
      },
      {
        date: "June 2005 – Sept 2006",
        title: "The Farewell Keepsake",
        description:
          "The reverse of the sign was covered with Polaroids, sticker photos, inside jokes, and heartfelt farewell messages before Trudie set off for the West Coast.",
        location: "Hong Kong to West Coast",
        flag: "us",
        clusterId: "the-memory-board",
      },
      {
        date: "2005–2006",
        title: "Stop-Motion & Perspectives",
        description:
          "Documented in animated stop-motion frames and perspective angles, immortalizing the sign that traveled across continents.",
        location: "Pacific Crossing",
        flag: "us",
        clusterId: "animations",
      },
    ],
    starClusters: [
      {
        id: "the-sign-front",
        label: "The Street Sign (Front)",
        date: "June 8, 2005",
        detail: "Tweedy Road / 陶域道 & Macro Tiles",
        mediaFilter: ["s1", "s2", "s3", "s4", "s5", "sign 11_mod"],
      },
      {
        id: "the-memory-board",
        label: "Farewell Canvas (Back)",
        date: "June 2005 – Sept 2006",
        detail: "Letters, polaroids & signatures",
        mediaFilter: ["sign 01", "sign 03", "sign 04", "sign 05", "sign 07", "sign 09_mod", "sign 12"],
      },
      {
        id: "animations",
        label: "Stop-Motion & Perspectives",
        date: "2005–2006",
        detail: "Animated perspective & frames",
        mediaFilter: ["gif"],
      },
    ],
    captions: {
      "sign 11_mod.jpg": "The official Tweedy Road / 陶域道 street sign, liberated and photographed on a suitcase.",
      "sign 09_mod.jpg": "The complete reverse side: letters, photos, signatures, and memories from high school friends.",
      "s1.jpg": "Sign closeup: left edge and 'Tw...' / '陶...' character.",
      "s2.jpg": "Sign closeup: 'Tweed...' and traditional Chinese '陶域...' characters.",
      "s3.jpg": "Sign closeup: '...eedy R...' with the fateful 'y' added, and '...域道'.",
      "s4.jpg": "Sign closeup: '...y Road' and '...戈道'.",
      "s5.jpg": "Sign closeup: right corner showing the mounting holes and border.",
      "sign 01.JPG": "Letter from Dina & Susan: 'Hey there Trudz! ... illegal actions have been taken just for you :) ... dinosaurs crush turtles!'",
      "sign 03.JPG": "Handwritten note and confession: 'The y on the previous Tweedy Road yes. That was me!'",
      "sign 04.JPG": "Photo collage of high school friends and inside jokes.",
      "sign 05.JPG": "Notes from friends: 'Take care of yourself, work hard but play hard & sleep hard too!!'",
      "sign 07.JPG": "Friend messages and doodles: 'Turtle track forever... miss u trudz!'",
      "sign 12.JPG": "Signature corner: '2D 10/04/02' and farewell hugz.",
      "sign.gif": "Stop-motion animation showing sequential frames around the sign.",
      "sign-perspective.gif": "Perspective tilt animation highlighting the metallic road sign.",
    },
  },
}

export function getCreativeProjectConfig(id: string): CreativeProjectConfig | undefined {
  return creativeProjectOverrides[id]
}
