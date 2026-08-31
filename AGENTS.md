# AGENTS.md — Class Management System Frontend

## 1. Purpose

This file is the authoritative working guide for AI agents and developers modifying the frontend of the Class Management System (CMS).

The frontend is an Angular standalone-component application for a role-based class/academic management system. It communicates with a Spring Boot REST API through a shared `ApiService`, with JWT authentication handled through an HTTP interceptor.

IMPORTANT:
- Treat the existing source code as the source of truth.
- Do not invent backend endpoints, response fields, permissions, routes, or authentication claims.
- Before changing an API contract, verify the corresponding backend implementation.
- Preserve the existing architecture unless there is a concrete reason to refactor it.
- Prefer small, isolated changes over broad rewrites.
- If a requirement is not supported by the current source, explicitly identify it as an assumption instead of silently implementing it.

---

# 2. Current Frontend Stack

Verified from the uploaded source:

- Angular standalone components
- TypeScript
- SCSS
- Angular Router
- Angular `HttpClient`
- Functional HTTP interceptor
- Functional route guards
- RxJS `Observable`
- Template-driven forms in some existing screens
- Reactive forms in some existing screens
- JWT stored in browser `localStorage`
- Spring Boot REST API
- API base URL:
  `http://localhost:8080/api/v1`
- Four application roles:
  - `SUPER_ADMIN`
  - `ADMIN`
  - `TEACHER`
  - `STUDENT`

The uploaded archive did not contain the frontend root `package.json`, `angular.json`, `tsconfig` files, or lockfile. Therefore exact npm scripts and dependency versions cannot be verified from this archive alone.

Do not claim exact build/test commands beyond the normal Angular CLI commands unless the repository root configuration is inspected.

---

# 3. Source Layout

The important application structure is:

```text
src/
├── main.ts
├── index.html
├── styles.scss
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
└── app/
    ├── app.ts
    ├── app.html
    ├── app.scss
    ├── app.config.ts
    ├── app.routes.ts
    │
    ├── core/
    │   ├── auth/
    │   │   ├── auth.service.ts
    │   │   ├── auth-state.service.ts
    │   │   └── token.service.ts
    │   ├── constants/
    │   │   ├── api-endpoints.ts
    │   │   └── app.constants.ts
    │   ├── guards/
    │   │   ├── auth.guard.ts
    │   │   └── role.guard.ts
    │   ├── interceptors/
    │   │   ├── auth.interceptor.ts
    │   │   └── error.interceptor.ts
    │   ├── models/
    │   │   ├── api-response.model.ts
    │   │   ├── pagination.model.ts
    │   │   └── user-role.model.ts
    │   └── services/
    │       ├── api.service.ts
    │       └── notification.service.ts
    │
    ├── features/
    │   ├── auth/
    │   ├── super-admin/
    │   ├── admin/
    │   ├── teacher/
    │   ├── student/
    │   └── errors/
    │
    ├── layouts/
    │   ├── app-layout/
    │   └── auth-layout/
    │
    └── shared/
        ├── components/
        ├── directives/
        ├── pipes/
        └── utils/
```

Some folders such as `pipes` and `utils` currently have little/no implementation in the uploaded source. Do not create abstractions there unless they are actually needed.

---

# 4. Application Bootstrap

`src/main.ts` bootstraps the standalone `App` using `appConfig`.

`src/app/app.config.ts` currently provides:

- zoneless change detection
- Angular Router
- `HttpClient`
- the functional `authInterceptor`

Current interceptor registration is conceptually:

```text
provideHttpClient(
    withInterceptors([
        authInterceptor
    ])
)
```

Do not replace this with module-based HTTP configuration without a concrete reason.

---

# 5. Environment Configuration

Both environment files currently point to:

```text
http://localhost:8080/api/v1
```

Development:

```ts
production: false
showDevLoginHelper: true
```

Production:

```ts
production: true
showDevLoginHelper: false
```

## Rules

