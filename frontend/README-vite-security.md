# Vite Security Update (May 2025)

## Important Notice

On May 20, 2025, the `vite` dependency in this project was updated to address a security vulnerability (CVE-2025-46565) as recommended by GitHub security alerts.

## What Changed?
- **Dependency Updated:** `vite` was upgraded to version `~6.3.4` in `package.json` and `package-lock.json`.
- **Why:** This update patches a moderate severity vulnerability affecting prior versions.

## What Developers Need to Know
- **No breaking changes** are expected with this patch update, but always check your local development environment after pulling the latest changes.
- If you have a local install, run `npm install` in the `frontend` directory to ensure you are using the secure version.
- If you maintain forks or deployment pipelines, ensure they are also using `vite@~6.3.4` or newer.

## Reference
- [CVE-2025-46565](https://github.com/advisories/GHSA-xxxx-xxxx-xxxx) (update with actual advisory link if available)

---

For more details, see the main `README.md` for setup instructions or contact the maintainers for security-related questions.
