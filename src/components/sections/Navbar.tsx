"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useUser } from "../../../contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const Navbar = () => {
  const { user, isLoadingUser } = useUser();
  const pathname = usePathname();

  const menu = user
    ? [
      { label: "Post", href: "/posts" },
      { label: "Add Post", href: "/add-post" },
    ]
    : [
      { label: "Post", href: "/posts" },
      { label: "Login", href: "/login" },
    ];

  return (
    <nav className=" px-4 shadow-sm">
      <div className="mx-auto max-w-[1400px] flex h-24 items-center justify-between ">
        <Link href="/">
          <Image src="/BlogLogo.png" alt="blog logo" width={100} height={50}
            className="sm:w-30 w-20"
          />
        </Link>

        <div className="flex items-center sm:gap-6 gap-3 sm:text-base text-[12px]">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "font-bold" : ""}
            >
              {item.label}
            </Link>
          ))}

          {/* Keep layout stable while loading user */}
          {isLoadingUser ? (
            <div className="flex items-center gap-2" style={{ width: 120 }}>
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
          ) : user ? (
            <Link href={"/about"}>
              <div className="flex gap-2 items-center">
                <p className="font-bold capitalize">{user.name}</p>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user.avatarUrl || "/images/avatar-placeholder.png"}
                    alt={user.name || "Avatar"}
                  />
                  <AvatarFallback>{user.name?.[0]?.toUpperCase?.() || "U"}</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          ) : null}

          {/* {user && <LogoutButton />} */}
        </div>
      </div>
    </nav>
  );
};
