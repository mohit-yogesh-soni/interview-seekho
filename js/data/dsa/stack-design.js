// Stack se design
registerLesson("dsa", "stack-design", {
  why: "Brackets match karna, expression evaluate karna, undo/back button: ye sab stack ke kaam hain. Min Stack jaisa design sawaal dekhta hai ki aap \"O(1) mein extra info\" ke liye data structure ko kaise extend karte ho, jo LLD rounds mein bhi kaam aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Stack = LIFO (Last In, First Out)</h2>
        <p>Plate ka dher: jo plate sabse baad mein rakhi, wahi pehle uthti hai. Operations: <code>push</code>, <code>pop</code>, <code>peek</code>, sab <b>O(1)</b>.</p>
        <h2>Signals</h2>
        <ul>
          <li><b>Nesting / matching:</b> brackets, HTML tags, function calls. Jo sabse last khula, wahi pehle band hona chahiye.</li>
          <li><b>"Abhi tak ka" state yaad rakhna</b> aur wapas jaana: undo (Google Docs), browser back button, DFS.</li>
          <li><b>Postfix expressions</b> (Reverse Polish Notation), calculator.</li>
          <li>Design: stack jaisa object chahiye par saath mein ek aur query O(1) mein (min, max).</li>
        </ul>
        <h2>Java mein stack</h2>
        <table>
          <tr><th>Class</th><th>Kya bolna hai</th></tr>
          <tr><td><code>Deque&lt;Integer&gt; st = new ArrayDeque&lt;&gt;()</code></td><td>Recommended. <code>push/pop/peek</code>, fast, null allow nahi karta.</td></tr>
          <tr><td><code>Stack&lt;Integer&gt;</code></td><td>Legacy class (Vector extend karti hai, har method synchronized). Docs bhi Deque recommend karte hain.</td></tr>
          <tr><td><code>int[] arr + int top</code></td><td>Sabse fast, jab max size pata ho (no boxing).</td></tr>
        </table>`
    },
    {
      type: "code",
      title: "ArrayDeque as stack: push, peek, pop, aur empty pe kya hota hai",
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<String> history = new ArrayDeque<>();   // browser back button
        history.push("google.com");
        history.push("youtube.com");
        history.push("youtube.com/watch?v=dsa");
        System.out.println("Abhi: " + history.peek());
        history.pop();                                // back dabaya
        System.out.println("Back ke baad: " + history.peek());
        System.out.println("Size: " + history.size());

        history.clear();
        System.out.println("peek on empty = " + history.peek());   // null, exception nahi
        try {
            history.pop();                                          // empty pe pop
        } catch (NoSuchElementException e) {
            System.out.println("pop on empty: NoSuchElementException");
        }
    }
}`,
      note: "Empty stack pe <code>peek()</code> <code>null</code> deta hai par <code>pop()</code> exception phenkta hai. Brackets jaise problems mein pop se pehle <code>isEmpty()</code> check karo."
    },
    {
      type: "think",
      id: "think-minstack",
      q: "<b>Min Stack:</b> aisa stack design karo jisme <code>push</code>, <code>pop</code>, <code>top</code> aur <code>getMin</code> <b>sab O(1)</b> hon. Sirf ek <code>min</code> variable kyun kaafi nahi? Kya store karoge?",
      rubric: [
        { point: "Ek min variable kaafi nahi: <b>min pop ho jaaye</b> to pichla min kaun tha, pata nahi", keys: ["pop ho", "pichla min", "previous min", "purana min", "min hat", "min pop"], weight: 2 },
        { point: "Har level pe <b>us waqt ka min</b> saath store karo (pair ya doosra stack)", keys: ["pair", "doosra stack", "second stack", "min stack", "two stack", "har element ke saath", "along with"], weight: 2 },
        { point: "push: <b>newMin = min(x, current min)</b>", keys: ["min(x", "math.min", "minimum of", "newmin"] },
        { point: "Duplicates of min handle (≤ se push, ya har level pe store)", keys: ["duplicate", "<=", "≤", "barabar", "equal"] },
        { point: "Sab operations O(1), space O(n)", keys: ["o(1)", "o(n)", "constant"] }
      ],
      answer: `<p>Ek <code>min</code> variable push pe update ho jaata hai, par jab wahi min <b>pop</b> ho, to pichla min nikaalne ke liye poora stack scan karna padega (O(n)).</p>
        <p><b>Solution:</b> har element ke saath "is level tak ka min" bhi store karo. Do tareeke: (1) <code>Deque&lt;int[]&gt;</code> jisme <code>{value, minSoFar}</code>; (2) do stacks: values aur mins. push(x): <code>minSoFar = isEmpty ? x : min(x, mins.peek())</code>. pop dono se. getMin = <code>mins.peek()</code>.</p>
        <p>Space optimize: mins stack mein sirf tab push karo jab <code>x &lt;= mins.peek()</code> (≤ zaroori, duplicates ke liye), aur pop pe tabhi pop karo jab value == mins.peek(). <b>Sab O(1), space O(n).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-minstack",
      title: "Min Stack",
      level: "Medium",
      task: `<p>Implement <code>MinStack</code> with <code>push(int x)</code>, <code>pop()</code>, <code>top()</code> and <code>getMin()</code> (the smallest value currently in the stack). <b>Every operation must be O(1).</b></p><p><code>pop</code>, <code>top</code> and <code>getMin</code> are only called on a non-empty stack.</p><h4>Constraints</h4><ul><li>Up to 10⁵ operations</li><li>-2³¹ ≤ x ≤ 2³¹ − 1</li></ul><p><a href="https://leetcode.com/problems/min-stack/" target="_blank">LeetCode 155</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()
Output: getMin → -3, top → 0, getMin → -2</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class MinStack {
    MinStack() {
    }

    void push(int x) {
    }

    void pop() {
    }

    int top() {
        return 0;
    }

    int getMin() {
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Check.eq("push -2,0,-3; getMin; pop; top; getMin", List.of(-3, 0, -2), () -> {
            MinStack m = new MinStack();
            m.push(-2); m.push(0); m.push(-3);
            List<Integer> out = new ArrayList<>();
            out.add(m.getMin());
            m.pop();
            out.add(m.top());
            out.add(m.getMin());
            return out;
        });
        Check.eq("duplicate min: push 5, 5, 3; pop pop ke baad bhi min 5", List.of(5, 3, 5, 5), () -> {
            MinStack m = new MinStack();
            List<Integer> out = new ArrayList<>();
            m.push(5); out.add(m.getMin());
            m.push(5); m.push(3); out.add(m.getMin());
            m.pop(); out.add(m.getMin());
            m.pop(); out.add(m.getMin());
            return out;
        });
        Check.hiddenFromHere();
        Check.eq("single push 1: top, getMin", List.of(1, 1), () -> {
            MinStack m = new MinStack();
            m.push(1);
            return List.of(m.top(), m.getMin());
        });
        Check.eq("extreme values MIN_VALUE, MAX_VALUE", List.of(Integer.MIN_VALUE, Integer.MAX_VALUE, Integer.MIN_VALUE), () -> {
            MinStack m = new MinStack();
            m.push(Integer.MIN_VALUE); m.push(Integer.MAX_VALUE);
            List<Integer> out = new ArrayList<>();
            out.add(m.getMin());
            out.add(m.top());
            m.pop();
            out.add(m.top());
            return out;
        });
        Check.eq("khaali karke dobara bharo", List.of(7, 2), () -> {
            MinStack m = new MinStack();
            m.push(1); m.pop();
            m.push(7);
            int a = m.getMin();
            m.push(2);
            return List.of(a, m.getMin());
        });
        int n = 100000;
        long expected = (long) n * (n + 1) / 2 - 1;     // sum 2..n
        Check.eq("bada: 1e5 push (ghatte), har pop ke baad getMin ka sum", expected, () -> {
            MinStack m = new MinStack();
            for (int i = 0; i < n; i++) m.push(n - i);   // n, n-1, ..., 1
            long total = 0;
            for (int k = 0; k < n - 1; k++) {
                m.pop();
                total += m.getMin();
            }
            return total;
        });
    }
}`,
      hints: [
        "Har push pe \"ab tak ka min\" bhi kahin save karo, taaki pop ke baad purana min wapas mil jaaye.",
        "Do stacks: <code>Deque&lt;Integer&gt; vals, mins</code>. push(x): <code>vals.push(x); mins.push(mins.isEmpty() ? x : Math.min(x, mins.peek()));</code>",
        "pop: dono se pop. top: <code>vals.peek()</code>. getMin: <code>mins.peek()</code>."
      ],
      solution: `import java.util.*;

class MinStack {
    private final Deque<int[]> st = new ArrayDeque<>();   // {value, min tak is level}

    MinStack() {
    }

    void push(int x) {
        int min = st.isEmpty() ? x : Math.min(x, st.peek()[1]);
        st.push(new int[]{x, min});
    }

    void pop() {
        st.pop();
    }

    int top() {
        return st.peek()[0];
    }

    int getMin() {
        return st.peek()[1];
    }
}`,
      explain: `<p><b>Approach:</b> har entry ke saath us waqt ka minimum. Pop pe purana min apne aap top pe aa jaata hai.</p>
        <p><b>Time:</b> har operation O(1). <b>Space:</b> O(n).</p>
        <p>Follow-up: O(1) extra space (sirf ek min variable) wala trick bhi hai: <code>2x - min</code> encode karke push karna. Par overflow ka khatra hai (long chahiye) aur interview mein do-stack wala zyada clear hai.</p>`
    },
    {
      type: "steps",
      title: "Valid Parentheses dry run: \"{[()]}\" aur \"([)]\"",
      steps: [
        { title: "\"{[()]}\": opening push", html: `<div class="arr"><span class="cell ok">{</span><span class="cell ok">[</span><span class="cell ok">(</span><span class="cell">)</span><span class="cell">]</span><span class="cell">}</span></div><p>Teen opening: stack = <code>{ [ (</code> (top = <code>(</code>)</p>` },
        { title: "Closing aate hi match", html: `<div class="arr"><span class="cell dim">{</span><span class="cell dim">[</span><span class="cell dim">(</span><span class="cell hl">)</span><span class="cell hl">]</span><span class="cell hl">}</span></div><p><code>)</code> → top <code>(</code> match, pop. <code>]</code> → top <code>[</code> match, pop. <code>}</code> → <code>{</code> match, pop. Stack khaali: <b>valid</b>.</p>` },
        { title: "\"([)]\"", html: `<div class="arr"><span class="cell ok">(</span><span class="cell ok">[</span><span class="cell bad">)</span><span class="cell">]</span></div><p>stack = <code>( [</code>. Ab <code>)</code> aaya par top <code>[</code> hai. Mismatch: <b>invalid</b>. Count barabar hona kaafi nahi, <b>order</b> bhi sahi hona chahiye.</p>` }
      ]
    },
    {
      type: "think",
      id: "think-parens",
      q: "<b>Valid Parentheses:</b> string mein sirf <code>()[]{}</code> hain. Valid tab hai jab har bracket sahi type se aur sahi order mein band ho. Kaunse 3 cases mein invalid return karoge?",
      rubric: [
        { point: "Opening bracket: <b>push</b>", keys: ["push", "opening", "khulne"] },
        { point: "Closing aaye aur <b>stack khaali</b> → invalid", keys: ["empty", "khaali", "isempty"], weight: 2 },
        { point: "Closing ka <b>top se match nahi</b> → invalid", keys: ["match", "mismatch", "top", "same type", "pair"], weight: 2 },
        { point: "End mein <b>stack khaali nahi</b> → invalid", keys: ["end mein", "at the end", "bache", "remaining", "leftover", "isempty()"], weight: 2 },
        { point: "Time O(n), space O(n); odd length pe seedha false (optional)", keys: ["o(n)", "odd", "linear"] }
      ],
      answer: `<p>Opening bracket pe push. Closing pe teen checks:</p>
        <ol><li>Stack khaali hai → invalid (jaise <code>")"</code>).</li>
        <li>Top uska matching opening nahi → invalid (jaise <code>"(]"</code>).</li>
        <li>Warna pop.</li></ol>
        <p>End mein stack khaali hona chahiye (jaise <code>"(("</code> invalid). Trick: opening pe uska <b>closing push</b> karo; closing aane pe bas <code>pop() == c</code> check. <b>Time O(n), space O(n).</b></p>`
    },
    {
      type: "exercise",
      id: "ex-parens",
      title: "Valid Parentheses",
      level: "Easy",
      task: `<p><code>s</code> contains only the characters <code>( ) [ ] { }</code>. Return <code>true</code> if every opening bracket is closed by the <b>same type</b> of bracket in the <b>correct order</b>, and every closing bracket has a matching opening one. The empty string is valid.</p><h4>Constraints</h4><ul><li>0 ≤ s.length ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/valid-parentheses/" target="_blank">LeetCode 20</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  s = "()"
Output: true</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  s = "()[]{}"
Output: true</pre></div><div class="ex-case"><b>Example 3</b><pre class="code-static">Input:  s = "(]"
Output: false</pre></div><div class="ex-case"><b>Example 4</b><pre class="code-static">Input:  s = "([)]"
Output: false
Explanation: The ) closes [ in the wrong order.</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    boolean isValid(String s) {
        // count barabar hona kaafi nahi hai, order bhi dekho
        return s.length() % 2 == 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("\\"()\\"", true, () -> s.isValid("()"));
        Check.eq("\\"()[]{}\\"", true, () -> s.isValid("()[]{}"));
        Check.eq("\\"(]\\"", false, () -> s.isValid("(]"));
        Check.hiddenFromHere();
        Check.eq("empty", true, () -> s.isValid(""));
        Check.eq("galat order \\"([)]\\"", false, () -> s.isValid("([)]"));
        Check.eq("nested \\"{[]}\\"", true, () -> s.isValid("{[]}"));
        Check.eq("closing pehle \\")(\\"", false, () -> s.isValid(")("));
        Check.eq("band nahi hue \\"((((\\"", false, () -> s.isValid("(((("));
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 50000; i++) sb.append("([{".charAt(i % 3));
        for (int i = 49999; i >= 0; i--) sb.append(")]}".charAt(i % 3));
        String big = sb.toString();
        Check.eq("bada: 1e5 chars, 50000 deep nesting", true, () -> s.isValid(big));
        String bigBad = big.substring(0, 50000) + ")" + big.substring(50001);   // yahan ']' chahiye tha
        Check.eq("bada: beech mein ek galat bracket", false, () -> s.isValid(bigBad));
    }
}`,
      hints: [
        "<code>Deque&lt;Character&gt; st = new ArrayDeque&lt;&gt;()</code>. Opening pe push.",
        "Trick: <code>(</code> aaye to <code>)</code> push karo (expected closing). Closing <code>c</code> aaye to <code>if (st.isEmpty() || st.pop() != c) return false;</code>",
        "End mein <code>return st.isEmpty();</code>"
      ],
      solution: `import java.util.*;

class Solution {
    boolean isValid(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') st.push(')');          // expected closing push karo
            else if (c == '[') st.push(']');
            else if (c == '{') st.push('}');
            else if (st.isEmpty() || st.pop() != c) return false;
        }
        return st.isEmpty();                     // kuch khula na reh jaaye
    }
}`,
      explain: `<p><b>Approach:</b> stack mein expected closing brackets. Closing aaye to top se match, end mein stack khaali.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(n).</p>
        <p>Sirf ek type (<code>()</code>) ho to stack ki jagah ek counter kaafi hai (count kabhi negative na ho, end mein 0). Teen types mein order yaad rakhna padta hai, isliye stack.</p>`
    },
    {
      type: "think",
      id: "think-rpn",
      q: "<b>Evaluate Reverse Polish Notation:</b> tokens postfix order mein hain (jaise <code>[\"2\",\"1\",\"+\",\"3\",\"*\"]</code> = (2+1)×3). Stack kaise use karoge? Operator aane pe operands ka order kya hoga? Division kaisa hai?",
      rubric: [
        { point: "Number: <b>push</b>", keys: ["push", "number", "operand"] },
        { point: "Operator: <b>do pop</b>, result push", keys: ["do pop", "two pop", "pop two", "2 pop", "pop karo", "result push"], weight: 2 },
        { point: "Order: pehla pop = <b>right (b)</b>, doosra = left (a); <b>a - b</b>, a / b", keys: ["a - b", "a / b", "order", "right operand", "pehla pop", "second pop", "ulta"], weight: 2 },
        { point: "Division <b>zero ki taraf truncate</b> (Java int division yahi karta hai)", keys: ["truncate", "zero ki taraf", "toward zero", "towards zero", "int division"] },
        { point: "Time O(n), space O(n)", keys: ["o(n)", "linear"] }
      ],
      answer: `<p>Number aaye to <code>push</code>. Operator aaye to <code>b = pop()</code>, <code>a = pop()</code> (pehla pop right operand hai!), <code>push(a op b)</code>. End mein stack mein ek hi value: answer.</p>
        <p><code>["4","2","-"]</code> = 4 - 2 = 2. Agar order ulta kiya to -2 aayega. Division: Java ka <code>a / b</code> int pe zero ki taraf truncate karta hai (<code>-7 / 2 = -3</code>), jo is problem ka rule hai.</p>
        <p><b>Time O(n), space O(n).</b> Real use: calculators aur compilers expression ko postfix mein badal ke stack se evaluate karte hain (brackets ki zaroorat nahi padti).</p>`
    },
    {
      type: "exercise",
      id: "ex-rpn",
      title: "Evaluate Reverse Polish Notation",
      level: "Medium",
      task: `<p><code>tokens</code> is an expression in Reverse Polish (postfix) notation. Each token is an integer (possibly negative, like <code>"-11"</code>) or one of <code>+ - * /</code>. Return the value. Division is integer division that <b>truncates toward zero</b>. The expression is always valid, never divides by zero, and every intermediate result fits in an int.</p><p class="small muted">Example 1 with a stack: ["2","1","+","3","*"]</p><pre class="diagram">push 2      [2]
push 1      [2, 1]
+  → 2+1    [3]
push 3      [3, 3]
*  → 3*3    [9]</pre><h4>Constraints</h4><ul><li>1 ≤ tokens.length ≤ 10⁵</li></ul><p><a href="https://leetcode.com/problems/evaluate-reverse-polish-notation/" target="_blank">LeetCode 150</a></p>`,
      examples: `<div class="ex-case"><b>Example 1</b><pre class="code-static">Input:  tokens = ["2","1","+","3","*"]
Output: 9
Explanation: (2 + 1) × 3</pre></div><div class="ex-case"><b>Example 2</b><pre class="code-static">Input:  tokens = ["4","13","5","/","+"]
Output: 6
Explanation: 4 + 13 / 5 = 4 + 2</pre></div>`,
      userFile: "Solution.java",
      starter: `import java.util.*;

class Solution {
    int evalRPN(String[] tokens) {
        // yahan likho
        return 0;
    }
}`,
      harness: `import seekho.Check;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[2,1,+,3,*]", 9, () -> s.evalRPN(new String[]{"2", "1", "+", "3", "*"}));
        Check.eq("[4,13,5,/,+]", 6, () -> s.evalRPN(new String[]{"4", "13", "5", "/", "+"}));
        Check.eq("[10,6,9,3,+,-11,*,/,*,17,+,5,+]", 22,
            () -> s.evalRPN(new String[]{"10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"}));
        Check.hiddenFromHere();
        Check.eq("single number [42]", 42, () -> s.evalRPN(new String[]{"42"}));
        Check.eq("negative number single [-5]", -5, () -> s.evalRPN(new String[]{"-5"}));
        Check.eq("truncate toward zero [-7,2,/]", -3, () -> s.evalRPN(new String[]{"-7", "2", "/"}));
        Check.eq("order matter [3,-4,-]", 7, () -> s.evalRPN(new String[]{"3", "-4", "-"}));
        Check.eq("[0,3,/]", 0, () -> s.evalRPN(new String[]{"0", "3", "/"}));
        int pairs = 50000;
        String[] big = new String[1 + 2 * pairs];
        big[0] = "1";
        for (int i = 0; i < pairs; i++) { big[1 + 2 * i] = "2"; big[2 + 2 * i] = "+"; }
        Check.eq("bada: 1e5 tokens", 1 + 2 * pairs, () -> s.evalRPN(big));
    }
}`,
      hints: [
        "<code>Deque&lt;Integer&gt; st</code>. Har token: operator hai to do pop, warna <code>Integer.parseInt(token)</code> push.",
        "Operator check <code>token.equals(\"+\")</code> se karo. <code>\"-11\"</code> bhi \"-\" se shuru hota hai, isliye <code>charAt(0) == '-'</code> se check mat karo.",
        "<code>int b = st.pop(), a = st.pop();</code> phir switch se <code>a + b</code>, <code>a - b</code>, <code>a * b</code>, <code>a / b</code> push."
      ],
      solution: `import java.util.*;

class Solution {
    int evalRPN(String[] tokens) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String t : tokens) {
            switch (t) {
                case "+": { int b = st.pop(), a = st.pop(); st.push(a + b); break; }
                case "-": { int b = st.pop(), a = st.pop(); st.push(a - b); break; }
                case "*": { int b = st.pop(), a = st.pop(); st.push(a * b); break; }
                case "/": { int b = st.pop(), a = st.pop(); st.push(a / b); break; }   // zero ki taraf truncate
                default: st.push(Integer.parseInt(t));
            }
        }
        return st.pop();
    }
}`,
      explain: `<p><b>Approach:</b> operand stack. Operator pe do pop (pehla = right operand), result push.</p>
        <p><b>Time:</b> O(n). <b>Space:</b> O(n).</p>
        <p>Follow-up: infix expression (<code>"(1+2)*3"</code>) ho to? Do stacks (operands, operators) + precedence, ya Shunting-yard se postfix bana ke yahi code (LeetCode 224, 227).</p>`
    },
    {
      type: "pick",
      id: "pick-stack-use",
      q: "Inme se kaunse problems mein <b>stack</b> natural fit hai?",
      options: [
        { text: "Text editor ka undo", correct: true, why: "Sabse last change pehle undo hota hai: LIFO." },
        { text: "Printer ki job queue (jo pehle aaya pehle print)", correct: false, why: "Ye FIFO hai, queue chahiye." },
        { text: "HTML tags sahi nested hain ya nahi check karna", correct: true, why: "Brackets jaisa hi matching problem: jo last khula, pehle band." },
        { text: "Recursion ko iterative banana (jaise DFS)", correct: true, why: "Call stack ko apne explicit stack se replace karte hain." },
        { text: "Top 10 sabse zyada bikne wale products nikaalna", correct: false, why: "Ye heap / sorting ka kaam hai." },
        { text: "Sliding window ka maximum (har window ka max)", correct: false, why: "Isme dono sire se nikaalna padta hai: monotonic <b>deque</b> chahiye, sirf stack nahi." }
      ],
      answer: "Stack = LIFO: undo, nesting, matching, DFS. FIFO (queue), top-k (heap) aur dono sire wale kaam (deque) alag tools hain."
    },
    {
      type: "text",
      html: `<h2>Recap</h2><ul><li>Stack = LIFO; Java mein ArrayDeque use karo (Stack class legacy hai).</li><li>Min Stack: har entry ke saath us waqt ka min, sab O(1).</li><li>Valid Parentheses: opening pe expected closing push; closing pe empty/mismatch check; end mein khaali.</li><li>RPN: number push, operator pe b = pop, a = pop, push(a op b). Division zero ki taraf truncate.</li></ul>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Design sawaal (Min Stack, Max Stack, LRU) mein pehle <b>har operation ki target complexity</b> bolo (\"sab O(1)\"), phir batao kaunsi extra info store karoge aur kyun. Interviewer ka follow-up aksar \"space kam karo\" ya \"getMax bhi chahiye\" hota hai, to apna design flexible rakho."
    }
  ],
  references: [
    { title: "Min Stack", by: "LeetCode", url: "https://leetcode.com/problems/min-stack/", type: "article" },
    { title: "Valid Parentheses", by: "LeetCode", url: "https://leetcode.com/problems/valid-parentheses/", type: "article" },
    { title: "Evaluate Reverse Polish Notation", by: "LeetCode", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/", type: "article" },
    { title: "Deque / ArrayDeque (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/", type: "docs" },
    { title: "NeetCode Roadmap (Stack)", by: "NeetCode", url: "https://neetcode.io/roadmap", type: "course" }
  ]
});
