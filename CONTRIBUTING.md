# Contributing

Thanks for looking. One thing to know before you open anything: **this repository is generated.** The Texture files, the registry files, the README and the changelog are written by a sync from the Textures catalog each time a free Texture is published or changes, so that every file here stays byte for byte what `npx shadcn@latest add https://textures.dev/r/<slug>.json` installs. A pull request that edits one of them would be overwritten by the next sync, so it cannot be merged as it stands.

What helps, in order:

## Report a bug

Open an [issue](https://github.com/Textures-dev/textures/issues/new/choose) with:

- the Texture (for example `settle`) and where you mounted it (hero, card, background),
- your framework and version (Next.js 16, Vite + React 19, ...), browser and device,
- what you expected and what happened, with a screenshot or a short recording if it is visual,
- the smallest mount that shows it. A Texture needs a parent with `position: relative` and a size; say what the parent is.

If the install itself failed, paste the command and its full output.

## Propose a fix

If you already know the fix, open an issue and put the diff in it (or link a branch on your fork). We apply it in the catalog, it goes through the same fit and performance checks as every Texture, and the sync brings it back here with credit to you in the changelog. That is slower than merging your pull request and we know it; it is what keeps this repository and the registry identical.

## Ask for a Texture

Ideas for new Textures are welcome as issues: describe what the field looks like at rest and what the pointer does to it, and where you would use it. No promise on which tier a new Texture lands in.

## What does not belong here

- Pro Textures. Their code is not in this repository and must not be posted in issues, forks of this repository or pull requests. See the [licence](https://textures.dev/legal/license).
- Security reports. See [SECURITY.md](SECURITY.md).
- Account, billing or Pro questions: contact@textures.dev.

## Licence

Everything in this repository is MIT. By posting a fix in an issue you agree that it may be used under the same licence.
