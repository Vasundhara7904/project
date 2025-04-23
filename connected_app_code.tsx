

// --- layout.tsx ---

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


// --- page.tsx ---

"use client"

import { useState } from "react"
import { Loader2, Play, Bug, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { debugPythonCode, generateAICode } from "@/app/actions"
import CodeEditor from "@/components/code-editor"
import VariableInspector from "@/components/variable-inspector"
import OutputDisplay from "@/components/output-display"
import ErrorDisplay from "@/components/error-display"
import AICodeModal from "@/components/ai-code-modal"

export default function Home() {
  const [code, setCode] = useState(`# Example Python code
def calculate_factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * calculate_factorial(n-1)

# Test the function
result = calculate_factorial(5)
print(f"Factorial of 5 is {result}")

# Uncomment to see error handling
# print(undefined_variable)
`)
  const [output, setOutput] = useState<string>("")
  const [variables, setVariables] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("output")
  const [isAILoading, setIsAILoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  const handleRunCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await debugPythonCode(code)

      setOutput(result.output)
      setVariables(result.variables || {})
      setError(result.error || null)

      if (result.error) {
        setActiveTab("error")
      } else {
        setActiveTab("output")
      }
    } catch (err) {
      setError("Failed to execute code. Please try again.")
      setActiveTab("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearOutput = () => {
    setOutput("")
    setVariables({})
    setError(null)
  }

  const handleGenerateAICode = async () => {
    setIsAILoading(true)
    try {
      const result = await generateAICode(code)
      setGeneratedCode(result.generatedCode)
      setIsAIModalOpen(true)
    } catch (err) {
      setError("Failed to generate alternative code. Please try again.")
    } finally {
      setIsAILoading(false)
    }
  }

  const applyGeneratedCode = () => {
    if (generatedCode) {
      setCode(generatedCode)
      setIsAIModalOpen(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <h1 className="text-2xl font-bold">Python Debugger</h1>
        <p className="text-slate-400">Write, debug and analyze Python code</p>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Code Editor Section */}
        <div className="w-full md:w-1/2 p-4 border-r border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Code Editor</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClearOutput} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAICode}
                disabled={isLoading || isAILoading}
                className="bg-purple-900 hover:bg-purple-800 text-white border-purple-700"
              >
                {isAILoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                AI Suggest
              </Button>
              <Button onClick={handleRunCode} disabled={isLoading} size="sm">
                {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Play className="h-4 w-4 mr-1" />}
                Run Code
              </Button>
              <Button variant="secondary" onClick={handleRunCode} disabled={isLoading} size="sm">
                {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Bug className="h-4 w-4 mr-1" />}
                Debug
              </Button>
            </div>
          </div>

          <CodeEditor value={code} onChange={setCode} language="python" error={error} />
        </div>

        {/* Output Section */}
        <div className="w-full md:w-1/2 p-4 bg-slate-900">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="error" className={error ? "text-red-400" : ""}>
                Errors {error && "⚠️"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="output" className="mt-0">
              <OutputDisplay output={output} />
            </TabsContent>

            <TabsContent value="variables" className="mt-0">
              <VariableInspector variables={variables} />
            </TabsContent>

            <TabsContent value="error" className="mt-0">
              <ErrorDisplay error={error} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AICodeModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        generatedCode={generatedCode || ""}
        onApply={applyGeneratedCode}
      />
    </main>
  )
}


// --- globals.css ---

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
