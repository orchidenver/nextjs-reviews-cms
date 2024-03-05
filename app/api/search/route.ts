import { NextRequest, NextResponse } from "next/server";
import { searchReviews } from "@/lib/reviews";

// робимо запит до CMS API з серверу через API шлях, щоб не робити API публічним і не звертатися до API напряму
// npm i server-only - допомагає забеспечити запити тільки з серверу. У такому разі модуль не буде використовуватися у клієнтському компоненті.
export async function GET(request: NextRequest) {
  // get query from url
  const query = request.nextUrl.searchParams.get("query");
  // make request to CMS
  const reviews = await searchReviews(query);
  return NextResponse.json(reviews);
}
