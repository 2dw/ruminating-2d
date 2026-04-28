export interface PhotoAlbum {
  id: string
  title: string
  subtitle: string
  description: string
  prefix: string
  cover?: string
}

export const PHOTO_ALBUMS: PhotoAlbum[] = [
  {
    id: "baja-2006",
    title: "2006 Baja California",
    subtitle: "Earthwatch Research Expedition",
    description:
      "Documentation from my Earthwatch research expedition to Baja California, exploring the interconnected ecosystems and biodiversity of this unique region.",
    prefix: "photography/2006 baja california/",
    cover: "/placeholder.jpg",
  },
]
