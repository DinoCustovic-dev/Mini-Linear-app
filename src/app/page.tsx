import { redirect } from 'next/navigation';

// TODO(ML-05): send logged-out users to /login instead
export default function HomePage() {
  redirect('/my-issues');
}
