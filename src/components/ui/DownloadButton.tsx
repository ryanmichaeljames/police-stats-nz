interface DownloadButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'csv' | 'json';
}

export default function DownloadButton({ onClick, label, variant = 'csv' }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 border border-gray-900 text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label || `Download ${variant.toUpperCase()}`}
    </button>
  );
}
