import Link from "next/link";
export function Logo({ iconOnly = false }: { iconOnly?: boolean }) {
  return (
    <Link href="/" className="logo" aria-label="CollabKaro home">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="2" y="3" width="25" height="23" rx="9" fill="#6C3BFF" />
        <path d="M8 22v9l9-7" fill="#6C3BFF" />
        <rect x="15" y="15" width="23" height="20" rx="8" fill="#FF5A36" />
        <path d="M32 31v7l-8-5" fill="#FF5A36" />
        <path
          d="m23 15 2.2 4.8L30 22l-4.8 2.2L23 29l-2.2-4.8L16 22l4.8-2.2Z"
          fill="#C8F560"
        />
      </svg>
      {!iconOnly && (
        <span>
          collab<span className="brand-text">karo</span>
          <span className="logo-period">.</span>
        </span>
      )}
    </Link>
  );
}
