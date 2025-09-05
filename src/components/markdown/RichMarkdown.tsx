// components/RichMarkdown.tsx
"use client";

import dynamic from "next/dynamic";

// dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function RichMarkdown({
  value,
  onChange,
  height,
}: {
  value: string;
  onChange: (md: string) => void;
  height?: number;
}) {
  return (
    <div data-color-mode="light"> {/* or hook into your theme */}
      <MDEditor
        value={value}
        height={500}
        onChange={(v) => onChange(v ?? "")}
        commandsFilter={(cmd, isExtra) => {
          // Example: alisin 'image' at 'fullscreen'
          if (cmd.name === "image") {
            return false; // hide this command
          }
          return cmd; // keep others
        }}
      />

    </div>
  );
}
