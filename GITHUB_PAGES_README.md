# Nature.ON — GitHub Pages version

This package is adapted from the Nature.ON Dothome v9 package for GitHub Pages.

## Important difference
GitHub Pages is static hosting and does not execute PHP. The original `nature-api.php`, `_nature_admin_config.php`, `_nature_data/`, and `.htaccess` server files are therefore not included in this package.

Public news/gallery data and the demo HQ login are handled with browser `localStorage`/`sessionStorage` so the existing screens can be previewed on GitHub Pages.

### Demo HQ login
- ID: `hq`
- Password: `1234`

This is a client-side demo login, not a secure production authentication system. Because GitHub Pages is public, do not use it as a real administrator password.

## Recommended production path
For real multi-user administrator data, connect the existing UI to a hosted backend such as Supabase or Firebase later. The page structure and UI can remain largely unchanged.
