import { Navigate } from 'react-router';

// GitHub activity now lives inside the Projects page. Old links keep working.
export default function Activity() {
  return <Navigate to="/projects#activity" replace />;
}
