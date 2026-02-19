#!/bin/bash

# Compile C++ Backend
echo "Compiling C++ Backend..."
cd backend/cpp
g++ -std=c++17 -o algorithms algorithms.cpp || { echo "Compilation failed"; exit 1; }
cd ../..

# Start Backend
echo "Starting Backend..."
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend..."
cd ../frontend
npm run dev -- --host &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both
trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT

wait
