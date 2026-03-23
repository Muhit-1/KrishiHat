import { useState } from "react";

export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit] = useState(initialLimit);

  return {
    page,
    limit,
    setPage,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    goToPage: (n: number) => setPage(n),
  };
}