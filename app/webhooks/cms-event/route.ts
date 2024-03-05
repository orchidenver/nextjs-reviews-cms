import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { CACHE_TAG_REVIEWS } from "@/lib/reviews";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  if (payload.model === "review") {
    // review - колекція контенту на стороні cms, у якій відбулися зміни
    revalidateTag(CACHE_TAG_REVIEWS); // інвалідуємо кешовані дані фетчу, котрі замарковані тегом
    // CACHE_TAG_REVIEWS === reviews - тег, котрий відповідає певному фетч реквесту
    console.log("revalidated:", CACHE_TAG_REVIEWS);
  }

  return new Response(null, { status: 204 });
}
