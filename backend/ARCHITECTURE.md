# Architecture

## Layers
- **Routes**: request mapping
- **Controllers**: input validation + orchestration
- **Services**: business logic
- **Repos**: database access (mysql2/promise)
- **Middlewares**: auth, role checks, access gating, errors
- **Sockets**: presence/messaging/typing/call signaling
- **Jobs**: access expiry enforcement

## Access control model
- `users.status`:
  - `active` => can use app
  - `expired` => trial/subscription ended
  - `pending` => registered but no access (rare in this starter)
  - `blocked` => manually blocked
- `users.access_ends_at` determines expiry for both trial + admin approvals.
- A background job marks active users as expired once `access_ends_at < now`.

## Invite codes
- One-time use: `invite_codes.is_used`
- Registration requires a valid unused invite code
- Invite stores `generated_by_user_id` -> tracks "My Invited Users Count" via `users.invited_by_user_id`

## Trial
- On registration:
  - `trial_ends_at = now + 3 days`
  - `access_ends_at = trial_ends_at`
  - Insert `subscriptions` record (source=trial)
