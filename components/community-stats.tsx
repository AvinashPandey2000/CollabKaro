"use client";
import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
function Counter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (n) => String(Math.round(n)));
  useEffect(() => {
    if (seen) {
      const controls = animate(count, value, {
        duration: reduced ? 0 : 1.2,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [seen, reduced, count, value]);
  return (
    <div ref={ref}>
      <motion.strong>{rounded}</motion.strong>
      <span>{label}</span>
    </div>
  );
}
export function CommunityStats() {
  return (
    <section
      className="community-stats container"
      aria-label="Sample marketplace community"
    >
      <Counter value={36} label="Creative voices to discover" />
      <Counter value={40} label="Campaigns to explore" />
      <Counter value={14} label="Brands & agencies to meet" />
      <p>
        A sample community.
        <br />A world of possibilities.
      </p>
    </section>
  );
}
