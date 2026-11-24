/**
 * manapick ネットワーク（姉妹サイト）宛てのリンクの共通判定（2026-11-24、決定キュー #74。ai #43 と同じ仕様）。
 * - 姉妹サイト宛てのリンクは rel から noreferrer を外し、noopener だけを残す
 *   （行き先の GA4 で参照元＝姉妹サイトとして記録されるように）。外部サイト宛ては従来どおり noreferrer を付ける。
 * - 姉妹サイトへのクリックは network_click（source_site・destination_site・destination_path・placement）で数える
 *   （components/NetworkClickTracker.tsx）。
 */
export const NETWORK_SOURCE_SITE = "career";

/** ホスト名 → 計測で使うサイトのキー（ai #43 と同じ） */
export const NETWORK_SITE_BY_HOST: Record<string, string> = {
  "manapick.app": "manapick",
  "ai.manapick.app": "ai",
  "license.manapick.app": "license",
  "career.manapick.app": "career",
  "company.manapick.app": "company",
  "politics.manapick.app": "politics",
  "saincho-sauna-stamp-rally.pages.dev": "saincho"
};

/** 絶対 URL の行き先が姉妹サイト（自サイト以外）なら、そのキーを返す */
export function networkSiteOf(href: string | undefined): string | undefined {
  if (!href || !/^https?:\/\//i.test(href)) return undefined;
  try {
    const site = NETWORK_SITE_BY_HOST[new URL(href).hostname];
    return site && site !== NETWORK_SOURCE_SITE ? site : undefined;
  } catch {
    return undefined;
  }
}

/** 別タブで開くリンクの rel。姉妹サイト宛ては noopener だけ、それ以外は noopener noreferrer */
export function externalRel(href: string | undefined): string {
  return networkSiteOf(href) ? "noopener" : "noopener noreferrer";
}
