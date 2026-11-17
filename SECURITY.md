# Security

## Reporting a vulnerability

Please do not open a public issue for a security problem.

- Email **contact@textures.dev** with "Security" in the subject, or
- use GitHub's private reporting on this repository: Security tab, "Report a vulnerability".

Say what you found, how to reproduce it and what it affects. We read every report, reply to it and tell you when the fix is out. Reports made in good faith are welcome; please give us a reasonable time to fix a problem before you publish it.

## Scope

- The files in this repository: each Texture is one client-side React file that draws an SVG and listens to pointer events. It makes no network request, reads no storage and has no dependency beyond React.
- The registry at `https://textures.dev/r/` and the MCP server at `https://textures.dev/mcp`.
- The website textures.dev.

## Checking what you installed

Every file under `components/textures/` here is the exact file the shadcn CLI writes, and every file under `r/` is the registry's answer as served. If a file you installed from `https://textures.dev/r/<slug>.json` differs from this repository at the same date in the [changelog](CHANGELOG.md), tell us.

## Supported versions

Only the current file of each Texture is supported. Reinstall with `npx shadcn@latest add https://textures.dev/r/<slug>.json --overwrite` to get it.
