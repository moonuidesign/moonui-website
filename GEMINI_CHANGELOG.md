I have implemented the user invitation and registration system as requested.

### Key Features Implemented:

1.  **Admin Invitation Page (`/dashboard/invite`)**:
    -   Allows admins to invite users by email and select a role (User, Admin, Superadmin).
    -   Sends an email with a secure, signed link and an OTP.

2.  **Invitation Logic (Server Action)**:
    -   Checks if the user already exists.
    -   Creates a pending user record (unverified, no password).
    -   Generates a 6-digit OTP and a cryptographic signature (hmac) to secure the invite link.
    -   Stores the OTP in the database.

3.  **User Registration Page (`/invite`)**:
    -   The link in the email directs here (e.g., `/invite?signature=...&email=...`).
    -   Validates the signature to ensure the link hasn't been tampered with.
    -   Form to set a **New Password** and **Confirm Password**.
    -   Input for the **OTP** received in the email.
    -   **Resend OTP** functionality (regenerates OTP and signature).

4.  **Registration Completion (Server Action)**:
    -   Verifies the signature and OTP.
    -   Hashes the password (using `bcryptjs`).
    -   Updates the user record (sets password and marks email as verified).
    -   Redirects to `/signin` upon success.

### Files Created/Modified:

-   `libs/mail.ts`: Added `sendInviteEmail`.
-   `libs/signature.ts`: Added `generateInviteSignature` and `verifyInviteSignature`.
-   `server-action/admin/invite.ts`: Logic for sending invites.
-   `server-action/Auth/register-invite.ts`: Logic for completing registration and resending OTP.
-   `app/(admin)/dashboard/invite/page.tsx`: The admin UI.
-   `app/(auth)/invite/page.tsx`: The user landing page.

You can now access the invite page at `/dashboard/invite` (assuming you are logged in as admin) and test the flow.

### Added List Pages
- **Licenses List**: `/dashboard/licenses` (Table view of all licenses)
- **Transactions List**: `/dashboard/transactions` (Table view of all transactions)
- **Files**:
    - `modules/dashboard/licenses/list-page/index.tsx`
    - `modules/dashboard/transactions/list-page/index.tsx`
        - `components/dashboard/licenses/client.tsx`
            - `components/dashboard/transactions/client.tsx`
        
        ### Sidebar Updates
        -   Updated `components/general/layout/dashboard/sidebar/index.tsx` to support role-based menu visibility.
        -   Restricted "Newsletter", "Licenses", "Transactions", and "Invite User" to `superadmin` role only.
        -   Updated menu paths to use `/dashboard` base URL instead of `/admin`.
        -   Added "Design" to Content CMS menu.
        
        ### Content List Page Updates
        -   Added `statusContent` filter to Components, Designs, and Templates list pages.
        -   Added Sorting by "Best View" (`viewCount`) to Components, Designs, and Templates.
        -   Added Sorting by "Best Download" (`downloadCount`) to Designs, Gradients, and Templates.
        -   Added Sorting by "Best Copy" (`copyCount`) to Components.
        -   Files modified:
                - `modules/dashboard/components/list-page/index.tsx`
                - `modules/dashboard/designs/list-page/index.tsx`
                - `modules/dashboard/gradients/list-page/index.tsx`
                - `modules/dashboard/templates/list-page/index.tsx`
            
            ### Bug Fixes
            -   Fixed "Cannot convert undefined or null to object" error in Drizzle `db.select()` by flattening nested object selections (e.g., replaced `category: { name: ... }` with `categoryName: ...`) in all content list modules.
            
            ### Content List UI Updates
            -   Updated `ContentToolbar` (`components/dashboard/content/content-toolbar.tsx`) to support `statuses` prop and render a status filter dropdown.
            -   Updated `ComponentsClient`, `DesignsClient`, `GradientsClient`, and `TemplatesClient` to pass status options (Draft, Published, Archived) and extended sort options (Best View, Best Download/Copy) to the toolbar.

### Role-Based Content Management
-   Updated Content List Modules (`components`, `designs`, `gradients`, `templates`) to implement role-based data fetching.
    -   **Admin**: Filters content to show only items uploaded by the current user (`userId`).
    -   **Superadmin**: Shows all content and includes `authorName` (joined from `users` table).
-   Updated Client Components to display "Author" column in tables and badges in cards for Superadmin users.
            