- Never hard-code API URLs inside feature components.
- Prefer `environment.apiBaseUrl`.
- If adding a new environment-specific value, place it in the appropriate environment configuration.
- Do not commit real production secrets.
- The frontend must never contain database credentials.

NOTE:
The current `environment.ts` is marked `production: true` while still pointing to localhost. This is an existing repository state and should not be "fixed" automatically unless the actual build/environment strategy is verified.

---

# 6. API Architecture

The frontend uses this request flow:

```text
Feature Component
      ↓
Feature Service
      ↓
ApiService
      ↓
HttpClient
      ↓
authInterceptor
      ↓
Spring Boot API
```

`ApiService` is the central HTTP abstraction.

It currently exposes:

- `get<T>()`
- `post<T>()`
- `put<T>()`
- `patch<T>()`
- `delete<T>()`

It prefixes endpoints with:

```text
environment.apiBaseUrl
```

Example:

```ts
this.api.get<ApiResponse<Student>>('/students');
```

becomes:

```text
GET http://localhost:8080/api/v1/students
```

## Critical API rule

Feature services should normally call `ApiService`, not construct complete URLs themselves.

Authentication is the main existing exception: `AuthService` directly uses `HttpClient` for `/auth/login`.

Do not introduce a second HTTP abstraction.

---

# 7. Authentication

Authentication is JWT-based.

## Login

`AuthService` calls:

```text
POST /auth/login
```

with:

```ts
{
  email: string;
  password: string;
}
```

The expected login response contains:

```ts
{
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
  };
  errors: unknown;
}
```

After login:

1. `LoginComponent` receives the response.
2. `accessToken` is saved by `TokenService`.
3. The JWT payload is decoded.
4. The role is read.
5. The user is redirected according to role.

Current role redirects:

```text
SUPER_ADMIN → /super-admin/dashboard
ADMIN       → /admin/dashboard
TEACHER     → /teacher/dashboard
STUDENT     → /student/dashboard
```

Do not change these redirects without checking the route table.

---

# 8. Token Storage and JWT Claims

`TokenService` stores the access token under:

```text
access_token
```

in:

```text
localStorage
```

Current expected JWT payload:

```ts
interface JwtPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

The frontend currently obtains:

- email from `sub`
- role from `role`
- expiry from `exp`

## Important security rule

The frontend role is only a UI/navigation control. It is NOT a security boundary.

The backend must independently enforce:
- authentication
- role authorization
- teacher permissions
- teacher scope
- resource ownership
- access to student data

Never rely on hiding a button or route in Angular as proof that an operation is secure.

---

# 9. Current Authentication/Authorization Warning

`src/app/core/constants/app.constants.ts` currently contains:

```ts
DEV_BYPASS_GUARDS: true
```

Both `authGuard` and `roleGuard` immediately return `true` when this flag is enabled.

This means the current frontend route guards are intentionally bypassed.

## This is a major development-only condition.

Before treating frontend authorization as functional, verify that:

```ts
DEV_BYPASS_GUARDS
```

is disabled.

Do not accidentally ship this configuration to a real production environment.

Future agents must NOT:
- remove the guards just because bypass mode exists
- treat the current bypass as the intended security model
- implement security solely in the frontend

---

# 10. Auth Guard

`authGuard` protects the main application layout.

Normal intended behavior:

```text
No valid authentication → /login
Authenticated → allow route
```

However, the current implementation checks token presence in the normal guard path and does not itself perform the same full validity check as `TokenService.hasToken()`.

When modifying this code, preserve the intended authentication model and consider token validity, not merely localStorage presence.

Do not silently introduce token refresh logic unless the backend contract supports refresh tokens.

---

# 11. Role Guard

`roleGuard` reads:

```text
route.data.roles
```

and compares it to the role in the JWT.

Example:

```ts
data: {
  roles: ['ADMIN']
}
```

Only the specified application role is accepted.

Current application roles are:

```text
SUPER_ADMIN
ADMIN
TEACHER
STUDENT
```

A role mismatch redirects to:

```text
/access-denied
```

Do not change role names casually. They are contract values shared with the backend JWT.

---

# 12. Permission vs Role vs Scope

This application has three distinct authorization concepts.

## Role

Application-level role:

```text
SUPER_ADMIN
ADMIN
TEACHER
STUDENT
```

## Teacher Permission

Teacher-role configuration exists under:

```text
Admin → Teacher Roles
```

A `TeacherRole` contains:

```ts
permissions: Permission[]
```

A permission has:

```ts
id
code
name
description
```

## Teacher Scope

A teacher-role assignment contains one or more scopes:

```ts
academicYearId
classId
sectionId?
```

The frontend therefore represents:

```text
Teacher
  ↓
