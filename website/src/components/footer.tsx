import { Link } from "react-router-dom"
import { Bug } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">ReactLog</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Zero-dependency React lifecycle debugger with micro-kernel plugin
              architecture.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Documentation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/docs/getting-started"
                  className="hover:text-foreground transition-colors"
                >
                  Getting Started
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/api"
                  className="hover:text-foreground transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/plugins"
                  className="hover:text-foreground transition-colors"
                >
                  Plugins
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/configuration"
                  className="hover:text-foreground transition-colors"
                >
                  Configuration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/examples"
                  className="hover:text-foreground transition-colors"
                >
                  Examples
                </Link>
              </li>
              <li>
                <Link
                  to="/playground"
                  className="hover:text-foreground transition-colors"
                >
                  Playground
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/ersinkoc/reactlog/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://github.com/ersinkoc/reactlog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ersinkoc/reactlog/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ersinkoc/reactlog/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Discussions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ReactLog. MIT License.
          </p>
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <a
              href="https://github.com/ersinkoc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              ersinkoc
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
