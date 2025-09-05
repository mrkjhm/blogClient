"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Container from "@/components/ui/Container";
import LogoutButton from "@/components/ui/LogoutButton";

import { useUser } from "../../../contexts/UserContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "access";
const REFRESH_KEY = "refresh";

export default function AccountSettingsPage() {
  const { user, isLoadingUser, setUser } = useUser();

  // local state
  const [name, setName] = useState("");
  const [emailNew, setEmailNew] = useState("");
  const [emailPwd, setEmailPwd] = useState("");
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmailNew(user.email ?? "");
    }
  }, [user]);

  if (isLoadingUser) return <Container className="py-10">Loading…</Container>;
  if (!user) return <Container className="py-10">Not logged in.</Container>;


  const token = localStorage.getItem("accessToken")

  // 1) Update Name
  const submitName = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: name }),
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Update failed");
      setUser(data.user ?? data);
      toast.success("Name updated");
    } catch (err: any) {
      toast.error(err?.message || "Update failed");
    }
  };

  // 2) Update Avatar
  const submitAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl) return;
    try {
      const fd = new FormData();
      fd.append("avatarUrl", avatarUrl);
      const res = await fetch(`${API_URL}/api/users/${user._id}/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type
        body: fd,
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please login again.");
        return;
      }


      if (!res.ok) throw new Error(data?.message || "Upload failed");
      setUser(data.user ?? data);
      setAvatarUrl(null);
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    }
  };

  // 3) Change Email (rotates tokens)
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}/change-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: emailPwd, newEmail: emailNew.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Change email failed");

      // tokens may rotate
      if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);

      // backend doesn’t always return user; optionally refetch /me here if needed
      toast.success("Email changed. Please verify your email if required.");
      setEmailPwd("");
    } catch (err: any) {
      toast.error(err?.message || "Change email failed");
    }
  };

  // 4) Change Password (rotates tokens)
  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdNew !== pwdConfirm) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/users/${user._id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: pwdCurrent,
          newPassword: pwdNew,
          confirmNewPassword: pwdConfirm,
        }),
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Change password failed");

      // tokens may rotate
      if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);

      toast.success("Password changed");
      setPwdCurrent(""); setPwdNew(""); setPwdConfirm("");
    } catch (err: any) {
      toast.error(err?.message || "Change password failed");
    }
  };

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="text-center space-y-2">
          <h1 className="font-bold leading-[1.18] tracking-[-0.02em] text-[clamp(1rem,4vw+0.5rem,2rem)] text-center">
            Account Settings
          </h1>
          <p className="text-sm text-gray-500">Manage your profile and security</p>
        </header>

        {/* Avatar */}
        <section className="rounded-lg border p-4 space-y-4">
          <h2 className="font-semibold">Avatar</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl} alt={user.name || "Avatar"} />
              <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <form onSubmit={submitAvatar} className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={(e) => setAvatarUrl(e.target.files?.[0] ?? null)} />
              <button
                type="submit"
                disabled={!avatarUrl}
                className="rounded-md bg-black text-white px-3 py-2 disabled:opacity-50"
              >
                Update Avatar
              </button>
            </form>
          </div>
        </section>

        {/* Name */}
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Display Name</h2>
          <form onSubmit={submitName} className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2"
              placeholder="Your name"
            />
            <button className="rounded-md bg-black text-white px-3 py-2">Save</button>
          </form>
        </section>

        {/* Email */}
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Email</h2>
          <form onSubmit={submitEmail} className="grid gap-3 sm:grid-cols-2">
            <input
              type="email"
              value={emailNew}
              onChange={(e) => setEmailNew(e.target.value)}
              className="rounded-md border px-3 py-2 sm:col-span-2"
              placeholder="New email"
            />
            <input
              type="password"
              value={emailPwd}
              onChange={(e) => setEmailPwd(e.target.value)}
              className="rounded-md border px-3 py-2 sm:col-span-2"
              placeholder="Current password (to confirm)"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button className="rounded-md bg-black text-white px-3 py-2">Change Email</button>
            </div>
          </form>
          <p className="text-xs text-gray-500">
            Changing email will sign out other sessions (token rotation).
          </p>
        </section>

        {/* Password */}
        <section className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold">Password</h2>
          <form onSubmit={submitPassword} className="grid gap-3 sm:grid-cols-2">
            <input
              type="password"
              value={pwdCurrent}
              onChange={(e) => setPwdCurrent(e.target.value)}
              className="rounded-md border px-3 py-2 sm:col-span-2"
              placeholder="Current password"
            />
            <input
              type="password"
              value={pwdNew}
              onChange={(e) => setPwdNew(e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="New password"
            />
            <input
              type="password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="Confirm new password"
            />
            <div className="sm:col-span-2 flex justify-end">
              <button className="rounded-md bg-black text-white px-3 py-2">
                Change Password
              </button>
            </div>
          </form>
          <p className="text-xs text-gray-500">
            Changing password will revoke old tokens (you may be asked to re-login on other devices).
          </p>
        </section>
        <div>

          <LogoutButton />
        </div>
      </div>

    </Container>
  );
}
