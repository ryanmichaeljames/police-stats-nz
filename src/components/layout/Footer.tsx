import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-gray-400">police-stats-nz</p>
            <p className="text-xs text-gray-400 mt-1">Independent. Not affiliated with NZ Police.</p>
          </div>
          <div className="text-xs text-gray-400 space-y-1 md:text-right">
            <p>
              Data:{' '}
              <a
                href="https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz"
                className="text-gray-600 hover:text-black underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                NZ Police — policedata.nz
              </a>
            </p>
            <p>Licensed under Creative Commons Attribution 4.0</p>
          </div>
          <div className="flex gap-6 text-xs text-gray-400">
            <Link to="/about" className="hover:text-black">About</Link>
            <a
              href="https://github.com/ryanmichaeljames/police-stats-nz"
              className="hover:text-black"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
