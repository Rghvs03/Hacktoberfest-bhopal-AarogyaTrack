# AarogyaTrack --- Implementation Guide for Antigravity

> **Purpose:** This document guides Antigravity in implementing
> AarogyaTrack incrementally, as a careful junior engineer working with
> a human technical lead. It is not a one-shot build prompt and is not
> intended to prescribe every line of code.
>
> **Product principle:** Build a trustworthy healthcare workflow first.
> AI is an assistive layer, not the product's source of truth.

**Product:** AarogyaTrack\
**Tagline:** Every Visit Matters.\
**Product type:** Offline-first clinical record and longitudinal health
monitoring PWA\
**Initial users:** Travelling doctors and healthcare teams conducting
rural/periodic medical visits\
**Implementation status:** Greenfield / confirm repository state before
changing anything

------------------------------------------------------------------------

## 1. How Antigravity must work

Act as a capable junior full-stack engineer. Use engineering judgement,
inspect the existing project, identify risks, propose sensible options
and explain trade-offs. Do not blindly follow this document where a
better, safer implementation is justified.

### 1.1 Incremental delivery is mandatory

**Never attempt to build the entire product from one prompt.**

Work in small, reviewable milestones:

1.  Inspect the repository and understand its current state.
2.  State the goal and acceptance criteria for the current milestone.
3.  Propose the implementation approach and any decisions that need
    approval.
4.  Implement only the current milestone.
5.  Run relevant tests, type checks, linting and build checks.
6.  Summarize files changed, decisions made, test results and known
    limitations.
7.  **Stop and wait for the human to review and explicitly authorize the
    next milestone.**

Do not continue to the next milestone just because the current one is
complete. The human will review the work, test it, create a Git
commit/push when appropriate, and then give the next instruction.

### 1.2 Git and workspace rules

-   Never run `git push`, create a remote repository, change remote
    settings, or publish code.
-   Do not create commits unless explicitly asked.
-   Do not discard, reset, overwrite or reformat unrelated user changes.
-   Before editing, inspect `git status` and preserve all existing work.
-   Do not replace project configuration wholesale when a small change
    is sufficient.
-   Do not add dependencies without explaining why they are needed.
-   Never put API keys, credentials, patient data or secrets in source
    control.
-   Keep `.env` out of Git and maintain a safe `.env.example`.
-   If a task would require a destructive migration or data deletion,
    stop and ask first.

### 1.3 Engineering autonomy

Antigravity is encouraged to: - Suggest better component boundaries,
schemas, API contracts and test strategies. - Identify missing
requirements and edge cases. - Choose sensible implementation details
not fixed by this document. - Challenge unnecessary complexity. - Prefer
maintainable, boring technology over clever abstractions. - Ask a
concise question when a decision has material security, privacy,
clinical or architectural consequences.

Antigravity must not: - Invent clinical rules or claim medical
validation. - silently expand the MVP. - introduce microservices without
a demonstrated need. - use real patient data for development or demos. -
treat an AI response as verified clinical fact. - claim the product is
compliant, certified or production-ready without formal assessment.

------------------------------------------------------------------------

## 2. Product definition

### 2.1 The problem

Travelling doctors and healthcare workers may visit the same rural
communities periodically. Patient information can be spread across paper
registers, prescriptions and disconnected records. This makes it
difficult to quickly reconstruct a patient's history, compare
measurements across visits and maintain continuity of care. Manual
documentation is time-consuming, while unreliable connectivity makes
cloud-only applications unsuitable for some field workflows.

### 2.2 Product promise

AarogyaTrack gives authorized healthcare professionals a practical way
to:

-   Maintain structured patient records.
-   Record consultations and vital measurements.
-   Review a patient's history across multiple visits.
-   See measurement trends over time.
-   Generate AI-assisted summaries of existing records.
-   Continue essential record-entry workflows offline and synchronize
    later.

### 2.3 Product positioning

**An offline-first clinical record and longitudinal health monitoring
workspace for travelling healthcare professionals.**

Do not position the MVP as an autonomous diagnostic system, a
disease-prediction engine, an emergency response service or a
replacement for a clinician.

### 2.4 Primary user journey

1.  A doctor signs in.
2.  The doctor searches for an existing patient or registers a new
    patient.
3.  The doctor reviews the patient's prior consultations and recorded
    measurements.
4.  The doctor creates a new consultation.
5.  The doctor records complaints, observations, vital measurements and
    the clinician-entered assessment/plan.
