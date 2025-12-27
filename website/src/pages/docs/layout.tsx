import { Link, Outlet, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Home,
  Rocket,
  Settings,
  Code,
  Puzzle,
  Anchor,
  Wrench,
  Zap,
} from "lucide-react"

const sidebarLinks = [
  {
    title: "Getting Started",
    links: [
      { href: "/docs", label: "Introduction", icon: Home },
      { href: "/docs/getting-started", label: "Quick Start", icon: Rocket },
      { href: "/docs/configuration", label: "Configuration", icon: Settings },
    ],
  },
  {
    title: "Core Concepts",
    links: [
      { href: "/docs/api", label: "API Reference", icon: Code },
      { href: "/docs/plugins", label: "Plugins", icon: Puzzle },
      { href: "/docs/hooks", label: "Hooks", icon: Anchor },
    ],
  },
  {
    title: "Advanced",
    links: [
      { href: "/docs/custom-plugins", label: "Custom Plugins", icon: Wrench },
      { href: "/docs/performance", label: "Performance", icon: Zap },
    ],
  },
]

export function DocsLayout() {
  const location = useLocation()

  return (
    <div className="flex pt-16">
      {/* Sidebar */}
      <aside className="hidden lg:block fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] border-r border-border bg-background overflow-y-auto">
        <div className="p-4">
          {sidebarLinks.map((section) => (
            <div key={section.title} className="mb-6">
              <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h4>
              <nav className="space-y-1">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
