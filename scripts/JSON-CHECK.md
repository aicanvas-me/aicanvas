# Registry JSON Validation

**Purpose:** Verify that a component's registry JSON matches its source code before publishing to the shadcn registry.

**Run:**
```bash
npm run validate:registry -- <slug>
```

**Example:**
```bash
npm run validate:registry -- particle-sphere
```

## Exit codes

- **0 (success)**: All checks passed. Proceed to publish.
- **1 (failure)**: At least one check failed. Output explains the reason.

## What it checks

1. **JSON file exists** at `registry-data/<slug>.json`
2. **Schema validity**: Has required shadcn fields (`$schema`, `name`, `type`, `files`)
3. **Content parity**: JSON's `files[0].content` matches `components-workspace/<slug>/index.tsx` byte-for-byte
4. **Slug match**: JSON's `name` equals the folder name
5. **Target path**: `files[0].target` is `components/aicanvas/<slug>.tsx`
6. **Dependency completeness**: Every npm import in the component code appears in JSON's `dependencies` array

## If a check fails

The script prints the specific check that failed and why. Example outputs:

```
✗ JSON check failed for particle-sphere:
  Slug mismatch: JSON name is "particle" but folder name is "particle-sphere". 
  Update the registry build to use the correct slug.
```

```
✗ JSON check failed for ai-job-cards:
  Content parity mismatch: registry-data/ai-job-cards.json content does not match 
  components-workspace/ai-job-cards/index.tsx. The component source may have 
  changed after the registry build. Re-run the registry build script.
```

## Common issues

| Issue | Solution |
|-------|----------|
| "JSON file not found" | Run the registry build script first: `npm run build` |
| "Schema invalid" | Component wasn't properly wired in `app/lib/component-registry.tsx`. Check the registry build logs. |
| "Content parity mismatch" | Component source changed after build. Re-run `npm run build` to regenerate the JSON. |
| "Dependency missing" | A package imported in the component isn't in the JSON's dependencies. Check the registry build configuration or the component's imports. |
| "Slug mismatch" | Folder name and JSON name don't match. Rename the folder or fix the registry entry. |

## Supervisor integration

The Supervisor runs this check as **step 9 of the pipeline** (between integration and publishing). If validation fails, the check blocks the push immediately and surfaces the error in chat so the root cause can be fixed before the component goes live.
