# Changelog

Every change to the free set, newest first. This file is written by the sync from the Textures catalog. Each line carries the first eight characters of the SHA-256 of the Texture's file, the same file `npx shadcn@latest add https://textures.dev/r/<slug>.json` writes, so you can tell which one you have: `shasum -a 256 components/textures/<slug>.tsx`.

## 2026-11-18

- Added **Magnet** (`magnet`, `26031d07`): A field of small dots. The pointer is a magnet: the twenty-five nearest dots leave their cells and snap together into one solid block under it, then spring back out when it moves on or leaves.
- Added **Swell** (`swell`, `7d286fe6`): Eighteen columns of hairline dashes in equal-gap stacks. Under the pointer the dashes thicken into a diamond-shaped bump that squeezes its neighbours; the grid flattens when it leaves.
- Added **Lift** (`lift`, `c001e07e`): A field of small white containers, each holding a dark circle resting in its corner. The pointer pulls the circles toward it like a magnet, with a wide reach.
- Added **Beam** (`beam`, `c1425331`): A field of hairlines. The pointer carries a beam across them: the lines under it swell into bars and part to make room, and the beam glides after the pointer.
- Added **Cells** (`cells`, `2605c0d0`): A grid of cells, each with a small square. Near the pointer the squares swell to fill their cells in a soft dome, trailing it; they shrink back when it leaves.
- Added **Blinds** (`blinds`, `7f8a3398`): Twenty-seven thin lines. The pointer twists them up: each is a ribbon turning about its centre, opening to a full stripe under the cursor, the white opening as tapered spindles. Curtain, inverted.

## 2026-11-17

- Added **Settle** (`settle`, `24ceaa44`): Twenty columns of thin bars, denser toward the floor on the left and the ceiling on the right. Under the pointer the bars gather toward it along their columns and relax when it leaves.
- Added **Warp** (`warp`, `997b0a95`): A grid of small rectangular tiles. Near the pointer, columns widen and rows deepen, stretching tiles into squares, bars and dashes.
- Added **Pillars** (`pillars`, `e61c783e`): A field of white-capped cylinders, row behind row. Under the pointer they rise in a smoothed pyramid, most beneath it and less around, bodies showing between the caps, and settle back as it moves on.
- Added **Pinch** (`pinch`, `6f02021a`): A grid of cells, each filled by its square. Near the pointer the squares shrink to the smallest unit in a soft dome, trailing it; they fill their cells again when it leaves. Cells, inverted.
- Added **Twist** (`twist`, `ad0fbef7`): A field of cells, each with a thin upright bar. Every bar turns to point at the pointer; fat when the cursor lies along its row or column, thin on the diagonals: a cross with a twist in each quadrant.
- Added **Watch** (`watch`, `d0f2a226`): A grid of dim round cells, each holding a small dot. Under the pointer the dots fill their cells, most at the cursor and less with distance, and every dot turns toward it: a field of eyes.
