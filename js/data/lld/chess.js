// Chess
registerLesson("lld", "chess", {
  why: "Chess LLD ka 'final boss' hai, par basic functionality mein ye bas teen ideas hai: Board/Cell/Piece ka model, har piece ki movement polymorphism se (koi giant switch nahi), aur game state (turn, check, game over). Pehle ke saare lessons (inheritance vs composition, Strategy, State, Command for undo) yahan ek saath lagte hain.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Scope (basic rakho, interviewer se confirm)</h2>
        <ul>
          <li>8×8 board, do players (WHITE, BLACK), baari baari.</li>
          <li>Pieces: King, Queen, Rook, Bishop, Knight, Pawn ki basic moves. Raste mein piece ho to sliding pieces (Rook, Bishop, Queen) aage nahi jaate. Apne piece pe move nahi.</li>
          <li>Capture. King capture = game over (simplification). Out of scope: castling, en passant, promotion, check/checkmate detection (follow-up).</li>
        </ul>
        <pre class="diagram">
Game ── Board ◆── 8x8 Cell (row, col, piece?)       Game: turn: Color, status, moves: List&lt;Move&gt;
Piece «abstract» (color) ── canMove(board, from, to): boolean
   ▲      ▲       ▲       ▲        ▲       ▲
 King   Queen   Rook   Bishop   Knight   Pawn
Move (from, to, piece, captured?)   ← Command ki tarah: undo ke liye captured yaad
enum Color { WHITE, BLACK }</pre>
        <h3>Movement: inheritance ya composition?</h3>
        <p>Piece types fixed hain (6) aur har ek ka "is-a Piece" rishta saaf hai (LSP nahi tootta: har piece canMove ka wada nibhata hai). Isliye yahan <b>inheritance theek hai</b>. Common logic ("sliding move in direction") ek helper mein: Rook = straight directions, Bishop = diagonals, Queen = dono. Composition wala alternative: <code>Piece</code> ke paas <code>List&lt;MoveRule&gt;</code> (Queen = StraightRule + DiagonalRule): naye variants (fairy chess) ke liye flexible. Dono bolo, ek chuno, reason do.</p>`
    },
    {
      type: "think",
      id: "think-chess-validate",
      q: "Move validation ki <b>zimmedari kahan</b> rakhoge? Game, Board ya Piece? Kaun kya check karega? (turn, board bounds, apna piece target pe, path clear, piece ka shape)",
      rubric: [
        { point: "<b>Game</b>: turn sahi player ka, game over to nahi, move record", keys: ["game", "turn", "game over", "record"], weight: 2 },
        { point: "<b>Board</b>: bounds, cell pe kya hai, path clear helper", keys: ["board", "bounds", "path", "clear", "isempty"], weight: 2 },
        { point: "<b>Piece.canMove</b>: apna shape (L-shape, diagonal...) polymorphism se", keys: ["piece", "canmove", "polymorph", "override", "shape"], weight: 2 },
        { point: "Apne hi rang ka piece target pe → common check (Game ya Piece base)", keys: ["apna", "own piece", "same color", "friendly"] }
      ],
      answer: "<ul><li><b>Game.move(from, to)</b>: game chal raha hai? from pe current player ka piece hai? target pe apna piece to nahi? Phir <code>piece.canMove(board, from, to)</code>. Valid → board update, captured yaad (Move object), turn badlo, king capture → game over.</li><li><b>Board</b>: data + helpers (<code>inBounds</code>, <code>get</code>, <code>isPathClear(from, to)</code>). Board ko rules nahi pata.</li><li><b>Piece</b>: sirf apna geometry. Knight ko path clear nahi chahiye, sliding pieces ko chahiye, Pawn ko direction + capture rule.</li></ul><p>Har class ki ek zimmedari: naya piece = nayi class, Game nahi badla.</p>"
    },
    {
      type: "exercise",
      id: "ex-chess",
      title: "Chess core: pieces with polymorphic moves",
      level: "Hard",
      task: `<p>Starter mein <code>Color</code>, <code>Board</code> (8×8, <code>get/set/inBounds/isPathClear</code> diye hain) aur abstract <code>Piece</code> hai. Likho:</p>
        <ul>
          <li>Pieces: <code>King</code> (1 step koi bhi direction), <code>Queen</code>, <code>Rook</code>, <code>Bishop</code> (sliding, path clear), <code>Knight</code> (L, jump), <code>Pawn</code> (WHITE upar = row badhti hai, BLACK neeche; 1 step aage agar khaali; start row (WHITE 1, BLACK 6) se 2 step agar dono khaali; diagonal 1 step sirf capture pe).</li>
          <li><code>Game</code>: <code>Game(Board b)</code>, WHITE pehle. <code>String move(int fr, int fc, int tr, int tc)</code> return: <code>"OK"</code>, <code>"CAPTURE"</code>, <code>"WIN WHITE"</code>/<code>"WIN BLACK"</code> (king capture), ya <code>"INVALID"</code> (state nahi badle). Game over ke baad sab INVALID.</li>
          <li><code>boolean undo()</code>: aakhri move ulta (captured piece wapas, turn wapas, game over bhi wapas).</li>
        </ul>
        <p>Har piece ka <code>symbol()</code>: K Q R B N P (WHITE capital, BLACK small).</p>`,
      examples: "WHITE knight (0,1) → (2,2) OK; WHITE rook (0,0) → (5,0) jab (1,0) pe pawn → INVALID",
      userFile: "Solution.java",
      starter: `import java.util.*;

enum Color { WHITE, BLACK }

abstract class Piece {
    final Color color;
    Piece(Color color) { this.color = color; }
    abstract boolean canMove(Board b, int fr, int fc, int tr, int tc);
    abstract char letter();
    char symbol() { return color == Color.WHITE ? letter() : Character.toLowerCase(letter()); }
}

class Board {
    private final Piece[][] g = new Piece[8][8];
    Piece get(int r, int c) { return g[r][c]; }
    void set(int r, int c, Piece p) { g[r][c] = p; }
    boolean inBounds(int r, int c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
    // from aur to ke BEECH ke cells (straight / diagonal line pe) khaali hain?
    boolean isPathClear(int fr, int fc, int tr, int tc) {
        int dr = Integer.signum(tr - fr), dc = Integer.signum(tc - fc);
        int r = fr + dr, c = fc + dc;
        while (r != tr || c != tc) { if (g[r][c] != null) return false; r += dr; c += dc; }
        return true;
    }
}

class King extends Piece { King(Color c) { super(c); } boolean canMove(Board b, int fr, int fc, int tr, int tc) { return false; } char letter() { return 'K'; } }
class Queen extends Piece { Queen(Color c) { super(c); } boolean canMove(Board b, int fr, int fc, int tr, int tc) { return false; } char letter() { return 'Q'; } }
class Rook extends Piece { Rook(Color c) { super(c); } boolean canMove(Board b, int fr, int fc, int tr, int tc) { return false; } char letter() { return 'R'; } }
class Bishop extends Piece { Bishop(Color c) { super(c); } boolean canMove(Board b, int fr, int fc, int tr, int tc) { return false; } char letter() { return 'B'; } }
class Knight extends Piece { Knight(Color c) { super(c); } boolean canMove(Board b, int fr, int fc, int tr, int tc) { return false; } char letter() { return 'N'; } }
class Pawn extends Piece { Pawn(Color c) { super(c); } boolean canMove(Board b, int fr, int fc, int tr, int tc) { return false; } char letter() { return 'P'; } }

class Game {
    Game(Board b) { }
    String move(int fr, int fc, int tr, int tc) { return "INVALID"; }
    boolean undo() { return false; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static Board standard() {
        Board b = new Board();
        Piece[] backW = { new Rook(Color.WHITE), new Knight(Color.WHITE), new Bishop(Color.WHITE), new Queen(Color.WHITE), new King(Color.WHITE), new Bishop(Color.WHITE), new Knight(Color.WHITE), new Rook(Color.WHITE) };
        Piece[] backB = { new Rook(Color.BLACK), new Knight(Color.BLACK), new Bishop(Color.BLACK), new Queen(Color.BLACK), new King(Color.BLACK), new Bishop(Color.BLACK), new Knight(Color.BLACK), new Rook(Color.BLACK) };
        for (int c = 0; c < 8; c++) { b.set(0, c, backW[c]); b.set(7, c, backB[c]); b.set(1, c, new Pawn(Color.WHITE)); b.set(6, c, new Pawn(Color.BLACK)); }
        return b;
    }

    public static void main(String[] args) {
        Check.eq("opening moves", List.of("OK", "INVALID", "OK", "OK"), () -> {
            Game g = new Game(standard());
            return List.of(g.move(0, 1, 2, 2), g.move(2, 2, 4, 3), g.move(6, 4, 4, 4), g.move(1, 3, 3, 3));
        });
        Check.eq("rook blocked", "INVALID", () -> new Game(standard()).move(0, 0, 5, 0));
        Check.hiddenFromHere();
        Check.eq("turn: black pehle nahi", "INVALID", () -> new Game(standard()).move(6, 0, 5, 0));
        Check.eq("pawn rules: [3 step, 2 step start, diagonal bina capture, black 2 step]", List.of("INVALID", "OK", "INVALID", "OK"), () -> {
            Game g = new Game(standard());
            String a = g.move(1, 0, 4, 0);
            String b2 = g.move(1, 0, 3, 0);
            String c = g.move(6, 0, 5, 1);
            String d = g.move(6, 0, 4, 0);
            return List.of(a, b2, c, d);
        });
        Check.eq("pawn capture diagonal", "CAPTURE", () -> {
            Board b = new Board(); b.set(0, 4, new King(Color.WHITE)); b.set(7, 4, new King(Color.BLACK));
            b.set(3, 3, new Pawn(Color.WHITE)); b.set(4, 4, new Pawn(Color.BLACK));
            return new Game(b).move(3, 3, 4, 4);
        });
        Check.eq("bishop, queen, king geometry", List.of("OK", "INVALID", "OK", "INVALID"), () -> {
            Board b = new Board(); b.set(0, 0, new Bishop(Color.WHITE)); b.set(7, 7, new King(Color.BLACK)); b.set(3, 3, new Queen(Color.BLACK)); b.set(0, 7, new King(Color.WHITE));
            Game g = new Game(b);
            String a = g.move(0, 0, 2, 2);          // bishop diagonal
            String q = g.move(3, 3, 4, 5);          // queen knight-shape → invalid
            String q2 = g.move(3, 3, 3, 7);         // queen straight
            String k = g.move(0, 7, 2, 7);          // king 2 steps → invalid
            return List.of(a, q, q2, k);
        });
        Check.eq("king capture → WIN, phir sab INVALID", List.of("WIN WHITE", "INVALID"), () -> {
            Board b = new Board(); b.set(0, 0, new Rook(Color.WHITE)); b.set(5, 0, new King(Color.BLACK)); b.set(7, 7, new King(Color.WHITE));
            Game g = new Game(b); return List.of(g.move(0, 0, 5, 0), g.move(7, 7, 6, 7));
        });
        Check.eq("undo capture: piece wapas, turn wapas", List.of(true, 'p', "CAPTURE"), () -> {
            Board b = new Board(); b.set(0, 4, new King(Color.WHITE)); b.set(7, 4, new King(Color.BLACK));
            b.set(3, 3, new Pawn(Color.WHITE)); b.set(4, 4, new Pawn(Color.BLACK));
            Game g = new Game(b); g.move(3, 3, 4, 4);
            boolean u = g.undo();
            return List.of(u, b.get(4, 4).symbol(), g.move(3, 3, 4, 4));
        });
        Check.eq("apne piece pe nahi + bahar nahi", List.of("INVALID", "INVALID"), () -> {
            Game g = new Game(standard()); return List.of(g.move(0, 0, 1, 0), g.move(0, 1, -1, 3));
        });
        Check.eq("undo khaali → false", false, () -> new Game(standard()).undo());
    }
}`,
      hints: [
        "Sliding: <code>boolean straight = fr == tr || fc == tc; boolean diag = Math.abs(tr - fr) == Math.abs(tc - fc);</code> Rook: straight &amp;&amp; path clear. Bishop: diag &amp;&amp; path clear. Queen: (straight || diag) &amp;&amp; path clear. Same cell pe move hamesha false.",
        "Knight: <code>dr*dc == 2</code> (abs values: 1×2). King: <code>max(|dr|, |dc|) == 1</code>. Pawn: <code>dir = WHITE ? 1 : -1</code>; seedha: dc==0, target khaali, dr==dir ya (start row aur dr==2*dir aur beech khaali); capture: |dc|==1, dr==dir, target pe opponent.",
        "Game: bounds, game over, from pe current player ka piece, target pe apna nahi, canMove. Move record: <code>(fr,fc,tr,tc,moved,captured,wasOver)</code> stack mein. Undo: piece wapas, captured wapas, turn palto, status restore."
      ],
      solution: `import java.util.*;

enum Color { WHITE, BLACK }

abstract class Piece {
    final Color color;
    Piece(Color color) { this.color = color; }
    abstract boolean canMove(Board b, int fr, int fc, int tr, int tc);
    abstract char letter();
    char symbol() { return color == Color.WHITE ? letter() : Character.toLowerCase(letter()); }

    static boolean straight(int fr, int fc, int tr, int tc) { return (fr == tr) != (fc == tc); }
    static boolean diagonal(int fr, int fc, int tr, int tc) { return fr != tr && Math.abs(tr - fr) == Math.abs(tc - fc); }
}

class Board {
    private final Piece[][] g = new Piece[8][8];
    Piece get(int r, int c) { return g[r][c]; }
    void set(int r, int c, Piece p) { g[r][c] = p; }
    boolean inBounds(int r, int c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
    boolean isPathClear(int fr, int fc, int tr, int tc) {
        int dr = Integer.signum(tr - fr), dc = Integer.signum(tc - fc);
        int r = fr + dr, c = fc + dc;
        while (r != tr || c != tc) { if (g[r][c] != null) return false; r += dr; c += dc; }
        return true;
    }
}

class King extends Piece {
    King(Color c) { super(c); }
    boolean canMove(Board b, int fr, int fc, int tr, int tc) { return Math.max(Math.abs(tr - fr), Math.abs(tc - fc)) == 1; }
    char letter() { return 'K'; }
}

class Queen extends Piece {
    Queen(Color c) { super(c); }
    boolean canMove(Board b, int fr, int fc, int tr, int tc) {
        return (straight(fr, fc, tr, tc) || diagonal(fr, fc, tr, tc)) && b.isPathClear(fr, fc, tr, tc);
    }
    char letter() { return 'Q'; }
}

class Rook extends Piece {
    Rook(Color c) { super(c); }
    boolean canMove(Board b, int fr, int fc, int tr, int tc) { return straight(fr, fc, tr, tc) && b.isPathClear(fr, fc, tr, tc); }
    char letter() { return 'R'; }
}

class Bishop extends Piece {
    Bishop(Color c) { super(c); }
    boolean canMove(Board b, int fr, int fc, int tr, int tc) { return diagonal(fr, fc, tr, tc) && b.isPathClear(fr, fc, tr, tc); }
    char letter() { return 'B'; }
}

class Knight extends Piece {
    Knight(Color c) { super(c); }
    boolean canMove(Board b, int fr, int fc, int tr, int tc) { return Math.abs(tr - fr) * Math.abs(tc - fc) == 2; }
    char letter() { return 'N'; }
}

class Pawn extends Piece {
    Pawn(Color c) { super(c); }
    boolean canMove(Board b, int fr, int fc, int tr, int tc) {
        int dir = color == Color.WHITE ? 1 : -1, start = color == Color.WHITE ? 1 : 6;
        int dr = tr - fr, dc = tc - fc;
        Piece target = b.get(tr, tc);
        if (dc == 0 && target == null) {
            if (dr == dir) return true;
            return fr == start && dr == 2 * dir && b.get(fr + dir, fc) == null;
        }
        return Math.abs(dc) == 1 && dr == dir && target != null && target.color != color;
    }
    char letter() { return 'P'; }
}

class Game {
    private record Move(int fr, int fc, int tr, int tc, Piece moved, Piece captured, String prevStatus) {}

    private final Board b;
    private Color turn = Color.WHITE;
    private String status = "PLAYING";
    private final Deque<Move> history = new ArrayDeque<>();

    Game(Board b) { this.b = b; }

    String move(int fr, int fc, int tr, int tc) {
        if (!status.equals("PLAYING")) return "INVALID";
        if (!b.inBounds(fr, fc) || !b.inBounds(tr, tc) || (fr == tr && fc == tc)) return "INVALID";
        Piece p = b.get(fr, fc);
        if (p == null || p.color != turn) return "INVALID";
        Piece target = b.get(tr, tc);
        if (target != null && target.color == turn) return "INVALID";
        if (!p.canMove(b, fr, fc, tr, tc)) return "INVALID";

        history.push(new Move(fr, fc, tr, tc, p, target, status));
        b.set(tr, tc, p);
        b.set(fr, fc, null);
        String result = target == null ? "OK" : "CAPTURE";
        if (target instanceof King) { status = "WIN " + turn; result = status; }
        turn = turn == Color.WHITE ? Color.BLACK : Color.WHITE;
        return result;
    }

    boolean undo() {
        if (history.isEmpty()) return false;
        Move m = history.pop();
        b.set(m.fr(), m.fc(), m.moved());
        b.set(m.tr(), m.tc(), m.captured());
        status = m.prevStatus();
        turn = m.moved().color;
        return true;
    }
}`,
      explain: "<p>Har piece sirf apni geometry jaanta hai (polymorphism, koi switch nahi); <code>straight</code>/<code>diagonal</code> helpers se Rook/Bishop/Queen ka code duplicate nahi. Game generic rules (turn, own piece, bounds, game over) rakhta hai. Move record Command jaisa hai: undo ke liye captured piece aur purana status. Follow-ups: check detection (move ke baad apna king attacked to illegal: saare opponent pieces ka canMove king tak), promotion (Pawn last row pe → Queen), castling (King + Rook ka special move, history chahiye ki dono hile nahi). DB: <code>games(id, white_id, black_id, status)</code>, <code>moves(game_id, seq, from, to, piece, captured)</code> — moves se poora game replay ho sakta hai.</p>"
    },
    {
      type: "pick",
      id: "pick-chess-design",
      q: "Chess design ke baare mein kaunse statements sahi hain?",
      options: [
        { text: "Game ke andar ek bada <code>switch (piece.type)</code> movement ke liye", correct: false, why: "Polymorphism: har piece apna canMove. Naya piece = nayi class." },
        { text: "Moves ki list store karne se undo, replay aur PGN export aasaan", correct: true, why: "Command / event-sourcing jaisa." },
        { text: "Board ko rules pata hone chahiye (turn kiska hai)", correct: false, why: "Board data + geometry helpers. Turn Game ki zimmedari." },
        { text: "Sliding pieces common helper share karein (path clear)", correct: true, why: "DRY bina inheritance explosion ke." },
        { text: "Online chess mein do players ke concurrent move requests: game pe lock / version check", correct: true, why: "Ek game ka state ek writer, optimistic version ya per-game lock." }
      ]
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Chess mein sab kuch implement karne ki koshish mat karo. Scope bolo (\"castling, en passant, checkmate out of scope, design mein jagah rahegi\"), phir clean Piece hierarchy + Game validation + Move history dikhao. Follow-up mein check detection ka approach bolna kaafi hai."
    }
  ],
  references: [
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" },
    { title: "Refactoring Guru: Command", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/command", type: "article" }
  ]
});
