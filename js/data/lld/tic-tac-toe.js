// Tic Tac Toe
registerLesson("lld", "tic-tac-toe", {
  why: "Chhota game, par isme do interview favourites hain: (1) game state aur turn ka saaf model, (2) win check O(n²) se O(1) per move mein karna. Board games (Connect Four, Chess) isi soch ke bade roop hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements</h2>
        <ul>
          <li>N×N board (3 default), 2 players (X, O), baari baari move.</li>
          <li>Move: row, col. Invalid (bahar, bhara hua, galat player ki baari, game khatam) → error.</li>
          <li>Har move ke baad: WIN (poori row / column / diagonal), DRAW (board bhara), ya IN_PROGRESS.</li>
        </ul>
        <pre class="diagram">
Game ◆── Board (n, cells[][])          Game ── 2 ── Player (name, symbol: Symbol enum)
Game: currentPlayer, status: GameStatus enum { IN_PROGRESS, X_WON, O_WON, DRAW }
      move(player, r, c) → GameStatus</pre>
        <h2>Win check: naive vs smart</h2>
        <p><b>Naive:</b> har move ke baad poora board check: O(n²). 3×3 pe farak nahi, par interviewer pooche "1000×1000?"</p>
        <p><b>Smart (counters):</b> har row, column aur dono diagonals ka ek counter. X = +1, O = −1. Move (r, c) ke baad sirf <code>rows[r]</code>, <code>cols[c]</code>, aur agar diagonal pe ho to <code>diag</code>/<code>anti</code> update. Kisi counter ka <code>|value| == n</code> = win. Har move O(1).</p>
        <p>Kyun kaam karta hai: ek line mein n moves aur sab ek hi player ke tabhi honge jab sum exactly +n ya −n ho. Mixed line kabhi ±n nahi pahunchti.</p>`
    },
    {
      type: "steps",
      title: "Counters dry run (3×3)",
      steps: [
        { title: "X (0,0): rows[0]=1, cols[0]=1, diag=1", html: `<div class="arr"><span class="cell hl">X</span><span class="cell"></span><span class="cell"></span></div><div class="arr"><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><div class="arr"><span class="cell"></span><span class="cell"></span><span class="cell"></span></div>` },
        { title: "O (1,0): rows[1]=-1, cols[0]=0", html: `<div class="arr"><span class="cell">X</span><span class="cell"></span><span class="cell"></span></div><div class="arr"><span class="cell hl">O</span><span class="cell"></span><span class="cell"></span></div><div class="arr"><span class="cell"></span><span class="cell"></span><span class="cell"></span></div><p>Column 0 mein ab X aur O dono hain. Iska sum kabhi ±3 nahi ho sakta, isliye ye column koi nahi jeet sakta. Counter ko ye "yaad" rakhne ki zaroorat nahi, maths khud sambhal leta hai.</p>` },
        { title: "X (1,1): rows[1]=0, cols[1]=1, diag=2", html: `<div class="arr"><span class="cell">X</span><span class="cell"></span><span class="cell"></span></div><div class="arr"><span class="cell">O</span><span class="cell hl">X</span><span class="cell"></span></div><div class="arr"><span class="cell"></span><span class="cell"></span><span class="cell"></span></div>` },
        { title: "O (0,2), X (2,2): diag = 3 → X WON", html: `<div class="arr"><span class="cell ok">X</span><span class="cell"></span><span class="cell">O</span></div><div class="arr"><span class="cell">O</span><span class="cell ok">X</span><span class="cell"></span></div><div class="arr"><span class="cell"></span><span class="cell"></span><span class="cell ok">X</span></div><p>Board scan kiye bina, sirf 4 counters dekh ke.</p>` }
      ]
    },
    {
      type: "exercise",
      id: "ex-ttt",
      title: "Tic Tac Toe with O(1) win check",
      level: "Medium",
      task: `<p><code>Game(int n)</code>: X pehle chalta hai. <code>String move(char player, int r, int c)</code> return kare <code>"IN_PROGRESS"</code>, <code>"X_WON"</code>, <code>"O_WON"</code> ya <code>"DRAW"</code>.</p>
        <p>Invalid moves pe <code>IllegalArgumentException</code>: bahar ka cell, bhara cell, galat player ki baari, ya game khatam hone ke baad move. Invalid move se state nahi badalni chahiye.</p>
        <p>Win check counters se karo (har move O(1)). Harness 1000×1000 board pe bhi chalata hai.</p>`,
      examples: "X(0,0) O(1,0) X(1,1) O(0,2) X(2,2) → <code>\"X_WON\"</code>",
      userFile: "Solution.java",
      starter: `class Game {
    Game(int n) { }
    String move(char player, int r, int c) { return "IN_PROGRESS"; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static String iae(Runnable r) { try { r.run(); return "ok"; } catch (IllegalArgumentException e) { return "IAE"; } }

    public static void main(String[] args) {
        Check.eq("diagonal win", "X_WON", () -> {
            Game g = new Game(3); g.move('X', 0, 0); g.move('O', 1, 0); g.move('X', 1, 1); g.move('O', 0, 2); return g.move('X', 2, 2);
        });
        Check.eq("galat baari → IAE", "IAE", () -> { Game g = new Game(3); return iae(() -> g.move('O', 0, 0)); });
        Check.hiddenFromHere();
        Check.eq("column win O", "O_WON", () -> {
            Game g = new Game(3); g.move('X', 0, 0); g.move('O', 0, 1); g.move('X', 2, 2); g.move('O', 1, 1); g.move('X', 1, 0); return g.move('O', 2, 1);
        });
        Check.eq("anti-diagonal", "X_WON", () -> {
            Game g = new Game(3); g.move('X', 0, 2); g.move('O', 0, 0); g.move('X', 1, 1); g.move('O', 0, 1); return g.move('X', 2, 0);
        });
        Check.eq("draw", "DRAW", () -> {
            Game g = new Game(3);
            int[][] m = {{0,0},{0,1},{0,2},{1,1},{1,0},{1,2},{2,1},{2,0},{2,2}};
            String s = ""; char p = 'X';
            for (int[] x : m) { s = g.move(p, x[0], x[1]); p = p == 'X' ? 'O' : 'X'; }
            return s;
        });
        Check.eq("bhara cell / bahar / game over → IAE, state same", List.of("IAE", "IAE", "IN_PROGRESS", "IAE"), () -> {
            Game g = new Game(3); g.move('X', 0, 0);
            String a = iae(() -> g.move('O', 0, 0)), b = iae(() -> g.move('O', 3, 0));
            String c = g.move('O', 1, 1);
            Game w = new Game(1); w.move('X', 0, 0);
            return List.of(a, b, c, iae(() -> w.move('O', 0, 0)));
        });
        Check.eq("1000x1000: X row 0 fill, O row 1", "X_WON", () -> {
            Game g = new Game(1000); String s = "";
            for (int c = 0; c < 1000; c++) { s = g.move('X', 0, c); if (!s.equals("IN_PROGRESS")) break; g.move('O', 1, c); }
            return s;
        });
    }
}`,
      hints: [
        "Fields: <code>char[][] cells</code>, <code>int[] rows, cols</code>, <code>int diag, anti, moves</code>, <code>char turn = 'X'</code>, <code>String status = \"IN_PROGRESS\"</code>.",
        "Pehle saari validations (status, turn, bounds, empty), tabhi state badlo. <code>int v = player == 'X' ? 1 : -1;</code> rows[r] += v, cols[c] += v, <code>if (r == c) diag += v; if (r + c == n - 1) anti += v;</code>",
        "Win: kisi ka <code>Math.abs(...) == n</code>. Warna <code>moves == n*n</code> → DRAW. Phir turn badlo."
      ],
      solution: `class Game {
    private final int n;
    private final char[][] cells;
    private final int[] rows, cols;
    private int diag, anti, moves;
    private char turn = 'X';
    private String status = "IN_PROGRESS";

    Game(int n) {
        this.n = n;
        cells = new char[n][n];
        rows = new int[n];
        cols = new int[n];
    }

    String move(char player, int r, int c) {
        if (!status.equals("IN_PROGRESS")) throw new IllegalArgumentException("game over");
        if (player != turn) throw new IllegalArgumentException("not your turn");
        if (r < 0 || c < 0 || r >= n || c >= n) throw new IllegalArgumentException("outside board");
        if (cells[r][c] != 0) throw new IllegalArgumentException("cell taken");

        cells[r][c] = player;
        moves++;
        int v = player == 'X' ? 1 : -1;
        rows[r] += v;
        cols[c] += v;
        if (r == c) diag += v;
        if (r + c == n - 1) anti += v;

        if (Math.abs(rows[r]) == n || Math.abs(cols[c]) == n || Math.abs(diag) == n || Math.abs(anti) == n) {
            status = player + "_WON";
        } else if (moves == n * n) {
            status = "DRAW";
        }
        turn = turn == 'X' ? 'O' : 'X';
        return status;
    }
}`,
      explain: "<p>Validation pehle, mutation baad mein: invalid move state nahi bigaadta. Counters se har move O(1) time, memory O(n) (plus board O(n²), jo occupied check ke liye chahiye). LeetCode 348 'Design Tic-Tac-Toe' yahi trick maangta hai.</p>"
    },
    {
      type: "think",
      id: "think-ttt-ext",
      q: "Follow-up: <b>\"Ab win ke liye poori line nahi, kisi bhi line mein lagatar K symbols chahiye (Gomoku / Connect-K).\"</b> Counters wali trick chalegi? Kaise check karoge?",
      rubric: [
        { point: "Sum counters <b>nahi chalenge</b> (lagatar hona zaroori, poori line nahi)", keys: ["nahi chalega", "won't work", "kaam nahi", "lagatar", "consecutive", "continuous"], weight: 2 },
        { point: "Last move se <b>4 directions</b> (horizontal, vertical, 2 diagonals) mein dono taraf count", keys: ["4 direction", "four direction", "dono taraf", "both sides", "direction"], weight: 2 },
        { point: "Complexity <b>O(K)</b> per move", keys: ["o(k)", "k per move", "order k"], weight: 2 }
      ],
      answer: "<p>Sum sirf \"poori line ek player ki\" batata hai, lagatar K nahi. Har move ke baad sirf <b>naye piece ke aas-paas</b> dekho: 4 directions (→, ↓, ↘, ↗), har direction mein dono taraf same symbol gino jab tak alag na mile: <code>1 + countForward + countBackward ≥ K</code> → win. Har move O(K), board scan nahi. Ye Connect Four LLD ka standard jawab hai.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Game LLD mein entities (Game, Board, Player, Move, enums) jaldi khatam karo aur zyaada time <b>validation + win logic + extensibility</b> (N×N, K-in-a-row, undo via Command) pe do. Wahi score karta hai."
    }
  ],
  references: [
    { title: "Design Tic-Tac-Toe (LeetCode 348)", by: "LeetCode", url: "https://leetcode.com/problems/design-tic-tac-toe/", type: "article" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
