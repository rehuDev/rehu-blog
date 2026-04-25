export type GalleryVariant = "default" | "programming" | "health";

export type GalleryMeta = {
  title: string;
  description: string;
  accentColor: string;
  variant: GalleryVariant;
};

const fallbackGallery: GalleryMeta = {
  title: "",
  description: "",
  accentColor: "#29367c",
  variant: "default",
};

const galleryMetaByCategory: Record<string, Partial<GalleryMeta>> = {
  Dev: {
    title: "프로그래밍 갤러리",
    description: "개발, 서버, 도구, 블로그 제작 기록을 모아둔 공간입니다.",
    accentColor: "#2f4f8f",
    variant: "programming",
  },
  Health: {
    title: "헬스 갤러리",
    description: "운동, 건강 관리, 생활 습관과 관련된 글을 모아둔 공간입니다.",
    accentColor: "#207a4c",
    variant: "health",
  },
};

export function getGalleryMeta(category: string): GalleryMeta {
  const customMeta = galleryMetaByCategory[category] ?? {};

  return {
    ...fallbackGallery,
    title: `${category} 갤러리`,
    description: `${category} 카테고리의 글을 모아둔 공간입니다.`,
    ...customMeta,
  };
}
