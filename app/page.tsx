import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* Navigation */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
            <div className="flex gap-5 items-center font-semibold">
              <Link href="/" className="text-xl">MissionGrid</Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <AuthButton />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative w-full py-32 px-4 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:to-transparent">
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto text-center relative">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 text-sm font-medium mb-8 bg-primary/5 text-primary animate-bounce">
                <span className="w-2 h-2 inline-block bg-primary rounded-full mr-2"></span>
                Mission Control Ready
              </span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              Stop the Chaos.{" "}
              <span className="block mt-2">
                Manage Gaza Logistics in Real-Time.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              The all-in-one platform for dispatchers, ops managers, and finance to track missions from HP1 to reconciliation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/auth/login"
                className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link 
                href="/auth/sign-up"
                className="group relative px-8 py-4 bg-background text-foreground border-2 border-secondary rounded-xl font-medium overflow-hidden transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-secondary/20"
              >
                <span className="relative z-10">Request a Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-foreground/10">
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <div className="text-sm text-muted-foreground">Active Missions</div>
              </div>
              <div className="p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-foreground/10">
                <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Real-time Tracking</div>
              </div>
              <div className="p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-foreground/10">
                <div className="text-4xl font-bold text-accent mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Drivers Managed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative w-full py-32 bg-gradient-to-b from-secondary/5 to-background">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Everything You Need for Mission Success
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Powerful features designed to streamline your logistics operations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Live Dispatch Board */}
              <div className="group relative bg-background p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 border border-foreground/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l6-6-6-6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Live Dispatch Board</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track trucks in real-time from HP1 to GL approval and final delivery. Always know where your assets are.
                  </p>
                </div>
              </div>

              {/* Driver & CSV Upload */}
              <div className="group relative bg-background p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-secondary/10 hover:-translate-y-1 border border-foreground/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Driver & CSV Upload</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bulk upload driver lists in seconds with full Arabic support. No more manual data entry.
                  </p>
                </div>
              </div>

              {/* 1-Click Reconciliation */}
              <div className="group relative bg-background p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 border border-foreground/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">1-Click Reconciliation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Generate comprehensive summary reports and export to CSV for finance with a single click.
                  </p>
                </div>
              </div>

              {/* Custom Mission Templates */}
              <div className="group relative bg-background p-8 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 border border-foreground/5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Custom Mission Templates</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Define your own workflow with customizable mission templates that match your organization&apos;s needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative w-full py-32 bg-gradient-to-b from-background to-secondary/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A simple, streamlined process from start to finish
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Progress Line */}
              <div className="hidden lg:block absolute top-[4.5rem] left-[25%] right-[25%] h-0.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>
              
              {/* Define Step */}
              <div className="relative group">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark rotate-45 transform transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
                      <div className="absolute inset-0 flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-2xl font-bold text-primary-foreground">1</span>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary opacity-50 animate-ping"></div>
                  </div>
                  <h3 className="text-2xl font-bold mt-6 mb-3 text-center group-hover:text-primary transition-colors">Define</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Create your custom mission templates that match your workflow
                  </p>
                </div>
              </div>

              {/* Dispatch Step */}
              <div className="relative group">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark rotate-45 transform transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
                      <div className="absolute inset-0 flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-2xl font-bold text-secondary-foreground">2</span>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary opacity-50 animate-ping animation-delay-200"></div>
                  </div>
                  <h3 className="text-2xl font-bold mt-6 mb-3 text-center group-hover:text-secondary transition-colors">Dispatch</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Upload drivers and assign them to missions efficiently
                  </p>
                </div>
              </div>

              {/* Track Step */}
              <div className="relative group">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-dark rotate-45 transform transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
                      <div className="absolute inset-0 flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-2xl font-bold text-accent-foreground">3</span>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent opacity-50 animate-ping animation-delay-400"></div>
                  </div>
                  <h3 className="text-2xl font-bold mt-6 mb-3 text-center group-hover:text-accent transition-colors">Track</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Monitor GLs and mission status in real-time
                  </p>
                </div>
              </div>

              {/* Reconcile Step */}
              <div className="relative group">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark rotate-45 transform transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
                      <div className="absolute inset-0 flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                        <span className="text-2xl font-bold text-primary-foreground">4</span>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary opacity-50 animate-ping animation-delay-600"></div>
                  </div>
                  <h3 className="text-2xl font-bold mt-6 mb-3 text-center group-hover:text-primary transition-colors">Reconcile</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    Export comprehensive CSV reports for finance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © 2025 MissionGrid. All rights reserved.
              </div>
              <div className="flex gap-8 text-sm text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
