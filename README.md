# NEON RECKONING

A playable browser prototype for an original retro run-and-gun game. The year is 2189: the rogue signal known as the HOLLOW has awakened beneath the drowned city. Two operatives, Vex and Rook, must breach its defenses before it rewrites humanity.

## Run

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open `http://localhost:8000`.

## Controls

- **Player 1:** A/D move, W or Space jump, F shoot, Q pulse bomb
- **Player 2:** Arrow keys move, Up jump, L shoot, K pulse bomb
- **P:** pause; **Enter:** start/restart

Collect cyan weapon cores for a spread shot. Survive the enemy waves and destroy the Warden. The prototype uses keyboard co-op on one screen and procedural canvas art; it requires no dependencies or backend.

## Prototype content and roadmap

Choose Vex, Rook, or Nova, a starting zone, and a threat level before deployment. Defeat each zone's boss to advance to the next zone. Operatives have different speed, lives, and firing rates; difficulty changes enemy speed and spawn rate as well as boss health. Physics currently includes acceleration, friction, gravity, jumping and weapon recoil.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the native release direction, limitations, and public repository inspirations. This is not yet a native mobile build and does not yet have touch controls.

Each player starts with three pulse charges. A pulse clears all current enemies and enemy projectiles and deals 30% of a boss’s maximum health; use Q (player 1), K (player 2), or the on-screen player 1 PULSE button. Charges reset on a new run.

Vex uses an original full-body sprite based on her concept art, with a simple movement bob rather than a full animation set. Rook and Nova still use procedural prototype sprites.

## City movement

The camera follows the leading living player rather than moving automatically. Walk right to explore a continuous city route through the Old Market, Transit District, and East Waterfront; walk left to revisit earlier blocks. The boss appears at the far end of each route. In local co-op the camera follows the leading player and keeps both players on screen. The district artwork and layout are still procedural prototype content, not a finished open-world city.
