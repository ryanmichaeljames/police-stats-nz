interface SourceAttributionProps {
  className?: string;
}

export default function SourceAttribution({ className = '' }: SourceAttributionProps) {
  return (
    <p className={`text-xs font-mono text-gray-400 mt-3 ${className}`}>
      Source:{' '}
      <a
        href="https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz"
        className="underline underline-offset-2 hover:text-black"
        target="_blank"
        rel="noopener noreferrer"
      >
        NZ Police / policedata.nz
      </a>
      {' '}· CC BY 4.0
    </p>
  );
}
