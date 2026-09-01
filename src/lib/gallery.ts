import type { CollectionEntry } from 'astro:content';

export const GALLERY_POSTS_PER_PAGE = 2;
export const GALLERY_PAGE_GROUP_SIZE = 10;

export interface GalleryPostContext {
  gallery: CollectionEntry<'gallery'>;
  pagePosts: CollectionEntry<'post'>[];
  postCount: number;
  currentPage: number;
  totalPages: number;
}
