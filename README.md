# AlgoVizualizer

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://algovizualizer.onrender.com/)

**AlgoVizualizer** is a high-performance, interactive pathfinding visualizer built to demonstrate classic graph algorithms in a modern, aesthetically pleasing web interface.

## 🚀 Features

-   **Algorithms**: Supported algorithms include:
    -   **Breadth-First Search (BFS)**: Guarantees the shortest path.
    -   **Depth-First Search (DFS)**: Explores as far as possible along each branch before backtracking.
    -   **Dijkstra's Algorithm**: The father of pathfinding algorithms; guarantees the shortest path.
    -   **A* Search**: A smart algorithm that uses heuristics to guarantee the shortest path faster than Dijkstra's.
-   **Interactive Grid**: Draw walls and barriers effortlessly to challenge the algorithms.
-   **Speed Control**: Adjust the visualization speed to understand the algorithm's process step-by-step or watch it race.
-   **Premium UI**: A clean, light-themed "Glassmorphism" interface with neon accents and smooth animations.
-   **High Performance**: The core pathfinding logic is written in **C++** for maximum efficiency, ensuring even complex calculations are near-instantaneous.

## 🛠 Tech Stack

This project uses a hybrid architecture to combine the performance of C++ with the ease of React and Python.

-   **Frontend**: React.js (Vite) - Handles the interactive grid, animations, and user controls.
-   **Backend**: Python (FastAPI) - Serves as the API layer, managing requests between the frontend and the C++ core.
-   **Core Engine**: C++ - Executes the intense pathfinding algorithms. The Python backend communicates with the compiled C++ binary via standard I/O streams.

## 🏗 Architecture

1.  **User Action**: User draws walls and clicks "Visualize!" on the React frontend.
2.  **API Request**: React sends the grid state (start, end, walls) to the Python FastAPI backend.
3.  **Process Interop**: Python spawns the compiled C++ executable as a subprocess and pipes the grid data to it.
4.  **Algorithm Execution**: C++ parses the input, runs the selected algorithm (BFS, DFS, A*, etc.), and outputs the visited nodes and shortest path.
5.  **Response**: Python parses the C++ output and sends it back to React as a JSON response.
6.  **Visualization**: React animates the visited nodes and the shortest path based on the data received.

## 📦 Installation & Run

### Prerequisites
-   Node.js & npm
-   Python 3.x
-   G++ Compiler (for C++)

### Automatic Start
The easiest way to run the application is using the provided script:

```bash
./run.sh
```

This script will:
1.  Compile the C++ backend.
2.  Start the Python backend server.
3.  Start the React frontend development server.

### Manual Setup

1.  **Backend (C++ & Python)**
    ```bash
    # Compile C++
    cd backend/cpp
    g++ -std=c++17 -O3 -o algorithms algorithms.cpp
    cd ../..

    # Setup Python environment
    python3 -m venv venv
    source venv/bin/activate
    pip install fastapi uvicorn
    
    # Run Python Server
    uvicorn backend.main:app --reload
    ```

2.  **Frontend (React)**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 👨‍💻 Creator

Created by **Aryan Kumar**
*Learner’s Space, IIT Bombay [Jun’ 25-Jul ’25]*
