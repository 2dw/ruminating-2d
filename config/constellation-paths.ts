export interface PathConfig {
  id: string
  color: string
  duration: number
  delay: number
  particleCount?: number
  particleSize?: number
}

export const constellationPaths: PathConfig[] = [
  {
    id: "path-origin-nexus",
    color: "rgb(20, 184, 166)",
    duration: 1.5,
    delay: 0,
    particleCount: 4,
    particleSize: 2.5,
  },
  {
    id: "path-nexus-horizontal",
    color: "rgb(20, 184, 166)",
    duration: 2,
    delay: 1,
    particleCount: 8,
    particleSize: 2,
  },
  {
    id: "path-nexus-professional",
    color: "rgb(74, 222, 128)",
    duration: 1.5,
    delay: 3,
    particleCount: 6,
    particleSize: 2,
  },
  {
    id: "path-nexus-personal",
    color: "rgb(56, 189, 248)",
    duration: 1.5,
    delay: 3,
    particleCount: 6,
    particleSize: 2,
  },
  {
    id: "path-growth-purpose",
    color: "rgb(74, 222, 128)",
    duration: 1.2,
    delay: 4.5,
    particleCount: 3,
    particleSize: 1.8,
  },
  {
    id: "path-creativity-passion",
    color: "rgb(56, 189, 248)",
    duration: 1.2,
    delay: 4.5,
    particleCount: 3,
    particleSize: 1.8,
  },
  {
    id: "path-nexus-purpose",
    color: "rgb(20, 184, 166)",
    duration: 1.8,
    delay: 6,
    particleCount: 5,
    particleSize: 1.5,
  },
  {
    id: "path-nexus-passion",
    color: "rgb(20, 184, 166)",
    duration: 1.8,
    delay: 6,
    particleCount: 5,
    particleSize: 1.5,
  },
  {
    id: "path-purpose-professional",
    color: "rgb(74, 222, 128)",
    duration: 1.5,
    delay: 7.5,
    particleCount: 4,
    particleSize: 2,
  },
  {
    id: "path-passion-personal",
    color: "rgb(56, 189, 248)",
    duration: 1.5,
    delay: 7.5,
    particleCount: 4,
    particleSize: 2,
  },
  {
    id: "path-growth-personal",
    color: "rgb(125, 211, 252)",
    duration: 2,
    delay: 9,
    particleCount: 7,
    particleSize: 1.5,
  },
  {
    id: "path-creativity-professional",
    color: "rgb(134, 239, 172)",
    duration: 2,
    delay: 9,
    particleCount: 7,
    particleSize: 1.5,
  },
  {
    id: "path-professional-personal",
    color: "rgb(139, 92, 246)",
    duration: 2.5,
    delay: 10.5,
    particleCount: 8,
    particleSize: 1.5,
  },
]
