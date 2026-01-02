import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Study Companion
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Learn Smarter, Not Harder with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Study
            </span>
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            Upload your lecture materials, get instant summaries, ask questions, and
            generate practice exams. Your personalized AI tutor, trained on YOUR content.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Start Learning Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Powerful Features for Your Success
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to ace your exams
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-blue-600" />}
            title="Upload & Organize"
            description="Upload PDFs, PPTs, DOCX, and text files. Organize by subject and access anytime."
          />
          <FeatureCard
            icon={<Sparkles className="h-10 w-10 text-purple-600" />}
            title="AI Summarization"
            description="Get concise, bullet-point summaries of lengthy lectures in seconds."
          />
          <FeatureCard
            icon={<Brain className="h-10 w-10 text-green-600" />}
            title="Ask Questions"
            description="Chat with your materials. Get accurate answers based only on your content."
          />
          <FeatureCard
            icon={<BookOpen className="h-10 w-10 text-orange-600" />}
            title="Practice Exams"
            description="Auto-generate MCQs and practice questions tailored to your materials."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold">Ready to Transform Your Study Experience?</h2>
          <p className="mb-8 text-xl">Join thousands of students already learning smarter with AI</p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>© 2026 AI Study Companion. Empowering students with AI.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
