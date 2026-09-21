# Supabase Backend Handoff

## Goal

Replace browser demo persistence with Supabase while preserving the existing frontend workflows and page structure.

## 1. Authentication

Use Supabase Auth for all real credentials.

Recommended profile model:

- `auth.users` — authentication identity
- `profiles` — app identity and school scope
  - `id uuid` FK → `auth.users.id`
  - `display_name`
  - `email`
  - `role` (`superadmin`, `school_admin`, `branch_admin`, `front_desk`, `teacher`, `parent`, `student`)
  - `school_id`
  - `branch_id` nullable
  - `teacher_id` nullable
  - `parent_id` nullable
  - `student_id` nullable
  - `status`

Use invitation emails for initial account setup. Password reset should use Supabase reset links. Do not reproduce the current demo “any non-empty password” behavior.

## 2. Core relational tables

### Organization structure

- `schools`
- `branches`
- `school_years`
- `school_year_archives`

`school_years` should contain `id`, `school_id`, `name`, `start_date`, `end_date`, `status`, `is_current`, `closed_at`, and semester/term configuration.

Only one current school year per school should be allowed. Enforce that with a partial unique index or transactional server function.

### People

- `students`
- `parents`
- `parent_students`
- `teachers`
- `profiles`
- `invitations`
- `teacher_permissions` (or a JSONB permission document if you prefer, although normalized rows are easier to audit)

The frontend now uses stable teacher permission keys such as `attendance.view`, `attendance.manage`, `grades.view`, `grades.manage`, `students.guardian_contact`, `students.health_alerts`, `messages.send`, and `documents.upload`. Preserve these keys so the UI can stay unchanged while authorization moves to RLS/server functions.

### Protected student data

If a school has a legitimate requirement to collect SSN/government identifiers, keep them out of the ordinary `students` row and normal API payloads. Use a separate table such as `student_protected_identifiers`:

- `student_id` (PK/FK)
- `ssn_ciphertext` or another encrypted representation
- `birth_certificate_number_ciphertext`
- `passport_number_ciphertext`
- `state_student_id`
- `updated_at`
- `updated_by`

Only `superadmin` and `school_admin` should have default access. Branch principals should **not** receive protected-identifier access automatically. Use narrow RPCs/views for masked display and explicit access-log writes for reveal/read operations. Do not include these fields in roster CSV exports, parent/student APIs, teacher APIs, realtime broadcasts, logs, or analytics.

Guardian/family records should support legal first/middle/last name, relationship, email/phones, address, legal-guardian flag, authorized-pickup flag, primary-contact flag, preferred language, and communication preference.

### Annual enrollment

- `student_enrollments`
  - `id`
  - `student_id`
  - `school_id`
  - `branch_id`
  - `school_year_id`
  - `grade_id`
  - `grade_label`
  - `status`
  - `enrolled_at`
  - `rollover_source_id`

The permanent `students` row represents the person. `student_enrollments` represents that student's participation in a particular academic year.

### Academics

- `classes`
- `class_enrollments`
- `assignments`
- `grades`
- `attendance`
- `report_periods`

Classes should reference `school_year_id` and a term/semester (`full_year`, `semester_1`, `semester_2`, or a term FK if terms are normalized). Teacher Class Home and My Classes already expose Semester 1 / Semester 2 views, so preserve that contract in Supabase. Do not rely on the current browser arrays where some seed classes have no year ID.

### School operations

The shared School Home reads from the same school/branch records used by the operational modules. Keep announcements, events, cafeteria menus, documents, photos, and school-year data branch-aware so every portal renders the same published information without duplicating records.

- `announcements`
- `events`
- `forms`
- `form_submissions`
- `lunch_menus`
- `documents`
- `photo_albums`
- `messages`
- `message_recipients`
- `applications`

### Billing

- `charges`
- `payments`
- `payment_allocations` if one payment may cover multiple charges
- `receipts`

Never trust payment totals calculated only in the browser. Provider webhooks/server functions should be the source of truth for online transactions.

### Platform operations

