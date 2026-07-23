import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - YourAIbrief',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen dark:bg-neutral-900">
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-700 dark:text-neutral-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Using YourAIbrief</h2>
            <p>
              YourAIbrief is a free newsletter service that curates AI-related news based on the
              topics you select. By subscribing, you agree to receive periodic emails at the
              frequency and time you choose during sign-up.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Your account</h2>
            <p>
              You're responsible for the accuracy of the information you provide and for keeping
              access to your email account secure, since sign-in links are sent there. You may
              cancel your subscription at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Content</h2>
            <p>
              Newsletter content is curated from third-party news sources. We do our best to
              surface relevant, high-quality articles, but we don't control or vouch for the
              accuracy of external content we link to.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Changes</h2>
            <p>
              We may update these terms as the product evolves. Continued use of YourAIbrief after
              a change means you accept the updated terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Contact us</h2>
            <p>
              Questions about these terms? Reach us at{' '}
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
