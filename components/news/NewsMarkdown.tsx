"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightNode(node: React.ReactNode, q: string): React.ReactNode {
  if (!q) return node;

  if (typeof node === "string") {
    const query = q.trim();
    if (!query) return node;

    const re = new RegExp(`(${escapeRegExp(query)})`, "gi");
    const parts = node.split(re);

    return parts.map((p, idx) =>
      p.match(re) ? (
        <mark
          key={idx}
          className="rounded bg-yellow-200/80 px-1 py-0.5 text-slate-900"
        >
          {p}
        </mark>
      ) : (
        <React.Fragment key={idx}>{p}</React.Fragment>
      )
    );
  }

  if (Array.isArray(node)) {
    return node.map((n, i) => (
      <React.Fragment key={i}>{highlightNode(n, q)}</React.Fragment>
    ));
  }

  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    const children = el.props.children;

    if (!children) return el;

    return React.cloneElement(
      el,
      undefined,
      highlightNode(children, q)
    );
  }

  return node;
}

export default function NewsMarkdown({
  content,
  highlight,
}: {
  content: string;
  highlight?: string;
}) {
  const q = (highlight || "").trim();

  return (
    <div className="prose prose-slate max-w-none dark:prose-invert prose-img:rounded-xl prose-headings:scroll-mt-28">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{highlightNode(children, q)}</p>,
          li: ({ children }) => <li>{highlightNode(children, q)}</li>,
          h1: ({ children }) => <h1>{highlightNode(children, q)}</h1>,
          h2: ({ children }) => <h2>{highlightNode(children, q)}</h2>,
          h3: ({ children }) => <h3>{highlightNode(children, q)}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20">
              {highlightNode(children, q)}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
