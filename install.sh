#!/bin/bash
echo "==============================="
echo "   Zuna Tungviet - Quick Start"
echo "==============================="

echo ""
echo "[1/3] Installing Server dependencies..."
cd server
npm install
cd ..

echo ""
echo "[2/3] Installing Client dependencies..."
cd client
npm install
cd ..

echo ""
echo "[3/3] Installing Admin dependencies..."
cd admin
npm install
cd ..

echo ""
echo "==============================="
echo "   Installation Complete!"
echo "==============================="
echo ""
echo "To start the project:"
echo "   1. Start MongoDB"
echo "   2. Run: cd server && npm run seed (to seed data)"
echo "   3. Run: cd server && npm run dev (server on port 5000)"
echo "   4. Run: cd client && npm run dev (client on port 3000)"
echo "   5. Run: cd admin && npm run dev (admin on port 3001)"
