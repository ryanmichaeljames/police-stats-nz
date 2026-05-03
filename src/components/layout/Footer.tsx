import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Police Stats NZ</h3>
            <p className="text-sm">Independent website presenting publicly available NZ Police statistics. Not affiliated with NZ Police.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Data Source</h3>
            <p className="text-sm">Data sourced from <a href="https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">NZ Police — policedata.nz</a></p>
            <p className="text-sm mt-1">Licensed under Creative Commons Attribution 4.0</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Links</h3>
            <ul className="text-sm space-y-1">
              <li><Link to="/about" className="hover:text-white">About this site</Link></li>
              <li><a href="https://github.com/ryanmichaeljames/police-stats-nz" className="hover:text-white" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-xs text-center">
          Source: NZ Police via policedata.nz. Licensed under Creative Commons Attribution 4.0 International. This is an independent website, not affiliated with NZ Police.
        </div>
      </div>
    </footer>
  );
}