Teacher Role
  ↓
Permissions
  ↓
Assigned Academic Scope
  ├── Academic Year
  ├── Class
  └── optional Section
```

This distinction is critical.

A teacher being a `TEACHER` does NOT automatically mean the teacher should be able to access every student.

The backend must determine the actual allowed scope.

---

# 13. Teacher Student Page

The teacher student page is currently implemented.

Route:

```text
/teacher/students
```

Component:

```text
src/app/features/teacher/students/teacher-student-list/teacher-student-list.ts
```

Service:

```text
src/app/features/teacher/students/services/teacher-student.service.ts
```

Model:

```text
src/app/features/teacher/students/models/teacher-student.model.ts
```

## Current API endpoints

List:

```text
GET /teacher/students
```

Details:

```text
GET /teacher/students/{id}
```

List query parameters:

```text
page
size
search
sortBy
sortDirection
```

Current values sent by the frontend:

```text
sortBy=firstName
sortDirection=asc
```

Default pagination:

```text
page = 0
size = 10
```

## Current intended behavior

The teacher page:
- loads students on initialization
- supports search
- supports pagination
- displays assigned-scope students
- opens a student detail drawer
- loads detail data by student ID
- displays loading state
- displays empty state
- displays errors
- displays active/inactive status

The UI description explicitly states that the teacher sees students within assigned classes/sections.

Do not change the frontend to load all students and filter them locally.

The backend should return only students the teacher is authorized to see.

---

# 14. Teacher Student Model

Current `TeacherStudent` fields:

```ts
studentId
firstName
lastName
rollNumber
email
phone
isActive
enrollmentNumber
academicYearId
academicYearName
classId
className
sectionId
sectionName
```

Nullability currently exists for:

```text
rollNumber
email
phone
isActive
```

Do not make these non-nullable without verifying the backend response.

---

# 15. Admin Student Management

Admin student management is separate from teacher student viewing.

Route family:

```text
/admin/students
/admin/students/create
/admin/students/:id/edit
```

Service:

```text
src/app/features/admin/students/services/student.service.ts
```

Endpoints:

```text
GET    /students
GET    /students/{id}
POST   /students
PUT    /students/{id}
PATCH  /students/{id}/status
DELETE /students/{id}
```

The admin model contains:
- basic student identity/contact information
- enrollment information
- academic year
- class
- section

Create requests additionally contain a password.

Do not expose or display passwords after creation.

---

# 16. Teacher Management

Admin teacher management is under:

```text
/admin/teachers
/admin/teachers/create
/admin/teachers/:id/edit
```

Model:

```ts
id
teacherNumber
firstName
lastName
email
phone
isActive
```

Endpoints:

```text
GET    /teachers
GET    /teachers/{id}
POST   /teachers
PUT    /teachers/{id}
PATCH  /teachers/{id}/status
DELETE /teachers/{id}
```

Teacher listing uses:

```text
page
size
search
sortBy
sortDirection
```

Current sorting:

```text
sortBy=firstName
sortDirection=asc
```

---

# 17. Academic Management

The frontend contains administration screens for:

## Academic Years

Route:

```text
/admin/academic-years
```

Service endpoints:

```text
GET    /academic-years
GET    /academic-years/{id}
POST   /academic-years
PUT    /academic-years/{id}
PATCH  /academic-years/{id}/current
DELETE /academic-years/{id}
```

## Classes

Route:

```text
/admin/classes
```

Endpoints:

```text
GET    /classes
GET    /classes/{id}
POST   /classes
PUT    /classes/{id}
DELETE /classes/{id}
```

## Sections

Sections are handled by `SectionService`.

Endpoint:

```text
GET /sections?classId={classId}
```

and:

```text
POST   /sections
PUT    /sections/{id}
DELETE /sections/{id}
```

## Subjects

Route:

```text
/admin/subjects
```

Endpoints:

```text
GET    /subjects
POST   /subjects
PUT    /subjects/{id}
DELETE /subjects/{id}
```

Do not assume academic relationships without checking the existing models and backend.

---

# 18. Assignment Management

Admin assignment management:

```text
/admin/assignments
/admin/assignments/create
/admin/assignments/:id/edit
```

Admin service endpoints:

```text
GET    /assignments
GET    /assignments/{id}
POST   /assignments
PUT    /assignments/{id}
DELETE /assignments/{id}
```

Assignment fields include:

```text
academicYearId
classId
sectionId
subjectId
teacherId
title
description
dueDate
maxMarks
status
```

Assignment status:

```text
DRAFT
PUBLISHED
CLOSED
```

Teacher assignment management is separate.

Teacher service uses:

```text
GET    /teacher-assignments/my
GET    /teacher-assignments/my/{id}
PUT    /teacher-assignments/my/{id}
DELETE /teacher-assignments/my/{id}
```

The `/my` API is important: do not replace it with the unrestricted admin assignment API for teacher screens.

---

# 19. Teacher Roles

Admin teacher-role management exists.

Routes:

```text
/admin/teacher-roles
/admin/teacher-roles/create
/admin/teacher-roles/:id/edit
```

Role endpoints:

```text
GET   /teacher-roles
GET   /teacher-roles/{id}
POST  /teacher-roles
PUT   /teacher-roles/{id}
PATCH /teacher-roles/{id}/deactivate
```

Permissions:

```text
GET /permissions
```

Teacher role creation/update sends:

```ts
{
  name: string;
  description: string;
  permissionIds: number[];
}
```

When editing a role, the frontend converts the returned permission objects into their IDs.

Do not send full permission objects when the request contract expects `permissionIds`.

---

# 20. Teacher Role Assignments

Admin teacher-role assignment management exists.

Routes:

```text
/admin/teacher-role-assignments
/admin/teacher-role-assignments/create
/admin/teacher-role-assignments/:teacherId/edit
/admin/teacher-role-assignments/:teacherId/view
```

Service endpoints:

```text
POST   /teacher-role-assignments
GET    /teacher-role-assignments
GET    /teacher-role-assignments/teacher/{teacherId}
PUT    /teacher-role-assignments/teacher/{teacherId}
DELETE /teacher-role-assignments/teacher/{teacherId}
```

Create/update request:

```ts
{
  teacherId: number;
  teacherRoleId: number;
  scopes: [
    {
      academicYearId: number;
      classId: number;
      sectionId?: number;
    }
  ];
}
```

A scope can therefore be class-level or section-level depending on whether `sectionId` is provided.

Do not flatten scopes into a single class/section pair.

---

# 21. Routing

Current major routes:

## Public

```text
/login
/access-denied
/not-found
/server-error
```

## Super Admin

```text
/super-admin/dashboard
/super-admin/admins
```

## Admin

```text
/admin/dashboard
/admin/academic-years
/admin/classes
/admin/subjects
/admin/teachers
/admin/teachers/create
/admin/teachers/:id/edit
/admin/students
/admin/students/create
/admin/students/:id/edit
/admin/teacher-roles
/admin/teacher-roles/create
/admin/teacher-roles/:id/edit
/admin/teacher-role-assignments
/admin/teacher-role-assignments/create
/admin/teacher-role-assignments/:teacherId/edit
/admin/teacher-role-assignments/:teacherId/view
/admin/assignments
/admin/assignments/create
/admin/assignments/:id/edit
/admin/attendance
```

## Teacher

```text
/teacher/dashboard
/teacher/assignments
/teacher/assignments/:id/edit
/teacher/students
```

The navigation also references:

```text
/teacher/attendance
```

but the uploaded `app.routes.ts` does not currently define a teacher attendance route.

This is a verified route/navigation inconsistency. Do not assume the route exists.

## Student

```text
/student/dashboard
/student/attendance
```

The navigation also references:

```text
/student/profile
```

but the uploaded route table does not currently define it.

This is another verified route/navigation inconsistency.

---

# 22. Navigation

`AppLayoutComponent` builds sidebar navigation based on the JWT role.

Current navigation is role-based only.

Admin sees:
- Dashboard
- Academic Years
- Classes
- Subjects
- Teachers
- Teacher Roles
- Teacher Role Assignments
- Students
- Assignments
- Attendance

Teacher sees:
- Dashboard
- My Assignments
- Students
- Attendance

Student sees:
- Dashboard
- Profile
- Attendance

Super Admin sees:
- Dashboard
- Admins

## Important future requirement

The current navigation does NOT appear to evaluate teacher permissions or teacher scopes.

Therefore a future implementation that requires:
- permission-based sidebar items
- permission-based buttons
- scope-aware actions

must be implemented deliberately and consistently with the backend permission contract.

Do not fake permissions by adding arbitrary frontend constants.

---

# 23. Shared Components

The source contains reusable components for:

```text
ConfirmDialog
ConfirmationDialog
DataTable
EmptyState
ErrorState
Loading
PageHeader
PagePlaceholder
Pagination
SearchBox
SearchInput
StatusBadge
```

Before creating a new generic component, check whether one of these already supports the required behavior.

Prefer reuse over duplicate UI implementations.

---

# 24. Forms

The project currently uses both:

- `FormsModule` / template-driven binding in some components
- `ReactiveFormsModule` / reactive forms in others

Do not rewrite an entire feature from one form strategy to another merely for stylistic consistency.

When adding fields to an existing form:
- preserve its current form strategy
- preserve validation behavior
- preserve request models
- preserve loading/submitting states
- preserve error handling

---

# 25. Change Detection

Several components explicitly use:

```ts
ChangeDetectorRef
```

and call:

```ts
detectChanges()
```

or:

```ts
markForCheck()
```

The application also enables zoneless change detection.

Do not blindly remove explicit change-detection calls without verifying UI behavior under the existing zoneless configuration.

When introducing new components, prefer Angular's normal reactive/state-driven patterns rather than adding manual `detectChanges()` everywhere.

---

# 26. Error Handling

Feature components generally handle API errors locally with patterns such as:

```ts
error?.error?.message
```

and fallback messages.

There is an `error.interceptor.ts` file, but the uploaded source does not show a substantive implementation there.

Therefore do not assume global HTTP error handling already exists.

If implementing global error behavior:
- preserve feature-specific messages where useful
- avoid duplicate notifications
- do not swallow HTTP errors
- distinguish at least authentication, authorization, validation, server, and network failures when the backend contract supports it

---

# 27. API Response Convention

Several services use a response shape like:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

Some local definitions additionally contain:

```ts
errors: unknown;
```

The project currently has duplicated local `ApiResponse` definitions in multiple feature files, while core model files also exist.

Do not perform a broad response-model consolidation unless required.

If refactoring these models:
1. inspect every consumer
2. verify backend response shape
3. preserve compatibility
4. make the change feature-by-feature

---

# 28. Pagination

The project uses zero-based pagination.

Teacher student page:

```text
currentPage = 0
pageSize = 10
```

The frontend expects:

```ts
content
totalElements
totalPages
size
number
```

Do not change page numbering to one-based without updating both UI and API integration.

When adding paginated APIs, verify whether Spring Boot's `Page` serialization is being consumed directly.

---

# 29. Search

Teacher student search sends:

```text
search
```

together with:

```text
page
size
sortBy
sortDirection
```

Search resets the page to:

```text
0
```

This is the correct pattern to preserve when implementing similar paginated search screens.

Do not perform client-side filtering if the endpoint is intended to provide server-side pagination/search.

---

# 30. UI State Rules

List/detail screens should maintain clear states:

```text
idle
loading
success
empty
error
```

When adding or modifying a screen:
- prevent duplicate submissions
- show loading state while requests are active
- clear stale data on failed detail loads where appropriate
- avoid displaying old detail data as if it were current
- provide a retry path for recoverable failures
- preserve empty-state handling

---

# 31. Backend Connectivity Verification

The uploaded frontend source can verify the frontend's configured connectivity contract:

```text
Frontend
http://localhost:<frontend-port>
        ↓
