# enrollment-status

Returns `{ enrolled: boolean }` for the currently authenticated user (if any).

- If no session: `{ enrolled: false }`
- If user has at least one `enrollment` with `status: ACTIVE`: `{ enrolled: true }`
