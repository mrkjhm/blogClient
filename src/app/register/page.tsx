'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useUser } from "../../../contexts/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoadingUser } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoadingUser && user) {
      router.push("/")
    }
  }, [user, isLoadingUser, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!avatarUrl) {
      toast.error('Avatar is required');
      return;
    }

    try {
      await register(name, email, password, avatarUrl);
      router.push('/')

    } catch (err: any) {
      setError(err.message || "Registration Failed")
    }

  }

  if (user) return null;

  const handleLoginClick = () => {
    router.push('/login')
  }

  return (
    <main className="flex-1">
      <div className="flex min-h-screen">

        <div className="relative hidden w-1/2 overflow-hidden [background:linear-gradient(146deg,var(--primary-50,rgba(231,244,253,0.20))_43.89%,var(--primary-200,rgba(18,142,232,0.20))_140.81%)] lg:block">
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-12">
            <h1 className="font-bold text-5xl">LOGO</h1>
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
          <div className="w-full max-w-md space-y-8">
            {/* text */}
            <div className="text-center">
              <h1 className="font-bold text-3xl">Create Account!</h1>
              <p>Enter your information to get started</p>
            </div>
            {/* form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium leading-none">Name</label>
                <input
                  type="text"
                  required
                  autoComplete='name'
                  className="h-[44px] w-full text-base rounded-md border px-3"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium leading-none">Email</label>
                <input
                  type="email"
                  required
                  autoComplete='email'
                  className="h-[44px] w-full text-base rounded-md border px-3"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium leading-none">Password</label>
                <input
                  type="password"
                  required
                  autoComplete='email'
                  className="h-[44px] w-full text-base rounded-md border px-3"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium leading-none">Confirm Password</label>
                <input
                  type="password"
                  required
                  autoComplete='email'
                  className="h-[44px] w-full text-base rounded-md border px-3"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium leading-none">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  className="h-[44px] w-full text-base rounded-md border px-3 py-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAvatarUrl(file);
                  }}
                />
              </div>
              {/* <div className="flex items-center justify-end">
                <a href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">Forgot password?
                </a>
              </div> */}

              {/* {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )} */}


              <button
                type="submit"
                className=" items-center justify-center gap-2  rounded-md text-sm font-medium bg-primary text-white shadow-sm h-10 px-4 py-2 w-full"
              >Create account</button>
            </form>
            <p className="text-center text-sm text-muted-foreground" >Already have an account? <span className="cursor-pointer text-primary underline hover:underline-offset-4" onClick={handleLoginClick}>Sign in</span></p>
          </div>
        </div>
      </div>
    </main>
  )
}
