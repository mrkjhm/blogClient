// app/blogs/[slug]/page.tsx
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PostBody from "@/components/markdown/PostBody";
import RichMarkdown from "@/components/markdown/RichMarkdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Container from "@/components/ui/Container";
import PostActions from "@/components/ui/PostActions";
import { Post } from "@/types/post";

import { useUser } from "../../../../contexts/UserContext";
import CommentsSection from "../../../components/comments/CommentsSection";

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PostPage({ params }: BlogPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  // Form state for editing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  // Image state for editing
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Normalize author (could be populated object, string id, or null)
  const author = (post && typeof post.author === 'object' && post.author !== null)
    ? (post.author as any)
    : null;

  // Check if user can modify this post
  const canModify = !!user && (
    user.isAdmin ||
    (author && user._id === author._id) ||
    (typeof post?.author === 'string' && user._id === post.author)
  );

  // Debug logging
  console.log('Post Page Debug:', {
    user: user ? { id: user._id, isAdmin: user.isAdmin } : null,
    postAuthor: author || post?.author,
    canModify
  });

  async function fetchPost() {
    try {
      const resolvedParams = await params;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/slug/${resolvedParams.slug}`,
        { next: { revalidate: 60 } }
      );

      if (!res.ok) {
        router.push('/404');
        return;
      }

      const postData: Post = await res.json();
      setPost(postData);
    } catch (error) {
      console.error("Error fetching post:", error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPost();
  }, [params, router]);

  const startEditing = () => {
    if (!post) return;
    setTitle(post.title);
    setDescription(post.description);
    setContent(post.content);
    setCategory(post.category);
    setSelectedImage(null);
    setImagePreview("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form to original values
    if (post) {
      setTitle(post.title);
      setDescription(post.description);
      setContent(post.content);
      setCategory(post.category);
      setSelectedImage(null);
      setImagePreview("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveChanges = async () => {
    if (!post) return;

    try {
      setUpdateLoading(true);
      const token = localStorage.getItem("accessToken");

      let imageUrl = post.imageUrl; // Keep existing image by default
      let imagePublicId = post.imagePublicId; // Keep existing public ID by default

      // If new image is selected, upload it first
      if (selectedImage) {
        const formData = new FormData();
        formData.append('imageUrl', selectedImage);
        formData.append('title', title);
        formData.append('postId', post._id);

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/upload-image`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({}));
          throw new Error(errorData.message || `Upload failed with status: ${uploadRes.status}`);
        }



        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      }

      // Update the post with new data including image
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            content,
            category,
            imageUrl,
            imagePublicId,
          }),
        }
      );

      if (res.status === 401 || res.status === 403) {
        toast.error("Unauthorized. Please login again.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to update post");
      }


      const updatedPost = await res.json();

      // Debug logging to see what we're getting from the API
      console.log('Updated Post Response:', updatedPost);
      console.log('Original Post:', post);

      // The backend now returns the complete populated post
      setPost(updatedPost);
      setIsEditing(false);
      toast.success("Post updated successfully!");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPost(updatedPost);
  };

  if (loading) {
    return (
      <Container className="py-10">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <Container className="py-10">
      <div className="space-y-4">
        <div className="max-w-4xl mx-auto px-4 py-8 prose prose-lg">
          <div className="flex justify-between items-center">
            {isEditing ? (
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#4B6BFB] inline-block  py-1 px-2 rounded-md text-white text-[12px]"
                placeholder="Category"
              />
            ) : (

              <p className="bg-[#4B6BFB] inline-block  py-1 px-2 rounded-md text-white text-[12px]">{post.category}</p>
            )}

            {canModify && (
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
                  >
                    Edit Post
                  </button>
                ) : (
                  <>
                    <button
                      onClick={saveChanges}
                      disabled={updateLoading}
                      className="bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {updateLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-600 text-white py-1 px-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <PostActions
                  post={post}
                  onUpdated={handlePostUpdated}
                  showEdit={false} // Hide edit button since we have our own
                  className="flex-shrink-0"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col my-7">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-bold leading-[1.18] tracking-[-0.02em] text-[clamp(1rem,4vw+0.5rem,2.5rem)] my-3 border-b-2 border-gray-300 outline-none focus:border-blue-500"
                placeholder="Post Title"
              />
            ) : (
              <h1 className="font-bold leading-[1.18] tracking-[-0.02em] text-[clamp(1rem,4vw+0.5rem,2.5rem)] my-3">{post.title}</h1>

            )}




            <div className="flex gap-6 items-center text-gray-500">
              <div className="flex gap-2 items-center">
                <Avatar>
                  {author?.avatarUrl ? (
                    <AvatarImage
                      src={author.avatarUrl}
                      alt={author.name || 'Unknown Author'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : null}
                  <AvatarFallback>{author?.name?.[0]?.toUpperCase?.() || 'U'}</AvatarFallback>
                </Avatar>
                <p className="capitalize">by: {author?.name || 'Unknown Author'}</p>
              </div>
              <div className="flex gap-3">
                <p className="text-sm">
                  <i className="ri-calendar-line mr-2"></i>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm">
                  <i className="ri-file-edit-line mr-2"></i>
                  Edited: {new Date(post.updatedAt || post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
          {isEditing ? (
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md  border-gray-300"
            />
          ) : (
            <p className="prose prose-lg max-w-none">{post.description}</p>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
              <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full rounded-2xl" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview:</label>
                  <Image src={imagePreview} alt="Preview" width={600} height={400} className="w-full rounded-2xl" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <Image src={post.imageUrl} alt={post.title} width={600} height={400} className="w-full rounded-2xl" />
        )}

        <div className="max-w-4xl mx-auto px-4 py-8">
          {isEditing ? (
            <RichMarkdown value={content} onChange={setContent} />
          ) : (
            <div className="prose prose-lg max-w-none">
              <PostBody markdown={post.content} />
            </div>
          )}
        </div>

      </div>

      {!isEditing && <CommentsSection postId={post._id} />}
    </Container>
  );
}
