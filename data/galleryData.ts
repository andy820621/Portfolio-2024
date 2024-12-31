export const galleryGroups: GalleryGroup[] = [
  {
    id: 'Blossoms & Kids',
    coverImage: '/gallery-images/Blossoms & Kids.webp',
    title: 'Blossoms & Kids',
    chTitle: '櫻趣',
    description: 'A delightful collection capturing the joyful moments of children playing amidst the beautiful cherry blossoms in Japan during springtime.',
    tags: ['Japan', 'Sakura', 'Childhood', 'Play', 'Spring', 'Kids'],
  },
  {
    id: 'Nihonbashi',
    title: 'Nihonbashi',
    coverImage: '/gallery-images/Nihonbashi.webp',
    description: 'A photographic journey through Nihonbashi, one of Tokyo\'s most historic districts, showcasing its unique urban landscape and cultural significance.',
    tags: ['Japan', 'Tokyo'],
  },
  {
    id: 'Blossom Passage',
    title: 'Blossom Passage',
    chTitle: '花徑穿梭',
    coverImage: '/gallery-images/Blossom Passage.webp',
    description: 'An enchanting series exploring the intersection of cherry blossoms and urban transportation in Japan, highlighting the beauty of spring travel.',
    tags: ['Japan', 'Sakura', 'Transportation', 'Spring'],
  },
  {
    id: 'Cityscapes of Tokyo',
    title: 'Cityscapes of Tokyo',
    coverImage: '/gallery-images/Cityscapes of Tokyo.webp',
    description: 'A vibrant collection showcasing the diverse urban landscapes, culinary scenes, and daily life in Tokyo, capturing the city\'s dynamic spirit.',
    tags: ['Travel', 'Japan', 'Food'],
  },
  {
    id: 'Bali',
    title: 'Bali',
    description: 'An immersive visual exploration of Bali\'s rich culture, tropical landscapes, and the unique charm of this Indonesian island paradise.',
    tags: ['Travel', 'Tropical', 'Island', 'Culture'],
  },
  {
    id: 'Sakura Park',
    title: 'Sakura Park',
    chTitle: '櫻、園',
    description: 'A serene collection capturing the ethereal beauty of cherry blossoms in Japanese parks, showcasing the tranquil spring atmosphere.',
    tags: ['Japan', 'Park', 'Sakura', 'Spring'],
  },
  {
    id: 'Neko',
    title: 'Neko',
    description: 'A charming series dedicated to cats, highlighting their playful, mysterious, and adorable nature in various settings.',
    tags: ['Animals'],
  },
  {
    id: 'Yanesen',
    title: 'Yanesen',
    coverImage: '/gallery-images/Yanesen.webp',
    description: 'A culinary and cultural journey through the historic Yanesen area of Tokyo, exploring its traditional food scene and local charm.',
    tags: ['Travel', 'Japan', 'Food'],
  },
  {
    id: 'Chasing Blossoms',
    title: 'Chasing Blossoms',
    chTitle: '追花',
    coverImage: '/gallery-images/Chasing Blossoms.webp',
    description: 'A nostalgic bicycle journey through Japanese landscapes, capturing the essence of childhood and the fleeting beauty of cherry blossoms.',
    tags: ['Japan', 'Sakura', 'Bicycle', 'Childhood', 'Riverside', 'Spring'],
  },
]

// export type GalleryGroup = typeof galleryGroups[number]
export interface GalleryGroup {
  id: string
  title: string
  chTitle?: string
  coverImage?: string
  description?: string
  tags: string[]
  images?: string[]
}
