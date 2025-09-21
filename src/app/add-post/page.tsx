"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import RichMarkdown from "@/components/markdown/RichMarkdown";
import Container from "@/components/ui/Container";

import { useUser } from "../../../contexts/UserContext";

export default function Page() {

  const router = useRouter();
  const { user } = useUser();


  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null); // ✅ keep file
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) return false;

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      if (e.target) e.target.value = "";
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);                                      // ✅ store file
    setImagePreview(file ? URL.createObjectURL(file) : "");
  }

  async function createPost(e: FormEvent<HTMLFormElement>) {

    const token = localStorage.getItem("accessToken");

    e.preventDefault();
    if (!API_URL) throw new Error("API URL not configured");
    if (!imageFile) throw new Error("Please select an image");
    if (imageFile.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("content", content);
    formData.append("imageUrl", imageFile);


    const res = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    // Block success when token is missing/invalid/expired
    if (res.status === 401 || res.status === 403) {
      toast.error("Unauthorized. Please login again.");
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err?.message
        || err?.error?.message
        || (res.status === 413 ? "Image too large. Max 5MB." : res.statusText)
        || "Create post unsuccessful";
      toast.error(message);
      return;
    }

    // Only reach here on success
    toast.success("Post created successfully!");
    setCategory("");
    setDescription("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setContent("");
    setTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <Container className="mt-10">
      <div className="max-w-4xl mx-auto px-4 prose prose-lg">
        <h1 className="font-bold leading-[1.18] tracking-[-0.02em] text-[clamp(1rem,4vw+0.5rem,2rem)] text-center">
          Add Post
        </h1>
        <div className="my-10">
          <form className="space-y-5" onSubmit={createPost}>
            <div className="flex flex-col gap-3">
              <label>Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category"
                className="border p-3 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Post Title"
                className="font-semibold text-[clamp(1rem,4vw+0.5rem,1.7rem)] border p-3 rounded-md"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label>Description:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter short description"
                className="border p-3 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition">
                <span className="text-gray-500 text-sm my-10">
                  {imagePreview ? "Change Image" : "Click to upload image"}
                </span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="max-h-64 rounded-md mb-10" />
                )}
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <label>Content (Markdown):</label>
              <RichMarkdown value={content} onChange={setContent} />
            </div>

            <button type="submit" className="bg-primary w-full py-3 text-white rounded-md">
              Create Post
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}
