// Snake and Ladder
registerLesson("lld", "snake-ladder", {
  why: "Simple game, par ek design trick sikhata hai: randomness (dice) ko interface ke peeche rakho taaki game test-able ho. Aur snakes/ladders ko alag classes ki jagah ek 'jump' map se model karna KISS ka achha example hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements</h2>
        <ul>
          <li>Board 1..100. Snakes (head → tail, neeche), ladders (start → end, upar).</li>
          <li>Players baari baari dice phenkte hain. 100 ke upar jaaye to move nahi (exact 100 chahiye). Pehle 100 pe pahunchne wala jeeta.</li>
        </ul>
        <h2>Do design sawaal</h2>
        <p><b>1. Snake aur Ladder alag classes?</b> Dono ka behaviour ek hi hai: "is cell pe aaye to us cell pe jao". Farak sirf direction ka. Ek <code>Map&lt;Integer, Integer&gt; jumps</code> kaafi hai (KISS). Agar kal "snake pe ek turn skip" jaisa alag behaviour aaye, tab <code>Jump</code> interface.</p>
        <p><b>2. Dice random hai, test kaise karein?</b> <code>Dice</code> interface: <code>int roll()</code>. Production mein <code>RandomDice</code>, test mein <code>FixedDice(4, 6, 3...)</code>. Ye Dependency Inversion hai: game randomness pe nahi, abstraction pe depend karta hai.</p>
        <pre class="diagram">
Game ── Board (size, jumps: Map&lt;from,to&gt;)
Game ── * Player (name, position)        Game ── Dice «i»: roll()  ◁── RandomDice, FixedDice (tests)
Game.playTurn() → move current player, apply jump, check win, next player</pre>`
    },
    {
      type: "exercise",
      id: "ex-snake-ladder",
      title: "Snake & Ladder with injectable dice",
      level: "Easy",
      task: `<p><code>Game(int size, Map&lt;Integer,Integer&gt; jumps, List&lt;String&gt; players, Dice dice)</code>. Sab position 0 se.</p>
        <ul>
          <li><code>String playTurn()</code>: current player roll kare. <code>pos + roll &gt; size</code> → move nahi. Warna move, phir agar naye cell pe jump ho to jump (ek hi baar; jump ke end pe doosra jump nahi lagta). Return <code>"&lt;name&gt; &lt;old&gt;-&gt;&lt;new&gt;"</code>. Player <code>size</code> pe pahunche to winner set. Agle player ki baari.</li>
          <li><code>String winner()</code> ya null. Winner ke baad <code>playTurn</code> → <code>IllegalStateException</code>.</li>
          <li><code>String play()</code>: winner milne tak turns, winner lautao (max 10,000 turns, warna null).</li>
          <li>Constructor validate: jump ka from/to 1..size ke andar, from ≠ to, from = size nahi → IAE.</li>
        </ul>`,
      examples: "size 10, ladder 2→8, dice [2, 1, 2]: A 0->8, B 0->1, A 8->10 → winner A",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface Dice { int roll(); }

class Game {
    Game(int size, Map<Integer, Integer> jumps, List<String> players, Dice dice) { }
    String playTurn() { return ""; }
    String winner() { return null; }
    String play() { return null; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static Dice fixed(int... rolls) { int[] i = {0}; return () -> rolls[i[0]++ % rolls.length]; }
    static String iae(Runnable r) { try { r.run(); return "ok"; } catch (IllegalArgumentException e) { return "IAE"; } }

    public static void main(String[] args) {
        Check.eq("ladder + win", List.of("A 0->8", "B 0->1", "A 8->10", "A"), () -> {
            Game g = new Game(10, Map.of(2, 8), List.of("A", "B"), fixed(2, 1, 2));
            return List.of(g.playTurn(), g.playTurn(), g.playTurn(), g.winner());
        });
        Check.eq("snake", "A 0->1", () -> new Game(10, Map.of(5, 1), List.of("A"), fixed(5)).playTurn());
        Check.hiddenFromHere();
        Check.eq("overshoot → no move", List.of("A 0->9", "A 9->9", "A 9->10"), () -> {
            Game g = new Game(10, Map.of(), List.of("A"), fixed(6, 3, 5, 1));
            g.playTurn(); g.playTurn();          // 6, 3 → 9
            return List.of("A 0->9", g.playTurn(), g.playTurn());
        });
        Check.eq("winner ke baad ISE", "ISE", () -> {
            Game g = new Game(3, Map.of(), List.of("A"), fixed(3)); g.playTurn();
            try { g.playTurn(); return "no"; } catch (IllegalStateException e) { return "ISE"; }
        });
        Check.eq("jump chain nahi", "A 0->5", () -> new Game(10, Map.of(2, 5, 5, 9), List.of("A"), fixed(2)).playTurn());
        Check.eq("play() 3 players", "C", () -> new Game(6, Map.of(), List.of("A", "B", "C"), fixed(1, 1, 6)).play());
        Check.eq("invalid jumps → IAE", List.of("IAE", "IAE", "IAE"), () -> List.of(
            iae(() -> new Game(10, Map.of(10, 2), List.of("A"), fixed(1))),
            iae(() -> new Game(10, Map.of(3, 3), List.of("A"), fixed(1))),
            iae(() -> new Game(10, Map.of(4, 11), List.of("A"), fixed(1)))));
        Check.eq("never-ending (dice 7 on size 6) → null", null, () -> new Game(6, Map.of(), List.of("A"), fixed(7)).play());
    }
}`,
      hints: [
        "Fields: size, jumps (copy), <code>List&lt;String&gt; names</code>, <code>int[] pos</code>, <code>int turn</code>, <code>String winner</code>, dice.",
        "playTurn: <code>int old = pos[turn], r = dice.roll(), np = old + r; if (np &lt;= size) np = jumps.getOrDefault(np, np); else np = old;</code>",
        "Winner check <code>np == size</code>, phir <code>turn = (turn + 1) % names.size()</code>."
      ],
      solution: `import java.util.*;

interface Dice { int roll(); }

class Game {
    private final int size;
    private final Map<Integer, Integer> jumps;
    private final List<String> names;
    private final int[] pos;
    private final Dice dice;
    private int turn = 0;
    private String winner;

    Game(int size, Map<Integer, Integer> jumps, List<String> players, Dice dice) {
        for (Map.Entry<Integer, Integer> j : jumps.entrySet()) {
            int from = j.getKey(), to = j.getValue();
            if (from < 1 || from >= size || to < 1 || to > size || from == to)
                throw new IllegalArgumentException("bad jump " + from + "->" + to);
        }
        this.size = size;
        this.jumps = Map.copyOf(jumps);
        this.names = List.copyOf(players);
        this.pos = new int[players.size()];
        this.dice = dice;
    }

    String playTurn() {
        if (winner != null) throw new IllegalStateException("game over");
        int old = pos[turn];
        int np = old + dice.roll();
        if (np > size) np = old;                       // exact chahiye
        else np = jumps.getOrDefault(np, np);          // snake ya ladder (ek hi jump)
        pos[turn] = np;
        String log = names.get(turn) + " " + old + "->" + np;
        if (np == size) winner = names.get(turn);
        turn = (turn + 1) % names.size();
        return log;
    }

    String winner() { return winner; }

    String play() {
        for (int i = 0; i < 10_000 && winner == null; i++) playTurn();
        return winner;
    }
}`,
      explain: "<p>Dice inject hone se har test deterministic hai, bina <code>Random</code> seed ke jugaad ke. Jumps ek map (snake/ladder ka farak sirf data mein). Constructor validation se invalid board ban hi nahi sakta. Follow-ups: kai dice (Strategy for movement), 'six pe dobara turn' rule (turn logic mein chhota change), ya special cells (tab Jump interface).</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Kisi bhi game/system mein randomness ya time ho (dice, shuffle, now()), bolo: <i>\"Isko interface ke peeche rakhunga taaki test mein fixed values de sakun.\"</i> Ye ek line testing maturity dikhati hai."
    }
  ],
  references: [
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
