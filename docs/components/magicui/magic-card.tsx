"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import React, { useCallback, useEffect, useRef } from "react";

import { cn } from "@app/lib/utils";
import { cva, VariantProps } from "class-variance-authority";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
  inset?: string;
}

const cardVariants = cva("", {
  variants: {
    color: {
      pink: "var(--color-pink-400)",
      blue: "var(--color-blue-400)",
      green: "var(--color-green-400)",
      yellow: "var(--color-yellow-400)",
      orange: "var(--color-orange-400)",
      red: "var(--color-red-400)",
      purple: "var(--color-purple-400)",
      gray: "var(--color-gray-400)",
      cyan: "var(--color-cyan-400)",
      fuchsia: "var(--color-fuchsia-400)",
    },
  },
});

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.05,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
  inset="1px",
  color="pink"
}: MagicCardProps & VariantProps<typeof cardVariants>) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (cardRef.current) {
        const { left, top } = cardRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
      }
    },
    [mouseX, mouseY],
  );

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      if (!e.relatedTarget) {
        document.removeEventListener("mousemove", handleMouseMove);
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
      }
    },
    [handleMouseMove, mouseX, gradientSize, mouseY],
  );

  const handleMouseEnter = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMove);
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [handleMouseMove, mouseX, gradientSize, mouseY]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [handleMouseEnter, handleMouseMove, handleMouseOut]);

  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);


  return (
    <div
      ref={cardRef}
      className={cn("group relative flex size-full", className)}
    >
      <div className={`absolute z-10  bg-background`} style={{inset: inset}}/>
      <div className="relative z-30 w-full">{children}</div>
      <motion.div
        className={`pointer-events-none absolute z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${cardVariants({ color })}, transparent 100%)
          `,
          inset: inset,
          opacity: gradientOpacity,
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0  duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
              var(--color-primary), 
              var(--color-secondary), 
              var(--color-border) 100%
            )
          `,
        }}
      />
    </div>
  );
}
