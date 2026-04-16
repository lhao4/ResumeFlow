import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('markdown-body prose prose-slate max-w-none', className)}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
