// Command
registerLesson("lld", "command", {
  why: "Undo/redo, job queues, macros, aur 'request ko object bana ke baad mein chalao' — ye sab Command pattern hai. Text editor, drawing app aur task scheduler jaise LLD questions mein undo ka follow-up hamesha aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: undo kaise karein?</h2>
        <p>Text editor mein user type karta hai, delete karta hai, bold karta hai. Ctrl+Z pe <b>aakhri kaam ulta</b> hona chahiye. Agar editor ke methods seedha text badal dete hain (<code>insert()</code>, <code>delete()</code>), to "aakhri kaam kya tha aur use ulta kaise karein" ki jaankari kahin nahi bachti.</p>
        <p><b>Idea:</b> har action ko ek <b>object</b> banao jo jaanta ho (1) kaise karna hai: <code>execute()</code>, (2) kaise ulta karna hai: <code>undo()</code>. Editor in objects ka ek <b>stack</b> rakhta hai.</p>
        <pre class="diagram">
 User ─► Editor.run(cmd) ─► cmd.execute() ─► undoStack.push(cmd), redoStack.clear()
 Ctrl+Z ─► cmd = undoStack.pop() ─► cmd.undo() ─► redoStack.push(cmd)
 Ctrl+Y ─► cmd = redoStack.pop() ─► cmd.execute() ─► undoStack.push(cmd)

 «interface» Command: execute(), undo()
       ▲                ▲
   InsertCommand   DeleteCommand (deleted text yaad rakhta hai, taaki undo mein wapas daale)</pre>
        <p>Prototype lesson mein humne undo ke liye poore document ki copy (snapshot / Memento) rakhi thi. Command sirf <b>change</b> yaad rakhta hai: bade documents ke liye bahut sasta.</p>
        <h3>Command ke aur use</h3>
        <ul>
          <li><b>Queue / scheduling:</b> <code>Runnable</code> ek command hi hai. <code>executor.submit(task)</code> = request ko object bana ke baad mein chalana.</li>
          <li><b>Macro:</b> ek command jo kai commands ki list chalaye (Composite + Command).</li>
          <li><b>Audit / replay:</b> commands ko log karo, crash ke baad dobara chalao.</li>
        </ul>`
    },
    {
      type: "think",
      id: "think-delete-undo",
      q: "<code>DeleteCommand(position, length)</code> ka <code>undo()</code> kaam kare, iske liye command ko <code>execute()</code> ke time kya yaad rakhna padega? Kyun?",
      rubric: [
        { point: "Jo text <b>delete hua</b> wo save karna (warna wapas kya daalenge)", keys: ["deleted text", "delete hua", "removed", "text save", "yaad", "store"], weight: 2 },
        { point: "Position bhi, taaki <b>wahin insert</b> ho", keys: ["position", "index", "wahin", "same jagah"], weight: 2 },
        { point: "Execute ke <b>waqt</b> capture karna, constructor pe nahi (tab tak text badal sakta hai)", keys: ["execute ke", "execute time", "waqt", "constructor pe nahi", "run time"] }
      ],
      answer: "<p>Undo = execute ka ulta. Delete ka ulta insert hai, aur insert ke liye <b>kya</b> (deleted text) aur <b>kahan</b> (position) chahiye. Deleted text <code>execute()</code> ke andar hi capture karo, kyunki constructor aur execute ke beech document badal sakta hai. Insert ka undo aasan hai: utni hi length delete.</p>"
    },
    {
      type: "exercise",
      id: "ex-editor-undo",
      title: "Text editor with undo / redo",
      level: "Medium",
      task: `<p><code>Editor</code> banao:</p>
        <ul>
          <li><code>insert(int pos, String s)</code>, <code>delete(int pos, int len)</code>: dono command objects ke through chalo aur undo stack mein jaayein. Naya command aane pe redo stack khaali.</li>
          <li><code>boolean undo()</code>, <code>boolean redo()</code>: kuch na ho to <code>false</code>.</li>
          <li><code>String text()</code>.</li>
          <li>Delete ki length text se bahar jaaye to text ke end tak hi delete (crash nahi). Undo sahi text wapas laaye.</li>
        </ul>`,
      examples: "<code>insert(0,\"hello\"); insert(5,\" world\"); delete(0,6); undo()</code> → <code>\"hello world\"</code>",
      userFile: "Solution.java",
      starter: `import java.util.*;

interface Command {
    void execute();
    void undo();
}

class Editor {
    private final StringBuilder text = new StringBuilder();

    void insert(int pos, String s) { text.insert(pos, s); }      // TODO: command bana ke
    void delete(int pos, int len) { text.delete(pos, pos + len); }
    boolean undo() { return false; }
    boolean redo() { return false; }
    String text() { return text.toString(); }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("delete ka undo", "hello world", () -> {
            Editor e = new Editor(); e.insert(0, "hello"); e.insert(5, " world"); e.delete(0, 6); e.undo(); return e.text();
        });
        Check.eq("undo + redo", List.of("hello", "hello world"), () -> {
            Editor e = new Editor(); e.insert(0, "hello"); e.insert(5, " world");
            e.undo(); String a = e.text(); e.redo(); return List.of(a, e.text());
        });
        Check.hiddenFromHere();
        Check.eq("khaali stacks → false", List.of(false, false), () -> { Editor e = new Editor(); return List.of(e.undo(), e.redo()); });
        Check.eq("saare undo → empty", "", () -> { Editor e = new Editor(); e.insert(0, "ab"); e.insert(1, "X"); e.delete(0, 1); e.undo(); e.undo(); e.undo(); return e.text(); });
        Check.eq("naya command redo clear kare", List.of("aZ", false), () -> {
            Editor e = new Editor(); e.insert(0, "ab"); e.undo(); e.insert(0, "a"); e.insert(1, "Z");
            return List.of(e.text(), e.redo());
        });
        Check.eq("delete bahar tak → end tak, undo exact", List.of("ab", "abcd"), () -> {
            Editor e = new Editor(); e.insert(0, "abcd"); e.delete(2, 100); String a = e.text(); e.undo(); return List.of(a, e.text());
        });
        Check.eq("beech mein insert ka undo", "hello", () -> { Editor e = new Editor(); e.insert(0, "hello"); e.insert(2, "XYZ"); e.undo(); return e.text(); });
        Check.eq("1000 inserts, sab undo", "", () -> {
            Editor e = new Editor(); for (int i = 0; i < 1000; i++) e.insert(0, "x"); while (e.undo()) { } return e.text();
        });
    }
}`,
      hints: [
        "Do inner classes: <code>InsertCmd(pos, s)</code> (execute: insert, undo: delete pos..pos+len) aur <code>DeleteCmd(pos, len)</code> (execute mein <code>removed = text.substring(pos, end)</code> save, undo: <code>text.insert(pos, removed)</code>).",
        "<code>Deque&lt;Command&gt; undoStack, redoStack</code>. <code>run(cmd)</code>: execute, undo.push, redo.clear().",
        "undo: <code>if (undoStack.isEmpty()) return false; Command c = undoStack.pop(); c.undo(); redoStack.push(c); return true;</code>"
      ],
      solution: `import java.util.*;

interface Command {
    void execute();
    void undo();
}

class Editor {
    private final StringBuilder text = new StringBuilder();
    private final Deque<Command> undoStack = new ArrayDeque<>();
    private final Deque<Command> redoStack = new ArrayDeque<>();

    private class InsertCmd implements Command {
        final int pos; final String s;
        InsertCmd(int pos, String s) { this.pos = pos; this.s = s; }
        public void execute() { text.insert(pos, s); }
        public void undo() { text.delete(pos, pos + s.length()); }
    }

    private class DeleteCmd implements Command {
        final int pos, len; String removed = "";
        DeleteCmd(int pos, int len) { this.pos = pos; this.len = len; }
        public void execute() {
            int end = Math.min(text.length(), pos + len);
            removed = text.substring(pos, end);          // undo ke liye yaad rakho
            text.delete(pos, end);
        }
        public void undo() { text.insert(pos, removed); }
    }

    private void run(Command c) {
        c.execute();
        undoStack.push(c);
        redoStack.clear();                               // naya kaam = purana redo future invalid
    }

    void insert(int pos, String s) { run(new InsertCmd(pos, s)); }
    void delete(int pos, int len) { run(new DeleteCmd(pos, len)); }

    boolean undo() {
        if (undoStack.isEmpty()) return false;
        Command c = undoStack.pop();
        c.undo();
        redoStack.push(c);
        return true;
    }

    boolean redo() {
        if (redoStack.isEmpty()) return false;
        Command c = redoStack.pop();
        c.execute();
        undoStack.push(c);
        return true;
    }

    String text() { return text.toString(); }
}`,
      explain: "<p>Har command apna ulta jaanta hai, isliye Editor ko pata hi nahi ki kitne tarah ke actions hain: naya \"Bold\" command = ek nayi class. Redo stack naye command pe clear hota hai, kyunki branch badal gayi. Memory: har command sirf apna change rakhta hai (O(change)), poora document nahi.</p>"
    },
    {
      type: "quiz",
      q: "Java mein kaunsa interface Command pattern ka roz ka example hai?",
      options: ["Comparable", "Runnable / Callable", "Iterable", "Serializable"],
      answer: 1,
      why: "Runnable = 'ek kaam ko object bana do' (execute = run). Executors, schedulers, thread pools sab commands ki queue hain."
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> \"Undo support karo\" sunte hi bolo: <i>\"Har operation ek Command object hoga with execute/undo, aur editor do stacks rakhega.\"</i> Follow-up \"memory?\" pe: command sirf diff rakhta hai; agar operation ulta karna mushkil ho (complex image filter) to us command ke liye snapshot (Memento)."
    }
  ],
  references: [
    { title: "Refactoring Guru: Command", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/command", type: "article" },
    { title: "Refactoring Guru: Memento", by: "Refactoring Guru", url: "https://refactoring.guru/design-patterns/memento", type: "article" }
  ]
});
