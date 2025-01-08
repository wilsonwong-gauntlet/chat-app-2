import { FileIcon, Download } from 'lucide-react';

interface FileAttachmentProps {
  fileName: string;
  fileUrl: string;
}

export const FileAttachment = ({ fileName, fileUrl }: FileAttachmentProps) => {
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-zinc-800/50 max-w-xs">
      <FileIcon className="h-10 w-10" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {fileName}
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-500 hover:underline"
        >
          Download
        </a>
      </div>
    </div>
  );
}; 