export default function About() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">About Police Stats NZ</h1>
        <p className="text-gray-500 mt-1">Transparency, methodology, and data sources</p>
      </div>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">About This Site</h2>
        <p className="text-gray-700">Police Stats NZ is an independent, non-commercial website that presents publicly available New Zealand Police statistics in an accessible, visual format. This site is not affiliated with, endorsed by, or connected to the New Zealand Police in any way.</p>
        <p className="text-gray-700 mt-3">The goal is to make crime and policing statistics more accessible to journalists, researchers, students, and the general public. All data presented here comes directly from official NZ Police publications.</p>
      </section>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">Data Sources</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold">RCVS (Recorded Crime Victims Statistics)</h3>
            <p className="mt-1">Victim-focused crime statistics recording the number of victimisations and unique victims. Covers monthly data from January 2015, broken down by district, offence type, and demographics. Excludes drug offences (which are typically offender-focused).</p>
          </div>
          <div>
            <h3 className="font-semibold">RCOS (Recorded Crime Offenders Statistics)</h3>
            <p className="mt-1">Offender-focused statistics recording the number of criminal proceedings. Includes drug offences. Covers monthly data from January 2015, broken down by district, offence type, and offender demographics.</p>
          </div>
          <div>
            <h3 className="font-semibold">Demand and Activity</h3>
            <p className="mt-1">Monthly police demand volume data including crime demand, non-crime demand, and proactive policing activities by district.</p>
          </div>
          <p className="mt-2">All data is published by NZ Police via <a href="https://www.police.govt.nz/about-us/publications-statistics/data-and-statistics/policedatanz" className="underline" target="_blank" rel="noopener noreferrer">policedata.nz</a> using Tableau Public dashboards. Data is updated monthly on the last working day.</p>
        </div>
      </section>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">Methodology</h2>
        <div className="text-gray-700 space-y-3">
          <p>Crime statistics are classified using the <strong>New Zealand Standard Offence Classification (NZSOC)</strong>, which provides a consistent framework for categorising criminal offences.</p>
          <p>A <strong>victimisation</strong> is counted each time a person is a victim of a crime. If one person is victimised multiple times, each incident is counted separately. <strong>Unique victims</strong> counts each person only once in the reference period, regardless of how many times they were victimised.</p>
          <p>Similarly, <strong>proceedings</strong> count each criminal proceeding, while <strong>unique offenders</strong> deduplicate individuals.</p>
          <p>Monthly data refers to the month in which the offence was recorded, not necessarily when it occurred.</p>
        </div>
      </section>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">Privacy</h2>
        <div className="text-gray-700 space-y-2">
          <p>No cookies — this site does not use cookies of any kind.</p>
          <p>No tracking — no analytics, no Google Analytics, no user tracking whatsoever.</p>
          <p>No user data collected — we collect absolutely no personal information.</p>
          <p>Static site — all data is pre-compiled. No server-side processing of your requests.</p>
        </div>
      </section>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">License</h2>
        <p className="text-gray-700">The underlying data is sourced from NZ Police and is licensed under the <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 International (CC BY 4.0)</a> licence. Attribution: <em>New Zealand Police — policedata.nz</em>.</p>
        <p className="text-gray-700 mt-2">The website code itself is open source. See GitHub for details.</p>
      </section>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">GitHub</h2>
        <p className="text-gray-700">This project is open source. Source code, data pipeline scripts, and issue tracking are available at:</p>
        <a href="https://github.com/ryanmichaeljames/police-stats-nz" className="underline mt-2 block text-gray-900" target="_blank" rel="noopener noreferrer">github.com/ryanmichaeljames/police-stats-nz ↗</a>
      </section>

      <section className="bg-gray-50 border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">Disclaimer</h2>
        <div className="text-gray-600 space-y-2 text-sm">
          <p>This is an independent website and is <strong>not affiliated with, endorsed by, or connected to New Zealand Police</strong> in any way.</p>
          <p>While every effort is made to accurately present the data, this site is provided "as is" without warranty. Always refer to the <a href="https://www.police.govt.nz" className="underline" target="_blank" rel="noopener noreferrer">official NZ Police website</a> for authoritative information.</p>
          <p>Statistical data should be interpreted carefully. Crime statistics reflect recorded crime only and are influenced by reporting rates, policing practices, and data collection methods. They do not represent the totality of crime in New Zealand.</p>
        </div>
      </section>
    </div>
  );
}
