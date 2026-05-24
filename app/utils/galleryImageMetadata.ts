export interface GalleryImageDimensions {
  width: number
  height: number
}

export interface GalleryImageAsset extends GalleryImageDimensions {
  src: string
}

export type GalleryImagesMetadata = Record<string, GalleryImageDimensions>

const NATURAL_SORT_OPTIONS = {
  numeric: true,
  sensitivity: 'base',
} as const

export function buildGalleryImagesMetadata(
  publicPaths: string[],
  readDimensions: (publicPath: string) => GalleryImageDimensions,
): GalleryImagesMetadata {
  return Object.fromEntries(
    [...publicPaths]
      .sort((a, b) => a.localeCompare(b, undefined, NATURAL_SORT_OPTIONS))
      .map(publicPath => [publicPath, readDimensions(publicPath)]),
  )
}

export function enrichGalleryAlbumsWithCoverDimensions<T extends { coverImage?: string }>(
  albums: T[],
  metadata: GalleryImagesMetadata,
): Array<T & { coverImageWidth?: number, coverImageHeight?: number }> {
  return albums.map((album) => {
    const dimensions = album.coverImage ? metadata[album.coverImage] : undefined

    if (!dimensions)
      return album

    return {
      ...album,
      coverImageWidth: dimensions.width,
      coverImageHeight: dimensions.height,
    }
  })
}

export function resolveGalleryImageAssets(
  albumId: string,
  imageFiles: string[],
  metadata: GalleryImagesMetadata,
): GalleryImageAsset[] {
  return imageFiles.map((file) => {
    const publicPath = `/gallery-images/${albumId}/${file}`
    const dimensions = metadata[publicPath]

    if (!dimensions) {
      throw new Error(`Missing gallery image metadata for: ${publicPath}`)
    }

    return {
      src: publicPath,
      width: dimensions.width,
      height: dimensions.height,
    }
  })
}
