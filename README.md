# remember-me-api

This repository is the backend service of "remember me", a prototyping application for food loss reduction.

# dependency

- Firebase CLI
- Firebase emulators
- Node.js
- OpenJDK 11
- Python 3
- TypeScript

# build image & login container

```
docker compose up --build -d
```

# commands

- login

```
firebase login --no-localhost
```

- start emulators

```
firebase emulators:start
```

# exposed ports

| Port | Purpose           |
| ---- | ----------------- |
| 8081 | Emulator Suite UI |
| 5001 | Cloud Functions   |
| 8082 | Cloud Firestore   |
