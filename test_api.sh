#!/bin/bash

set -e
set -x

# Create and migrate the database
cd /app/backend
npm cache clean --force
npm install
npx sequelize-cli db:migrate:undo:all || true
npx sequelize-cli db:migrate

# Start the backend server
npm run dev > /app/backend/backend.log 2>&1 &
BACKEND_PID=$!
cd /app

# Wait for the server to be ready
sleep 15

# List files in backend directory
ls -l /app/backend

# Register a new user
curl -X POST -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "password", "firstName": "Test", "lastName": "User"}' http://localhost:3001/api/auth/register

# Login to get a JWT token
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email": "test@example.com", "password": "password"}' http://localhost:3001/api/auth/login)
echo "Login response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

echo "Token: $TOKEN"

# Create a new client
CLIENT_ID=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "Test Client", "company_name": "Test Company", "contacts": [{"name": "Test Contact", "email": "contact@example.com", "phone": "1234567890"}]}' http://localhost:3001/api/clients | jq -r '.id')

echo "Created client with ID: $CLIENT_ID"

# Get all clients
curl -s -X GET -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/clients

# Update the client
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name": "Test Client Updated", "company_name": "Test Company Updated", "contacts": [{"name": "Test Contact Updated", "email": "contact.updated@example.com", "phone": "0987654321"}]}' http://localhost:3001/api/clients/$CLIENT_ID

# Get the updated client
curl -s -X GET -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/clients/$CLIENT_ID

# Delete the client
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/clients/$CLIENT_ID

# Kill the backend server
kill $BACKEND_PID
