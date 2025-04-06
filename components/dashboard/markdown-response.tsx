"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface MarkdownResponseProps {
  content: string;
}

const MarkdownResponse: React.FC<MarkdownResponseProps> = ({ content }) => {
  // More thorough preprocessing to handle different content formats
  const cleanContent = () => {
    if (!content) return "";

    // Strip enclosing quotes if present
    let processed = content.trim();
    if ((processed.startsWith('"') && processed.endsWith('"')) || 
        (processed.startsWith("'") && processed.endsWith("'"))) {
      processed = processed.slice(1, -1);
    }

    // Handle escaped newlines and literal newlines
    processed = processed.replace(/\\n/g, '\n');
    
    return processed;
  };
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              {...props}
              style={atomDark}
              wrapLongLines
              language={match[1]}
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          )
        },
        p: ({ children }) => <p className="mb-4">{children}</p>
      }}
      className="prose prose-invert max-w-none text-sm overflow-hidden break-words leading-7">
      {cleanContent()}
    </ReactMarkdown>
  )
}

export default MarkdownResponse;