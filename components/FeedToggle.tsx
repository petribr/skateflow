import Link from "next/link";

export function FeedToggle({ current }: { current: "list" | "map" }) {
  const base = "px-3 py-1 text-xs rounded-full border";
  return (
    <div className="flex gap-2">
      <Link
        href="/feed?view=list"
        className={`${base} ${current === "list" ? "bg-accent text-black border-accent" : "border-line text-white/70"}`}
      >
        List
      </Link>
      <Link
        href="/feed?view=map"
        className={`${base} ${current === "map" ? "bg-accent text-black border-accent" : "border-line text-white/70"}`}
      >
        Map
      </Link>
    </div>
  );
}
