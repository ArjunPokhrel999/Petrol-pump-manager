# Google Drive backup setup (frontend-only)

The app can export/import JSON locally without Google. Google Drive features require your own OAuth client ID; do not share client secrets in frontend code.

1. Open Google Cloud Console and create/select a project.
2. Enable **Google Drive API**.
3. Configure the OAuth consent screen for your intended users.
4. Create an **OAuth Client ID → Web application**.
5. Add your exact app origin to **Authorized JavaScript origins**. For local testing, use a local server such as `http://localhost:8000` (not `file://`). For a hosted app, add its HTTPS origin.
6. Copy the client ID into `DRIVE_CLIENT_ID` near the top of `js/upgrades.js`, replacing `YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com`.
7. Serve the folder with a local static server, open the app, then select **Connect Google** and approve access.
8. Click **Upload backup to Drive** once to test. After connection, app edits schedule a debounced upload while the page remains open and the access token remains valid. The app cannot guarantee uploads after the browser closes; export a JSON backup periodically.

Drive backups are stored in the app's hidden `appDataFolder`, accessible to this app/account rather than shown in the normal Drive file list. The restore button downloads the latest backup in that app folder. Keep local JSON backups too.

## Important security notes
- This app has no server. Anyone using the same browser profile can access the local records.
- Never put an OAuth **client secret** in frontend JavaScript. Only a public web client ID belongs here.
- OAuth publishing/testing settings and authorized origins must match your Google Cloud configuration.
- Google may require a verified/published consent screen for broader use.
