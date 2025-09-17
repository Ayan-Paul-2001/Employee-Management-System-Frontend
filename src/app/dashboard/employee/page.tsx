import { redirect } from 'next/navigation';

export default function EmployeeRedirect() {
  // Use Next.js built-in redirect for server-side redirection
  redirect('/dashboard/employees');
}