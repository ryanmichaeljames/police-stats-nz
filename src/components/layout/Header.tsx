import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Overview' },
  { to: '/victimisations', label: 'Victimisations' },
  { to: '/offenders', label: 'Offenders' },
  { to: '/family-violence', label: 'Family Violence' },
  { to: '/demand', label: 'Demand & Activity' },
  { to: '/deportees', label: 'Deportees' },
  { to: '/conduct', label: 'Conduct' },
  { to: '/data-explorer', label: 'Data Explorer' },
  { to: '/about', label: 'About' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="font-mono text-sm font-semibold text-black tracking-tight hover:no-underline">
            police-stats-nz
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'text-black font-medium underline underline-offset-4'
                      : 'text-gray-500 hover:text-black'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="md:hidden p-2 text-gray-500 hover:text-black"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-2 py-2 text-sm mb-0.5 ${
                  isActive ? 'text-black font-medium' : 'text-gray-500 hover:text-black'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
