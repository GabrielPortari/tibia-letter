interface AvatarProps {
  src: string | null
  alt: string
  size?: number
}

export function Avatar({ src, alt, size = 32 }: AvatarProps) {
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-bg3 border border-border flex items-center justify-center text-text-muted text-xs font-bold"
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-full border border-border object-cover"
      style={{ width: size, height: size }}
    />
  )
}
