"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const TOPICS = [
  "AI News (General)",
  "Startups & Funding",
  "Big Tech & Industry",
  "Crypto & Blockchain",
  "Fintech & Business",
  "EdTech & Learning",
  "Autonomous & Robotics",
  "HealthTech & BioAI",
  "Tools & Productivity",
  "Policy & Ethics",
  "Research Breakthroughs",
  "Opinion & Analysis",
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // If already onboarded, redirect to /member
    if (session?.user && (session.user as any).hasOnboarded) {
      router.push("/member");
    }
  }, [status, session, router]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Save preferences and set hasOnboarded=true via API
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/member");
    }, 1000);
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <form onSubmit={handleSubmit} className="card max-w-lg w-full p-8 space-y-8">
        <h1 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">Personalize Your AI Newsletter</h1>
        <p className="mb-4 text-neutral-600 dark:text-neutral-400">Select your favorite topics and how often you want to receive updates.</p>
        <div>
          <label className="block font-medium mb-2">Topics of Interest</label>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicToggle(topic)}
                className={`p-2 rounded border text-left transition-all duration-200 ${
                  selectedTopics.includes(topic)
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-2">Newsletter Frequency</label>
          <select
            className="input-field"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selectedTopics.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Finish & Go to Member Home"}
        </button>
      </form>
    </div>
  );
} 