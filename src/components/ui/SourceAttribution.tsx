interface SourceAttributionProps {
  className?: string;
}

export default function SourceAttribution({ className = '' }: SourceAttributionProps) {
  return (
    <p className={`text-xs text-gray-500 mt-2 ${className}`}>
      Source:{' '}
      <a
        href="https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz"
        className="underline hover:text-gray-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        NZ Police — policedata.nz
      </a>{' '}
      | Creative Commons Attribution 4.0
    </p>
  );
}
