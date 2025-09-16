import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function EmployeeByIdRedirect({ params }: { params: { id: string } }) {
  // Redirect from singular 'employee/[id]' to plural 'employees/[id]'
  redirect(`/dashboard/employees/${params.id}`);
}