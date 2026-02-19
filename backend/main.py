from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
from typing import List

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Point(BaseModel):
    x: int
    y: int

class GridRequest(BaseModel):
    width: int
    height: int
    grid: List[List[int]]
    start: Point
    end: Point
    algorithm: str

@app.post("/run-algorithm")
def run_algorithm(request: GridRequest):
    # Construct input string for C++ executable
    input_str = f"{request.algorithm} {request.width} {request.height}\n"
    input_str += f"{request.start.x} {request.start.y} {request.end.x} {request.end.y}\n"
    
    for row in request.grid:
        input_str += " ".join(map(str, row)) + "\n"

    # Path to C++ executable
    cpp_executable = os.path.join(os.path.dirname(__file__), "cpp", "algorithms")
    
    if not os.path.exists(cpp_executable):
        return {"error": "C++ executable not found. Please compile backend/cpp/algorithms.cpp"}

    try:
        process = subprocess.Popen(
            [cpp_executable],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate(input=input_str)
        
        if process.returncode != 0:
            print(f"C++ Error: {stderr}") # Log to console
            raise HTTPException(status_code=500, detail=f"Algorithm failed: {stderr}")
            
        # Parse output
        lines = stdout.strip().split("\n")
        if len(lines) < 4:
             print(f"Invalid Output: {stdout}") # Log to console
             print(f"Stderr: {stderr}")
             raise HTTPException(status_code=500, detail="Invalid output from algorithm. Check backend logs.")

        num_visited = int(lines[0])
        visited_nodes_raw = list(map(int, lines[1].split()))
        visited_nodes = []
        for i in range(0, len(visited_nodes_raw), 2):
            visited_nodes.append({"x": visited_nodes_raw[i], "y": visited_nodes_raw[i+1]})

        path_length = int(lines[2])
        path_nodes_raw = list(map(int, lines[3].split()))
        path_nodes = []
        for i in range(0, len(path_nodes_raw), 2):
            path_nodes.append({"x": path_nodes_raw[i], "y": path_nodes_raw[i+1]})

        return {
            "visited_nodes": visited_nodes,
            "path": path_nodes
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