- `audit_logs`
- `notification_preferences`
- `integration_settings`
- `subscriptions`

## 3. School-year rollover should be transactional

The current frontend wizard already collects the required inputs. Implement a Supabase RPC/Edge Function such as `rollover_school_year(...)` that performs the closeout atomically:

1. Verify caller is authorized for the school.
2. Lock/validate the current school year.
3. Mark old year `closed` and `is_current = false`.
4. Write an immutable/archive summary row.
5. Create the new school year.
6. For each decision:
   - `promote` → new enrollment with next grade
   - `retain` → new enrollment with same/chosen grade
   - `graduate` → no new enrollment; update student lifecycle status as appropriate
   - `not_returning` → no new enrollment; preserve old records and mark profile inactive
   - `skip` → leave undecided; do not create new enrollment
7. Optionally copy class templates into the new year with **empty rosters**.
8. Set the new year as current.
9. Write an audit-log entry.
10. Return counts/new IDs to the frontend.

Never delete the closed year's grades, attendance, classes, billing, or enrollments.

## 4. Row Level Security

RLS is essential because client-side guards are not security.

High-level rules:

- `superadmin` — platform-wide access through controlled policies/functions
- `school_admin` — all rows where `school_id = profile.school_id`
- `branch_admin` — rows in their school, with branch-scoped operational writes unless a specific school-wide permission is granted
- `front_desk` — limited student/family/admissions/attendance operations; no finance, audit, staff-admin, or school-year closeout
- `teacher` — assigned classes/students only, further restricted by the individual teacher permission set. A teacher must pass both assignment scope and permission checks (for example, `grades.manage`) before a write succeeds.
- `parent` — only linked children and parent-visible school content
- `student` — only own records and student-visible school content

Avoid trusting `school_id`, `branch_id`, or role values supplied by the browser. Derive scope from the authenticated profile inside policies/functions.

## 5. Storage

Create Supabase Storage buckets such as:

- `school-documents`
- `admissions-documents`
- `student-private-documents`
- `school-photos`

Store only metadata/path in Postgres. Use signed URLs for private files and RLS/storage policies for access. Replace `assets/js/demo-files.js` after Storage is connected.

## 6. Email and SMS

The frontend already creates invitation/message/notification intents. Backend delivery can use Edge Functions plus a provider.

Suggested event types:

- user invitation
- password reset (Supabase Auth)
- attendance alert
- grade notification
- billing reminder
- payment receipt
- admissions status update
- school announcement

Record delivery attempts/status instead of only showing “sent” in the browser.

## 7. Payments

Keep the current charge/receipt UI, but move payment truth to a real provider and server-side verification.

Flow:

1. Create checkout/payment intent server-side.
2. Provider handles payment details.
3. Webhook verifies success.
4. Insert immutable payment transaction.
5. Allocate payment to charge(s).
6. Create receipt number server-side.
7. Notify family.
8. Update UI through database fetch/realtime subscription.

Do not store raw card details in Supabase.

## 8. Migration order

Recommended order:

1. Supabase project + environment configuration
2. Tables/enums/indexes
3. Auth + `profiles`
4. RLS helper functions/policies
5. Schools/branches/users/invitations
6. Students/parents/teachers + teacher permissions + protected-identifier table
7. School years + enrollments + rollover RPC
8. Classes/assignments/grades/attendance
9. Admissions
10. Billing/payments
11. Messaging/notifications
12. Storage/documents
13. Audit logs
14. Replace each `SMS_API` mock method with Supabase calls
15. Remove demo storage/session bridge code from production build

## 9. Frontend files to replace or retire during backend work

- Replace mock logic in `assets/js/api.js` with Supabase data access / Edge Function calls.
- Replace demo login/session logic in `assets/js/auth.js` and `assets/js/security.js` with Supabase sessions.
- Retire `assets/js/demo-store.js` from the production bundle.
- Retire `assets/js/demo-files.js` after Supabase Storage works.
- Retire `super-admin/shared/bridge.js` after all Super Admin pages use the same database.

Keep the current page-level role guards as UX routing, but enforce every permission again in RLS/server functions.
