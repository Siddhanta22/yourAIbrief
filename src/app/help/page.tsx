import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center - YourAIbrief',
};

const FAQS = [
  {
    q: 'How often do you send newsletters?',
    a: 'You choose - daily, weekly, or monthly - along with a preferred delivery time, from your dashboard.',
  },
  {
    q: 'Is the newsletter free?',
    a: 'Yes, YourAIbrief is completely free to subscribe to.',
  },
  {
    q: 'How do I change my topics or delivery time?',
    a: 'Sign in and open your dashboard to update your interests, frequency, and delivery time at any time.',
  },
  {
    q: 'How do I sign in?',
    a: "Use Google, or enter your email on the homepage - we'll send a one-time sign-in link to your inbox. No password needed.",
  },
  {
    q: 'Can I unsubscribe anytime?',
    a: 'Yes - use the link in any newsletter email, or visit our unsubscribe page directly. It takes effect immediately.',
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen dark:bg-neutral-900">
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-neutral-400">
            Answers to common questions about YourAIbrief.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {FAQS.map((item) => (
              <div key={item.q} className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">
                  {item.q}
                </h3>
                <p className="text-gray-600 dark:text-neutral-400">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-600 dark:text-neutral-400 mb-4">
              Still need help?
            </p>
            <a
              href="/contact"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
