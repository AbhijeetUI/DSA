import { useEffect, useRef } from "react";

export function useIntersectionObserver(callback, options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
        ...options,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
}
