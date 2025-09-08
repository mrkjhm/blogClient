"use client";

import axios, { AxiosError } from "axios";
import { AnimatePresence, motion } from 'framer-motion'; // 🆕 Added AnimatePresence
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import { Post } from "@/types/post";

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null); // 🆕 Track hovered card

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await axios.get<Post[]>(
          `${API_URL}/api/posts`
        );
        setPosts(result.data);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        console.error("Fetch error:", error);
        setError(error.response?.data?.message || error.message || "Unexpected error");
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [posts]);

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visiblePosts = posts.slice(startIndex, startIndex + pageSize);

  return (
    <Container className="mt-10">
      <motion.div className="space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="font-bold leading-[1.18] tracking-[-0.02em] text-[clamp(1rem,4vw+0.5rem,2rem)] text-center">
          All Post
        </motion.h1>

        {error && <p className="text-red-500">{error}</p>}

        {posts.length === 0 ? (
          <p className="text-center text-gray-500 my-10">No blog posts yet.</p>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-5 my-10">
            {visiblePosts.map((post, index) => (
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
                <Card className="p-5 relative hover:scale-102 transition-all duration-300">
                  <Link href={`/posts/${post.slug}`} className="block">
                    <div className="w-full aspect-[16/9] overflow-hidden rounded-lg">
                      <Image
                        src={post.imageUrl || "/images/post-placeholder.png"}
                        alt={post.title}
                        width={600}
                        height={400}
                        className="h-full w-full object-cover hover:scale-110 transition-all duration-300"
                      />
                    </div>
                  </Link>

                  {post.category && (
                    <CardDescription className="inline-block w-fit py-1 rounded-md text-blue-600 font-bold">
                      {post.category}
                    </CardDescription>
                  )}

                  <CardHeader className="mb-5">
                    <CardTitle className="line-clamp-1">
                      <Link href={`/posts/${post.slug}`} className="hover:underline inline w-auto">
                        {post.title}
                      </Link>
                    </CardTitle>
                    {post.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.description}
                      </p>
                    )}
                  </CardHeader>

                  {/* 🆕 Animated floating title shown only when hovered */}
                  <AnimatePresence>
                    {hoveredCard === post._id && (
                      <motion.div
                        initial={{ scale: 0.5, rotate: '0deg', opacity: 0 }}
                        animate={{ scale: 1, rotate: '-3deg', opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute z-10 top-0 -left-2"
                      >
                        <CardTitle className="bg-blue-600 px-5 py-2 rounded-md text-white shadow-lg">
                          <h1 className="text-2xl text-center">
                            {post.title}
                          </h1>
                        </CardTitle>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <CardFooter className="flex items-center justify-between text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-2 items-center">
                        <Avatar>
                          <AvatarImage
                            src={typeof post.author === 'object' ? (post.author.avatarUrl || "") : ""}
                            alt={typeof post.author === 'object' ? (post.author.name || "Avatar") : "Avatar"}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                          <AvatarFallback>{typeof post.author === 'object' ? post.author.name?.[0]?.toUpperCase() : 'Unknown'}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm">by: <span className="capitalize">{typeof post.author === 'object' ? post.author.name : 'Unknown Author'}</span></p>
                      </div>
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
        )}

        {posts.length > pageSize && (
          <div className="flex items-center justify-center gap-3 mt-4 mb-10">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        )}
      </motion.div>
    </Container>
  );
}
