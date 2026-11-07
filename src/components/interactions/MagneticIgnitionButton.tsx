"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";

interface MagneticIgnitionButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function MagneticIgnitionButton({
  href,
  onClick,
  children,
  className = "",
}: MagneticIgnitionButtonProps) {
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ignited, setIgnited] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.35;
    const distanceY = (e.clientY - centerY) * 0.35;
    setOffset({ x: distanceX, y: distanceY });
  };

  const handleMouseEnter = () => {
    setIgnited(true);
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
    setIgnited(false);
  };

  const content = (
    <>
      {/* High-Voltage Magnetic Flux Ring */}
      <span
        className={`absolute -inset-[3px] rounded-xl bg-gradient-to-r from-[#FF3E00] via-[#FF7700] to-[#FF3E00] opacity-0 blur-sm transition-opacity duration-300 ${
          ignited ? "opacity-100 animate-pulse" : ""
        }`}
      />
      {/* Plasma Core Arc */}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </>
  );

  const sharedClasses = `relative inline-flex items-center justify-center font-extrabold text-xs tracking-wider uppercase transition-transform duration-150 ease-out select-none ${className}`;
  const transformStyle = {
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
  };

  if (href) {
    return (
      <Link
        ref={btnRef as React.Ref<HTMLAnchorElement>}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={transformStyle}
        className={sharedClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={btnRef as React.Ref<HTMLButtonElement>}
      type="button"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={transformStyle}
      className={sharedClasses}
    >
      {content}
    </button>
  );
}
