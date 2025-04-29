import subprocess
import sys
import os
import signal

# ANSI escape codes for color (works on Mac, Linux, Windows 10+)
RESET = "\033[0m"
BOLD = "\033[1m"
CYAN = "\033[36m"
GREEN = "\033[32m"
YELLOW = "\033[33m"

# Helper to run a process and return the Popen object
def run(cmd, cwd=None):
    return subprocess.Popen(cmd, cwd=cwd, shell=True)

# Start backend (adjust path and port as needed)
backend = run("uvicorn app.main:app --reload --port 8000 --log-level warning", cwd="backend")
print(f"\n{BOLD}{CYAN}[GalleryFlow]{RESET} {GREEN}Backend server starting on {RESET}http://localhost:8000 ⬅ \n")

# Start frontend
frontend = run("npm run dev", cwd="frontend")
print(f"\n{BOLD}{CYAN}[GalleryFlow]{RESET} {GREEN}Frontend (Vite) server starting on {RESET}http://localhost:5173 ⬅ \n")

try:
    # Wait for both processes to complete
    backend.wait()
    frontend.wait()
except KeyboardInterrupt:
    print("\nStopping GalleryFlow, please wait a moment.")
    backend.terminate()
    frontend.terminate()
    try:
        backend.wait(timeout=5)
    except Exception:
        backend.kill()
    try:
        frontend.wait(timeout=5)
    except Exception:
        frontend.kill()
    print("Both servers stopped.")
