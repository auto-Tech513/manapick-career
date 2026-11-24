/**
 * 手動の広告枠の状態を GA4 に adsense_slot_status として送る（2026-11-24、決定キュー #74・■5 T1-3）。
 * - 名前と引数は ai・license の AdSlot と同じ：ad_placement・ad_slot・ad_status。
 * - ad_status：requested（広告の要求を積んだ）／request_error（要求で例外）／filled／unfilled／
 *   optimized_rendered・optimized_empty（unfill-optimized で中身が描かれた・描かれなかった。1.6 秒待って判定）／
 *   timeout（12 秒たっても data-ad-status が付かない）。同じ枠で同じ状態は1回だけ送る。
 * - 送るだけで、枠の表示・畳み方・広告の読み込み条件（webdriver 判定）には一切触れない（ins の属性を読むだけ）。
 * - gtag が無い環境では何も送らない（250ms おきに最大 20 回だけ待つ。ai・license と同じ）。
 */
type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

export type AdSlotStatusWatch = {
  report: (status: string) => void;
  dispose: () => void;
};

export function watchAdSlotStatus(element: HTMLElement, placement: string, slot: string): AdSlotStatusWatch {
  let disposed = false;
  let optimizedPending = false;
  const reported = new Set<string>();
  const timers = new Set<number>();

  const later = (fn: () => void, ms: number) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      if (!disposed) fn();
    }, ms);
    timers.add(timer);
  };

  const report = (status: string) => {
    if (disposed || reported.has(status)) return;
    reported.add(status);
    const send = (attempt = 0) => {
      const w = window as GtagWindow;
      if (typeof w.gtag === "function") {
        w.gtag("event", "adsense_slot_status", { ad_placement: placement, ad_slot: slot, ad_status: status });
        return;
      }
      if (attempt >= 20) return;
      later(() => send(attempt + 1), 250);
    };
    send();
  };

  const hasRenderedFrame = () =>
    Array.from(element.querySelectorAll("iframe")).some((frame) => {
      const rect = frame.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

  const inspect = () => {
    if (disposed) return;
    const status = element.getAttribute("data-ad-status");
    if (status === "filled" || (!status && hasRenderedFrame())) {
      report("filled");
      return;
    }
    if (status === "unfill-optimized") {
      if (hasRenderedFrame()) {
        report("optimized_rendered");
        return;
      }
      if (!optimizedPending) {
        optimizedPending = true;
        later(() => report(hasRenderedFrame() ? "optimized_rendered" : "optimized_empty"), 1600);
      }
      return;
    }
    if (status === "unfilled") report("unfilled");
  };

  const observer = new MutationObserver(inspect);
  observer.observe(element, { attributes: true, attributeFilter: ["data-ad-status"], childList: true, subtree: true });
  later(() => {
    if (!element.getAttribute("data-ad-status")) report("timeout");
  }, 12000);
  inspect();

  return {
    report,
    dispose: () => {
      disposed = true;
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    }
  };
}
