// Prototype (overview)
registerLesson("lld", "prototype", {
  why: "Prototype ka asli interview sawaal 'shallow vs deep copy' hai: copy kiya hua object badla aur original bhi badal gaya, ye bug bahut common hai. Pattern khud chhota hai, par copy ki samajh har jagah kaam aati hai (caches, undo, test data).",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: naya banane se copy sasti</h2>
        <p>Ek game mein "Goblin" enemy banana mehenga hai: model file, textures, stats DB se. Level pe 50 goblins chahiye, thode alag positions ke saath. Har baar shuru se banana bekaar. Ek <b>prototype</b> goblin banao, phir uski copy karke bas position badlo.</p>
        <p>Pattern: object khud apni copy banana jaanta hai (<code>copy()</code> method). Caller ko concrete class jaanne ki zaroorat nahi: <code>Shape s = prototype.copy();</code></p>
        <h2>Asli mudda: shallow vs deep</h2>
        <pre class="diagram">
 Shallow copy                         Deep copy
 original ─► [name, tags ─┐]          original ─► [name, tags ─► [a, b]]
 copy     ─► [name, tags ─┘─► [a,b]]  copy     ─► [name, tags ─► [a, b]]   (alag list)
 copy.tags.add("x") → original bhi!   copy.tags.add("x") → sirf copy</pre>
        <ul>
          <li><b>Shallow:</b> fields copy hote hain, par reference wale fields (list, map, doosre objects) <b>same object</b> point karte hain.</li>
          <li><b>Deep:</b> andar ke mutable objects bhi naye banate hain.</li>
          <li>Immutable fields (String, Integer, record of immutables) share karna safe hai: unhe deep copy ki zaroorat nahi.</li>
        </ul>`
    },
    {
      type: "code",
      title: "Shallow copy ka bug, aur copy constructor se deep copy",
      code: `import java.util.*;

public class Main {
    static class Enemy {
        String name;
        int x;
        List<String> loot;

        Enemy(String name, int x, List<String> loot) { this.name = name; this.x = x; this.loot = loot; }

        Enemy shallowCopy() { return new Enemy(name, x, loot); }                    // same list!
        Enemy deepCopy()    { return new Enemy(name, x, new ArrayList<>(loot)); }   // nayi list

        public String toString() { return name + "@" + x + " " + loot; }
    }

    public static void main(String[] args) {
        Enemy proto = new Enemy("Goblin", 0, new ArrayList<>(List.of("coin")));

        Enemy a = proto.shallowCopy();
        a.x = 10;
        a.loot.add("sword");
        System.out.println("shallow: proto = " + proto + "  ← sword proto mein bhi aa gaya!");

        Enemy fresh = new Enemy("Goblin", 0, new ArrayList<>(List.of("coin")));
        Enemy b = fresh.deepCopy();
        b.x = 20;
        b.loot.add("shield");
        System.out.println("deep   : proto = " + fresh + ", copy = " + b);
    }
}`,
      note: "<code>x</code> (int) dono mein alag hai, kyunki primitive copy hota hai. Problem sirf mutable reference fields mein."
    },
    {
      type: "warn",
      html: "⚠️ <b>Java ka <code>clone()</code>:</b> <code>Object.clone()</code> by default shallow copy karta hai, <code>Cloneable</code> interface mein koi method hi nahi hai, aur checked <code>CloneNotSupportedException</code> deta hai. Effective Java (Item 13) isko avoid karne ki salah deta hai: <b>copy constructor</b> (<code>new Enemy(other)</code>) ya <b>copy factory</b> (<code>Enemy.copyOf(other)</code>) better hai. Arrays ke liye <code>arr.clone()</code> theek hai (par 2D array mein andar ke arrays shallow!)."
    },
    {
      type: "quiz",
      q: "<code>int[][] grid = {{1,2},{3,4}}; int[][] c = grid.clone(); c[0][0] = 99;</code> ke baad <code>grid[0][0]</code> kya hoga?",
      options: ["1", "99", "Compile error", "CloneNotSupportedException"],
      answer: 1,
      why: "<code>clone()</code> sirf bahar wala array copy karta hai. <code>c[0]</code> aur <code>grid[0]</code> same andar wala array hain. Deep copy: <code>for (i) c[i] = grid[i].clone();</code> ya <code>Arrays.stream(grid).map(int[]::clone).toArray(int[][]::new)</code>. DSA mein grid copy karte waqt ye bug bahut hota hai."
    },
    {
      type: "exercise",
      id: "ex-deep-copy",
      title: "Undo ke liye document snapshot (deep copy)",
      level: "Easy",
      task: `<p>Text editor ka <code>Document</code> hai: <code>title</code> (String), <code>List&lt;String&gt; lines</code>, aur <code>Map&lt;String, List&lt;String&gt;&gt; comments</code> (line id → comments). Undo ke liye snapshot chahiye.</p>
        <ul>
          <li><code>Document copy()</code> likho jo <b>deep</b> copy kare: copy pe kuch bhi badlo (lines, comments ki lists, naye keys), original na badle.</li>
          <li>Strings immutable hain, unhe share kar sakte ho.</li>
        </ul>`,
      examples: "<code>Document s = d.copy(); s.comments.get(\"L1\").add(\"nice\");</code> → <code>d.comments.get(\"L1\")</code> waisa hi",
      userFile: "Solution.java",
      starter: `import java.util.*;

class Document {
    String title;
    List<String> lines = new ArrayList<>();
    Map<String, List<String>> comments = new HashMap<>();

    Document copy() {
        Document d = new Document();
        d.title = title;
        d.lines = lines;          // TODO: shallow!
        d.comments = comments;    // TODO: shallow!
        return d;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static Document sample() {
        Document d = new Document();
        d.title = "Notes";
        d.lines.add("hello");
        d.comments.put("L1", new ArrayList<>(List.of("typo?")));
        return d;
    }

    public static void main(String[] args) {
        Check.eq("copy ki line add → original lines same", List.of("hello"), () -> {
            Document d = sample(); Document c = d.copy(); c.lines.add("world"); return d.lines;
        });
        Check.eq("copy values same", List.of("Notes", List.of("hello"), List.of("typo?")), () -> {
            Document c = sample().copy(); return List.of(c.title, c.lines, c.comments.get("L1"));
        });
        Check.hiddenFromHere();
        Check.eq("andar wali comment list bhi alag (deep)", List.of("typo?"), () -> {
            Document d = sample(); Document c = d.copy(); c.comments.get("L1").add("nice"); return d.comments.get("L1");
        });
        Check.eq("naya key copy mein → original mein nahi", false, () -> {
            Document d = sample(); Document c = d.copy(); c.comments.put("L2", new ArrayList<>()); return d.comments.containsKey("L2");
        });
        Check.eq("title badla → original same", "Notes", () -> { Document d = sample(); Document c = d.copy(); c.title = "X"; return d.title; });
        Check.eq("original badla → copy (snapshot) same", List.of("hello"), () -> {
            Document d = sample(); Document c = d.copy(); d.lines.set(0, "changed"); return c.lines;
        });
    }
}`,
      hints: [
        "<code>d.lines = new ArrayList&lt;&gt;(lines);</code> Strings share karna theek hai.",
        "Map ke liye nayi map, aur har value list ki bhi nayi copy: <code>for (var e : comments.entrySet()) d.comments.put(e.getKey(), new ArrayList&lt;&gt;(e.getValue()));</code>"
      ],
      solution: `import java.util.*;

class Document {
    String title;
    List<String> lines = new ArrayList<>();
    Map<String, List<String>> comments = new HashMap<>();

    Document copy() {
        Document d = new Document();
        d.title = title;                                  // String immutable: share safe
        d.lines = new ArrayList<>(lines);                 // nayi list
        d.comments = new HashMap<>();
        for (Map.Entry<String, List<String>> e : comments.entrySet()) {
            d.comments.put(e.getKey(), new ArrayList<>(e.getValue()));   // har andar wali list bhi nayi
        }
        return d;
    }
}`,
      explain: "<p>Deep copy ka rule: <b>har mutable level</b> naya banao. Map naya, aur map ki values (lists) bhi nayi. Strings immutable hain, unhe copy karna bekaar. Ye snapshot <b>Memento</b> pattern (undo) ka core hai.</p><p>Cost: O(total lines + comments). Bade documents mein har edit pe poora copy mehenga hai; tab Command pattern (sirf change yaad rakho) better hai — Command lesson mein.</p>"
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Prototype pe zyada time mat lagao. Bolo: <i>\"object apni copy khud banata hai; main copy constructor use karunga, clone() nahi, aur mutable fields deep copy karunga.\"</i> Aur sabse achha: objects ko <b>immutable</b> rakho, phir copy ki zaroorat hi kam padti hai."
    }
  ],
  references: [
    { title: "Refactoring Guru: Prototype", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/prototype", type: "article" },
    { title: "Effective Java (3rd ed.), Item 13: Override clone judiciously", by: "Joshua Bloch", type: "book" }
  ]
});
