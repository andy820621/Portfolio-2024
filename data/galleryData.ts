export const galleryImages = [
  {
    id: 1,
    title: 'Sakura in Gorakuenn',
    src: '/gallery-images/1.jpg',
    tags: ['小石川後樂園', 'test'],
    description: '小石川後樂園的櫻花',
  },
  {
    id: 2,
    title: 'Sakura in Gorakuenn',
    src: '/gallery-images/2.jpg',
    tags: ['小石川後樂園'],
  },
]

export type GalleryImage = typeof galleryImages[number]
