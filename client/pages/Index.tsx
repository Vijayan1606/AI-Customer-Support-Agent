import { Link } from "react-router-dom";
import {
  Zap,
  Brain,
  Shield,
  BarChart3,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl opacity-30 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-primary/10 to-secondary/20 rounded-full blur-3xl opacity-30 translate-y-1/2"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <header className="border-b border-slate-700/50 backdrop-blur-md bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Refund AI
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition">
                Features
              </a>
              <a href="#policy" className="text-slate-300 hover:text-white transition">
                Policy
              </a>
              <Link
                to="/support"
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Intelligent Refund<br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Processing
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Deploy an AI-powered customer support system that intelligently
              processes refund requests using advanced policy validation and
              real-time decision reasoning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/support"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                Start Processing Refunds
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-600 rounded-lg font-semibold hover:bg-slate-700/50 transition-all"
              >
                View Admin Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powered by Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Agent Loop",
                description:
                  "Intelligent reasoning engine that validates policies in real-time",
              },
              {
                icon: Shield,
                title: "Policy Compliance",
                description:
                  "Automated enforcement of your refund policy rules and regulations",
              },
              {
                icon: Zap,
                title: "Real-time Processing",
                description:
                  "Instant decisions with transparent reasoning logs",
              },
              {
                icon: BarChart3,
                title: "Admin Analytics",
                description:
                  "Comprehensive dashboard with decision logs and metrics",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Section */}
        <div
          id="policy"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <h2 className="text-4xl font-bold mb-12">Refund Policy</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Standard Rules</h3>
              <ul className="space-y-4">
                {[
                  "30-day return window for standard customers",
                  "45-day window for VIP customers (>$10k spent)",
                  "15% restocking fee after 14 days",
                  "Items must be unused and original packaging",
                  "Minimum refund amount: $5",
                  "Account must be in good standing",
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Special Cases</h3>
              <ul className="space-y-4">
                {[
                  "Defective items bypass normal requirements",
                  "New customers get 30-day first-purchase window",
                  "Account status affects eligibility",
                  "High return rate triggers restrictions",
                  "Multiple refunds (5+) in 6 months flagged",
                  "Manager approval required for exceptions",
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/30 rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Automate Your Refunds?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              See the AI agent in action. Process refunds intelligently with
              transparent reasoning logs.
            </p>
            <Link
              to="/support"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              Launch Support Agent
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
            <p>
              AI Customer Support Agent • Built with React, Express, and
              Intelligent Policy Validation
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
