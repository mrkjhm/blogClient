"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Post } from "@/types/post";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Container from "../ui/Container";

export default function Hero() {

  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load posts");
        const data = (await res.json()) as Post[];

        // ✅ Sort newest first and take only 3
        const latestPost = [...data]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 1);

        setPosts(latestPost);
      } catch (e: any) {
        setError(e?.message || "Failed to load latest posts");
      }
    })();
  }, [API_URL]);

  return (

    <div className="py-5 bg-gray-200">
      <Container>


        <div className="relative my-20">
          {posts.map((post) => (
            <div key={post._id}>
              <div className="lg:flex gap-5">
                <Link href={`/posts/${post.slug}`} className="block">
                  <div className="object-cover overflow-hidden rounded-lg lg:mb-0 mb-6">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="lg:w-180 w-full hover:scale-102 transition-all duration-300"
                    />
                  </div>
                </Link>
                <div className="lg:w-1/2 w-full space-y-7">
                  <p className="inline-block w-fit py-1  rounded-md text-blue-600 font-bold">
                    {post.category}
                  </p>
                  <h1 className=" font-bold leading-[1.18] tracking-[-0.02em]  text-[clamp(1rem,2vw+0.5rem,2rem)]">
                    <Link href={`/posts/${post.slug}`} className="inline w-auto hover:underline ">
                      {post.title}
                    </Link>
                  </h1>
                  <p>{post.description}</p>
                  <div className="flex gap-4 items-center mt-4 text-gray-500">
                    <div className="flex gap-3 items-center">
                      <div className="h-10 w-10 items-center flex justify-center rounded-full overflow-hidden bg-gray-100">
                        <Avatar>
                          <AvatarImage
                            src={typeof post.author === 'object' ? (post.author.avatarUrl || "") : ""}
                            alt={typeof post.author === 'object' ? (post.author.name || "Avatar") : "Avatar"}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                          <AvatarFallback>{typeof post.author === 'object' ? post.author.name?.[0]?.toUpperCase?.() : 'Unknown'}</AvatarFallback>
                        </Avatar>
                      </div>
                      <p><span className="capitalize">{typeof post.author === "object" && post.author ? post.author.name : "Unknown Author"}</span></p>
                    </div>
                    <p className="text-sm">
                      <i className="ri-calendar-line mr-2"></i>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}

        </div>


        {/* <div className="relative">
        {posts.map((post) => (
          <Card key={post._id}>
            <Link href={`/posts/${post.slug}`} className="block">
              <div className="object-cover overflow-hidden rounded-lg">

                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={600}
                  height={400}
                  className="w-full hover:scale-102 transition-all duration-300"
                />
              </div>
            </Link>
            <div className="sm:absolute bg-white md:p-10 p-5 -bottom-10 md:left-10  md:w-1/2 w-full rounded-lg shadow-lg space-y-3">
              <p className="inline-block w-fit py-1  rounded-md text-blue-600 font-bold">
                {post.category}
              </p>
              <h1 className=" font-bold leading-[1.18] tracking-[-0.02em]  text-[clamp(1rem,2vw+0.5rem,2rem)]">
                <Link href={`/posts/${post.slug}`} className="inline w-auto hover:underline ">
                  {post.title}
                </Link>
              </h1>
              <p>{post.description}</p>
              <div className="flex gap-3 justify-between items-center mt-4 text-gray-400">
                <div className="flex gap-2 items-center">
                  <div className="h-10 w-10 items-center flex justify-center rounded-full overflow-hidden bg-gray-100">
                    <Avatar>
                      <AvatarImage
                        src={typeof post.author === 'object' ? (post.author.avatarUrl || "") : ""}
                        alt={typeof post.author === 'object' ? (post.author.name || "Avatar") : "Avatar"}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      <AvatarFallback>{typeof post.author === 'object' ? post.author.name?.[0]?.toUpperCase?.() : 'Unknown'}</AvatarFallback>
                    </Avatar>
                  </div>
                  <p>by: <span className="capitalize">{typeof post.author === "object" && post.author ? post.author.name : "Unknown Author"}</span></p>
                </div>
                <p className="text-sm">
                  <i className="ri-calendar-line mr-2"></i>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div> */}

      </Container>
    </div>

  );
}

