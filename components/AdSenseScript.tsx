export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  const enabled = process.env.NEXT_PUBLIC_MANUAL_ADS === "true";

  if (!client || !enabled) return null;

  return (
    <script
      id="adsense-manual"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
    />
  );
}
