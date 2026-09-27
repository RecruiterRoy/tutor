# Student flow: first repair pass

Expected navigation: index.html → student-register.html → login.html → student-dashboard.html.
Existing students can go directly from the landing page to login. dashboard.html remains a separate, unchanged legacy page.

## Git comparison

On 2026-09-27, GitHub origin/main was verified with git ls-remote at
5f83e957d74ee8ee52b5b7bcc9ec94e21e14354e. Local HEAD was 24ecf94c,
one unpublished commit affecting 19 files, including student registration,
the student dashboard, Supabase initialization and server endpoints.
The existing untracked student-dashboard.js was not modified.
This comparison is against GitHub source, not the deployed Vercel build.

## Production configuration

Confirmed production URL: https://tutor-omega-seven.vercel.app
The owner reports that the necessary Supabase settings have been updated.
No Supabase configuration changes are needed from this local repair pass.
The following records the expected configuration for deployment troubleshooting.

1. Production hostname: tutor-omega-seven.vercel.app.
2. In Supabase Authentication → URL Configuration, set Site URL to that
   production origin and add its exact /login.html URL to Redirect URLs.
   Keep existing working domain entries. Add http://localhost:3000/login.html
   if local registration needs email confirmation.
3. Check confirmation email templates for hardcoded tution.app links.
   The registration code already supplies the current origin via emailRedirectTo.
4. Confirm Vercel's Supabase URL and public anon key refer to the same project
   as public/js/config.js. Student registration also requires the server-only
   SUPABASE_SERVICE_ROLE_KEY. Never put that key in browser configuration.
5. Verify the students schema includes the fields in
   add_student_registration_fields.sql and that authenticated students can
   read their own records. No database schema or policy was changed in this pass.

Reference: https://supabase.com/docs/guides/auth/redirect-urls

## Verification

Run: node --test tests/student-flow.test.js

## Email confirmation and password recovery

Login provides Resend confirmation email and Forgot password buttons, using
the entered email address. Both call Supabase Auth directly and show provider
errors rather than claiming success when Supabase rejects a request.
Signup already requests its initial confirmation email through auth.signUp;
resend uses auth.resend with type signup and does not create another account.

Recovery emails return to the same allowed /login.html URL. Supabase consumes
the recovery tokens; the page checks the session before displaying a new-password
form. Matching passwords are sent to auth.updateUser, then the page returns to
sign-in. Invalid or expired links leave the email-request controls available.
All login and registration password fields have accessible Show/Hide buttons.

Run both suites: node --test tests/student-flow.test.js tests/account-recovery.test.js

Delivery is separate from API acceptance. If no mail arrives, check Supabase
Auth logs, SMTP configuration, provider delivery logs, and spam folders.
Supabase's default SMTP is limited to project-team recipients and has restrictive
rate limits: https://supabase.com/docs/guides/auth/auth-smtp

Tests cover script parsing, client helper collisions, missing sessions,
temporary auth outages, optional section failures, and Vercel routing.
These are isolated tests with mocked Supabase, not live account tests.

Before release, verify on the production domain with a test student:
register, follow the confirmation email, log in, refresh the dashboard,
log out, and revisit the protected dashboard. Also verify an existing student
can still log in and that a failed optional data request does not log them out.

Registration creates an Auth account before creating its student profile.
A profile-write failure can therefore leave a partial account; this existing
two-step behavior still needs a separate recovery design and live validation.
