# Data Model

## tenant
Represents a business running on the platform (platform core, cleaning company, marketplace).

Key fields:
- id (uuid)
- name, slug
- industry (cleaning, marketplace, platform, etc.)
- plan (b2b-pro, marketplace)
- parent_tenant_id (hierarchy)
- config_json (features, workflow flags)
- theme_json (branding)
- created_at

## user
Represents a person working inside that tenant (owner, provider, dispatcher, etc.).

Key fields:
- id (uuid)
- tenant_id (FK -> tenant)
- name, email
- role (admin, provider, client...)
- status (active/invited/disabled)
- created_at

## role
Defines permissions per tenant.
This lets us do org-scoped RBAC.

Key fields:
- id (text)
- tenant_id (FK -> tenant)
- name
- permissions (jsonb string array)

## service
Defines what the tenant sells.

Key fields:
- id (text)
- tenant_id (FK -> tenant)
- name, category
- pricing_json (hourly, fixed, tiered)
- metadata_json (vertical-specific flags)
- active
- created_at

## booking
Real-world scheduled work.

Key fields:
- id (uuid)
- tenant_id (FK -> tenant)
- service_id (FK -> service)
- customer info (name/phone/address)
- start_time / end_time
- status (requested/confirmed/completed/cancelled)
- assigned_user_id (FK -> user)
- price_final
- created_at
