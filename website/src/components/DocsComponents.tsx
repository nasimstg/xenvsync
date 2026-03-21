"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      className="space-y-4"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </motion.section>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-[var(--color-text-secondary)] leading-relaxed">
        {description}
      </p>
    </motion.header>
  );
}

export function Card({
  children,
  className = "",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`gradient-border p-4 ${glow ? "glow-sm" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-bright rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

export function Callout({
  children,
  type = "info",
}: {
  children: ReactNode;
  type?: "info" | "warning" | "important";
}) {
  const labels = {
    info: "Note",
    warning: "Warning",
    important: "Important",
  };

  return (
    <motion.div
      className="mt-4 p-4 rounded-xl border border-[var(--color-accent-dim)]/40 bg-[var(--color-accent-glow)] text-sm"
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <strong className="text-[var(--color-accent)]">{labels[type]}: </strong>
      <span className="text-[var(--color-text-secondary)]">{children}</span>
    </motion.div>
  );
}

export function StaggerList({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
