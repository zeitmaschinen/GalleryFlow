# Contributing to GalleryFlow

I love your input! I want to make contributing as easy and transparent as possible.

**Note:** I may not be fully available for troubleshooting or providing new updates. However, the project is open for improvement, so feel free to contribute, fork, or adapt it as you wish!

## Development Process

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. Update the documentation.
4. Ensure the test suite passes. Test your changes by running the app with the unified script as described below.
5. Make sure your code lints.
6. Issue a pull request!

## Running the App Locally

To start both backend and frontend for development, from the project root:

```bash
source backend/venv/bin/activate     # or backend\venv\Scripts\activate on Windows
python3 run_galleryflow.py
```

This will launch both servers. Access the frontend at [http://localhost:5173](http://localhost:5173) and the backend at [http://localhost:8000](http://localhost:8000).

## Pull Request Process

1. Update the README.md with details of changes if needed.
2. The pull request will be merged once you have the sign-off.

## Coding Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

---

## Advanced Usage

- You may customize `.env` files for different environments (local, staging, production).
- For advanced workflows (e.g., debugging only backend or frontend), you may still run them separately as described in the README.

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
  - If you encounter issues with the unified script, check that dependencies are installed and your virtual environment is activated. For more troubleshooting tips, see the README.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.