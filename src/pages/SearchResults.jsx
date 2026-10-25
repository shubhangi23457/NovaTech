import CatalogView from '../components/CatalogView.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function SearchResults() {
  useDocumentTitle('Search');
  return <CatalogView heading="Search products" eyebrow="Find your gear" />;
}
