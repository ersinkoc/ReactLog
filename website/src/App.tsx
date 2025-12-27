import { HashRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HomePage } from "@/pages/home"
import { DocsLayout } from "@/pages/docs/layout"
import { DocsIndexPage } from "@/pages/docs/index"
import { GettingStartedPage } from "@/pages/docs/getting-started"
import { ApiPage } from "@/pages/docs/api"
import { PluginsPage } from "@/pages/docs/plugins"
import { HooksPage } from "@/pages/docs/hooks"
import { ConfigurationPage } from "@/pages/docs/configuration"
import { CustomPluginsPage } from "@/pages/docs/custom-plugins"
import { PerformancePage } from "@/pages/docs/performance"
import { ExamplesPage } from "@/pages/examples"
import { PlaygroundPage } from "@/pages/playground"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="reactlog-theme">
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/docs" element={<DocsLayout />}>
                <Route index element={<DocsIndexPage />} />
                <Route path="getting-started" element={<GettingStartedPage />} />
                <Route path="api" element={<ApiPage />} />
                <Route path="plugins" element={<PluginsPage />} />
                <Route path="hooks" element={<HooksPage />} />
                <Route path="configuration" element={<ConfigurationPage />} />
                <Route path="custom-plugins" element={<CustomPluginsPage />} />
                <Route path="performance" element={<PerformancePage />} />
              </Route>
              <Route path="/examples" element={<ExamplesPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
