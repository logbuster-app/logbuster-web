import { Suspense } from "react";
import { MovieSearch } from "@/features/movies";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <MovieSearch />
    </Suspense>
  );
}