http://localhost:8080/api/v1
        ↓
Spring Boot REST API
```

The uploaded archive does NOT contain the complete Spring Boot backend. It contains only a backend path fragment including an assignment controller.

Therefore the following cannot be fully verified from this frontend archive alone:

- exact backend controller mappings for every endpoint
- exact backend DTOs
- exact backend permission codes
- exact backend JWT implementation
- exact CORS configuration
- exact teacher-scope authorization implementation
- exact database behavior

When an API change is needed, inspect the backend repository before implementing it.

---

# 32. Do Not Invent API Contracts

Never make assumptions such as:

```text
GET /teacher/students/my
GET /teachers/me
GET /permissions/me
GET /teacher/scopes
```

unless the backend actually implements them.

The currently verified teacher student endpoints are:

```text
GET /teacher/students
GET /teacher/students/{id}
```

The frontend should rely on the backend's authorization to determine which students are visible.

---

# 33. Security Rules

Never:
- store passwords in localStorage
- log passwords
- log access tokens
- expose refresh tokens unnecessarily
- trust client-side roles for backend authorization
- bypass backend authorization because a route is guarded
- use arbitrary JWT fields without verifying the backend claim contract

Be careful with:

```ts
console.log(...)
```

Existing code contains debugging logs. New production code should avoid sensitive logs.

---

# 34. JWT Decoding

The current token decoder uses:

```ts
token.split('.')[1]
```

and:

```ts
JSON.parse(atob(payload))
```

This is acceptable for reading claims already issued by the backend, but it is not cryptographic verification.

The frontend must never treat decoded JWT claims as proof that a user is authorized to perform an operation.

Authorization remains a backend responsibility.

---

# 35. Constants and Endpoints

`core/constants/api-endpoints.ts` currently centralizes some teacher/student CRUD endpoints:

```text
TEACHERS
STUDENTS
```

However, several feature services still use literal endpoint strings.

Do not perform a broad endpoint refactor unless it improves consistency without breaking behavior.

If adding a new endpoint:
- prefer the established endpoint constant pattern when the feature already uses it
- otherwise keep the service readable and consistent with its neighboring feature

Never duplicate the base URL in feature services.

---

# 36. Component Organization

Follow the existing feature-oriented structure.

For a new feature, prefer:

```text
feature/
├── models/
├── services/
├── feature-list/
├── feature-form/
└── feature-details/
```

when the feature naturally needs those responsibilities.

Keep:
- API logic in services
- route logic in routing/components
- reusable UI in shared components
- authentication logic in core/auth
- authorization route checks in guards
- feature-specific models close to the feature

Do not put feature-specific business logic into `ApiService`.

---

# 37. Routing Rules for New Pages

When adding a page:

1. Create the standalone component.
2. Add the route to `app.routes.ts`.
3. Apply `authGuard` through the application layout where appropriate.
4. Apply `roleGuard` with the correct role metadata.
5. Add navigation only when the role should see it.
6. Verify both direct URL access and sidebar navigation.
7. Verify unauthorized users reach `/access-denied`.
8. Verify unknown routes reach `/not-found`.

For role-restricted routes use the existing pattern:

```ts
canActivate: [roleGuard],
data: {
  roles: ['TEACHER']
}
```

Do not invent a second role-authorization mechanism.

---

# 38. Teacher Permission-Based Features

The system's teacher authorization model is more advanced than a simple `TEACHER` role.

When implementing a teacher-controlled feature:

```text
1. Check the required permission.
2. Check the teacher's assigned scope.
3. Ask the backend for only authorized data.
4. Use frontend checks only for UX.
5. Never trust frontend permission checks for security.
```

For example, a teacher may be:
- allowed to view students
- allowed only for certain academic years
- allowed only for certain classes
- allowed only for certain sections

Do not assume all teachers have identical access.

---

# 39. Teacher Students: Required Authorization Principle

For `/teacher/students`:

```text
Teacher login
    ↓