6.  The application saves the consultation locally if offline, or sends
    it to the backend if online.
7.  The doctor can view a chronological history and measurement trends.
8.  When online, the doctor may request an AI-generated summary of the
    available record.
9.  The doctor reviews AI-generated content; it does not silently become
    a signed clinical record.
10. Offline changes synchronize when connectivity returns.

------------------------------------------------------------------------

## 3. Product and clinical safety boundaries

This is a healthcare-adjacent software prototype. Treat all health
information as sensitive.

### 3.1 Synthetic data only during hackathon development

-   Use fictional names, villages, dates and measurements.
-   Do not copy records from real patients, hospitals, clinics or
    medical camps.
-   Do not ask a doctor or teammate to upload identifiable patient
    records into the development environment.
-   Use clearly labelled demo accounts and demo datasets.
-   Do not use real patient data with Groq or any other external AI
    provider.

### 3.2 AI is assistive, not authoritative

The AI may: - Summarize information already present in the record. -
Reformat clinician-entered notes into a draft structure. - Describe
simple, traceable changes in recorded measurements. - Identify missing
or inconsistent data for human review.

The AI must not: - Diagnose a patient. - Recommend or prescribe
medication. - Change a clinician-entered diagnosis or treatment plan. -
Predict disease progression or claim a probability of deterioration. -
Infer facts that are absent from the record. - invent measurements,
symptoms, dates or medication history.

Every AI output must be labelled as AI-generated and require clinician
review before it is used or saved as a clinical note.

### 3.3 Measurement flags

For the MVP, prefer transparent, deterministic logic over an LLM for
flags.

-   Any thresholds must be explicitly documented, sourced and reviewed
    by a qualified clinical stakeholder before being represented as
    clinical alerts.
-   If validated thresholds are not available, show measurements and
    simple changes without assigning a diagnosis or urgency category.
-   Distinguish a missing value from zero.
-   Show units, measurement dates and source consultation.
-   Do not present a trend line as proof of disease progression.
-   Make it possible to inspect the original measurements behind every
    insight.

### 3.4 Privacy and security baseline

Build with privacy and security in mind from the first milestone, not as
a final polish task.

At minimum: - Authentication and server-side authorization for every
protected resource. - Least-privilege access. - Password hashing using a
modern password-hashing algorithm such as Argon2id or bcrypt with
appropriate parameters. - HTTPS in deployed environments. - Secrets
stored only in environment variables or a secrets manager. - No
sensitive data in application logs, analytics, URLs or error messages. -
Audit events for important record access and changes. - Data
minimization and a clear consent/notice flow before any real-world
pilot. - Explicit session expiry and logout behavior. - Validation on
both client and server; server validation is authoritative. - Safe error
handling that does not expose stack traces or database details. -
Encrypted local storage or a documented risk-based approach for any
sensitive offline cache. Browser storage is not automatically secure
merely because it is local. - A clear local-data logout policy,
especially on shared devices.

Do not claim compliance with Indian or international healthcare/privacy
frameworks based solely on implementing these controls. A real
deployment requires legal, security and clinical review, including
applicable Indian data-protection and health-data requirements.

------------------------------------------------------------------------

## 4. Agreed technology stack

Use this stack unless repository inspection reveals a strong reason to
adapt it. Explain any proposed change before making it.

### 4.1 Frontend

  -----------------------------------------------------------------------
  Area                    Technology              Intended use
  ----------------------- ----------------------- -----------------------
  Framework               React + TypeScript      User interface

  Build tool              Vite                    Development and
                                                  production build

  Styling                 Tailwind CSS            Responsive design
                                                  system

  UI primitives           shadcn/ui + Radix UI    Accessible reusable
                                                  components

  Routing                 React Router            Application navigation

  Server state            TanStack Query          API fetching, caching
                                                  and invalidation

  Forms                   React Hook Form         Form state and
                                                  submission

  Validation              Zod                     Shared form/schema
                                                  validation where
                                                  practical

  Charts                  Recharts                Longitudinal
                                                  measurement
                                                  visualization

  Offline database        Dexie.js / IndexedDB    Local structured data
                                                  and sync queue

  PWA                     Vite PWA plugin /       Service worker and app
                          Workbox                 shell caching

  IDs                     `crypto.randomUUID()`   Client-generated IDs
                                                  for offline-created
                                                  records
  -----------------------------------------------------------------------

