import fs from 'fs'
import path from 'path'
import { transformRootHeightClass } from './lib/copy-paste-transform.mjs'

interface ShadCNFile {
  target: string
  content: string
}

interface ShadCNRegistry {
  $schema: string
  name: string
  type: string
  files: ShadCNFile[]
  dependencies?: string[]
}

type ValidationResult =
  | { success: true }
  | { success: false; reason: string }

async function validateRegistryJSON(slug: string): Promise<ValidationResult> {
  const jsonPath = path.join(process.cwd(), 'registry-data', `${slug}.json`)
  const sourceComponentPath = path.join(process.cwd(), 'components-workspace', slug, 'index.tsx')

  // Check 1: JSON file exists and is readable
  if (!fs.existsSync(jsonPath)) {
    return {
      success: false,
      reason: `JSON file not found at registry-data/${slug}.json. Did you run the registry build script after wiring the component?`,
    }
  }

  // Parse JSON
  let json: ShadCNRegistry
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8')
    json = JSON.parse(raw)
  } catch (err) {
    return {
      success: false,
      reason: `registry-data/${slug}.json is invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

  // Check 2: Schema validity — required shadcn fields present
  const requiredFields = ['$schema', 'name', 'type', 'files']
  const missingFields = requiredFields.filter((field) => !(field in json))
  if (missingFields.length > 0) {
    return {
      success: false,
      reason: `registry-data/${slug}.json is missing required shadcn fields: ${missingFields.join(', ')}`,
    }
  }

  if (!Array.isArray(json.files) || json.files.length === 0) {
    return {
      success: false,
      reason: `registry-data/${slug}.json must have at least one entry in the 'files' array`,
    }
  }

  // Check 3: Slug match — JSON name matches folder name
  if (json.name !== slug) {
    return {
      success: false,
      reason: `Slug mismatch: JSON name is "${json.name}" but folder name is "${slug}". Update the registry build to use the correct slug.`,
    }
  }

  // Check 4: Target path — first file target is correct
  const expectedTarget = `components/aicanvas/${slug}.tsx`
  if (json.files[0].target !== expectedTarget) {
    return {
      success: false,
      reason: `Target path mismatch: JSON files[0].target is "${json.files[0].target}" but should be "${expectedTarget}". Check the registry build configuration.`,
    }
  }

  // Check 5: Content parity — JSON content matches source file
  if (!fs.existsSync(sourceComponentPath)) {
    return {
      success: false,
      reason: `Source file not found at components-workspace/${slug}/index.tsx. Component folder may not exist or may be misnamed.`,
    }
  }

  const rawSourceContent = fs.readFileSync(sourceComponentPath, 'utf-8')
  // Apply the same copy-paste transform that generate-registry applies (root-only h-full → min-h-screen)
  const sourceContent = transformRootHeightClass(rawSourceContent)
  // JSON content is escaped; unescape it for comparison
  const jsonContent = json.files[0].content
  if (jsonContent !== sourceContent) {
    // Try to give a helpful diagnostic
    const sourceLines = sourceContent.split('\n').length
    const jsonLines = jsonContent.split('\n').length
    return {
      success: false,
      reason: `Content parity mismatch: registry-data/${slug}.json content (${jsonLines} lines) does not match components-workspace/${slug}/index.tsx (${sourceLines} lines). The component source may have changed after the registry build. Re-run the registry build script and verify the build completed without errors.`,
    }
  }

  // Check 6: Dependency completeness (optional but recommended)
  // Peer deps always available in a Next.js project — never listed in npm install comments
  const PEER_DEPS = new Set(['react', 'react-dom', 'next'])
  // Extract all imports from the source file that aren't relative or built-in
  const importRegex = /import\s+(?:[^'"]+\s+)?from\s+['"]([^'"]+)['"]/g
  const imports: Set<string> = new Set()
  let match
  while ((match = importRegex.exec(sourceContent)) !== null) {
    const importPath = match[1]
    // Skip relative imports (start with . or /) and built-ins (no . or /)
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      // Extract package name — scoped packages (@scope/pkg) need two segments
      const parts = importPath.split('/')
      const packageName = importPath.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
      if (!PEER_DEPS.has(packageName)) imports.add(packageName)
    }
  }

  const declaredDeps = new Set(json.dependencies || [])
  for (const dep of imports) {
    if (!declaredDeps.has(dep)) {
      return {
        success: false,
        reason: `Dependency missing: The component imports "${dep}" but it's not listed in the JSON dependencies array. Update the registry build or the component's imports.`,
      }
    }
  }

  // All checks passed
  return { success: true }
}

// Main execution
const slug = process.argv[2]
if (!slug) {
  console.error('Usage: npm run validate:registry -- <slug>')
  process.exit(1)
}

validateRegistryJSON(slug)
  .then((result) => {
    if (result.success) {
      console.log(`✓ JSON check passed for ${slug}`)
      process.exit(0)
    } else {
      console.error(`✗ JSON check failed for ${slug}:`)
      console.error(`  ${result.reason}`)
      process.exit(1)
    }
  })
  .catch((err) => {
    console.error(`✗ JSON check crashed: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  })
