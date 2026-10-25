import { useSearchParams } from 'react-router-dom';
import { POLICIES } from '../data/policies.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Policies() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('policy');
  const key = POLICIES[requested] ? requested : 'returns';
  const policy = POLICIES[key];
  useDocumentTitle(policy.title);

  return (
    <div className="section-wrap product-page-wrap">
      <div className="section-heading" style={{ marginBottom: 30 }}>
        <div><p className="eyebrow"><span></span> Customer Care &amp; Legal</p><h2>Store Policies</h2></div>
      </div>
      <div className="account-layout">
        <nav className="account-nav" aria-label="Policies">
          {Object.entries(POLICIES).map(([k, p]) => (
            <button key={k} type="button" className={k === key ? 'active' : ''} aria-current={k === key ? 'page' : undefined} onClick={() => setParams({ policy: k })}>
              {p.title.replace(/ (&|and) .*/, '').replace('Frequently Asked Questions', 'FAQ')}
            </button>
          ))}
        </nav>
        <div className="account-tab-content" style={{ lineHeight: 1.7 }}>
          <h2>{policy.title}</h2>
          {/* Static copy authored in src/data/policies.js (trusted content, no user input). */}
          <div style={{ marginTop: 20 }} dangerouslySetInnerHTML={{ __html: policy.html }} />
        </div>
      </div>
    </div>
  );
}
