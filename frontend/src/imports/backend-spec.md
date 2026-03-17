You are a senior backend architect.

Analyze this entire Figma project and generate a complete production-ready backend technical specification using FastAPI.

The system consists of two clearly separated parts:

────────────────────────────
1) PUBLIC LANDING WEBSITE
────────────────────────────
- Accessible publicly via browser
- No authentication required
- SEO-friendly
- Contains marketing pages, pricing, contact forms, CTA forms, etc.
- Any submitted form data must be stored in the database
- Must include basic rate limiting and spam protection

All public endpoints must be grouped under:
    /api/public/*

────────────────────────────
2) PRIVATE WEB APPLICATION (Telegram WebApp)
────────────────────────────
- Accessible ONLY via Telegram WebApp (Telegram Apps)
- No email/password login
- Authentication strictly via Telegram initData validation
- Backend must verify Telegram hash according to official Telegram documentation
- After successful validation, user must be created or updated in database
- Internal JWT session may be issued after Telegram validation (recommended)
- All private endpoints must require Telegram authentication

All app endpoints must be grouped under:
    /api/app/*

────────────────────────────
STACK REQUIREMENTS
────────────────────────────
- FastAPI
- PostgreSQL
- SQLAlchemy (async)
- Pydantic v2
- JWT (internal session handling)
- Role-Based Access Control (RBAC)
- Clean Architecture
- Docker-ready structure
- Production-ready structure

If SaaS architecture is detected:
- Implement multi-tenant support
- Each company must have isolated data
- Include tenant_id strategy
- Enforce tenant-level data filtering in queries

────────────────────────────
YOUR TASKS
────────────────────────────

1) Analyze UI and identify all backend entities:
   - Users
   - Roles
   - Companies / Tenants (if present)
   - Profiles
   - Dashboards
   - Objects displayed in tables
   - Forms
   - Statuses
   - Notifications
   - Payments (if present)
   - Analytics data (if present)
   - Any domain-specific models

2) Generate complete database schema:
   - Tables
   - Fields with types
   - Required/optional fields
   - Relationships (1:N, M:N)
   - Enums
   - Status flows
   - Indexes
   - Unique constraints

3) Generate complete API specification:
   For each entity provide:
   - Endpoint
   - HTTP method
   - Request schema
   - Response schema
   - Role permissions
   - Validation rules
   - Filtering & pagination strategy

4) Authentication layer:
   - Telegram initData validation logic
   - Middleware example
   - User linking logic
   - JWT issuing strategy
   - Role assignment strategy

5) Provide project structure:

backend/
 ├── app/
 │   ├── api/
 │   │   ├── public/
 │   │   └── app/
 │   ├── models/
 │   ├── schemas/
 │   ├── services/
 │   ├── repositories/
 │   ├── core/
 │   ├── dependencies/
 │   ├── middleware/
 │   ├── utils/
 │   └── main.py
 ├── alembic/
 ├── docker/
 └── docker-compose.yml

6) Provide:
   - ER diagram description (text format)
   - Role-permission matrix
   - Example JSON requests/responses
   - Example Telegram validation code snippet
   - Recommended production deployment architecture
   - Caching strategy (if needed)
   - Background task strategy (notifications, async jobs)

7) Security:
   - Rate limiting for public endpoints
   - Input validation strategy
   - Tenant data isolation enforcement
   - Basic logging strategy
   - Recommended monitoring tools

────────────────────────────
IMPORTANT
────────────────────────────

- Do NOT describe UI.
- Focus strictly on backend implementation.
- Think like a scalable SaaS system.
- Structure response clearly and professionally.

If any part of the UI is ambiguous or missing information required for backend design,
explicitly ask for clarification before finalizing the architecture.