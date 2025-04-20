# Contributing to GalleryFlow

We love your input! We want to make contributing as easy and transparent as possible.

**Note:** I may not be available for troubleshooting or providing new updates. However, the project is open for improvement, so feel free to contribute, fork, or adapt it as you wish!

## Development Process

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue a pull request!

## Pull Request Process

1. Update the README.md with details of changes if needed.
2. The PR will be merged once you have the sign-off.

## Coding Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

---

## Advanced Usage

- See the `README.md` for details on advanced configuration, environment variables, and deployment.
- You may customize `.env` files for different environments (local, staging, production).
- For running backend and frontend in parallel, use two terminal windows or a process manager (e.g., [concurrently](https://www.npmjs.com/package/concurrently)).

## Troubleshooting

- **Common Issues:**
  - Missing Python modules: `pip install package-name`
  - Node packages out of date: `npm install`
  - Database errors: check your `DATABASE_URL` and migration state
  - CORS issues: check `ALLOWED_ORIGINS` in your `.env`
- **Debugging:**
  - Set `LOG_LEVEL=debug` in your `.env` for verbose backend logs
  - Set `VITE_DEBUG=true` in your frontend `.env` for verbose frontend logs
- **Platform-specific tips:**
  - On Windows, use `venv\Scripts\activate` for Python virtualenv
  - On macOS/Linux, use `source venv/bin/activate`

## SSH Setup for Development

- If you wish to develop remotely (e.g., on a server or VM):
  1. Ensure you have SSH access to your development machine.
  2. Clone the repository via SSH: `git clone git@github.com:zeitmaschinen/galleryflow.git`
  3. Use SSH port forwarding to access local servers remotely:
     - Example: `ssh -L 5173:localhost:5173 user@remote-server` (for frontend)
     - Example: `ssh -L 8000:localhost:8000 user@remote-server` (for backend)
  4. Develop as usual, using the forwarded ports in your browser.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.