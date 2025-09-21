'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useUser } from '../../../contexts/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useUser(); // ✅ use login from context

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // useEffect(() => {
  //   if (!isLoading && user) {
  //     router.push("/")
  //   }

  // }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login error';
      setError(message);
      toast.error(message);
    }
  };

  if (user) return null;

  const handleRegisterClick = () => {
    router.push('/register');
  };

  return (
    <main className="flex-1" >
      <div className="flex min-h-screen">
        <div className="relative hidden w-1/2 overflow-hidden [background:linear-gradient(146deg,var(--primary-50,rgba(231,244,253,0.20))_43.89%,var(--primary-200,rgba(18,142,232,0.20))_140.81%)] lg:block">
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-12">
            <h1 className="font-bold text-5xl">LOGO</h1>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="font-bold text-3xl">Welcome Back!</h1>
              <p>Log in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium leading-none">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete='email'
                  className="h-[44px] w-full text-base rounded-md border px-3"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium leading-none">Password</label>
                <input
                  type="password"
                  required
                  autoComplete='current-password'
                  className="h-[44px] w-full text-base rounded-md border px-3"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* <div className="flex items-center justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </a>
              </div> */}

              {/* {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )} */}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-white shadow-sm h-10 px-4 py-2 w-full"
              >
                Log in
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <span
                className="cursor-pointer text-primary underline hover:underline-offset-4"
                onClick={handleRegisterClick}
              >
                Sign up here
              </span>
            </p>
          </div>
        </div>
      </div>
    </main >
  );
}
