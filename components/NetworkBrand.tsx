import config from "../content/network-site.json";

/**
 * Wordmark shared by the manapick network: lowercase "manapick" in
 * Zen Kaku Gothic New 900 plus the site suffix as a line-colour tag
 * (career: yellow tag with navy text — white on yellow is prohibited).
 */
export default function NetworkBrand({ className = "" }: { className?: string }) {
  return (
    <span className={`wm ${className}`}>
      <span className="wm-m">manapick</span>
      <span className="wm-sub">{config.short}</span>
    </span>
  );
}
