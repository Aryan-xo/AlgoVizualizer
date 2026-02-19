import React, { Component } from 'react';
import Node from './Node/Node';
import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      isRunning: false,
      algorithm: 'bfs',
      animationSpeed: 10,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    if (this.state.isRunning) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid, mouseIsPressed: true});
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed || this.state.isRunning) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  clearGrid() {
     if (this.state.isRunning) return;
     const grid = getInitialGrid();
     this.setState({grid});
     // Clear visual CSS classes
     for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 50; col++) {
            const node = document.getElementById(`node-${row}-${col}`);
            if (node) {
                node.className = 'node';
                if (row === START_NODE_ROW && col === START_NODE_COL) node.className += ' node-start';
                if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) node.className += ' node-finish';
            }
        }
     }
  }

  async visualizeAlgorithm() {
    if (this.state.isRunning) return;
    this.setState({isRunning: true});

    const {grid, algorithm} = this.state;
    const gridData = grid.map(row => row.map(node => node.isWall ? 1 : 0));
    
    // Prepare payload
    const payload = {
        width: 50,
        height: 20,
        grid: gridData,
        start: {x: START_NODE_COL, y: START_NODE_ROW},
        end: {x: FINISH_NODE_COL, y: FINISH_NODE_ROW},
        algorithm: algorithm 
    };

    try {
        const response = await fetch('http://127.0.0.1:8000/run-algorithm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'API request failed');
        }
        
        const data = await response.json();
        this.animateAlgorithm(data.visited_nodes, data.path);

    } catch (error) {
        console.error("Error running algorithm:", error);
        this.setState({isRunning: false});
        alert(`Failed to run algorithm: ${error.message}`);
    }
  }

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    const { animationSpeed } = this.state;
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, animationSpeed * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!(node.y === START_NODE_ROW && node.x === START_NODE_COL) && 
            !(node.y === FINISH_NODE_ROW && node.x === FINISH_NODE_COL)) {
             document.getElementById(`node-${node.y}-${node.x}`).className =
            'node node-visited';
        }
      }, animationSpeed * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    const { animationSpeed } = this.state;
    // Path animation is typically slower/smoother, but we can scale it
    const pathSpeed = animationSpeed * 5; 
    
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
         if (!(node.y === START_NODE_ROW && node.x === START_NODE_COL) && 
            !(node.y === FINISH_NODE_ROW && node.x === FINISH_NODE_COL)) {
             document.getElementById(`node-${node.y}-${node.x}`).className =
          'node node-path';
        }
      }, pathSpeed * i);
    }
     setTimeout(() => {
        this.setState({isRunning: false});
      }, pathSpeed * nodesInShortestPathOrder.length);
  }

  render() {
    const {grid, mouseIsPressed, animationSpeed} = this.state;

    return (
      <div className="pathfindingVisualizer">
        <div className="controls">
            <div className="control-group">
                <span className="control-label">Algorithm:</span>
                <select 
                    value={this.state.algorithm} 
                    onChange={(e) => this.setState({algorithm: e.target.value})}
                    disabled={this.state.isRunning}
                >
                    <option value="bfs">Breadth-First Search (BFS)</option>
                    <option value="dfs">Depth-First Search (DFS)</option>
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="astar">A* Search</option>
                </select>
            </div>
            
            <div className="control-group">
                <span className="control-label">Speed:</span>
                <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5"
                    value={animationSpeed} 
                    onChange={(e) => this.setState({animationSpeed: Number(e.target.value)})}
                    disabled={this.state.isRunning}
                    style={{direction: 'rtl'}} // rtl so left is faster (smaller delay)
                />
            </div>

            <button onClick={() => this.visualizeAlgorithm()} disabled={this.state.isRunning}>
              Visualize!
            </button>
            <button onClick={() => this.clearGrid()} disabled={this.state.isRunning}>
              Clear Grid
            </button>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx} className="row">
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
