interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color, height = 24 }: SparklineProps) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {data.map((val, i) => (
        <div
          key={i}
          className="rounded-sm transition-all duration-300"
          style={{
            width: 3,
            height: `${Math.max((val / max) * 100, 8)}%`,
            background: i === data.length - 1
              ? (color || "hsl(var(--primary))")
              : (color ? color + "66" : "hsl(var(--primary) / 0.35)"),
          }}
        />
      ))}
    </div>
  );
}
