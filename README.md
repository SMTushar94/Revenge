# NEON RECKONING

A playable browser prototype for an original retro run-and-gun game. The year is 2189: the rogue signal known as the HOLLOW has awakened beneath the drowned city. Two operatives, Vex and Rook, must breach its defenses before it rewrites humanity.

## Run

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open `http://localhost:8000`.

## Controls

- **Player 1:** A/D move, W or Space jump, F shoot
- **Player 2:** Arrow keys move, Up jump, L shoot
- **P:** pause; **Enter:** start/restart

Collect cyan weapon cores for a spread shot. Survive the enemy waves and destroy the Warden. The prototype uses keyboard co-op on one screen and procedural canvas art; it requires no dependencies or backend.

## Prototype content and roadmap

Choose Vex, Rook, or Nova, a starting zone, and a threat level before deployment. Defeat each zone's boss to advance to the next zone. Operatives have different speed, lives, and firing rates; difficulty changes enemy speed and spawn rate as well as boss health. Physics currently includes acceleration, friction, gravity, jumping and weapon recoil.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the native release direction, limitations, and public repository inspirations. This is not yet a native mobile build and does not yet have touch controls.
