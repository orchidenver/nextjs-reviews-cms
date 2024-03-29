import "server-only";

import { marked } from "marked";
import qs from "qs";

// env vars available only on server side
const CMS_URL = process.env.CMS_URL;

interface CmsItem {
  id: number;
  attributes: any;
}

export interface Review {
  slug: string;
  title: string;
  date: string;
  image: string;
  subtitle: string;
}

export interface FullReview extends Review {
  body: string;
}

export interface PaginatedReviews {
  pageCount: number;
  reviews: Review[];
}

export type SearchableReview = Pick<Review, "slug" | "title">;

export const CACHE_TAG_REVIEWS = "reviews";

export async function getReview(slug: string): Promise<FullReview> {
  const { data } = await fetchReviews({
    filters: { slug: { $eq: slug } },
    fields: ["slug", "title", "subtitle", "publishedAt", "body"],
    populate: { image: { fields: ["url"] } },
    pagination: { pageSize: 1, withCount: false },
  });

  if (!data.length) return null;

  const item = data[0];

  return {
    ...toReview(item),
    body: marked(item.attributes.body),
  };
}

export async function getReviews(
  pageSize: number,
  page?: number
): Promise<PaginatedReviews> {
  const { data, meta } = await fetchReviews({
    fields: ["slug", "title", "subtitle", "publishedAt"],
    populate: { image: { fields: ["url"] } },
    sort: ["publishedAt:desc"],
    pagination: { pageSize, page },
  });

  return {
    pageCount: meta.pagination.pageCount,
    reviews: data.map(toReview),
  };
}
// функція для фетчу даних на стороні серверу
// export async function getSearchableReviews(): Promise<SearchableReview[]> {
//   const { data } = await fetchReviews({
//     fields: ["slug", "title"],
//     sort: ["publishedAt:desc"],
//     pagination: { pageSize: 100 },
//   });
//   return data.map(({ attributes }) => ({
//     slug: attributes.slug,
//     title: attributes.title,
//   }));
// }

export async function searchReviews(
  query: string
): Promise<SearchableReview[]> {
  const { data } = await fetchReviews({
    filters: { title: { $containsi: query } },
    fields: ["slug", "title"],
    sort: ["title"],
    pagination: { pageSize: 5 },
  });
  return data.map(({ attributes }) => ({
    slug: attributes.slug,
    title: attributes.title,
  }));
}

export async function getSlugs(): Promise<string[]> {
  const { data } = await fetchReviews({
    fields: ["slug"],
    sort: ["publishedAt:desc"],
    pagination: { pageSize: 100 },
  });

  return data.map((item: CmsItem) => item.attributes.slug);
}

async function fetchReviews(parameters: any) {
  const url =
    `${CMS_URL}/api/reviews?` +
    qs.stringify(parameters, { encodeValuesOnly: true });
  const response = await fetch(url, {
    next: {
      tags: [CACHE_TAG_REVIEWS], // ідентифікуємо фетч реквести
    },
  });

  if (!response.ok) {
    throw new Error(`CMS returned ${response.status} for ${url}`);
  }

  return await response.json();
}

// for development
// function toReview(item: CmsItem): Review {
//   const { attributes } = item;

//   return {
//     slug: attributes.slug,
//     title: attributes.title,
//     subtitle: attributes.subtitle,
//     date: attributes.publishedAt.slice(0, "yyyy-mm-dd".length),
//     image: CMS_URL + attributes.image.data.attributes.url,
//   };
// }

// for production
function toReview(item: CmsItem): Review {
  const { attributes } = item;
  return {
    slug: attributes.slug,
    title: attributes.title,
    subtitle: attributes.subtitle,
    date: attributes.publishedAt.slice(0, "yyyy-mm-dd".length),
    image: new URL(attributes.image.data.attributes.url, CMS_URL).href,
  };
}
