"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownResponseProps {
  content: string;
}

const MarkdownResponse: React.FC<MarkdownResponseProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words text-sm overflow-hidden"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        code({ node, className, children, ...props }) {
          const childArray = React.Children.toArray(children);
          const firstChild = childArray[0];
          
          // Handle inline code blocks (single line without language specification)
          if (
            typeof firstChild === "string" &&
            !firstChild.includes("\n")
          ) {
            return (
              <code className={className} {...props}>
                {childArray}
              </code>
            )
          }

          // Extract language from className
          const match = /language-(\w+)/.exec(className || '')
          
          return (
            <SyntaxHighlighter
              style={atomDark as any}
              language={(match && match[1]) || ""}
              wrapLongLines
              PreTag="div"
              {...props}
            >
              {String(childArray).replace(/\n$/, '')}
            </SyntaxHighlighter>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownResponse;