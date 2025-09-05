"use client";
import MarkdownPreview from "@uiw/react-markdown-preview";
import remarkGfm from "remark-gfm";

export default function PostBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <MarkdownPreview source={markdown} remarkPlugins={[remarkGfm]} style={{
        backgroundColor: "white", // gawing white background
        color: "black",           // gawing black text
      }} />
    </div>
  );
}
