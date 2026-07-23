import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - YourAIbrief',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen dark:bg-neutral-900">
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-700 dark:text-neutral-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Essential cookies</h2>
            <p>
              YourAIbrief uses a single essential, secure session cookie to keep you signed in
              after you sign in with Google or click a sign-in link we email you. This cookie is
              required for the dashboard and preferences pages to work, and it's removed when you
              sign out or it expires.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Preferences</h2>
            <p>
              We store your light/dark theme choice locally in your browser so it's remembered on
              your next visit. This isn't sent to our servers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">No tracking or ad cookies</h2>
            <p>
              We don't use advertising or cross-site tracking cookies. We don't share cookie data
              with ad networks.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Contact us</h2>
            <p>
              Questions about our cookie use? Reach us at{' '}
              <a href="mailto:hello@youraibrief.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                hello@youraibrief.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
