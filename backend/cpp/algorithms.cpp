#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <tuple>
#include <algorithm>
#include <cmath>
#include <set>

using namespace std;

struct Point {
    int x, y;
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }
    bool operator<(const Point& other) const {
        if (x != other.x) return x < other.x;
        return y < other.y;
    }
};

struct Node {
    Point p;
    int g; // cost from start
    int h; // heuristic (for A*)
    int f; // g + h
    Point parent;

    bool operator>(const Node& other) const {
        return f > other.f;
    }
};

int width, height;
int startX, startY, endX, endY;
vector<vector<int>> grid; // 0: Empty, 1: Wall, 2+: Weight

// Output buffers
vector<Point> visitedOrder;
vector<Point> path;

bool isValid(int x, int y) {
    return x >= 0 && x < width && y >= 0 && y < height && grid[y][x] != 1;
}

void printResult() {
    cout << visitedOrder.size() << endl;
    for (const auto& p : visitedOrder) {
        cout << p.x << " " << p.y << " ";
    }
    cout << endl;

    cout << path.size() << endl;
    for (const auto& p : path) {
        cout << p.x << " " << p.y << " ";
    }
    cout << endl;
}

void reconstructPath(const vector<vector<Point>>& parent) {
    Point curr = {endX, endY};
    if (parent[endY][endX].x == -1) return; // No path

    while (!(curr.x == startX && curr.y == startY)) {
        path.push_back(curr);
        curr = parent[curr.y][curr.x];
        if (curr.x == -1) break; 
    }
    path.push_back({startX, startY});
    reverse(path.begin(), path.end());
}

// BFS
void runBFS() {
    queue<Point> q;
    q.push({startX, startY});
    vector<vector<bool>> visited(height, vector<bool>(width, false));
    vector<vector<Point>> parent(height, vector<Point>(width, {-1, -1}));
    
    visited[startY][startX] = true;

    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};

    bool found = false;

    while (!q.empty()) {
        Point curr = q.front();
        q.pop();

        visitedOrder.push_back(curr);

        if (curr.x == endX && curr.y == endY) {
            found = true;
            break;
        }

        for (int i = 0; i < 4; i++) {
            int nx = curr.x + dx[i];
            int ny = curr.y + dy[i];

            if (isValid(nx, ny) && !visited[ny][nx]) {
                visited[ny][nx] = true;
                parent[ny][nx] = curr;
                q.push({nx, ny});
            }
        }
    }
    
    if (found) reconstructPath(parent);
}

// DFS
void runDFS() {
    stack<Point> s;
    s.push({startX, startY});
    vector<vector<bool>> visited(height, vector<bool>(width, false));
    vector<vector<Point>> parent(height, vector<Point>(width, {-1, -1}));
    
    // Note: DFS in stack doesn't mark visited on push usually, but on pop/expand
    // or push and mark. Let's mark on pop to allow re-visiting better paths? 
    // No, standard DFS for unweighted graph just finds *a* path, not shortest.
    
    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};

    bool found = false;

    while (!s.empty()) {
        Point curr = s.top();
        s.pop();

        if (visited[curr.y][curr.x]) continue;
        visited[curr.y][curr.x] = true;
        visitedOrder.push_back(curr);

        if (curr.x == endX && curr.y == endY) {
            found = true;
            break;
        }

        for (int i = 0; i < 4; i++) {
            int nx = curr.x + dx[i];
            int ny = curr.y + dy[i];

            if (isValid(nx, ny) && !visited[ny][nx]) {
                // Determine parenting is tricky in iterative DFS if we want perfect reconstruction
                // We set parent when we push, but might overwrite? 
                // A visited check before push handles standard DFS tree
                if(parent[ny][nx].x == -1) parent[ny][nx] = curr;
                s.push({nx, ny});
            }
        }
    }

    if (found) reconstructPath(parent);
}

// Dijkstra
void runDijkstra() {
    priority_queue<Node, vector<Node>, greater<Node>> pq;
    pq.push({{startX, startY}, 0, 0, 0, {-1, -1}});
    
    vector<vector<int>> dist(height, vector<int>(width, 1e9));
    vector<vector<Point>> parent(height, vector<Point>(width, {-1, -1}));
    
    dist[startY][startX] = 0;

    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};
    
    bool found = false;

    while (!pq.empty()) {
        Node current = pq.top();
        pq.pop();
        Point u = current.p;

        if (current.g > dist[u.y][u.x]) continue;
        
        visitedOrder.push_back(u);

        if (u.x == endX && u.y == endY) {
            found = true;
            break; 
        }

        for (int i = 0; i < 4; i++) {
            int nx = u.x + dx[i];
            int ny = u.y + dy[i];

            if (isValid(nx, ny)) {
                int weight = (grid[ny][nx] >= 2) ? grid[ny][nx] : 1; 
                if (dist[ny][nx] > dist[u.y][u.x] + weight) {
                    dist[ny][nx] = dist[u.y][u.x] + weight;
                    parent[ny][nx] = u;
                    pq.push({{nx, ny}, dist[ny][nx], 0, dist[ny][nx], u});
                }
            }
        }
    }
    if (found) reconstructPath(parent);
}

// A*
void runAStar() {
    auto heuristic = [](int x1, int y1, int x2, int y2) {
        return abs(x1 - x2) + abs(y1 - y2); // Manhattan distance
    };

    priority_queue<Node, vector<Node>, greater<Node>> pq;
    pq.push({{startX, startY}, 0, heuristic(startX, startY, endX, endY), 0, {-1, -1}});
    
    vector<vector<int>> gScore(height, vector<int>(width, 1e9));
    vector<vector<Point>> parent(height, vector<Point>(width, {-1, -1}));
    
    gScore[startY][startX] = 0;

    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};
    
    bool found = false;

    while (!pq.empty()) {
        Node current = pq.top();
        pq.pop();
        Point u = current.p;

        // Note: In A*, we might revisit nodes if we find a better path?
        // Standard A* with consistent heuristic uses closed set implicitly via gScore check?
        // Let's use standard closed set logic
        // Actually, just checking gScore is enough?
        
        // Visualizer needs to see explored nodes. 
        visitedOrder.push_back(u);
        
        if (u.x == endX && u.y == endY) {
            found = true;
            break;
        }

        for (int i = 0; i < 4; i++) {
            int nx = u.x + dx[i];
            int ny = u.y + dy[i];

            if (isValid(nx, ny)) {
                int weight = (grid[ny][nx] >= 2) ? grid[ny][nx] : 1; 
                int tentative_gScore = gScore[u.y][u.x] + weight;
                
                if (tentative_gScore < gScore[ny][nx]) {
                    parent[ny][nx] = u;
                    gScore[ny][nx] = tentative_gScore;
                    int h = heuristic(nx, ny, endX, endY);
                    pq.push({{nx, ny}, tentative_gScore, h, tentative_gScore + h, u});
                }
            }
        }
    }
    if (found) reconstructPath(parent);
}

int main(int argc, char* argv[]) {
    string algo;
    cin >> algo >> width >> height;
    cin >> startX >> startY >> endX >> endY;

    grid.resize(height, vector<int>(width));
    for (int i = 0; i < height; i++) {
        for (int j = 0; j < width; j++) {
            cin >> grid[i][j];
        }
    }

    if (algo == "bfs") runBFS();
    else if (algo == "dfs") runDFS();
    else if (algo == "dijkstra") runDijkstra();
    else if (algo == "astar") runAStar();

    printResult();
    return 0;
}
