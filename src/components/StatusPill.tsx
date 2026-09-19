interface StatusPillProps {
  children: string;
}

export function StatusPill({ children }: StatusPillProps) {
  return <span className="status-pill">{children}</span>;
}
