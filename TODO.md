# TODO: Add Mock Test & Jobs pages + Admin Management

## Completed

### Navbar (public site)

- [x] Remove Gallery, Blogs, Contact links from desktop & mobile navbar
- [x] Add Mock Test and Jobs links (desktop & mobile)

### Mock Test & Jobs public pages

- [x] `src/app/mock-tests/page.tsx` - listing page
- [x] `src/app/jobs/page.tsx` - listing page
- [x] `src/app/mock-tests/[id]/page.tsx` - detail page
- [x] `src/app/jobs/[id]/page.tsx` - detail page
- [x] `src/app/mock-tests/[id]/take/page.tsx` - test-taking page
- [x] `src/app/mock-tests/[id]/result/page.tsx` - results page

### Admin sidebar

- [x] Remove Gallery and Articles links
- [x] Add Mock Tests and Jobs management links

### Admin API routes

- [x] `src/app/api/admin/mock-tests/route.ts` + `[id]/route.ts` (CRUD)
- [x] `src/app/api/admin/jobs/route.ts` + `[id]/route.ts` (CRUD)

### Admin management pages

- [x] `src/app/admin/mock-tests/page.tsx` - CRUD management
- [x] `src/app/admin/jobs/page.tsx` - CRUD management

### Verification

- [x] `npx tsc --noEmit` passes
