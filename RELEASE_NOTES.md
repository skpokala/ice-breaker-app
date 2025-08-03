# Release 1.0.13

**Release Date:** 2025-08-03

**Changes:** 38 commits by 1 contributor

## ✨ New Features

- Fix Docker workflow: consolidate builds, add fallback registry, optimize performance (274ce32)
- test: add minimal GitHub Actions workflow to isolate failures (c69f765)
- feat: add automated Docker build and push system (7cbc06d)
- feat: Add comprehensive Docker deployment with ghcr.io (a7a9f38)
- feat: Add comprehensive release notes system (1eae71f)
- feat: Add automatic versioning system (a26296a)

## 🐛 Bug Fixes

- fix: update main Docker build workflow with GHCR fixes and lowercase repo names (f8e7252)
- fix: remove GitHub CLI user API call causing 403 Forbidden error (86eefd1)
- fix: resolve GitHub Actions Docker build failures (3463821)
- fix: restore correct react-scripts version - was corrupted during cleanup (7f5ab0a)
- fix: comprehensive GHCR workflow improvements - separate build/push steps, better debugging, simplified naming (58c3954)
- fix: resolve ghcr.io 403 Forbidden with proper permissions and lowercase repo names (6e55f69)
- fix: BOTH builds now work - node_modules corruption + missing package-lock.json resolved (c277cb9)
- fix: clean node_modules - local builds work, investigating GitHub Actions failures (9fe78d8)
- fix: COMPREHENSIVE GitHub Actions Docker build fix - node modules corruption resolved, simplified workflow added, all builds verified working (2486d9f)
- fix: enhance GitHub Actions Docker builds with debugging (45183d4)
- fix: optimize GitHub Actions Docker builds (59d34ff)
- fix: Remove conflicting CI/CD workflow (4ffab4f)
- fix: Docker build issues (e235a63)

## 🚀 Improvements

- chore: update release notes for v1.0.12 (8ad62d6)

## 🔧 Other Changes

- MAJOR SIMPLIFICATION: Rebuild Docker workflow from scratch (0ee5a66)
- CRITICAL FIX: Implement proper fallback logic for Docker workflow (b7aa332)
- trigger: GHCR authentication test (515adde)
- add: Docker Hub backup workflow and immediate fix plan for persistent GHCR 403 errors (63ae775)
- add: GHCR authentication test workflow and setup guide (0234898)
- trigger: enable GitHub Actions Docker builds (000c531)
- Initial commit: Team Ice Breaker App with user name functionality (0d872da)

## 👥 Contributors

- Sandeep Kumar Pokala (38 commits)