### 4.2 Backend

  -----------------------------------------------------------------------
  Area                    Technology              Intended use
  ----------------------- ----------------------- -----------------------
  Runtime                 Node.js                 Server runtime

  Language                TypeScript              Type-safe application
                                                  code

  HTTP                    Express.js              REST API

  Database                PostgreSQL              Persistent relational
                                                  data

  ORM                     Prisma                  Schema, migrations and
                                                  queries

  Validation              Zod                     Request and response
                                                  validation

  Authentication          Secure session or       Authenticated access
                          JWT-based approach      

  Password hashing        Argon2id or bcrypt      Password storage

  Logging                 Structured logger with  Operational diagnostics
                          redaction               

  API documentation       OpenAPI, if useful      Contract documentation
  -----------------------------------------------------------------------

**Authentication decision:** Antigravity should compare secure
cookie-based sessions with short-lived access tokens before
implementation. For a browser-based PWA, prefer `HttpOnly`, `Secure`,
appropriately configured `SameSite` cookies when the deployment topology
allows it. Avoid storing long-lived bearer tokens in `localStorage`.
Document CSRF protections and session invalidation.

### 4.3 AI

  -----------------------------------------------------------------------
  Area                    Technology              Intended use
  ----------------------- ----------------------- -----------------------
  Provider                Groq                    Hosted inference

  Model                   `openai/gpt-oss-120b`   Initial model choice;
                                                  verify availability at
                                                  implementation time

  Integration             Official Groq SDK or    Server-side model calls
                          OpenAI-compatible       
                          client                  

  Output validation       Zod                     Validate generated JSON

  Prompt management       Versioned server-side   Traceable prompt
                          prompt files/modules    changes
  -----------------------------------------------------------------------

Important: - Verify the exact model identifier and current free-tier
availability in Groq's dashboard/documentation before implementation. -
Free-tier limits can change. Handle rate limits and provider outages
gracefully. - Keep the provider behind an internal AI service interface
so it can be replaced. - Do not expose the Groq API key in browser
code. - Do not send patient names, phone numbers, addresses or other
direct identifiers to the model. - For the hackathon, AI requests must
use synthetic demo data. - A valid JSON response is not necessarily a
clinically correct response. Validate structure, show source data and
require clinician review.

### 4.4 Development and deployment

Suggested starting setup:

-   Git and GitHub for version control.
-   Postman or Bruno for API testing.
-   Docker Compose for local PostgreSQL, if helpful.
-   Vercel for the frontend.
-   Render or another suitable Node hosting provider for the API.
-   Managed PostgreSQL (for example, Supabase) or a PostgreSQL instance
    with reliable backups.

Do not deploy real health information to a free hobby environment
without first reviewing its security, retention, backup, access and
contractual terms.

------------------------------------------------------------------------

## 5. Architecture guidance

Use a **modular monolith** for the MVP: one frontend, one backend API
and one PostgreSQL database. Do not introduce microservices.

### 5.1 Logical architecture

``` text
Doctor / Healthcare Worker
          |
          v
React + TypeScript PWA
          |
          +-------------------------------+
          |                               |
          v                               v
Online API Client                  Local Data Layer
TanStack Query                    Dexie.js / IndexedDB
          |                               |
          v                               v
Express REST API                  Local Consultation Drafts
          |                       Pending Sync Queue
          |                               |
          |<--------- Sync API ------------+
          |
          +-----------------------------+
          |              |              |
          v              v              v
      Auth Module   Patient Module   Consultation Module
          |              |              |
          +--------------+--------------+
                         |
                         v
                    Prisma ORM
                         |
                         v
                    PostgreSQL

AI request path:
Consultation / Patient Context
          |
          v
Backend AI Service
          |
          v
Identifier Minimization + Prompt Construction
          |
          v
Groq API
          |
          v
Zod Response Validation
          |
          v
AI Draft Returned to Doctor for Review
```

### 5.2 Backend module boundaries

Organize by domain rather than putting all logic in route handlers.

Suggested modules: - `auth` - `users` - `patients` - `consultations` -
`vitals` - `sync` - `ai` - `audit`

Each module may contain routes/controllers, service logic, schemas and
repository/database access as appropriate. Avoid overengineering
abstractions for a small MVP.

### 5.3 API conventions

-   Use `/api/v1` as the API prefix.
-   Use JSON request/response bodies.
-   Validate all incoming payloads.
-   Return consistent error shapes.
-   Use appropriate HTTP status codes.
-   Enforce authorization in the backend, not just by hiding UI
    controls.
-   Do not accept a doctor/user ID from the client as proof of identity;
    derive the authenticated actor from the server-side session.
