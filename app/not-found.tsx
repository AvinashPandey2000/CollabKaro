import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
export default function NotFound() {
  return (
    <div className="container empty-state page-wrap">
      <Search size={54} className="brand-text" />
      <h1>This page took a creative detour.</h1>
      <p>
        Even good ideas get lost sometimes. Your next collab is still out there.
      </p>
      <Link className="button" href="/">
        Back to home
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
