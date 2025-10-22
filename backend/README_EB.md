Deploying to AWS Elastic Beanstalk

This repository contains a FastAPI backend intended to run on AWS Elastic Beanstalk (Python platform).

Key points:
- The application listens on 0.0.0.0:$PORT. When running under EB, the platform sets $PORT (default 8080).
- A Procfile is included to run the app with gunicorn + uvicorn worker: `web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:$PORT`.
- The `.ebextensions/01_uploads.config` ensures an `uploads/` directory exists after deployment so uploaded files persist under the app folder.

How to deploy
1. Ensure you have the AWS CLI and EB CLI installed and configured.
2. From the `backend` directory, run `eb init` and choose the Python platform (e.g., Python 3.11).
3. Create an environment: `eb create my-backend-env` or deploy to an existing env with `eb deploy`.
4. Set environment variables in the EB console or via `eb setenv KEY=value` (for database paths, secrets, etc.).

Local development
- Use `./start.sh` to run the server locally. It uses uvicorn and listens on PORT 8080 by default.

Notes & environment variables
- If you want to use a production-grade database instead of the bundled SQLite file, set the appropriate `DATABASE_URL` environment variable and update `database.py` accordingly.
- Make sure to configure any secrets (SECRET_KEY, DB credentials) via EB environment variables — never commit secrets to source control.
