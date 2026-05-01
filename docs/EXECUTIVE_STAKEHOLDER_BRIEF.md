# Career-Ops Executive Stakeholder Brief

## 1) What Career-Ops Is

Career-Ops is an AI-powered job search operating system that helps a candidate run their search like a measurable pipeline rather than a manual spreadsheet process. It is a local-first, open-source command center that can:

- Evaluate job opportunities with a structured scoring model
- Generate tailored, ATS-optimized CV artifacts per role
- Scan hiring portals for new roles
- Track every opportunity across a canonical application pipeline
- Surface progress and bottlenecks in a terminal dashboard

In practical terms, Career-Ops converts unstructured job searching into a repeatable decision workflow: **discover -> evaluate -> decide -> apply -> track -> improve**.

## 2) What It Can Do (Business Capability View)

### Opportunity Discovery

- Scans multiple ATS ecosystems and company pages (Greenhouse, Ashby, Lever, and others through configured sources)
- Filters opportunities by role/keyword fit before effort is spent on applications
- Supports inbox-style processing of saved URLs for controlled throughput

### Offer Evaluation and Prioritization

- Uses a structured A-F (and legitimacy G) framework to rate fit, compensation signals, risks, and readiness
- Produces written evaluation reports for each role to support transparent go/no-go decisions
- Recommends against low-fit applications to preserve time and quality

### Application Asset Generation

- Produces role-tailored CV outputs from profile + source CV context
- Generates ATS-optimized PDF artifacts through automated rendering
- Supports interview-prep and story-bank accumulation for better conversion

### Pipeline Operations and Governance

- Maintains a single application tracker with merge, deduplication, and status normalization workflows
- Enforces canonical states and data quality checks to preserve reporting accuracy
- Provides a Go-based terminal dashboard for filtering, sorting, and status updates

### Scale and Throughput

- Supports batch processing with parallel workers for high-volume opportunity review
- Preserves resilient processing state and retry patterns for operational continuity

## 3) How It Helps Individuals

### Better decisions, less noise
- Prioritizes fit-first roles and reduces wasted applications.

### Faster high-quality execution
- Automates repetitive work (research structure, formatting, output generation) while keeping user control.

### Continuous improvement loop
- Every evaluation, report, and outcome enriches future targeting and messaging.

### Reduced cognitive load
- Replaces fragmented notes/spreadsheets with a unified, auditable workflow.

## 4) How It Helps Organizations and Teams

Although primarily candidate-focused, the system also creates organizational value for coaching teams, talent communities, and career services:

- **Standardization:** Shared framework for evaluating opportunities and advising candidates
- **Auditability:** Persistent artifacts (reports, tracker states, generated outputs) allow review and quality assurance
- **Operational discipline:** Canonical statuses and integrity scripts reduce process drift
- **Scalable support:** Batch workflows and templates allow a small team to support more candidates consistently
- **Knowledge transfer:** Structured modes and docs make the operating model teachable and repeatable

## 5) Core Technical Concept (How It Is Implemented)

Career-Ops is built around a **hybrid agent + script architecture**:

### Control Plane (Behavior Layer)
- Prompt-defined "modes" in `modes/*.md` describe each workflow (evaluate, scan, batch, tracker, etc.)
- AI CLI commands route into these modes to execute specific tasks

### Data Plane (State Layer)
- Human-readable files (Markdown, YAML, TSV) hold user profile, CV data, pipeline inbox, tracker records, and reports
- Canonical status definitions and file contracts keep downstream logic consistent

### Automation Plane (Execution Layer)
- Node.js scripts execute deterministic operations: scanning, PDF generation, merge/dedup/normalize, liveness checks, integrity validation
- Batch orchestration coordinates parallel workers with retries and resumability

### Visibility Plane (Operations Layer)
- A Go terminal dashboard provides a real-time operational view of pipeline status and outcomes

This separation of concerns is the key technical design: AI handles reasoning and personalization; scripts enforce deterministic data integrity and repeatable operations.

## 6) Trust, Safety, and Governance Model

Career-Ops includes explicit guardrails:

- Human-in-the-loop principle: it does not auto-submit applications
- Ethical fit guidance: discourages low-fit mass applications
- Data ownership: local-first model with user-controlled data files
- Updatability with protection: strict separation between user data and system logic
- Verification scripts: integrity checks for statuses, duplicates, and report links

This makes the system suitable for practical use without requiring a centralized SaaS control model.

## 7) Operational Maturity Signals

- Comprehensive script-level validation and pipeline checks
- CI workflows and security scanning in repository automation
- Update + rollback mechanism for system-layer files
- Documented governance, contribution standards, and community policy
- Clear data contract defining what can and cannot be auto-updated

## 8) Known Limitations and Risks

- Mode instructions are prompt-centric; quality depends on disciplined prompt adherence.
- Flat-file parsing is powerful but sensitive to formatting drift when manually edited.
- Some workflows assume specific local tooling and CLI availability.
- Cross-platform shell behavior can vary for batch orchestration in some environments.
- As with all AI-assisted systems, generated outputs require human review before use.

## 9) Strategic Positioning

Career-Ops is best positioned as a **decision-quality engine for job search execution**, not an application-spamming automation tool. Its differentiation is the combination of:

- Structured evaluation rigor
- Artifact generation at speed
- Pipeline integrity and operational visibility
- Human control and ethical constraints

For executive stakeholders, the value proposition is clear: **higher-quality decisions, faster execution cycles, and measurable process control across the full job search lifecycle**.

## 10) Suggested Next Steps for Stakeholders

1. Pilot with a small user cohort (individuals or coaching clients).
2. Track baseline vs post-adoption metrics (time-to-shortlist, application quality, interview conversion, offer rate).
3. Standardize profile and scoring configuration for the target population.
4. Establish an operating cadence (weekly scan, batch evaluation, tracker review).
5. Use findings to decide scale-up, customization depth, and governance model.