-   Paginate patient and consultation lists as they grow.
-   Use idempotency for offline sync submissions.

Potential initial routes (Antigravity may refine these):

``` text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/patients
POST   /api/v1/patients
GET    /api/v1/patients/:patientId
PATCH  /api/v1/patients/:patientId

GET    /api/v1/patients/:patientId/consultations
POST   /api/v1/patients/:patientId/consultations
GET    /api/v1/consultations/:consultationId

GET    /api/v1/patients/:patientId/vitals

POST   /api/v1/sync/consultations
POST   /api/v1/ai/patients/:patientId/summary
POST   /api/v1/ai/consultations/:consultationId/structure
```

These are a starting contract, not a command to implement all endpoints
in one milestone.

------------------------------------------------------------------------

## 6. Domain model and data design

Antigravity should review and improve this model before writing
migrations. Preserve clear relationships, ownership and auditability.

### 6.1 Core entities

**User** - `id` - `name` - `email` - `passwordHash` - `role` -
`isActive` - `createdAt` - `updatedAt`

**Patient** - `id` (UUID) - `patientCode` (human-readable unique code;
avoid using sensitive information) - `fullName` - `dateOfBirth` or age
where DOB is unavailable - `gender` (use a carefully considered field
design) - `village` / locality - `contactNumber` (optional) -
`medicalHistory` (structured where practical; do not force everything
into one unstructured string) - `allergies` - `createdBy` -
`createdAt` - `updatedAt` - `version` (for optimistic concurrency where
needed)

**Consultation** - `id` (UUID, generated client-side where offline
creation is required) - `patientId` - `doctorId` - `consultationDate` -
`chiefComplaints` - `observations` - `clinicianAssessment`
(clinician-entered) - `treatmentPlan` (clinician-entered) -
`followUpDate` (optional) - `createdAt` - `updatedAt` - `sync metadata`
where needed

**Vital** - `id` - `consultationId` - `type` or typed measurement
columns - `value` - `unit` - `recordedAt` - `recordedBy` - optional
measurement context

Antigravity should choose a practical representation. For a small set of
known vital types, typed nullable columns can be straightforward; a
normalized measurement table can be more extensible. Explain the
trade-off before choosing.

Potential vital types for the MVP: - Systolic blood pressure (mmHg) -
Diastolic blood pressure (mmHg) - Blood glucose (with explicit unit and
context) - Heart rate (bpm) - Temperature (with explicit unit) - Oxygen
saturation (%)

Do not assume all measurements are present at every visit.

**AISummary** - `id` - `patientId` - `generatedBy` - `modelProvider` -
`modelName` - `promptVersion` - `summaryPayload` -
`sourceConsultationIds` - `createdAt` - `reviewStatus` - `reviewedBy`
(optional) - `reviewedAt` (optional)

**AuditEvent** - `id` - `actorUserId` - `action` - `entityType` -
`entityId` - `timestamp` - minimal metadata that does not duplicate
sensitive clinical content

**SyncOperation** (or equivalent client sync metadata) - `id` -
`clientOperationId` (unique idempotency key) - `userId` - `entityType` -
`entityId` - `operation` - `status` - `createdAt` - `processedAt` - safe
error code, not sensitive payload content

### 6.2 Data ownership and access

For the initial MVP, decide whether records belong to a single doctor
account or an organization. Do not accidentally build a multi-tenant
platform without defining tenant boundaries.

At minimum: - Every patient and consultation must have a clear
owner/scope. - Every read and write must check that the authenticated
user is authorized for that scope. - A doctor must not be able to guess
another patient's UUID and access the record. - If an organization
concept is introduced, enforce organization scoping consistently in all
queries.

------------------------------------------------------------------------

## 7. Feature requirements

### P0 --- Core MVP

#### A. Authentication and doctor workspace

-   Doctor can sign in and sign out.
-   Protected routes require authentication.
-   Backend validates the session on every protected operation.
-   Dashboard displays a small set of useful counts and recent activity.
-   Demo credentials, if used, are clearly marked as demo-only.

#### B. Patient registry

-   Register a patient with the minimum required fields.
-   Generate a unique patient code.
-   Search by patient name or code.
-   View patient profile.
-   Edit allowed demographic fields.
-   Show clear empty, loading and error states.
-   Avoid duplicate patient creation where practical; do not merge
    records automatically based only on similar names.

#### C. Consultation records

