import {Link} from 'react-router-dom';
import {FiAlertCircle, FiPackage} from 'react-icons/fi';

export function BreadcrumbNavigation({items}) {
  return <nav className="breadcrumbs aisha-breadcrumbs" aria-label="Sahifa yo‘li">
    <ol>{items.map(item => <li key={item.label}>
      {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
    </li>)}</ol>
  </nav>;
}

export function ShopPageHeader({eyebrow, title, description, breadcrumbs, action}) {
  return <header className="aisha-page-header">
    {breadcrumbs?.length > 0 && <BreadcrumbNavigation items={breadcrumbs} />}
    <div className="aisha-page-header-copy">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="aisha-page-description">{description}</p>}
    </div>
    {action && <div className="aisha-page-header-action">{action}</div>}
  </header>;
}

export function SectionHeading({eyebrow, title, description, action, level = 2}) {
  const Heading = `h${level}`;
  return <div className="aisha-section-heading">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<Heading>{title}</Heading>
      {description && <p>{description}</p>}</div>
    {action && <div>{action}</div>}
  </div>;
}

export function PremiumCard({children, className = '', as: Element = 'section', ...props}) {
  return <Element className={`aisha-premium-card card ${className}`.trim()} {...props}>{children}</Element>;
}

export function EmptyState({icon: Icon = FiPackage, eyebrow = 'AISHA HOME', title, description, children}) {
  return <section className="aisha-state aisha-empty-state card" aria-labelledby="aisha-empty-title">
    <span className="aisha-state-icon"><Icon aria-hidden="true" focusable="false" /></span>
    <p className="eyebrow">{eyebrow}</p>
    <h2 id="aisha-empty-title">{title}</h2>
    {description && <p>{description}</p>}
    {children && <div className="aisha-state-action">{children}</div>}
  </section>;
}

export function ErrorState({title = 'Sahifani yuklab bo‘lmadi', message, children}) {
  return <section className="alert aisha-error-state" role="alert">
    <FiAlertCircle aria-hidden="true" focusable="false" />
    <div><h2>{title}</h2>{message && <p>{message}</p>}{children && <div className="aisha-state-action">{children}</div>}</div>
  </section>;
}

export function LoadingState({label = 'Yuklanmoqda', rows = 2}) {
  return <div className="aisha-loading-state" role="status" aria-label={label}>
    <span className="loading loading-spinner" aria-hidden="true" />
    <div className="aisha-loading-lines" aria-hidden="true">{Array.from({length: rows}, (_, i) => <span className="skeleton" key={i} />)}</div>
    <span className="sr-only">{label}…</span>
  </div>;
}

export function ProductSkeleton({count = 3}) {
  return <div className="catalog-grid aisha-skeleton-grid" role="status" aria-label="Mahsulotlar yuklanmoqda">
    {Array.from({length: count}, (_, i) => <article className="catalog-card card aisha-product-skeleton" aria-hidden="true" key={i}>
      <div className="skeleton aisha-skeleton-image" />
      <div className="aisha-skeleton-copy"><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></div>
    </article>)}
    <span className="sr-only">Mahsulotlar yuklanmoqda…</span>
  </div>;
}

export function OrderSummary({title = 'Buyurtma xulosasi', children, className = ''}) {
  return <aside className={`card aisha-order-summary ${className}`.trim()}>
    <div className="card-body"><h2>{title}</h2>{children}</div>
  </aside>;
}

export function StatusBadge({children}) {
  return <span className="badge badge-outline aisha-status-badge">{children}</span>;
}
