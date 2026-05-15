import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageShellProps {
  title: string;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  search?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
}

export default function PageShell({ title, subtitle, description, action, actions, search, breadcrumbs, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-(--text-muted) mb-1">
            {breadcrumbs.map((crumb, i) => (
              <Fragment key={i}>
                {i > 0 && <ChevronRight size={12} className="text-(--text-muted)" />}
                {crumb.href
                  ? <Link to={crumb.href} className="hover:text-white transition-colors">{crumb.label}</Link>
                  : <span className="text-(--text-primary)">{crumb.label}</span>
                }
              </Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-(--text-primary)">{title}</h1>
            {(description ?? subtitle) && (
              <p className="text-xs text-(--text-muted) mt-0.5">{description ?? subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {search}
            {actions ?? action}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
