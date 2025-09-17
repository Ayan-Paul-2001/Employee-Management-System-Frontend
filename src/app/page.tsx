import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-6 text-center">Employee Management System</h1>
          <p className="text-xl mb-8 text-center">A comprehensive system for managing employees, attendance, leave requests, and notices</p>
          
          <div className="flex gap-4">
            <Link href="/login" className="btn btn-primary">
              Login
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Register
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}