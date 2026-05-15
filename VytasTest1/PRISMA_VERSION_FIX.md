# Prisma Version Compatibility Fix

## Problem

During Docker build, Prisma schema validation failed with:

```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: The datasource property `url` is no longer supported in schema files.
```

## Root Cause

**Version Mismatch**: The project had mixed Prisma versions:
- `@prisma/client`: v5.7.0 (stable)
- `@prisma/adapter-pg`: v7.8.0 (preview/beta)
- `prisma.config.ts`: Prisma 7 feature

When npm installed dependencies, it pulled in Prisma 7 CLI due to the adapter dependency, but the schema was written for Prisma 5.

## Prisma 7 Breaking Changes

Prisma 7 (preview) introduced major changes:
1. **No `url` in schema**: Connection URL moved to `prisma.config.ts`
2. **New config file**: `prisma.config.ts` replaces some schema settings
3. **Adapter pattern**: Direct database connections use adapters
4. **Client configuration**: Connection details passed to PrismaClient constructor

## Solution

### 1. Remove Prisma 7 Adapter
```json
// backend/package.json - BEFORE
"dependencies": {
  "@prisma/adapter-pg": "^7.8.0",  // ❌ Prisma 7
  "@prisma/client": "^5.7.0",      // ✅ Prisma 5
  ...
}

// backend/package.json - AFTER
"dependencies": {
  "@prisma/client": "^5.7.0",      // ✅ Prisma 5 only
  ...
}
```

### 2. Delete Prisma 7 Config File
```bash
rm backend/prisma.config.ts
```

This file is only for Prisma 7 and causes confusion with Prisma 5.

### 3. Keep Prisma 5 Schema Format
```prisma
// backend/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ✅ Works in Prisma 5
}
```

## Why This Happened

The `@prisma/adapter-pg` package was likely added when exploring Prisma 7 features or following newer documentation. However:

1. Prisma 7 is still in preview/beta
2. Production apps should use stable Prisma 5
3. Mixing versions causes CLI/schema incompatibility

## Verification

After fixing, the build should succeed:

```bash
# Clean build
docker compose build --no-cache backend

# Check logs
docker logs vytastest1-backend-1

# Should see:
✅ Prisma schema loaded from prisma/schema.prisma
✅ Generated Prisma Client
```

## Prisma Version Comparison

| Feature | Prisma 5 (Stable) | Prisma 7 (Preview) |
|---------|-------------------|-------------------|
| Schema `url` | ✅ Required | ❌ Removed |
| `prisma.config.ts` | ❌ Not supported | ✅ Required |
| Adapters | ❌ Not needed | ✅ Required |
| Production Ready | ✅ Yes | ⚠️ Beta |
| Breaking Changes | ❌ None | ✅ Many |

## Best Practices

1. **Use stable versions** in production
2. **Match all Prisma packages** to same major version
3. **Read migration guides** before upgrading major versions
4. **Test in dev** before deploying version changes
5. **Lock versions** in package.json (remove `^` for exact versions)

## Related Files Changed

- `backend/package.json` - Removed `@prisma/adapter-pg`
- `backend/prisma.config.ts` - Deleted (Prisma 7 only)
- `backend/prisma/schema.prisma` - Already correct for Prisma 5

## References

- [Prisma 5 Documentation](https://www.prisma.io/docs)
- [Prisma 7 Preview Announcement](https://www.prisma.io/blog/prisma-7-preview)
- [Prisma Version Compatibility](https://www.prisma.io/docs/reference/system-requirements)

## Made with Bob