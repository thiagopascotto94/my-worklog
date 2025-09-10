#!/bin/bash
cd /app/backend
npm install
./node_modules/.bin/sequelize-cli db:migrate --config /app/backend/src/db/config.js --migrations-path /app/backend/migrations --models-path /app/backend/src/models
