import CatalogView from '../components/CatalogView.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Products() {
  useDocumentTitle('All products');
  return <CatalogView heading="All products" eyebrow="Shop the catalog" />;
}
