import Link from 'next/link';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen px-6 sm:px-12 py-16" style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1535 100%)', color: '#F5F1E8' }}>
      <div className="max-w-2xl mx-auto">

        <Link href="/" className="eyebrow mb-10 inline-block" style={{ color: 'rgba(245,241,232,0.4)', fontSize: 11 }}>
          ← Back to Kickoff26
        </Link>

        <p className="eyebrow-red mb-3">Legal</p>
        <h1 className="head mb-2" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>Cookie Policy</h1>
        <p className="mono mb-12" style={{ fontSize: 12, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>
          Last updated: May 2026
        </p>

        <div className="space-y-10" style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(245,241,232,0.8)' }}>

          <section>
            <h2 className="head mb-3" style={{ fontSize: 20, color: '#F5F1E8' }}>What are cookies?</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They allow the site to remember information about your visit — such as whether you are signed in — so you don&apos;t have to re-enter details on every page.
            </p>
          </section>

          <section>
            <h2 className="head mb-3" style={{ fontSize: 20, color: '#F5F1E8' }}>How we use cookies</h2>
            <p className="mb-4">
              Kickoff26 uses only essential cookies required to operate the site. We do not use advertising cookies, analytics tracking cookies, or any third-party marketing cookies.
            </p>
          </section>

          <section>
            <h2 className="head mb-3" style={{ fontSize: 20, color: '#F5F1E8' }}>Cookies we set</h2>
            <div className="space-y-4">
              {[
                {
                  name: 'sb-*-auth-token',
                  purpose: 'Authentication',
                  description: 'Set by Supabase, our authentication provider. Keeps you signed in to your Kickoff26 account across pages and browser sessions.',
                  duration: 'Up to 7 days, or until you sign out',
                },
                {
                  name: 'cookie_consent',
                  purpose: 'Cookie consent',
                  description: 'Stores your acknowledgement of this cookie notice so we don\'t show it on every visit.',
                  duration: '1 year',
                },
              ].map(c => (
                <div key={c.name} className="p-5 rounded-sm" style={{ background: 'rgba(245,241,232,0.04)', border: '1px solid rgba(245,241,232,0.1)' }}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <code className="mono text-sm" style={{ color: '#C9A84C' }}>{c.name}</code>
                    <span className="eyebrow shrink-0" style={{ fontSize: 10, color: '#E33A3A' }}>{c.purpose}</span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: 'rgba(245,241,232,0.7)' }}>{c.description}</p>
                  <p className="mono" style={{ fontSize: 11, color: 'rgba(245,241,232,0.35)' }}>Duration: {c.duration}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="head mb-3" style={{ fontSize: 20, color: '#F5F1E8' }}>Third-party cookies</h2>
            <p>
              We do not load any third-party advertising or analytics scripts. No external parties set cookies through the Kickoff26 website.
            </p>
          </section>

          <section>
            <h2 className="head mb-3" style={{ fontSize: 20, color: '#F5F1E8' }}>Managing cookies</h2>
            <p className="mb-3">
              You can control and delete cookies through your browser settings. Please note that disabling essential cookies will prevent you from signing in to Kickoff26.
            </p>
            <p>
              For guidance on managing cookies in your browser, visit{' '}
              <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#C9A84C', textUnderlineOffset: 3 }}>
                aboutcookies.org
              </a>.
            </p>
          </section>

          <section>
            <h2 className="head mb-3" style={{ fontSize: 20, color: '#F5F1E8' }}>Contact</h2>
            <p>
              If you have any questions about how we use cookies, please contact us at{' '}
              <a href="mailto:simonmargolis29@gmail.com" className="underline" style={{ color: '#C9A84C', textUnderlineOffset: 3 }}>
                simonmargolis29@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
