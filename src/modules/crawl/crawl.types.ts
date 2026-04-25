export type CrawlMetadata = {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
};

export type CrawlCreateResponse = {
  id: string;
  url: string;
  title: string | null;
  metadata: CrawlMetadata;
  filePath: string;
  createdAt: Date;
};

export type CrawlDetailResponse = CrawlCreateResponse & {
  updatedAt: Date;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
