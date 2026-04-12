import type { DateLike } from '~~/types/main'
import { queryCollection } from '#imports'

export interface GalleryAlbum {
  albumId: string
  order: number
  title: string
  chTitle?: string
  coverImage?: string
  description?: string
  tags: string[]
  updatedAt?: DateLike
  published: boolean
}

function createGalleryQuery() {
  return queryCollection('gallery')
}

export function sortGalleryAlbums(albums: GalleryAlbum[]) {
  return [...albums].sort((a, b) => a.order - b.order)
}

export async function fetchGalleryAlbums(): Promise<GalleryAlbum[]> {
  const albums = await createGalleryQuery()
    .where('published', '=', true)
    .all() as unknown as GalleryAlbum[]

  return sortGalleryAlbums(albums)
}

export async function fetchGalleryAlbumById(id: string): Promise<GalleryAlbum | null> {
  return await createGalleryQuery()
    .where('published', '=', true)
    .where('albumId', '=', id)
    .first() as unknown as GalleryAlbum | null
}
