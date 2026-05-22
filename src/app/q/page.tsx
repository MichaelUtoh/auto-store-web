"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionCard } from "@/components/qa/QuestionCard";
import { Pagination } from "@/components/shared/Pagination";
import { questionsApi } from "@/lib/api/questions";
import type { QuestionListItem, QuestionStatus } from "@/types/qa";

const STATUS_OPTIONS: { value: QuestionStatus | ""; label: string }[] = [
  { value: "", label: "All open" },
  { value: "open", label: "Open" },
  { value: "answered", label: "Answered" },
];

export default function QuestionsBrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("q") ?? ""
  );

  const q = searchParams.get("q") ?? undefined;
  const status = (searchParams.get("status") as QuestionStatus | null) ?? undefined;
  const make = searchParams.get("make") ?? undefined;
  const model = searchParams.get("model") ?? undefined;
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await questionsApi.list({
        q,
        status: status || undefined,
        make,
        model,
        year: Number.isFinite(year) ? year : undefined,
        page,
        limit: 20,
      });
      setQuestions(res.items);
      setTotalPages(res.totalPages);
      setCurrentPage(res.page);
    } catch {
      setQuestions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [q, status, make, model, year, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    params.delete("page");
    router.push(`/q?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || undefined });
  };

  return (
    <div className="page-container py-6 sm:py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Community Q&A</h1>
          <p className="mt-2 max-w-lg text-sm text-secondary sm:text-base">
            Ask fitment and install questions. Verified mechanics share answers.
          </p>
        </div>
        <Button asChild>
          <Link href="/q/ask">
            <Plus className="mr-2 h-4 w-4" />
            Ask a question
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <Input
          type="search"
          placeholder="Search questions…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
          aria-label="Search questions"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              updateParams({ status: value || undefined })
            }
            className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
              (status ?? "") === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-secondary hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Make"
          defaultValue={make}
          onBlur={(e) =>
            updateParams({ make: e.target.value.trim() || undefined })
          }
          aria-label="Vehicle make"
        />
        <Input
          placeholder="Model"
          defaultValue={model}
          onBlur={(e) =>
            updateParams({ model: e.target.value.trim() || undefined })
          }
          aria-label="Vehicle model"
        />
        <Input
          type="number"
          placeholder="Year"
          defaultValue={yearParam ?? ""}
          onBlur={(e) =>
            updateParams({ year: e.target.value.trim() || undefined })
          }
          aria-label="Vehicle year"
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-center text-secondary py-12">Loading…</p>
        ) : questions.length === 0 ? (
          <div className="rounded-3xl bg-muted px-6 py-16 text-center">
            <p className="text-secondary">No questions match your filters.</p>
            <Button asChild className="mt-4">
              <Link href="/q/ask">Ask the first question</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/q"
        />
      </div>
    </div>
  );
}
