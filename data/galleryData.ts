export const galleryGroups: GalleryGroup[] = [
  {
    id: 'Blossoms & Kids',
    coverImage: '/gallery-images/Blossoms & Kids.webp',
    title: 'Blossoms & Kids',
    chTitle: '櫻趣',
    tags: ['Japan', 'Sakura', 'Childhood', 'Play', 'Spring', 'Kids'],
  },
  {
    id: 'Nihonbashi',
    title: 'Nihonbashi',
    coverImage: '/gallery-images/Nihonbashi.webp',
    tags: ['Japan', 'Tokyo'],
  },
  {
    id: 'Blossom Passage',
    title: 'Blossom Passage',
    chTitle: '花徑穿梭',
    coverImage: '/gallery-images/Blossom Passage.webp',
    tags: ['Japan', 'Sakura', 'Transportation', 'Spring'],
  },
  {
    id: 'Cityscapes of Tokyo',
    title: 'Cityscapes of Tokyo',
    coverImage: '/gallery-images/Cityscapes of Tokyo.webp',
    tags: ['Travel', 'Japan', 'Food'],
  },
  {
    id: 'Bali',
    title: 'Bali',
    tags: ['Travel', 'Tropical', 'Island', 'Culture'],

  },
  {
    id: 'Sakura Park',
    title: 'Sakura Park',
    chTitle: '櫻、園',
    // coverImage: '/gallery-images/Sakura Park.webp',
    tags: ['Japan', 'Park', 'Sakura', 'Spring'],

  },
  {
    id: 'Chasing Blossomse',
    title: 'Chasing Blossomse',
    chTitle: '追花',
    coverImage: '/gallery-images/Chasing Blossomse.webp',
    tags: ['Japan', 'Sakura', 'Bicycle', 'Childhood', 'Riverside', 'Spring'],
  },
  {
    id: 'Yanesen',
    title: 'Yanesen',
    coverImage: '/gallery-images/Yanesen.webp',
    tags: ['Travel', 'Japan', 'Food'],
  },
  {
    id: 'Neko',
    title: 'Neko',
    tags: ['Animals'],
  },
]

// export type GalleryGroup = typeof galleryGroups[number]
export interface GalleryGroup {
  id: string
  title: string
  chTitle?: string
  coverImage?: string
  tags: string[]
  images?: string[]
}
