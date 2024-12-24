export const galleryGroups = [
  {
    id: 'Gorakuenn',
    title: 'Gorakuenn',
    coverImage: '/gallery-images/Gorakuenn.jpg',
    tags: ['travel', 'japan', 'city'],
    images: [
      '/gallery-images/Gorakuenn/1.jpg',
      '/gallery-images/Gorakuenn/2.jpg',
    ],
  },
  {
    id: 'AsukayamaPark',
    title: 'AsukayamaPark Exploration',
    coverImage: '/gallery-images/AsukayamaPark.jpg',
    tags: ['travel', 'japan', 'food'],
    images: [
      '/gallery-images/AsukayamaPark/1.jpg',
      '/gallery-images/AsukayamaPark/2.jpg',
      '/gallery-images/AsukayamaPark/3.jpg',
      '/gallery-images/AsukayamaPark/4.jpg',
      '/gallery-images/AsukayamaPark/5.jpg',
      '/gallery-images/AsukayamaPark/6.jpg',
    ],
  },
]

export type GalleryGroup = typeof galleryGroups[number]
