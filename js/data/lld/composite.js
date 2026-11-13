// Composite
registerLesson("lld", "composite", {
  why: "Jab data ek tree ho (folder ke andar files aur folders, menu ke andar sub-menus, company ke andar teams), aur aap chahte ho ki single item aur group dono ko same tareeke se treat karo (size(), price()). File system aur org chart LLD questions mein seedha yahi pattern hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: har jagah "ye file hai ya folder?"</h2>
        <pre class="code-static">long size(Object node) {
    if (node instanceof File f) return f.bytes;
    if (node instanceof Folder d) {
        long s = 0;
        for (Object child : d.children) s += size(child);   // har feature mein ye instanceof
        return s;
    }
    throw ...;
}</pre>
        <p>Size, count, search, delete: har operation mein yahi type check. Naya node type (Shortcut) = sab jagah edit.</p>
        <p><b>Composite:</b> ek common interface (<code>Node</code>) jo <b>leaf</b> (File) aur <b>container</b> (Folder) dono implement karein. Folder ka <code>size()</code> apne children ka <code>size()</code> jodta hai, bina jaane wo file hain ya folder.</p>
        <pre class="diagram">
          «interface» Node: size(), name()
              ▲                 ▲
           File (leaf)      Folder (composite) ◆──── * Node   ← children Node hain, File ya Folder koi bhi
           size = bytes     size = Σ child.size()

 root/
 ├── a.txt (10)
 └── src/
     ├── Main.java (40)
     └── util/
         └── X.java (5)          root.size() = 10 + (40 + (5)) = 55</pre>`
    },
    {
      type: "think",
      id: "think-composite-org",
      q: "Company org chart: har <b>Employee</b> ki salary hai. <b>Manager</b> bhi employee hai aur uske neeche reports (employees ya managers). \"Is manager ki poori team ka total salary cost\" kaise nikaloge bina instanceof ke?",
      rubric: [
        { point: "Common interface/abstract: <b>Employee</b> with <code>cost()</code>", keys: ["interface", "cost()", "common", "abstract", "employee"], weight: 2 },
        { point: "Manager.cost() = apni salary + <b>har report ka cost()</b> (recursion)", keys: ["recurs", "har report", "children", "reports", "sum", "jodo", "+"], weight: 2 },
        { point: "Manager ke reports ka type <b>Employee</b> (manager bhi ho sakta hai)", keys: ["list<employee", "list of employee", "manager bhi", "nested", "tree"], weight: 1 },
        { point: "Leaf (IC) ka cost = sirf salary", keys: ["leaf", "individual", "sirf salary", "only salary"] }
      ],
      answer: `<pre class="code-static">interface Member { long cost(); }
record Engineer(String name, long salary) implements Member { public long cost() { return salary; } }
class Manager implements Member {
    long salary; List&lt;Member&gt; reports = new ArrayList&lt;&gt;();
    public long cost() { long s = salary; for (Member m : reports) s += m.cost(); return s; }
}</pre>
        <p>CEO ka <code>cost()</code> poori company ka cost hai. Koi type check nahi: har node bas "apna + bachchon ka" karta hai. Naya role (Intern) = ek nayi leaf class.</p>`
    },
    {
      type: "exercise",
      id: "ex-file-system",
      title: "File system: size, count, find",
      level: "Medium",
      task: `<p><code>Node</code> interface (<code>String name()</code>, <code>long size()</code>, <code>int fileCount()</code>, <code>List&lt;String&gt; find(String ext)</code>) ke liye <code>File</code> aur <code>Folder</code> likho:</p>
        <ul>
          <li><code>File(name, bytes)</code>: size = bytes, fileCount = 1, find(ext) = <code>[name]</code> agar name <code>ext</code> pe khatam ho, warna <code>[]</code>.</li>
          <li><code>Folder(name)</code> + <code>Folder add(Node child)</code> (chaining ke liye this return). size = children ka jod, fileCount = jod, find = saare matching files ke <b>paths</b> (<code>"folder/child"</code>), depth-first, add ke order mein.</li>
        </ul>
        <p>Path: Folder apne children ke results ke aage <code>name + "/"</code> lagata hai.</p>`,
      examples: "<code>root{a.txt(10), src{Main.java(40), util{X.java(5)}}}</code> → size 55, fileCount 3, <code>find(\".java\")</code> → <code>[\"root/src/Main.java\", \"root/src/util/X.java\"]</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface Node {
    String name();
    long size();
    int fileCount();
    List<String> find(String ext);
}

class File implements Node {
    File(String name, long bytes) { }
    public String name() { return ""; }
    public long size() { return 0; }
    public int fileCount() { return 0; }
    public List<String> find(String ext) { return List.of(); }
}

class Folder implements Node {
    Folder(String name) { }
    Folder add(Node child) { return this; }
    public String name() { return ""; }
    public long size() { return 0; }
    public int fileCount() { return 0; }
    public List<String> find(String ext) { return List.of(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    static Folder sample() {
        return new Folder("root")
            .add(new File("a.txt", 10))
            .add(new Folder("src")
                .add(new File("Main.java", 40))
                .add(new Folder("util").add(new File("X.java", 5))));
    }

    public static void main(String[] args) {
        Check.eq("size", 55L, () -> sample().size());
        Check.eq("find .java", List.of("root/src/Main.java", "root/src/util/X.java"), () -> sample().find(".java"));
        Check.hiddenFromHere();
        Check.eq("fileCount", 3, () -> sample().fileCount());
        Check.eq("empty folder", List.of(0L, 0), () -> { Folder f = new Folder("e"); return List.of(f.size(), f.fileCount()); });
        Check.eq("single file find", List.of("notes.md"), () -> new File("notes.md", 1).find(".md"));
        Check.eq("no match", List.of(), () -> sample().find(".png"));
        Check.eq("find .txt top level", List.of("root/a.txt"), () -> sample().find(".txt"));
        Check.eq("deep chain 200 levels size", 200L, () -> {
            Folder top = new Folder("d0"), cur = top;
            for (int i = 1; i < 200; i++) { Folder n = new Folder("d" + i); cur.add(new File("f" + i, 1)).add(n); cur = n; }
            cur.add(new File("last", 1));
            return top.size();
        });
    }
}`,
      hints: [
        "File: fields <code>name</code>, <code>bytes</code>. <code>find</code>: <code>name.endsWith(ext) ? List.of(name) : List.of()</code>.",
        "Folder: <code>private final List&lt;Node&gt; children = new ArrayList&lt;&gt;();</code>. size: loop karke <code>child.size()</code> jodo.",
        "Folder.find: har child ke <code>find(ext)</code> ke har path ke aage <code>name + \"/\"</code> lagake result list mein daalo."
      ],
      solution: `import java.util.*;

interface Node {
    String name();
    long size();
    int fileCount();
    List<String> find(String ext);
}

class File implements Node {
    private final String name;
    private final long bytes;
    File(String name, long bytes) { this.name = name; this.bytes = bytes; }
    public String name() { return name; }
    public long size() { return bytes; }
    public int fileCount() { return 1; }
    public List<String> find(String ext) { return name.endsWith(ext) ? List.of(name) : List.of(); }
}

class Folder implements Node {
    private final String name;
    private final List<Node> children = new ArrayList<>();

    Folder(String name) { this.name = name; }

    Folder add(Node child) { children.add(child); return this; }

    public String name() { return name; }

    public long size() {
        long s = 0;
        for (Node c : children) s += c.size();
        return s;
    }

    public int fileCount() {
        int n = 0;
        for (Node c : children) n += c.fileCount();
        return n;
    }

    public List<String> find(String ext) {
        List<String> out = new ArrayList<>();
        for (Node c : children) {
            for (String p : c.find(ext)) out.add(name + "/" + p);
        }
        return out;
    }
}`,
      explain: "<p>Har operation do jagah hai: leaf ka simple version aur folder ka \"bachchon ka jod\". Koi <code>instanceof</code> nahi. Ye recursion hai (DSA ka tree DFS), bas OOP shape mein. Time O(nodes) har operation.</p><p>Trade-off: <code>add()</code> sirf Folder pe hai (File pe add ka matlab nahi). Kuch designs add() ko Node interface mein daalte hain (\"transparency\"), par tab File ko exception phenkna padta hai: LSP toota. Yahan safety chuni.</p>"
    },
    {
      type: "quiz",
      q: "Inme se kaunsa Composite pattern ka natural use <b>nahi</b> hai?",
      options: [
        "Restaurant menu: categories ke andar sub-categories aur dishes, har level ka price range",
        "UI: Panel ke andar buttons aur panels, sabko render()",
        "Bank account mein transactions ki flat list ka total",
        "Expression tree: (2 + 3) × 4, har node evaluate()"
      ],
      answer: 2,
      why: "Flat list mein koi nesting (part-whole hierarchy) nahi, seedha loop kaafi hai. Composite tab jab group ke andar group ho aur dono ko same treat karna ho."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"File system design karo\" pe sabse pehle bolo: <i>\"File aur Directory dono ek Node interface implement karenge; directory children ki list rakhegi (Composite).\"</i> Phir operations (size, search by name/extension, path) ko recursion se dikhao. Follow-up mein permissions/filters ke liye Strategy jod sakte ho."
    }
  ],
  references: [
    { title: "Refactoring Guru: Composite", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/composite", type: "article" },
    { title: "Design Patterns (GoF): Composite", by: "Gamma, Helm, Johnson, Vlissides", type: "book" }
  ]
});
