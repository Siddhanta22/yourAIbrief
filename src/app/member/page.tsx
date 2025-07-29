"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NewsletterPreview } from "@/components/sections/NewsletterPreview";
import { useEffect } from "react";

export default function MemberPage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/member");
    }
  }, [session?.status, router]);

  if (session?.status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Welcome, {session?.data?.user?.name || "Member"}!</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">Here's your personalized AI news feed and account management.</p>

        {/* Live News Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Live AI News</h2>
          <NewsletterPreview />
          {/* Replace NewsletterPreview with real news feed if available */}
        </section>

        {/* Preferences Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
          {/* TODO: Fetch and display user preferences (topics, frequency, etc.) */}
          <div className="card p-6 mb-4">
            <p className="mb-2">Preferred Frequency: <span className="font-medium">(coming soon)</span></p>
            <p className="mb-2">Topics: <span className="font-medium">(coming soon)</span></p>
            <button className="btn-primary mt-2">Update Preferences</button>
          </div>
        </section>

        {/* Account Management Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Account Management</h2>
          <div className="card p-6">
            <button className="btn-ghost text-red-600">Unsubscribe from all emails</button>
            {/* TODO: Add more account management features */}
          </div>
        </section>
      </div>
    </div>
  );
} 