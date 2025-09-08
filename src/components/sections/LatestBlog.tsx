// components/home/LatestBlog.tsx
"use client";

import { AnimatePresence, motion } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import { Post } from "@/types/post";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function LatestBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);



  const API_URL = process.env.NEXT_PUBLIC_API_URL;



  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load posts");
        const data = (await res.json()) as Post[];

        // ✅ Sort newest first and take only 3
        const latestPost = [...data]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(1, 4);

        setPosts(latestPost);
      } catch (e: any) {
        setError(e?.message || "Failed to load latest posts");
      }
    })();
  }, [API_URL]);

  return (
    <Container className="p-10">
      <motion.div
        initial='initial'
        whileHover='whileHover'
        className='space-y-6'
      >

      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="font-bold leading-[1.18] tracking-[-0.02em] text-[clamp(1rem,4vw+0.5rem,2rem)] text-center"
      >
        Latest Post
      </motion.h1>

      {error && <p className="text-center text-red-500 mt-6">{error}</p>}

      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 my-10">
        {posts.map((post, index) => (
          // ✅ Wrap each Card in motion.div for individual animation
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 * index, // ✅ Add stagger delay based on index
              duration: 0.3,
              ease: "easeOut"
            }}
            onMouseEnter={() => setHoveredCard(post._id)} // 🆕 Set hover
            onMouseLeave={() => setHoveredCard(null)}     // 🆕 Clear hover
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-5 hover:scale-102 transition-all duration-300">
              <Link href={`/posts/${post.slug}`} className="block">
                <div className="w-full aspect-[16/9] overflow-hidden rounded-lg">
                  <Image
                    src={post.imageUrl || "/images/post-placeholder.png"}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover hover:scale-105 transition-all duration-300"
                  />
                </div>
              </Link>

              <CardHeader>
                {post.category && (
                  <CardDescription className="inline-block w-fit py-1 rounded-md text-blue-600 font-bold">
                    {post.category}
                  </CardDescription>
                )}
                <CardTitle className="line-clamp-1">
                  <Link href={`/posts/${post.slug}`} className="hover:underline inline w-auto">
                    {post.title}
                  </Link>
                </CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
              </CardHeader>

              <AnimatePresence>
                {hoveredCard === post._id && (
                  <motion.div
                    initial={{ scale: 0.5, rotate: '0deg', opacity: 0 }}
                    animate={{ scale: 1, rotate: '-5deg', opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute z-10 top-0 left-0"
                  >
                    <CardTitle className="bg-blue-600 px-5 py-2 rounded-md text-white shadow-lg">
                      <h1 className="text-2xl text-center">
                        {post.title}
                      </h1>
                    </CardTitle>
                  </motion.div>
                )}
              </AnimatePresence>

              <CardFooter className="flex gap-2 justify-between mt-4 text-gray-400">
                <div className="flex gap-2 items-center">
                  <div className="h-10 w-10 flex justify-center items-center rounded-full overflow-hidden bg-gray-100">
                    <Avatar>
                      <AvatarImage
                        src={typeof post.author === 'object' ? (post.author.avatarUrl || "") : ""}
                        alt={typeof post.author === 'object' ? (post.author.name || "Avatar") : "Avatar"}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                      <AvatarFallback>
                        {typeof post.author === 'object' ? post.author.name?.[0]?.toUpperCase?.() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-sm">
                    by: <span className="capitalize">
                      {typeof post.author === "object" && post.author ? post.author.name : "Unknown Author"}
                    </span>
                  </p>
                </div>
                <p className="text-sm">
                  <i className="ri-calendar-line mr-2"></i>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/posts"
          className="text-center px-4 py-2 border rounded-md border-gray-300 inline-block hover:bg-primary hover:text-white transition-all duration-300"
        >
          View All Post
        </Link>
      </div>
    </Container>
  );
}


