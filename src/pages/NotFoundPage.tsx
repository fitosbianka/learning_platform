import { Link } from '../router/Link';
import { strings } from '../ui/strings';

export function NotFoundPage() {
  return (
    <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
      <h1>{strings.notFound.title}</h1>
      <p>
        <Link to="/" className="btn btnPrimary">
          {strings.notFound.toDashboard}
        </Link>
      </p>
    </div>
  );
}
