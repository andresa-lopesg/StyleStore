interface FilterBarProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function FilterBar({ children, actions }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
