import { ApiError } from "@/app/_lib/api/api-error";
import type { NewsArticle } from "@/app/_lib/api/schemas/news";
import type { HomeNewsItem } from "./_data";

type FetchNews = () => Promise<NewsArticle[]>;

const DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

export function formatNewsDate(publishedAt: string): string {
  const matched = DATE_PREFIX.exec(publishedAt);
  if (!matched) return publishedAt;

  const [, year, month, day] = matched;
  return `${year}.${month}.${day}`;
}

export function mapNewsArticleToHomeItem(article: NewsArticle, index: number): HomeNewsItem {
  return {
    id: `news-${index}-${article.originalUrl}`,
    title: article.title,
    date: formatNewsDate(article.publishedAt),
    url: article.originalUrl,
    thumbnailUrl: article.thumbnailUrl,
  };
}

export function mapNewsToHomeItems(articles: NewsArticle[]): HomeNewsItem[] {
  return articles.map(mapNewsArticleToHomeItem);
}

export async function loadHomeNewsItems(fetchNews: FetchNews): Promise<HomeNewsItem[]> {
  try {
    return mapNewsToHomeItems(await fetchNews());
  } catch (error) {
    if (error instanceof ApiError) return [];
    throw error;
  }
}
