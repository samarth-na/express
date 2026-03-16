#!/bin/bash

# Auth API Test Commands
# Server must be running on port 4000 with auth routes mounted at /auth

# 1. Sign up a new user
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

echo ""

# 2. Sign in (get JWT token)
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

echo ""

# 3. Access protected route (GET /)
# Replace <TOKEN> with the JWT token from signin response
curl -X GET http://localhost:4000/auth/ \
  -H "Authorization: Bearer <TOKEN>"

echo ""

# 4. Access protected route without token (should fail)
curl -X GET http://localhost:4000/auth/

echo ""

# 5. Access protected route with invalid token (should fail)
curl -X GET http://localhost:4000/auth/ \
  -H "Authorization: Bearer invalid-token-here"

echo ""

# 6. Update data (PUT /:id) - protected route
curl -X PUT http://localhost:4000/auth/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"updateData": {"status": "completed"}}'

echo ""

# 7. Test signup with existing user (should fail with 409)
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

echo ""

# 8. Test signin with wrong password (should fail with 401)
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrongpassword"}'

echo ""

# 9. Test signin with non-existent user (should fail with 401)
curl -X POST http://localhost:4000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@example.com", "password": "password123"}'

echo ""

# 10. Test signup with missing fields (should fail with 400)
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

echo ""
