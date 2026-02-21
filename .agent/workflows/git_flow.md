---
description: Standard Git Flow: Feature -> Develop -> Main
---

# Git Flow Process

## 1. Start a New Feature
Run this to create a new feature branch from `develop`. Replace `feature/your-feature-name` with your desired branch name.
`git checkout develop`
`git pull origin develop`
`git checkout -b feature/your-feature-name`

## 2. Finish Feature (Merge to Develop)
Run this when your feature is complete and tested locally. Replace `feature/your-feature-name` with your actual branch name.
`git checkout develop`
`git pull origin develop`
`git merge feature/your-feature-name`
`git push origin develop`
// Optional: Delete feature branch
// `git branch -d feature/your-feature-name`

## 3. Release (Merge Develop to Main)
Run this when `develop` is stable and ready for production.
`git checkout main`
`git pull origin main`
`git merge develop`
`git push origin main`
`git checkout develop`
