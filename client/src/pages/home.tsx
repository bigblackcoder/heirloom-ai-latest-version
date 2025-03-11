import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { HeirloomLogo } from "@/components/heirloom-logo";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <HeirloomLogo className="h-8 w-8" />
            <span className="text-lg font-bold">Heirloom</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild variant="default">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container flex flex-col items-center text-center space-y-10">
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold">
                Secure Identity Verification Platform
              </h1>
              <p className="text-xl text-muted-foreground">
                Take control of your digital identity with our advanced biometric
                verification platform. Secure, intelligent, and user-friendly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-card">
          <div className="container space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with user-friendly design
                to provide a seamless identity verification experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <div className="p-4 rounded-full bg-primary/10 w-fit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Secure Authentication</h3>
                <p className="text-muted-foreground">
                  Multi-factor authentication with biometric verification ensures your
                  identity remains protected at all times.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-full bg-primary/10 w-fit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI-Powered Identity</h3>
                <p className="text-muted-foreground">
                  Advanced artificial intelligence ensures accurate verification while
                  protecting against spoofing and fraud attempts.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-full bg-primary/10 w-fit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Identity Capsules</h3>
                <p className="text-muted-foreground">
                  Store and manage verified identity data securely, sharing only what you
                  choose with third-party services and applications.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeirloomLogo className="h-6 w-6" />
            <span className="font-medium">Heirloom</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Heirloom Identity Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}