-   Create a consultation for an existing patient.
-   Record complaints, observations, clinician assessment and plan.
-   Record available vital measurements with units.
-   View consultation history in chronological order.
-   Preserve original consultation entries; corrections should be
    attributable rather than silently overwriting history.

#### D. Longitudinal timeline

-   Display measurements over time.
-   Allow the doctor to select a measurement type.
-   Show date, value, unit and originating consultation.
-   Handle missing values and irregular measurement intervals.
-   Provide a way to inspect source records.
-   Avoid implying that a chart itself is a diagnosis.

#### E. AI patient summary

-   Doctor explicitly requests a summary.
-   Backend fetches only records the doctor is authorized to access.
-   Use synthetic data in development/demo.
-   Minimize direct identifiers before external inference.
-   Prompt instructs the model to summarize only provided facts and
    identify missing information.
-   Validate response with Zod.
-   Show source consultation dates and a clear AI-generated label.
-   Allow doctor to review; do not auto-save as a clinician-authored
    note.
-   Handle timeout, rate limit, invalid JSON and provider outage with a
    useful fallback.

#### F. Offline consultation capture

-   Cache the application shell.
-   Persist selected/synchronized patient data locally.
-   Allow creation of a consultation while offline.
-   Clearly show offline and pending-sync states.
-   Queue operations and retry when connectivity returns.
-   Prevent duplicate server writes using client-generated operation
    IDs.
-   Do not claim all records are available offline: define which patient
    records are explicitly synchronized to the device.
-   Consider shared-device risks and local-data expiry/logout behavior.

### P1 --- Only after P0 works

-   Voice-assisted documentation.
-   Follow-up reminders.
-   Exportable patient summary.
-   Additional staff roles.
-   Better sync conflict resolution.
-   Additional languages.

### P2 --- Future product exploration

-   ABDM-compatible integrations, subject to proper standards and
    approvals.
-   Multi-organization administration.
-   Clinically validated decision-support.
-   Validated predictive models.
-   Hospital/PHC integrations.
-   Advanced reporting.

------------------------------------------------------------------------

## 8. Offline-first design requirements

Offline support is a core product requirement, not an optional
enhancement.

### 8.1 Local persistence

Use IndexedDB through Dexie.js for structured local data. Service-worker
caching is for application assets and should not be confused with secure
clinical-data storage.

Define: - Which patient records can be cached. - How records are
selected for offline availability. - How long local data persists. -
What happens on logout. - What happens if device storage is cleared or
full. - How the user knows whether a record is local, remote or pending
sync.

### 8.2 Sync behavior

Recommended initial approach: - Client generates UUIDs for
offline-created consultations. - Store the consultation and an outbox
operation in one local transaction. - On reconnect, send queued
operations in a deterministic order. - Server validates the payload and
authorization. - Server uses a unique idempotency key to avoid duplicate
creation. - Server returns the canonical saved record and sync result. -
Client marks the outbox item as complete only after server
confirmation. - Failed items remain visible and retryable.

### 8.3 Conflict strategy

Keep the first version simple and safe: - Consultation entries are
append-only. - Do not silently overwrite a consultation created on
another device. - Patient profile edits use a version number or
`updatedAt` check. - On conflict, preserve both versions or request
manual resolution. - Never silently discard a clinician's locally
entered consultation.

### 8.4 Network state

Do not rely only on `navigator.onLine` as proof that the API is
reachable. Use it as a hint and handle actual request failures. Show: -
Online / offline indication. - Last successful sync time. - Number of
pending records. - Failed sync state with retry action.

------------------------------------------------------------------------

## 9. AI implementation requirements

### 9.1 Provider abstraction

Keep provider-specific code isolated.

Conceptual interface:

``` ts
interface AIProvider {
  generatePatientSummary(input: PatientSummaryInput): Promise<PatientSummaryOutput>;
  structureConsultation(input: ConsultationDraftInput): Promise<StructuredConsultationOutput>;
}
```

The actual design may differ. Avoid building a complex generic AI
framework for only one provider.

Configuration:

``` env
AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
```

Use a validated environment configuration module. Fail safely at startup
or disable AI clearly if required configuration is missing; do not leak
secrets in error output.

### 9.2 Patient summary output

Use a constrained response shape, for example:

``` ts
type PatientSummaryOutput = {
  overview: string;
  recordedConditions: string[];
  measurementTrends: Array<{
    measurement: string;
    observation: string;
    sourceDates: string[];
  }>;
  missingInformation: string[];
  itemsForClinicianReview: string[];
  sourceConsultationIds: string[];
  disclaimer: string;
};
```

