import {useMemo, useState} from 'react';
import {useCatalog} from '../../hooks/useCatalog.js';
import {emptyFilters, filterCatalog, facets} from '../../services/catalog-filter.js';
import ProductCard from '../../components/shop/ProductCard.jsx';
import {ErrorState, ProductSkeleton, SectionHeading, ShopPageHeader} from '../../components/shop/ShopUI.jsx';
import {FiArrowRight, FiFilter, FiSearch, FiX} from 'react-icons/fi';

const filterGroups = [['category', 'Kategoriya'], ['color', 'Rang'], ['size', 'O‘lcham'], ['material', 'Material'], ['gsm', 'GSM / zichlik']];

export default function Catalog() {
  const {loading, products, error, retry} = useCatalog();
  const [filters, setFilters] = useState({...emptyFilters});
  const [open, setOpen] = useState(false);
  const result = useMemo(() => filterCatalog(products, filters), [products, filters]);
  const options = useMemo(() => facets(products), [products]);
  const set = (key, value) => setFilters(old => ({...old, [key]: value}));
  const active = Object.keys(emptyFilters).some(key => filters[key] !== emptyFilters[key]);

  return <section className="catalog-section aisha-inner-page is-catalog">
    <ShopPageHeader
      eyebrow="AISHA HOME · DEMO KATALOG"
      title="Sochiqlar"
      description="Rang, o‘lcham, material va narx bo‘yicha o‘zingizga mos variantlarni toping."
      breadcrumbs={[{label: 'Bosh sahifa', to: '/'}, {label: 'Katalog'}]}
    />

    <div className="aisha-catalog-toolbar">
      <label className="aisha-search-field input input-bordered">
        <FiSearch aria-hidden="true" focusable="false" />
        <span className="sr-only">Mahsulot qidirish</span>
        <input name="catalog-query" type="search" autoComplete="off" value={filters.query} onChange={e => set('query', e.target.value)} placeholder="Mahsulot nomi bo‘yicha qidirish…" />
      </label>
      <label className="aisha-sort-field">
        <span>Saralash</span>
        <select className="select select-bordered" value={filters.sort} onChange={e => set('sort', e.target.value)}>
          <option value="name">Nom bo‘yicha</option>
          <option value="price-asc">Narx: arzondan</option>
          <option value="price-desc">Narx: qimmatdan</option>
        </select>
      </label>
    </div>

    <div className="aisha-catalog-layout drawer drawer-end">
      <div className="catalog-results drawer-content">
        <div className="aisha-results-heading" aria-live="polite">
          <SectionHeading eyebrow="TANLANGAN TO‘PLAM" title="Katalog" description={loading ? 'Mahsulotlar yuklanmoqda' : `${result.length} ta mahsulot topildi`} />
          <button className="aisha-filter-trigger btn btn-outline" type="button" aria-expanded={open} aria-controls="catalog-filters" onClick={() => setOpen(value => !value)}>
            <FiFilter aria-hidden="true" focusable="false" /> Filtrlar {active && <span className="badge badge-sm">Faol</span>}
          </button>
        </div>

        {loading ? <ProductSkeleton count={3} /> : error ? <ErrorState title="Katalogni yuklab bo‘lmadi" message={error}><button className="btn btn-outline" type="button" onClick={retry}>Qayta urinish <FiArrowRight aria-hidden="true" focusable="false" /></button></ErrorState> : <>
          {active && <div className="aisha-active-filters"><span>Tanlangan mezonlar</span><button className="btn btn-ghost btn-sm" type="button" onClick={() => setFilters({...emptyFilters})}>Tozalash <FiX aria-hidden="true" focusable="false" /></button></div>}
          {result.length ? <div className="catalog-grid">{result.map(product => <ProductCard key={product.id} product={product} variant="collection" />)}</div> : <div className="aisha-no-results"><p className="eyebrow">NATIJALAR</p><h2>Mahsulot topilmadi</h2><p>Qidiruv so‘zi yoki tanlangan filtrlarni o‘zgartirib ko‘ring.</p>{active && <button className="btn btn-outline" type="button" onClick={() => setFilters({...emptyFilters})}>Filtrlarni tozalash</button>}</div>}
        </>}
      </div>

      <aside id="catalog-filters" className={`catalog-filters drawer-side ${open ? 'is-open' : ''}`} aria-label="Mahsulot filtrlari">
        {open && <button className="drawer-overlay aisha-filter-backdrop" type="button" aria-label="Filtrlarni yopish" onClick={() => setOpen(false)} />}
        <div className="aisha-filter-sheet card">
          <div className="aisha-filter-heading"><div><p className="eyebrow">ANIQ TANLOV</p><h2>Filtrlar</h2></div><button className="btn btn-ghost btn-square aisha-filter-close" type="button" aria-label="Filtrlarni yopish" onClick={() => setOpen(false)}><FiX aria-hidden="true" focusable="false" /></button></div>
          {filterGroups.map(([key, label]) => <details className="collapse collapse-arrow aisha-filter-group" key={key}>
            <summary className="collapse-title">{label}</summary>
            <div className="collapse-content"><fieldset className="fieldset"><legend className="fieldset-legend">{label}ni tanlang</legend><select className="select select-bordered" aria-label={`${label} bo‘yicha filtr`} value={filters[key]} onChange={e => set(key, e.target.value)}><option value="">Barchasi</option>{options[key].map(value => <option key={value} value={value}>{value}</option>)}</select></fieldset></div>
          </details>)}
          <details className="collapse collapse-arrow aisha-filter-group">
            <summary className="collapse-title">Narx oralig‘i</summary>
            <div className="collapse-content"><fieldset className="fieldset"><legend className="fieldset-legend">Minimal narx</legend><input className="input input-bordered" aria-label="Minimal narx" name="minimum-price" type="number" inputMode="numeric" autoComplete="off" min="0" value={filters.min} onChange={e => set('min', e.target.value)} /></fieldset><fieldset className="fieldset"><legend className="fieldset-legend">Maksimal narx</legend><input className="input input-bordered" aria-label="Maksimal narx" name="maximum-price" type="number" inputMode="numeric" autoComplete="off" min="0" value={filters.max} onChange={e => set('max', e.target.value)} /></fieldset></div>
          </details>
          <label className="aisha-availability checkbox-row"><input className="checkbox" type="checkbox" checked={filters.available} onChange={e => set('available', e.target.checked)} /><span>Faqat mavjud mahsulotlar</span></label>
          <div className="aisha-filter-actions"><button className="btn btn-ghost" type="button" onClick={() => setFilters({...emptyFilters})} disabled={!active}>Tozalash</button><button className="btn btn-primary" type="button" onClick={() => setOpen(false)}>Natijalarni ko‘rish</button></div>
        </div>
      </aside>
    </div>
  </section>;
}
