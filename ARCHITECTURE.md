# Release direction: Neon Reckoning

## Current milestone

This repository contains a **browser gameplay prototype**, not a shipping iOS or Android application. It validates three selectable operatives, three sequential combat zones, local keyboard co-op, difficulty tuning, and a small acceleration/recoil model. Stages currently share the same arena layout and enemy type; they are not yet authored platforming levels. The guns are original fictional rifles, not replicas or licensed brands.

## Creative pillars

- **Vex / assault:** balanced movement and three lives; VX-9 service rifle.
- **Rook / heavy:** slower movement, faster fire, four lives; M80 automatic rifle.
- **Nova / scout:** faster movement, two lives; Kite carbine.
- **The Breach:** rain-dark city perimeter; Warden encounter.
- **Iron Foundry:** molten industrial works; Forgemaster encounter.
- **Signal Core:** alien transmission chamber; the Hollow encounter.
- Normal, Veteran, and Nightmare change enemy speed, encounter frequency, and boss health. Progression moves through the remaining zones; selecting a later zone is useful for testing.

## Native path

Before shipping, choose a shared runtime and establish device performance targets. A practical route is **Godot**, exporting native Android and iOS builds, with a shared deterministic gameplay core and platform-specific Kotlin and Swift integrations for billing, achievements, permissions, and lifecycle. Alternatively, a Kotlin Multiplatform simulation with separately implemented renderers is viable but substantially increases engine and tooling work. Neither approach is implemented here. An iOS build requires macOS, Xcode, signing, and Apple developer enrollment; Android requires the Android SDK and signing. Verify current store policies and platform SDK requirements at release time.

Recommended boundaries:

1. **Simulation:** fixed timestep, input commands, collision, damage, spawns and seeded randomness, independent of rendering.
2. **Content:** versioned character, weapon, stage and difficulty definitions; validate data at build time.
3. **Presentation:** sprite animation, parallax, audio, effects and camera; interpolation decoupled from physics.
4. **Platform:** touch/controller input, accessibility, suspend/resume, save data, and store services. Keep platform SDKs out of simulation code.
5. **Networking:** local co-op first. Online co-op requires an explicit authoritative or rollback design, latency testing, reconnection and anti-cheat; this prototype has none and needs no backend.

## Production milestones

1. Agree on target devices, orientation, input, monetization, rating and online requirements. Build a measured native vertical slice with one complete level and boss.
2. Author level geometry, enemy archetypes, animation sets, sound, boss mechanics and original licensed assets. Add checkpoints, damage feedback, controller and touch support.
3. Move tuning into validated data, add deterministic simulation tests, device profiling and automated Android/iOS builds. Implement persistence, accessibility and localization.
4. Conduct closed playtests, balance, device compatibility, privacy/security and storefront review; complete signing and submission.

## Public project inspiration

- [Godot demo projects](https://github.com/godotengine/godot-demo-projects) (MIT): examples of engine patterns, input and 2D game structure.
- [libGDX](https://github.com/libgdx/libgdx) (Apache-2.0): reference for cross-platform game architecture and rendering abstractions.

These are architectural references, not copied game content. Check the specific asset and code licenses before reuse, and retain required notices. Do not copy characters, trademarks, level designs or audio from existing games.