Antigravity may refine the schema, but must: - Validate every field. -
Reject malformed or unexpected output. - Ensure source IDs refer only to
records included in the input context. - Avoid accepting model-generated
measurements as new database facts. - Treat model output as untrusted
input. - Limit prompt and response size. - Add timeouts and controlled
retries. - Respect provider rate limits. - Avoid logging prompts or
patient content.

### 9.3 Prompt design

Prompts should: - State that the model is producing a draft summary for
a clinician. - Restrict the model to the supplied record. - Require it
to say when information is unavailable. - Prohibit diagnosis, treatment
recommendations and medication instructions. - Require source dates/IDs
for factual trend statements. - Return the defined structured response
only.

### 9.4 AI failure behavior

If Groq is unavailable, rate-limited or returns invalid output: - Keep
all core patient and consultation functionality usable. - Show a
non-blocking message. - Allow the doctor to retry. - Never fabricate a
fallback AI response. - Do not lose the consultation being entered.

------------------------------------------------------------------------

## 10. UX and design direction

Build a calm, clear, professional healthcare interface. Avoid a flashy
AI-dashboard aesthetic.

Design priorities: - Readability and clear hierarchy. - Large touch
targets for field use. - Responsive layout for laptop, tablet and
mobile. - Clear labels and units for every measurement. - Strong
empty/loading/error states. - Visible offline and sync status. -
Accessible contrast and keyboard navigation. - Minimal steps to register
a patient or record a consultation. - Avoid dense dashboards that
overwhelm the doctor.

Potential main navigation: - Dashboard - Patients - New Consultation
(primary action) - Sync Status - Settings

Patient profile should make these sections easy to find: - Overview -
Consultation History - Vitals & Trends - AI Summary

Do not spend time polishing decorative elements before the main clinical
workflow works.

------------------------------------------------------------------------

## 11. Testing strategy

Testing is part of each milestone, not a final separate phase.

### Unit tests

-   Validation schemas.
-   Domain services.
-   Authorization checks.
-   Trend calculation logic.
-   AI output parsing.
-   Sync idempotency behavior.

### Integration tests

-   Authentication and protected routes.
-   Patient CRUD.
-   Consultation creation and retrieval.
-   Vitals linked to the correct consultation.
-   Patient ownership enforcement.
-   AI route with mocked provider.
-   Duplicate sync operation handling.

### Frontend tests

-   Patient registration validation.
-   Consultation form behavior.
-   Timeline rendering with missing measurements.
-   Offline state display.
-   Pending sync and retry behavior.
-   AI output review state.

### Manual end-to-end scenarios

1.  Sign in as a demo doctor.
2.  Register a synthetic patient.
3.  Record two or more consultations with different dates and
    measurements.
4.  Reopen the patient and inspect the timeline.
5.  Generate and review an AI summary.
6.  Disconnect the network.
7.  Create another consultation.
8.  Reconnect.
9.  Confirm synchronization occurs once.
10. Refresh and verify the record remains available.
11. Attempt access to a patient outside the user's authorized scope and
    confirm it is denied.

Never use a real patient's data to test these scenarios.

------------------------------------------------------------------------

## 12. Suggested repository structure

Antigravity should inspect the current repository and propose the final
structure before creating files. A possible monorepo layout:

``` text
arogyatrack/
  apps/
    web/
      src/
        app/
        components/
        features/
          auth/
          dashboard/
          patients/
          consultations/
          timeline/
          ai-summary/
          sync/
        lib/
        db/
        hooks/
        routes/
    api/
      src/
        config/
        middleware/
        modules/
          auth/
          users/
          patients/
          consultations/
          vitals/
          sync/
          ai/
          audit/
        lib/
        app.ts
        server.ts
      prisma/
        schema.prisma
        migrations/
  packages/
    shared/
      src/
        schemas/
        types/
  docs/
  .env.example
  README.md
```

A monorepo is a suggestion, not a requirement. A simpler repository
layout is acceptable if it improves delivery speed and maintainability.
Do not create empty folders merely to match this diagram.

------------------------------------------------------------------------

## 13. Phased implementation plan and mandatory stop points

**Each phase is a separate Antigravity task. Complete one phase, report,
and stop.**

### Phase 0 --- Repository reconnaissance and technical plan

**Goal:** Understand before changing.

