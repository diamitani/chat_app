import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative rounded-md bg-muted p-2 my-2 overflow-x-auto">
                 <code className={className} {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre({children}) {
             return <pre className="bg-transparent p-0 m-0 overflow-visible">{children}</pre>;
          },
          ul({children}) {
            return <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>;
          },
          ol({children}) {
            return <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>;
          },
          table({children}) {
            return <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-border border">{children}</table></div>
          },
          th({children}) {
            return <th className="bg-muted px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">{children}</th>
          },
          td({children}) {
            return <td className="px-3 py-2 whitespace-nowrap text-sm border-b border-border/50">{children}</td>
          },
          blockquote({children}) {
             return <blockquote className="border-l-4 border-primary/20 pl-4 italic my-2">{children}</blockquote>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
