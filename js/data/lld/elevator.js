// Elevator (simple)
registerLesson("lld", "elevator", {
  why: "Elevator LLD mein do cheezein check hoti hain: elevator ki state (UP/DOWN/IDLE) ka saaf model, aur requests ko kis order mein serve karein (scheduling strategy). Basic SCAN/LOOK algorithm khud samjho to kisi bhi variation ko handle kar loge.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Requirements (simple version)</h2>
        <ul>
          <li>Ek building, N floors, ek elevator (multi-elevator follow-up).</li>
          <li>Requests: andar se (button: floor 7) ya bahar se (floor 3 pe UP button).</li>
          <li>Elevator ek floor per step chalta hai. Har step pe agar current floor ki request ho to ruk ke serve.</li>
        </ul>
        <h2>Scheduling: kaunsa floor pehle?</h2>
        <table>
          <tr><th>Strategy</th><th>Idea</th><th>Problem</th></tr>
          <tr><td>FCFS (pehle aaya pehle)</td><td>Request order</td><td>Floor 1 → 10 → 2 → 9: bekaar upar-neeche</td></tr>
          <tr><td>Nearest first (SSTF)</td><td>Jo sabse paas</td><td>Door wale floors ko starvation</td></tr>
          <tr><td><b>LOOK</b> (SCAN ka practical roop)</td><td>Ek direction mein jao, us taraf ke saare requests serve karo; us taraf koi request na bache to direction palto</td><td>Fair aur efficient, real elevators isi family ke</td></tr>
        </table>
        <p>LOOK ko do sorted sets se banao: <code>up</code> (current floor se upar wale) aur <code>down</code>. Upar jaate waqt <code>up.first()</code> (sabse paas wala upar), neeche jaate waqt <code>down.last()</code>. <code>TreeSet</code> ye O(log n) mein deta hai.</p>
        <pre class="diagram">
Elevator: currentFloor, direction (UP/DOWN/IDLE), TreeSet up, TreeSet down
request(f): f &gt; current → up.add(f); f &lt; current → down.add(f); f == current → open door
step(): direction UP → ek floor upar; agar up.contains(floor) → stop, remove
        up khaali → down khaali nahi ho to direction DOWN, warna IDLE
Scheduler «i» (LOOK, SSTF...) ← multi-elevator: kaunsa elevator kaunsi hall call le</pre>`
    },
    {
      type: "steps",
      title: "LOOK dry run: start floor 5 IDLE, requests 8, 2, 6, 1",
      steps: [
        { title: "Requests aaye: up = {6, 8}, down = {1, 2}. Pehli request 8 (upar) → direction UP", html: `<p>Floor 5 → 6 (stop, 6 served) → 7 → 8 (stop). up khaali.</p>` },
        { title: "up khaali, down = {1, 2} → direction DOWN", html: `<p>8 → 7 → ... → 2 (stop) → 1 (stop). Stops order: <b>6, 8, 2, 1</b>.</p>` },
        { title: "FCFS se compare", html: `<p>FCFS: 5→8→2→6→1 = 3 + 6 + 4 + 5 = <b>18 floors</b>. LOOK: 5→8→1 = 3 + 7 = <b>10 floors</b>.</p>` }
      ]
    },
    {
      type: "exercise",
      id: "ex-elevator",
      title: "Elevator with LOOK scheduling",
      level: "Medium",
      task: `<p><code>Elevator(int floors, int start)</code> (floors 0..floors-1):</p>
        <ul>
          <li><code>void request(int floor)</code>: invalid floor → IAE. Current floor ki request (aur elevator wahan khada hai) → turant serve (stops list mein add, kuch nahi chalna).</li>
          <li><code>void step()</code>: LOOK ke hisaab se ek floor chalo (ya IDLE pe kuch nahi). Naye floor pe request ho to serve (stops mein add).</li>
          <li>Direction: IDLE se pehli request jidhar ho udhar. Current direction mein requests khatam → doosri taraf ho to palto, warna IDLE.</li>
          <li><code>List&lt;Integer&gt; stops()</code>: ab tak serve hue floors order mein. <code>int floor()</code>, <code>String direction()</code> ("UP"/"DOWN"/"IDLE").</li>
          <li><code>void runUntilIdle()</code>: tab tak step jab tak koi request na bache.</li>
        </ul>`,
      examples: "start 5, requests 8, 2, 6, 1 → runUntilIdle → stops <code>[6, 8, 2, 1]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Elevator {
    Elevator(int floors, int start) { }
    void request(int floor) { }
    void step() { }
    void runUntilIdle() { }
    List<Integer> stops() { return List.of(); }
    int floor() { return 0; }
    String direction() { return "IDLE"; }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("LOOK order", List.of(6, 8, 2, 1), () -> {
            Elevator e = new Elevator(10, 5); e.request(8); e.request(2); e.request(6); e.request(1); e.runUntilIdle(); return e.stops();
        });
        Check.eq("step by step", List.of(4, "UP", 5, "UP"), () -> {
            Elevator e = new Elevator(10, 3); e.request(6); e.step(); int a = e.floor(); String d = e.direction(); e.step();
            return List.of(a, d, e.floor(), e.direction());
        });
        Check.hiddenFromHere();
        Check.eq("idle → down first", List.of(1, 7), () -> { Elevator e = new Elevator(10, 4); e.request(1); e.request(7); e.runUntilIdle(); return e.stops(); });
        Check.eq("current floor request served immediately", List.of(4), () -> { Elevator e = new Elevator(10, 4); e.request(4); return e.stops(); });
        Check.eq("beech mein naya request same direction", List.of(5, 7, 9), () -> {
            Elevator e = new Elevator(10, 0); e.request(9); e.request(7); e.step(); e.step(); e.request(5); e.runUntilIdle(); return e.stops();
        });
        Check.eq("upar jaate waqt neeche ka request baad mein", List.of(6, 8, 3), () -> {
            Elevator e = new Elevator(10, 5); e.request(8); e.step(); e.request(3); e.request(6); e.runUntilIdle(); return e.stops();
        });
        Check.eq("end pe IDLE", "IDLE", () -> { Elevator e = new Elevator(5, 0); e.request(4); e.runUntilIdle(); return e.direction(); });
        Check.eq("duplicate request ek baar", List.of(3), () -> { Elevator e = new Elevator(5, 0); e.request(3); e.request(3); e.runUntilIdle(); return e.stops(); });
        Check.eq("invalid floor → IAE", "IAE", () -> { try { new Elevator(5, 0).request(5); return "no"; } catch (IllegalArgumentException ex) { return "IAE"; } });
    }
}`,
      hints: [
        "Fields: <code>TreeSet&lt;Integer&gt; up, down</code>, <code>int cur</code>, <code>String dir = \"IDLE\"</code>, <code>List&lt;Integer&gt; stops</code>.",
        "request: f == cur aur dir IDLE (ya bas f == cur) → stops.add; f &gt; cur → up; f &lt; cur → down. Agar IDLE tha to dir = f &gt; cur ? UP : DOWN.",
        "step: dir UP → cur++; <code>if (up.remove(cur)) stops.add(cur);</code> phir <code>if (up.isEmpty()) dir = down.isEmpty() ? IDLE : DOWN;</code>. DOWN ulta. runUntilIdle: <code>while (!dir.equals(\"IDLE\")) step();</code>"
      ],
      solution: `import java.util.*;

class Elevator {
    private final int floors;
    private int cur;
    private String dir = "IDLE";
    private final TreeSet<Integer> up = new TreeSet<>(), down = new TreeSet<>();
    private final List<Integer> stops = new ArrayList<>();

    Elevator(int floors, int start) { this.floors = floors; this.cur = start; }

    void request(int f) {
        if (f < 0 || f >= floors) throw new IllegalArgumentException("bad floor " + f);
        if (f == cur) { stops.add(f); return; }               // already here: door kholo
        if (f > cur) up.add(f); else down.add(f);
        if (dir.equals("IDLE")) dir = f > cur ? "UP" : "DOWN";
    }

    void step() {
        if (dir.equals("UP")) {
            cur++;
            if (up.remove(cur)) stops.add(cur);
            if (up.isEmpty()) dir = down.isEmpty() ? "IDLE" : "DOWN";
        } else if (dir.equals("DOWN")) {
            cur--;
            if (down.remove(cur)) stops.add(cur);
            if (down.isEmpty()) dir = up.isEmpty() ? "IDLE" : "UP";
        }
    }

    void runUntilIdle() { while (!dir.equals("IDLE")) step(); }

    List<Integer> stops() { return List.copyOf(stops); }
    int floor() { return cur; }
    String direction() { return dir; }
}`,
      explain: "<p>Do sorted sets se LOOK seedha nikal aata hai: jis direction mein ho, us set ke khatam hone tak chalo. Edge: upar jaate waqt current floor se neeche ki request <code>down</code> mein jaati hai aur direction palatne pe serve hoti hai. Multi-elevator follow-up: ek <code>Dispatcher</code> (Strategy) jo hall call us elevator ko de jo same direction mein aa raha ho aur sabse paas ho; elevators ka state alag objects.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Elevator mein pehle state diagram (IDLE ↔ MOVING_UP/DOWN ↔ DOORS_OPEN) aur scheduling choice (LOOK, reason: no starvation, kam travel) bolo. Code mein sorted sets dikhao. Multi-elevator ko Strategy (dispatcher) bata ke scope mein na lo jab tak pucha na jaaye."
    }
  ],
  references: [
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" },
    { title: "Refactoring Guru: State", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/state", type: "article" }
  ]
});
