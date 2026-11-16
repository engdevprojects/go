import Image from "next/image";
import Link from "next/link";
import goLogo from "@/assets/brand/go-logo.png";
import { cn } from "@/lib/cn";
import { PRODUCT_NAME, PRODUCT_SUBLINE } from "@/lib/config/product";

/**
 * The GO logo image (served locally from src/assets/brand; source:
 * Cloudinary "Go_logo"). Decorative by default because it always sits next to
 * the "GO" name or inside a labelled link; pass `alt` when it stands alone.
 */
export function BrandMark({ className, alt = "" }: { className?: string; alt?: string }) {
  return <Image src={goLogo} alt={alt} sizes="64px" className={cn("size-9 shrink-0 object-contain", className)} priority={false} />;
}

interface BrandLogoProps {
  href?: string;
  /** Use light text on dark backgrounds; the logo sits on a white tile so it stays visible. */
  inverse?: boolean;
  /** Logo only (collapsed sidebar). The link keeps its accessible name. */
  compact?: boolean;
  className?: string;
}

/** Logo + "GO" wordmark + "Local Access By GO" subline, linking home. */
export function BrandLogo({ href = "/", inverse = false, compact = false, className }: BrandLogoProps) {
  return (
    <Link href={href} className={cn("focus-ring inline-flex items-center gap-2.5 rounded-sm", className)} aria-label={`${PRODUCT_NAME} — home`}>
      <span className={cn("inline-flex shrink-0", inverse && "rounded-lg bg-surface p-0.5 shadow-card")}>
        <BrandMark />
      </span>
      {compact ? null : (
        <span className="leading-none">
          <span className={cn("block font-display text-xl font-extrabold tracking-tight", inverse ? "text-ink-inverse" : "text-brand-strong")}>
            {PRODUCT_NAME}
          </span>
          <span className={cn("mt-0.5 block text-[0.6875rem] font-semibold tracking-wide", inverse ? "text-ink-inverse/75" : "text-ink-muted")}>
            {PRODUCT_SUBLINE}
          </span>
        </span>
      )}
    </Link>
  );
}
