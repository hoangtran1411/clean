import Prism from 'prismjs'

// Ensure global Prism is available for Prism language components that expect window.Prism or global.Prism
if (typeof window !== 'undefined') {
  ;(window as unknown as { Prism: typeof Prism }).Prism = Prism
}
;(globalThis as unknown as { Prism: typeof Prism }).Prism = Prism

// 1. Base C-like grammar
import 'prismjs/components/prism-clike'

// 2. C# & .NET
import 'prismjs/components/prism-csharp'

// 3. JavaScript, TypeScript, JSX & TSX
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// 4. Shell & Terminal Scripting
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-powershell'

// 5. Data Formats & Protocols
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-http'
import 'prismjs/components/prism-graphql'

// 6. Databases & Cloud Query
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-kusto'

// 7. DevOps & Infrastructure as Code (IaC)
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-bicep'
import 'prismjs/components/prism-hcl'
import 'prismjs/components/prism-nginx'

// 8. Other Languages & Diff
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-diff'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'

// Language Aliases
Prism.languages.cs = Prism.languages.csharp
Prism.languages.dotnet = Prism.languages.csharp
Prism.languages.ts = Prism.languages.typescript
Prism.languages.js = Prism.languages.javascript
Prism.languages.sh = Prism.languages.bash
Prism.languages.shell = Prism.languages.bash
Prism.languages.ps1 = Prism.languages.powershell
Prism.languages.pwsh = Prism.languages.powershell
Prism.languages.yml = Prism.languages.yaml
Prism.languages.kql = Prism.languages.kusto
Prism.languages.tf = Prism.languages.hcl
Prism.languages.terraform = Prism.languages.hcl

export { Prism }
