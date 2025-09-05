"use client";
import { useRouter } from "next/navigation";

import { useUser } from "../../../contexts/UserContext";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();            // clear token and user state
    router.push("/login"); // redirect to login
  };

  return (
    <button
      onClick={handleLogout}
      className="hover:underline bg-primary text-white py-2 px-10 rounded-md mb-10 cursor-pointer"
    >
      Logout
    </button>
  );
}
