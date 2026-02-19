import React from 'react';
import PathfindingVisualizer from './PathfindingVisualizer/PathfindingVisualizer';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>ALGORITHM VISUALIZER</h1>
        <h2>Learner’s Space, IIT Bombay [Jun’ 25-Jul ’25]</h2>
      </header>
      <main>
        <PathfindingVisualizer />
      </main>
      <footer className="App-footer">
        <p>Created by <span className="creator-name">Aryan Kumar</span></p>
      </footer>
    </div>
  );
}

export default App;
