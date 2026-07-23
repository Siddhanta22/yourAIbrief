import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - YourAIbrief',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen dark:bg-neutral-900">
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-neutral-400">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-700 dark:text-neutral-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Information we collect</h2>
            <p>
              When you subscribe to YourAIbrief, we collect the email address, name, and content
              preferences (topics, delivery frequency, and preferred delivery time) you provide.
              If you sign in with Google, we receive your name, email address, and profile image
              from Google in line with the permissions you grant during sign-in.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">How we use it</h2>
            <p>
              We use this information to send the newsletters you've signed up for, personalize
              content to your selected interests, and operate your account (sign-in, preferences,
              and dashboard). We do not sell your personal information to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Third-party services</h2>
            <p>
              We use SendGrid to deliver emails, Google for optional sign-in, and NewsAPI to source
              article content for curation. Each of these providers processes data only as needed
              to perform their respective service for us.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Your choices</h2>
            <p>
              You can update your preferences at any time from your dashboard, or unsubscribe
              instantly from the link in any email or via our{' '}
              <a href="/unsubscribe" className="text-primary-600 dark:text-primary-400 hover:underline">
                unsubscribe page
              </a>
              . Unsubscribing stops future newsletters and deactivates your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100 mb-3">Contact us</h2>
            <p>
              Questions about this policy or your data? Reach us at{' '}
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
