import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";

/**
 * Renders a tutor chat reply's markdown (bold, lists, inline code, LaTeX)
 * instead of printing raw "**text**" asterisks - previously these bubbles
 * used a plain <p>, so every bolded term/step in an AI answer showed up as
 * literal markdown syntax instead of formatted text. Compact spacing is
 * tuned for a small chat-bubble footprint, not the full lesson page.
 */
export function ChatMarkdown({ content }: { content: string }) {
  return (
    <div
      className="prose prose-sm max-w-none break-words
        [&>*]:my-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
        [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5
        [&_strong]:font-bold [&_strong]:text-slate-900
        [&_code]:text-[11px] [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:before:content-none [&_code]:after:content-none
        [&_pre]:my-2 [&_pre]:p-2.5 [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:overflow-x-auto [&_pre]:text-[11px]"
    >
      <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeRaw, rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
