import db from "../config/db";

export interface GalleryItem {
  type: "photo" | "video";
  media: string;
  caption?: string;
  isHtml?: boolean;
}

export const saveGallery = (id: string, media: GalleryItem[]) => {
  db.prepare("INSERT OR REPLACE INTO galleries (id, media) VALUES (?, ?)").run(id, JSON.stringify(media));
};

export const getGallery = (id: string): GalleryItem[] | undefined => {
  const row = db.prepare("SELECT media FROM galleries WHERE id = ?").get(id) as { media: string } | undefined;
  return row ? JSON.parse(row.media) : undefined;
};
