export function Avatar({
  src,
  name,
  size = 36
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const style = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} style={style} className="rounded-full object-cover" />;
  }
  return (
    <div
      style={style}
      className="rounded-full bg-line text-white/80 grid place-items-center text-xs font-semibold"
    >
      {initials || "?"}
    </div>
  );
}
