import { Highlight, themes } from "prism-react-renderer"

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language = "tsx",
  showLineNumbers = false,
  className = "",
}: CodeBlockProps) {
  return (
    <div className={`code-block overflow-hidden ${className}`}>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} p-4 overflow-x-auto text-sm`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {showLineNumbers && (
                  <span className="inline-block w-8 text-gray-500 select-none">
                    {i + 1}
                  </span>
                )}
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
