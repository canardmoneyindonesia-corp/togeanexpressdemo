"use client";

import { useEffect, useState } from "react";

/** True when the viewport is below Tailwind's `sm` breakpoint (640px). */
export function useIsMobile(query = "(max-width: 639px)") {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return isMobile;
}
