import { ExternalLink, Heart, Star, TestTube2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLiveCommit } from "../lib/data";

export function Header() {
  const commit = useQuery({
    queryKey: ["live-commit"],
    queryFn: fetchLiveCommit,
    staleTime: 60_000,
    retry: false,
  });

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white">
            <TestTube2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-normal text-slate-950">
              Cheminformatics Workbench
            </h1>
            <p className="text-sm text-slate-600">
              v{__APP_VERSION__} - commit {commit.data ?? __APP_COMMIT__}
            </p>
          </div>
        </div>
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Project links"
        >
          <a
            className="toolbar-link"
            href={__REPO_URL__}
            target="_blank"
            rel="noreferrer"
          >
            <Star className="size-4" aria-hidden="true" />
            Star on GitHub
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <a
            className="toolbar-link"
            href={__PAYPAL_URL__}
            target="_blank"
            rel="noreferrer"
          >
            <Heart className="size-4" aria-hidden="true" />
            Support via PayPal
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}