JWT identifies teacher
    ↓
Backend identifies teacher role/assignment
    ↓
Backend resolves allowed scopes
    ↓
Backend returns authorized students
    ↓
Angular renders the returned page
```

Angular should NOT:
- fetch every student and filter them
- receive all students and hide unauthorized rows
- determine authorization from class IDs stored in localStorage
- trust query parameters as proof of scope

---

# 40. Common Mistakes to Avoid

## Mistake 1 — Using the wrong endpoint

Bad:

```ts
'/students'
```

inside the teacher student page when the feature requires teacher-scoped data.

Correct current teacher endpoint:

```ts
'/teacher/students'
```

## Mistake 2 — Sending a full URL from a feature

Avoid:

```ts
http.get('http://localhost:8080/api/v1/students')
```

Prefer:

```ts
api.get('/students')
```

## Mistake 3 — Local filtering for authorization

Do not fetch all students and filter by class in Angular.

## Mistake 4 — Treating role guard as security

Route guards improve UX. They do not replace backend authorization.

## Mistake 5 — Forgetting pagination reset

When search changes, reset:

```text
page = 0
```

## Mistake 6 — Breaking response shape

Do not assume:

```ts
response.data
```

is an array unless the specific endpoint says so.

## Mistake 7 — Introducing a new API abstraction

Reuse `ApiService`.

## Mistake 8 — Accidentally enabling production guard bypass

Never ship:

```ts
DEV_BYPASS_GUARDS: true
```

as a production authorization state.

---

# 41. Verified Current Inconsistencies

These are documented so future agents do not mistake them for intentional APIs.

## A. Guard bypass

```text
DEV_BYPASS_GUARDS = true
```

This makes both authentication and role guards return true.

## B. Teacher attendance navigation

`AppLayoutComponent` references:

```text
/teacher/attendance
```

but `app.routes.ts` does not currently define this route.

## C. Student profile navigation

`AppLayoutComponent` references:

```text
/student/profile
```

but `app.routes.ts` does not currently define this route.

## D. Empty/incomplete infrastructure files

The archive contains files such as:
- `notification.service.ts`
- `error.interceptor.ts`
- several placeholder pages/components

Do not assume they provide functionality just because the file exists.

## E. Missing repository-root configuration from archive

The uploaded archive is a `src` archive, not a complete frontend repository. Therefore package versions/scripts cannot be conclusively documented here.

---

# 42. Testing

The source contains several Angular `.spec.ts` files.

Examples include tests for:
- app
- dashboards
- teacher/student/admin components
- shared components

When modifying an existing tested component:
- update its tests when behavior changes
- do not delete tests merely because they fail after a change
- prefer focused tests for service/component behavior
- verify routing/authorization behavior where relevant

Exact test commands are intentionally not asserted here because the uploaded archive does not contain the root package configuration.

Typical Angular CLI commands, subject to the actual repository scripts/configuration:

```bash
npm install
npm start
npm run build
npm test
```

If these commands differ in the repository root, use the repository's actual scripts.

---

# 43. Build and Development Checklist

Before considering a frontend change complete:

```text
[ ] TypeScript compilation succeeds
[ ] Angular template compilation succeeds
[ ] SCSS compilation succeeds
[ ] Existing routes still work
[ ] API endpoint matches backend
[ ] Request body matches backend DTO
[ ] Response model matches backend response
[ ] JWT interceptor still attaches Authorization header
[ ] Role guard still behaves correctly
[ ] DEV_BYPASS_GUARDS has not been accidentally enabled for production
[ ] Loading state works
[ ] Empty state works
[ ] Error state works
[ ] Pagination/search works where applicable
[ ] Existing shared components remain compatible
[ ] Tests relevant to the change are updated/passing
```

---

# 44. Recommended Workflow for AI Agents

Before coding:

```text
1. Inspect the existing feature.
2. Inspect its service.
3. Inspect its model.
4. Inspect its route.
5. Inspect shared components used by the feature.
6. Inspect the corresponding backend controller/service/DTO if an API change is involved.
7. Identify the exact existing contract.
8. Make the smallest correct change.
9. Re-check all consumers.
10. Build/test.
```

For a new backend-connected feature:

```text
Backend contract
      ↓
