# Repair backlog

Fix existing behavior before adding product features. Preserve page layouts,
keep changes reviewable, and distinguish tests from live user verification.

| Order | Issue | Status / completion evidence |
| --- | --- | --- |
| 1 | `/api/chat` rejects dashboard `message` payload and uses undefined `completion` | Fixed locally; regression tests cover both request formats, usage metadata, and malformed requests |
| 2 | Confirmation resend, forgotten password, password visibility missing | Implemented locally; mocked email and recovery tests pass; deployment and live recovery test pending |
| 3 | Legacy dashboard calls absent profile, subject, assessment, points, leaderboard, OCR and video endpoints | Open; map each caller and preserve legacy contracts before adding routes |
| 4 | Placeholder PDF extractor and missing `lib/pdfHandler` | Open; implement and test parsing/search with a real PDF and graceful unavailable-content handling |
| 5 | Missing `/api/school-management` | Open; inspect actual schema, define server-side role/school authorization, then implement registration and management actions |
| 6 | Teacher sample classes/homework and attendance that does not persist | Open; replace each sample workflow with verified database reads/writes after issue 5 |
| 7 | Payment handlers not registered in Express | Open; audit authentication, order ownership, signature verification and subscription schema before exposing routes |
| 8 | Analytics handlers not registered in Express | Open; audit user/admin authorization and wire only intended routes |
| 9 | Inconsistent role checks and `students` versus `user_profiles` models | Open; establish authoritative role/profile lookup without trusting localStorage flags or changing working accounts blindly |
| 10 | Multiple dashboard implementations and disconnected React prototype | Open; retain current student entrypoint and legacy URLs until feature parity is verified |

## Previously addressed

- Student registration route aliases and Vercel root mapping.
- Supabase client helper collision.
- Dashboard initialization errors incorrectly redirecting authenticated users.
- Stale/malformed browser profile data interrupting initialization.
- School-admin login destination points to the existing school-admin page.
- Production service-key name mismatch causing student profile updates to return 500
  (deployed commit 3c806666; user save still needs confirmation).
- Reported expired confirmation link investigated: the account was already confirmed;
  the user subsequently confirmed login worked.

## Verification limitations

Passing unit tests does not prove SMTP delivery, paid AI availability, database
policies, payment settlement, or Android packaging. Verify relevant real workflows
as each repair ships. No class or board values should be guessed for existing users.
The untracked root student-dashboard.js is existing user work and is not part of repairs.