Tasks: - Inspect repository, package manager, existing code and Git
status. - Identify existing conventions and unfinished work. - Confirm
runtime versions and available scripts. - Identify deployment
assumptions. - Propose a frontend/backend layout. - Propose
authentication/session approach. - Propose initial data model and
offline sync design. - Identify privacy/security risks and unresolved
decisions.

Deliverables: - Short architecture proposal. - Initial implementation
sequence. - Risks and decisions requiring human approval. - No broad
implementation.

**Stop and wait for approval.**

### Phase 1 --- Project foundation and quality gates

**Goal:** Establish a maintainable development foundation.

Tasks: - Set up or refine frontend and backend TypeScript projects. -
Configure linting, formatting and type checking. - Add environment
validation. - Add health-check endpoint. - Add PostgreSQL development
setup. - Configure Prisma connection and initial migration workflow. -
Add safe error handling and structured logging with redaction. - Add
`.env.example` and confirm secrets are ignored by Git. - Add a concise
developer README.

Acceptance criteria: - Frontend starts and builds. - Backend starts. -
Health endpoint works. - Database connection can be verified. - Type
check and lint pass. - No secrets committed.

**Stop and wait for approval.**

### Phase 2 --- Security foundation and authentication

**Goal:** Establish authenticated access before patient data features.

Tasks: - Implement doctor account/session flow. - Add password
hashing. - Add login, logout and current-user endpoints. - Add protected
backend middleware. - Add frontend protected routes. - Add basic audit
events for authentication. - Add rate limiting to login where
appropriate. - Document session and CSRF choices.

Acceptance criteria: - Unauthenticated users cannot access protected
endpoints. - Invalid credentials are rejected safely. - Logout
invalidates the session. - User identity is derived server-side. - Tests
cover authentication and authorization basics.

**Stop and wait for approval.**

### Phase 3 --- Patient registry

**Goal:** Deliver the first useful end-to-end workflow.

Tasks: - Implement patient schema and migration. - Add patient create,
list, search, detail and update endpoints. - Add server-side validation
and authorization. - Build patient directory and registration form. -
Build patient profile shell. - Add loading, empty, validation and error
states. - Add synthetic demo seed data only if approved.

Acceptance criteria: - Doctor can register a synthetic patient. -
Patient appears in directory. - Search works. - Profile can be opened
and updated. - Unauthorized patient access is rejected. - Tests pass.

**Stop and wait for approval.**

### Phase 4 --- Consultation and vital records

**Goal:** Make the core clinical workflow usable.

Tasks: - Implement consultation and vital schemas. - Create consultation
endpoints. - Build consultation entry form. - Validate measurement units
and ranges at the data-quality level without inventing diagnoses. -
Display consultation history. - Ensure consultations preserve their
author and timestamps. - Add audit events for record creation and edits.

Acceptance criteria: - Doctor can create a consultation for an existing
synthetic patient. - Vital measurements are attached to the correct
consultation. - History appears chronologically. - Missing measurements
are represented correctly. - Records cannot be accessed across
unauthorized scopes.

**Stop and wait for approval.**

### Phase 5 --- Longitudinal timeline

**Goal:** Make patient history useful across visits.

Tasks: - Build vital history query. - Add measurement selector and
charts. - Display units, dates and source consultation. - Handle missing
or irregular data. - Add simple descriptive change calculations where
meaningful. - Make source records inspectable. - Keep clinical flag
thresholds out unless reviewed and approved.

Acceptance criteria: - Multiple visits appear in chronological order. -
Charts reflect the stored measurements. - Values can be traced to source
consultations. - Missing data does not create false zeroes. - No
unsupported diagnostic language appears.

**Stop and wait for approval.**

### Phase 6 --- AI service and patient summary

**Goal:** Add one safe, useful AI capability.

Tasks: - Verify Groq model availability, API access and limits. - Add
server-side AI provider configuration. - Build provider abstraction. -
Build patient-context retrieval with authorization. - Minimize
identifiers before external inference. - Create versioned prompt and Zod
output schema. - Implement patient summary endpoint. - Build AI summary
UI with source references and review state. - Handle rate limits,
timeout, malformed response and provider outage. - Use synthetic records
only.

Acceptance criteria: - Summary uses only supplied patient record
context. - Output passes schema validation. - Source consultation
references are valid. - AI output is visibly labelled and requires
clinician review. - AI cannot write or overwrite clinical records. -
Core workflows work when AI is unavailable.

**Stop and wait for approval.**

### Phase 7 --- PWA and offline foundation

**Goal:** Support essential field workflows without connectivity.