Frontend model
      ↓
Frontend service
      ↓
Component state
      ↓
Template
      ↓
Route
      ↓
Navigation
      ↓
Tests
```

Do not reverse-engineer an API from what would be convenient for the frontend.

---

# 45. Preferred Coding Style

Follow the style already present in the source.

Preferred patterns:

- standalone components
- dependency injection with `inject()` where the surrounding file already uses it
- `private readonly` service fields
- strongly typed request/response models
- feature-local models
- `Observable` based API calls
- explicit loading/error state
- reusable shared components
- route metadata for role restrictions

Avoid:
- unnecessary global state
- giant components
- duplicated API calls
- duplicated UI components
- `any` where a real type can be established
- hard-coded API base URLs
- magic authorization rules
- unrelated refactors

Some existing code uses `any`. Do not automatically rewrite every existing `any` unless it is directly related to the task.

---

# 46. Change Scope Discipline

When asked to implement one feature:

DO:
- modify the feature
- modify its service/model
- add its route
- add required navigation
- add/update tests
- make only necessary shared changes

DO NOT:
- rewrite the whole routing system
- migrate every form to Reactive Forms
- redesign the entire UI
- rename unrelated files
- replace every API model
- change backend contracts without verification
- remove working code simply for stylistic reasons

---

# 47. Production Readiness Priorities

Before production, the frontend should specifically revisit:

1. Disable development guard bypass.
2. Verify authentication guard checks token validity.
3. Verify backend authorization for every protected endpoint.
4. Verify CORS.
5. Verify production API environment configuration.
6. Remove sensitive debugging logs.
7. Verify 401/403 handling.
8. Verify token expiration behavior.
9. Verify refresh-token behavior if supported by backend.
10. Verify teacher permission + scope behavior.
11. Verify navigation matches actual routes.
12. Verify no development-only helper is enabled.
13. Run production build and relevant tests.

---

# 48. Source-of-Truth Hierarchy

When sources disagree, use this order:

```text
1. Backend API contract / backend implementation
2. Existing working frontend integration
3. Existing frontend models
4. Existing routes
5. UI/navigation expectations
6. General assumptions
```

If the backend and frontend disagree, do not silently choose one.

Report the mismatch and determine the intended contract.

---

# 49. Final Rule for AI Agents

The most important rule:

> Preserve the existing CMS architecture and backend contract. Make the smallest correct change, verify connectivity, and never replace backend authorization with frontend assumptions.

For teacher functionality specifically:

> A `TEACHER` role grants access to the teacher area; teacher permissions and assigned academic scope determine what the teacher is allowed to see or control. The backend is the final authority.

For student data specifically:

> Never broaden a teacher's student access merely because the frontend can technically request the data.

For API work specifically:

> Never invent an endpoint or response shape. Verify it.

For security specifically:

> Never treat Angular guards, hidden buttons, or decoded JWT claims as backend authorization.

