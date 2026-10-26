import { ArrowUpRight } from "lucide-react";
import deepLinks from "@/content/ai-deep-links.json";
import { TrackedExternalLink } from "@/components/Tracking";

type AiDeepLink = { href: string; label: string };

const AI_DEEP_LINKS = deepLinks as Record<string, AiDeepLink[]>;

/** content/ai-deep-links.json に載っているページだけ、manapick AI の関連ページ（最大2本）を表示する */
export function AiDeepLinks({ path }: { path: string }) {
  const links = (AI_DEEP_LINKS[path] ?? []).slice(0, 2);
  if (!links.length) return null;
  return (
    <div className="ai-deep-links">
      <strong>manapick AIの関連ページ</strong>
      <div>
        {links.map((link) => (
          <TrackedExternalLink key={link.href} href={link.href} eventLabel={`ai-deep:${link.label}`}>
            {link.label}
            <ArrowUpRight aria-hidden="true" />
          </TrackedExternalLink>
        ))}
      </div>
    </div>
  );
}
