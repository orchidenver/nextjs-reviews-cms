"use client";

import type { SearchableReview } from "@/lib/reviews";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useIsClient, useDebounce } from "@/lib/hooks";
// import { searchReviews } from "@/lib/reviews";
import { Combobox } from "@headlessui/react";

// export interface SearchBoxProps {
//   reviews: SearchableReview[];
// }

export default function SearchBox() {
  const router = useRouter();
  const isClient = useIsClient();
  const [query, setQuery] = useState("");
  const [reviews, setReviews] = useState<SearchableReview[]>([]);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length > 1) {
      (async () => {
        // якщо робимо запит з клієнтського компоненту напряму до CMS
        // const reviews = await searchReviews(query);
        // робимо запит через Route handler
        const response = await fetch(
          "/api/search?query=" + encodeURIComponent(debouncedQuery)
        );
        const reviews = await response.json();
        setReviews(reviews);
      })();
    } else {
      setReviews([]);
    }
  }, [debouncedQuery]);

  const handleChange = (review: SearchableReview) => {
    router.push(`/reviews/${review.slug}`);
  };

  // використовуємо такий підхід, щоб уникнути помилки, коли Combobox рендериться
  // у браузері і на сервері з різними id. У такому разі у компоненті буде рендеритися
  // тільки у браузері.
  if (!isClient) {
    return null;
  }

  // масив з фетчу даних на стороні серверу
  // const filteredReviews = reviews
  //   .filter((review) =>
  //     review.title.toLowerCase().includes(query.toLowerCase())
  //   )
  //   .slice(0, 5);

  return (
    <div className="relative w-48">
      <Combobox onChange={handleChange}>
        <Combobox.Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search…"
          className="border px-2 py-1 rounded w-full"
        />
        <Combobox.Options className="absolute bg-white py-1 w-full">
          {reviews.map((review) => (
            <Combobox.Option key={review.slug} value={review}>
              {({ active }) => (
                <span
                  className={`block px-2 truncate w-full ${
                    active ? "bg-orange-100" : ""
                  }`}
                >
                  {review.title}
                </span>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
    </div>
  );
}
