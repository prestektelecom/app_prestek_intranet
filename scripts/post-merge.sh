#!/bin/bash
set -e

if [ -f package-lock.json ]; then
    npm install --no-audit --no-fund
fi

if [ -f backend/package-lock.json ] || [ -f backend/package.json ]; then
    (cd backend && npm install --no-audit --no-fund)
fi