Tasks: - Configure PWA manifest and service worker. - Cache the
application shell. - Add Dexie schema and versioning. - Define which
patient data is explicitly available offline. - Persist offline
consultation drafts. - Add outbox/sync queue. - Add connectivity and
sync status UI. - Document local-data retention and shared-device
behavior.

Acceptance criteria: - Previously synchronized demo patient data can be
viewed offline. - A consultation can be created offline. - Refreshing
the page does not lose the local draft. - The UI clearly shows pending
sync. - AI is clearly unavailable offline without blocking record entry.

**Stop and wait for approval.**

### Phase 8 --- Synchronization and conflict handling

**Goal:** Reliably move offline-created consultations to the server.

Tasks: - Implement sync endpoint. - Add idempotency protection. - Add
retry and backoff. - Handle duplicate submissions. - Handle expired
sessions. - Add basic conflict handling for profile edits. - Preserve
append-only consultation entries. - Add sync integration tests.

Acceptance criteria: - Offline consultation syncs after reconnection. -
Repeated submission does not create duplicates. - Failed sync remains
visible and retryable. - No local consultation is silently discarded. -
Last successful sync is visible.

**Stop and wait for approval.**

### Phase 9 --- Hardening and demo readiness

**Goal:** Prepare a coherent, honest hackathon demonstration.

Tasks: - Run the full test suite, type checks, lint and production
builds. - Fix critical accessibility and responsive issues. - Verify
authorization on all data endpoints. - Check logs and error responses
for sensitive information. - Review dependency and secret handling. -
Prepare a synthetic demo dataset. - Prepare a repeatable demo script. -
Document known limitations and future work.

Acceptance criteria: - Main user journey works end-to-end. - Offline
scenario can be demonstrated. - AI summary can be demonstrated with
synthetic data. - No known critical security issue is ignored. - README
explains setup and limitations. - Demo does not imply clinical
validation.

**Stop and wait for approval.**

------------------------------------------------------------------------

## 14. Definition of done for every phase

A phase is not complete merely because the UI looks correct.

Before reporting completion, Antigravity must: - Run relevant tests. -
Run TypeScript checks. - Run linting where configured. - Run the
relevant build. - Check for console errors and obvious runtime
failures. - Review authorization and data exposure implications. -
Update documentation if architecture or setup changed. - Report any
tests that were not run and why.

### Required completion report

Use this format at the end of every phase:

``` text
PHASE: [number and name]
STATUS: Complete / Blocked / Partially complete

WHAT I IMPLEMENTED
- ...

IMPORTANT ENGINEERING DECISIONS
- ...
- Alternatives considered:
- Reason for selection:

FILES CREATED / MODIFIED
- ...

VALIDATION
- Tests:
- Type check:
- Lint:
- Build:
- Manual verification:

KNOWN LIMITATIONS / RISKS
- ...

GIT STATUS
- Working tree summary:
- No commit or push performed.

NEXT PHASE PROPOSAL
- ...
```

Then stop. Do not start the next phase until the human explicitly
approves it.

------------------------------------------------------------------------

## 15. First instruction to Antigravity

**Start with Phase 0 only.**

Inspect the repository and report what already exists. Do not scaffold
the whole product, install a large set of dependencies or implement
features yet.

Specifically: 1. Inspect the current directory and Git status. 2.
Identify existing frontend/backend code and scripts. 3. Recommend the
simplest maintainable project structure. 4. Review the proposed stack
and point out any compatibility or deployment concerns. 5. Propose an
initial database model and authentication approach. 6. Explain how
offline-created consultations can be synchronized safely. 7. List the
most important privacy and clinical-safety risks. 8. Present a phased
plan and ask for approval to begin Phase 1.

**End of instruction: Stop after the Phase 0 report. Wait for the
human's response.**

------------------------------------------------------------------------

## 16. Product decisions that must remain visible

The following are intentional product constraints:

-   The primary workflow is continuity of care across visits.
-   Offline consultation capture is a core requirement.
-   Patient records and clinician-entered notes are the source of truth.
-   AI is optional assistance and must never block core workflows.
-   AI summaries are drafts for clinician review.
-   The MVP uses synthetic patient data.
-   Measurement trends must be traceable to source records.
-   No autonomous diagnosis, prescribing or unvalidated disease
    prediction.
-   The first implementation is a modular monolith, not microservices.
-   Build one approved phase at a time.
-   The human reviews and controls Git commits and pushes.

**AarogyaTrack --- Every Visit Matters.**
