import React from 'react';
import PropTypes from 'prop-types';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

export const remarkPlugins = [remarkGfm];

/**
 * Table Component for Markdown
 */
const Table = ({ children, ...props }) => (
  <div className="w-full overflow-x-auto my-8 rounded-lg border border-gray-300 dark:border-gray-700">
    <table className="w-full border-collapse" {...props}>
      {children}
    </table>
  </div>
);

Table.propTypes = {
  children: PropTypes.node,
};

/**
 * Table Head Component
 */
const TableHead = ({ children, ...props }) => (
  <thead className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600" {...props}>
    {children}
  </thead>
);

TableHead.propTypes = {
  children: PropTypes.node,
};

/**
 * Table Row Component
 */
const TableRow = ({ children, ...props }) => (
  <tr className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" {...props}>
    {children}
  </tr>
);

TableRow.propTypes = {
  children: PropTypes.node,
};

/**
 * Table Header Cell Component
 */
const TableHeaderCell = ({ children, ...props }) => (
  <th className="text-left px-4 py-3 font-bold text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700" {...props}>
    {children}
  </th>
);

TableHeaderCell.propTypes = {
  children: PropTypes.node,
};

/**
 * Table Data Cell Component
 */
const TableDataCell = ({ children, ...props }) => (
  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700" {...props}>
    {children}
  </td>
);

TableDataCell.propTypes = {
  children: PropTypes.node,
};

/**
 * Code Block Component with Copy Button
 */
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!inline && match) {
    return (
      <div className="relative group">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded bg-gray-700 hover:bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Copy code"
        >
          {copied ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          className="rounded-lg"
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className={`${className} bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
      {children}
    </code>
  );
};

CodeBlock.propTypes = {
  node: PropTypes.object,
  inline: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Full markdown components configuration for main blog display
 * Includes all elements with complete styling
 */
export const fullMarkdownComponents = {
  code: CodeBlock,
  h1: ({ children, ...props }) => <h1 className="text-4xl font-bold mb-6 mt-12 text-gray-900 dark:text-white leading-tight scroll-mt-20" {...props}>{children}</h1>,
  h2: ({ children, ...props }) => <h2 className="text-3xl font-bold mb-6 mt-14 pt-2 border-b border-gray-200 dark:border-gray-700 pb-3 text-gray-900 dark:text-white" {...props}>{children}</h2>,
  h3: ({ children, ...props }) => <h3 className="text-2xl font-bold mb-4 mt-10 text-gray-900 dark:text-white" {...props}>{children}</h3>,
  h4: ({ children, ...props }) => <h4 className="text-xl font-bold mb-3 mt-8 text-gray-900 dark:text-white" {...props}>{children}</h4>,
  h5: ({ children, ...props }) => <h5 className="text-base font-bold mb-2 mt-4 text-gray-900 dark:text-white" {...props}>{children}</h5>,
  h6: ({ children, ...props }) => <h6 className="text-sm font-bold mb-2 mt-4 text-gray-900 dark:text-white" {...props}>{children}</h6>,
  p: ({ children, ...props }) => <p className="mb-6 mt-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props}>{children}</p>,
  a: ({ children, href, ...props }) => <a href={href} className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium" {...props}>{children}</a>,
  ul: ({ children, ...props }) => <ul className="list-disc list-inside mb-6 mt-6 space-y-2 text-gray-700 dark:text-gray-300 ml-4" {...props}>{children}</ul>,
  ol: ({ children, ...props }) => <ol className="list-decimal list-inside mb-6 mt-6 space-y-2 text-gray-700 dark:text-gray-300 ml-4" {...props}>{children}</ol>,
  li: ({ children, ...props }) => <li className="mb-2" {...props}>{children}</li>,
  blockquote: ({ children, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-5 italic my-6 bg-blue-50 dark:bg-blue-900/10 py-3 pr-4 rounded-r text-gray-600 dark:text-gray-400" {...props}>{children}</blockquote>,
  strong: ({ children, ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props}>{children}</strong>,
  em: ({ children, ...props }) => <em className="italic text-gray-700 dark:text-gray-300" {...props}>{children}</em>,
  img: ({ src, alt, ...props }) => (
    <img src={src} alt={alt} className="rounded-lg shadow-lg my-8 border border-gray-200 dark:border-gray-700 w-full" {...props} />
  ),
  hr: () => <hr className="my-10 border-t-2 border-gray-300 dark:border-gray-600" />,
  table: Table,
  thead: TableHead,
  tr: TableRow,
  th: TableHeaderCell,
  td: TableDataCell,
};

/**
 * Compact markdown components for preview displays (new/edit pages)
 * Similar styling but slightly smaller for preview context
 */
export const previewMarkdownComponents = {
  code: CodeBlock,
  h1: ({ children, ...props }) => <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white mt-6" {...props}>{children}</h1>,
  h2: ({ children, ...props }) => <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white mt-8 pt-4 border-b border-gray-200 dark:border-gray-700 pb-2" {...props}>{children}</h2>,
  h3: ({ children, ...props }) => <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white mt-6" {...props}>{children}</h3>,
  h4: ({ children, ...props }) => <h4 className="text-base font-bold mb-2 text-gray-900 dark:text-white mt-4" {...props}>{children}</h4>,
  h5: ({ children, ...props }) => <h5 className="text-sm font-bold mb-2 text-gray-900 dark:text-white mt-4" {...props}>{children}</h5>,
  h6: ({ children, ...props }) => <h6 className="text-xs font-bold mb-2 text-gray-900 dark:text-white mt-4" {...props}>{children}</h6>,
  p: ({ children, ...props }) => <p className="mb-6 mt-4 leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300" {...props}>{children}</p>,
  ul: ({ children, ...props }) => <ul className="list-disc list-inside mb-6 mt-6 space-y-2 text-gray-700 dark:text-gray-300 ml-4" {...props}>{children}</ul>,
  ol: ({ children, ...props }) => <ol className="list-decimal list-inside mb-6 mt-6 space-y-2 text-gray-700 dark:text-gray-300 ml-4" {...props}>{children}</ol>,
  li: ({ children, ...props }) => <li className="mb-2" {...props}>{children}</li>,
  blockquote: ({ children, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-5 italic my-6 bg-blue-50 dark:bg-blue-900/10 py-3 pr-4 rounded-r text-gray-600 dark:text-gray-400" {...props}>{children}</blockquote>,
  strong: ({ children, ...props }) => <strong className="font-bold text-gray-900 dark:text-white" {...props}>{children}</strong>,
  em: ({ children, ...props }) => <em className="italic text-gray-700 dark:text-gray-300" {...props}>{children}</em>,
  table: Table,
  thead: TableHead,
  tr: TableRow,
  th: TableHeaderCell,
  td: TableDataCell,
};
