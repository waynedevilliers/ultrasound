import { redirect } from 'next/navigation';

// German is the starting language. The middleware also defaults to German.
export default function RootPage() {
  redirect('/de');
}
