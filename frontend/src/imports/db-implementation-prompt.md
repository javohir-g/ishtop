You are a senior database architect.

Based on the previously generated backend architecture,
generate a COMPLETE and DETAILED prompt that can be used to implement the database layer for this project.

The database must be designed for:

- PostgreSQL
- Production environment
- Scalability
- High performance
- Multi-tenant architecture (if present)
- Telegram-auth based user system
- SaaS-ready structure

Your task:

1) Analyze all defined entities and relationships
2) Generate a FULL database implementation prompt that includes:

- SQL DDL statements (CREATE TABLE)
- All fields with correct PostgreSQL types
- Primary keys
- Foreign keys
- ON DELETE / ON UPDATE rules
- Indexes (including composite indexes)
- Unique constraints
- Enum types
- Default values
- Timestamps (created_at, updated_at)
- Soft delete strategy (if applicable)

3) Include:

- Multi-tenant strategy (tenant_id implementation)
- Row-level security strategy (if recommended)
- Partitioning strategy (if needed)
- Recommended indexing strategy
- Performance optimization notes

4) Generate:

- Alembic migration strategy
- Naming conventions
- ER diagram description (text format)
- Data integrity constraints

5) Provide:

- Example seed data strategy
- Example SQL inserts
- Recommendations for production deployment

Important:

- The output must be a PROMPT that can be directly used to generate the full database implementation.
- Do not describe UI.
- Focus only on database layer.
- Think like a senior PostgreSQL architect designing a scalable SaaS system.
- If any entity definitions are unclear, request clarification before generating final DB prompt.