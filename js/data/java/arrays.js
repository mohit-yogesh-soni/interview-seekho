// Arrays (1D aur 2D)
registerLesson("java", "arrays", {
  why: "DSA ke aadhe se zyada questions arrays pe hain. Default values, reference copy aur 2D traversal ke traps samajh liye to two pointers, prefix sum aur matrix problems aasan lagenge.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Array = ek line mein rakhe same type ke dabbe</h2>
              <p>Array memory mein <b>lagaatar (contiguous)</b> jagah leta hai. Isliye <code>arr[i]</code> <b>O(1)</b> hai: address = start + i × element size. Size <b>fixed</b> hai: ek baar bana, badal nahi sakta.</p>
              <pre class="diagram">
 int[] marks = {72, 85, 90, 64};

 index:    0     1     2     3
         +-----+-----+-----+-----+
 marks -&gt;| 72  | 85  | 90  | 64  |     marks.length = 4 (method nahi, field)
         +-----+-----+-----+-----+     marks[4] = ArrayIndexOutOfBoundsException</pre>
              <h3>Banane ke tareeke</h3>
              <pre class="code-static">int[] a = new int[5];             // 5 dabbe, sab default value
int[] b = {10, 20, 30};           // seedha values (sirf declaration ke saath)
int[] c = new int[]{10, 20, 30};  // kahin bhi (jaise method argument)
int d[] = new int[3];             // C style, chalta hai par Java mein int[] d likhte hain</pre>
              <h3>Default values (new se banaya, value nahi di)</h3>
              <table>
                <tr><th>Type</th><th>Default</th></tr>
                <tr><td><code>int, long, short, byte</code></td><td>0</td></tr>
                <tr><td><code>double, float</code></td><td>0.0</td></tr>
                <tr><td><code>boolean</code></td><td>false</td></tr>
                <tr><td><code>char</code></td><td>'\\u0000' (code 0, print pe khaali dikhta hai)</td></tr>
                <tr><td>Objects (<code>String</code>, <code>Integer</code>...)</td><td><code>null</code></td></tr>
              </table>
              <p>Note: ye defaults array elements aur class fields pe lagte hain. <b>Local variables</b> ka koi default nahi, bina value ke use kiya to compile error.</p>`
    },
    {
      type: "code",
      title: "Defaults, length, aur array print karne ka trap",
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] counts = new int[3];
        double[] prices = new double[2];
        boolean[] seen = new boolean[2];
        String[] names = new String[2];

        System.out.println(counts[0] + " " + prices[0] + " " + seen[0] + " " + names[0]);
        System.out.println("length = " + counts.length);

        int[] marks = {72, 85, 90, 64};
        System.out.println(marks);                    // [I@1b6d3586 jaisa kuch: type + hash, content nahi
        System.out.println(Arrays.toString(marks));   // [72, 85, 90, 64]

        // Last element: length - 1
        System.out.println(marks[marks.length - 1]);

        // Empty array valid hai
        int[] empty = new int[0];
        System.out.println(empty.length + " " + Arrays.toString(empty));
    }
}`,
      note: "<code>[I@...</code> mein <code>[I</code> matlab \"int ka array\". Hash har run mein alag ho sakta hai."
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">String[] cities = new String[3];
cities[0] = "Delhi";
System.out.println(cities[1] + " " + cities.length);</pre>`,
      options: ["\" 3\" (khaali string)", "null 3", "null 1", "NullPointerException"],
      answer: 1,
      why: "Object arrays ke elements default <code>null</code> hote hain. Print karne pe <code>\"null\"</code> likha aata hai (NPE tab aata jab <code>cities[1].length()</code> jaisa method call karte). Length 3 hi hai, kitne bhare hain usse farak nahi padta."
    },
    {
      type: "text",
      html: `
              <h2><code>java.util.Arrays</code>: kaam ke methods</h2>
              <table>
                <tr><th>Method</th><th>Kya karta hai</th><th>Note</th></tr>
                <tr><td><code>Arrays.toString(a)</code></td><td>Readable print</td><td>2D ke liye <code>deepToString</code></td></tr>
                <tr><td><code>Arrays.sort(a)</code></td><td>Ascending sort, in-place</td><td>Primitives: Dual-Pivot Quicksort. Objects: TimSort (stable). Dono O(n log n)</td></tr>
                <tr><td><code>Arrays.sort(a, from, to)</code></td><td>Sirf range sort</td><td><code>to</code> exclude</td></tr>
                <tr><td><code>Arrays.fill(a, v)</code></td><td>Saare elements = v</td><td>DP mein <code>fill(dp, -1)</code></td></tr>
                <tr><td><code>Arrays.copyOf(a, n)</code></td><td>Naya array, n size</td><td>Bada n = baaki default se bhar jaata hai</td></tr>
                <tr><td><code>Arrays.equals(a, b)</code></td><td>Content compare</td><td><code>a == b</code> sirf reference compare karta hai</td></tr>
                <tr><td><code>Arrays.binarySearch(a, key)</code></td><td>Sorted array mein dhoondho</td><td>Unsorted pe answer galat</td></tr>
              </table>
              <h3>Sabse bada trap: <code>int[] b = a;</code> copy nahi hai</h3>
              <p>Array ek object hai. Variable mein array ka <b>reference</b> hota hai. <code>b = a</code> karne se dono same array ko point karte hain: b mein badlav = a mein badlav. Asli copy chahiye to <code>a.clone()</code> ya <code>Arrays.copyOf(a, a.length)</code>.</p>`
    },
    {
      type: "code",
      title: "Arrays utility + reference copy trap",
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] ratings = {4, 1, 5, 3, 2};
        Arrays.sort(ratings);
        System.out.println(Arrays.toString(ratings));            // [1, 2, 3, 4, 5]
        System.out.println(Arrays.binarySearch(ratings, 4));     // index 3

        int[] dp = new int[5];
        Arrays.fill(dp, -1);
        System.out.println(Arrays.toString(dp));

        int[] bigger = Arrays.copyOf(ratings, 7);
        System.out.println(Arrays.toString(bigger));             // extra jagah 0

        // Reference copy trap
        int[] a = {1, 2, 3};
        int[] b = a;              // copy nahi, same array
        b[0] = 99;
        System.out.println(a[0]);                                // 99

        int[] c = a.clone();      // asli copy
        c[1] = 42;
        System.out.println(Arrays.toString(a) + " " + Arrays.toString(c));

        // == vs Arrays.equals
        int[] x = {1, 2};
        int[] y = {1, 2};
        System.out.println(x == y);                // false: alag objects
        System.out.println(Arrays.equals(x, y));   // true: content same

        // Descending sort: primitives pe Comparator nahi chalta. Sort karke ulta padho
        // (ya Integer[] use karo with Collections.reverseOrder())
        for (int i = ratings.length - 1; i >= 0; i--) System.out.print(ratings[i] + " ");
        System.out.println();
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">int[] p = {5, 6, 7};
int[] q = p;
q = new int[]{8, 9};
q[0] = 100;
System.out.println(p[0] + " " + p.length);</pre>`,
      options: ["100 2", "5 3", "100 3", "8 2"],
      answer: 1,
      why: "<code>q = p</code> ke baad dono same array pe the. Par <code>q = new int[]{8, 9}</code> ne q ko <b>naye</b> array pe point kara diya. Ab <code>q[0] = 100</code> naye array ko badalta hai. p abhi bhi purane <code>{5, 6, 7}</code> pe hai."
    },
    {
      type: "text",
      html: `
              <h2>2D arrays: array of arrays</h2>
              <p>Java mein 2D array asal mein <b>arrays ka array</b> hai. <code>grid[r]</code> khud ek 1D array (ek row) hai, <code>grid[r][c]</code> ek element.</p>
              <pre class="diagram">
 int[][] grid = new int[3][4];      // 3 rows, 4 columns

 grid ---&gt; [ row0 ] ---&gt; [0][0][0][0]     grid.length     = 3 (rows)
           [ row1 ] ---&gt; [0][0][0][0]     grid[0].length  = 4 (columns)
           [ row2 ] ---&gt; [0][0][0][0]</pre>
              <ul>
                <li>Har row alag size ki ho sakti hai (<b>jagged array</b>): <code>int[][] t = new int[3][];</code> phir <code>t[0] = new int[1];</code>... Isliye andar ke loop mein <code>grid[r].length</code> likho, fixed number nahi.</li>
                <li><b>Row-wise</b> traversal (bahar r, andar c) memory mein lagaatar chalta hai, isliye CPU cache ke liye column-wise se tez hai.</li>
                <li>Print: <code>Arrays.deepToString(grid)</code>. <code>Arrays.toString(grid)</code> sirf row references dikhayega.</li>
              </ul>`
    },
    {
      type: "code",
      title: "Matrix traversal: row-wise, column-wise, diagonal, jagged",
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] m = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        System.out.println(Arrays.deepToString(m));
        System.out.println(Arrays.toString(m[1]));   // ek row khud 1D array hai

        System.out.print("Row-wise: ");
        for (int r = 0; r < m.length; r++)
            for (int c = 0; c < m[r].length; c++) System.out.print(m[r][c] + " ");
        System.out.println();

        System.out.print("Column-wise: ");
        for (int c = 0; c < m[0].length; c++)
            for (int r = 0; r < m.length; r++) System.out.print(m[r][c] + " ");
        System.out.println();

        int diag = 0;
        for (int i = 0; i < m.length; i++) diag += m[i][i];
        System.out.println("Main diagonal sum = " + diag);   // 1 + 5 + 9

        // Jagged: har row alag length
        int[][] tri = new int[3][];
        for (int r = 0; r < tri.length; r++) {
            tri[r] = new int[r + 1];
            Arrays.fill(tri[r], r + 1);
        }
        System.out.println(Arrays.deepToString(tri));

        // Trap: fill se har row SAME array object ban jaati hai
        int[][] bad = new int[2][];
        int[] shared = new int[2];
        Arrays.fill(bad, shared);
        bad[0][0] = 7;
        System.out.println(Arrays.deepToString(bad));   // dono rows mein 7!
    }
}`
    },
    {
      type: "exercise",
      id: "ex-max",
      title: "Max element (negatives ke saath)",
      level: "Easy",
      task: "<p><code>max(arr)</code> sabse bada element return kare. Array kam se kam 1 element ka hoga. Starter Run karke dekho: ek classic bug hai.</p>",
      examples: "<code>max([3, 9, 2])</code> → <code>9</code><br><code>max([-5, -2, -9])</code> → <code>-2</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    int max(int[] arr) {
        int best = 0;
        for (int x : arr) {
            if (x > best) best = x;
        }
        return best;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[3, 9, 2]", 9, () -> s.max(new int[]{3, 9, 2}));
        Check.eq("[-5, -2, -9]", -2, () -> s.max(new int[]{-5, -2, -9}));
        Check.hiddenFromHere();
        Check.eq("single [42]", 42, () -> s.max(new int[]{42}));
        Check.eq("single negative [-7]", -7, () -> s.max(new int[]{-7}));
        Check.eq("MIN_VALUE only", Integer.MIN_VALUE, () -> s.max(new int[]{Integer.MIN_VALUE, Integer.MIN_VALUE}));
        Check.eq("max at end", 100, () -> s.max(new int[]{1, 2, 3, 100}));
        Check.eq("duplicates", 5, () -> s.max(new int[]{5, 5, 1, 5}));
    }
}`,
      hints: [
        "Agar saare numbers negative hain to <code>best = 0</code> kabhi update hi nahi hoga.",
        "<code>best = arr[0]</code> se shuru karo (ya <code>Integer.MIN_VALUE</code> se)."
      ],
      solution: `class Solution {
    int max(int[] arr) {
        int best = arr[0];
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > best) best = arr[i];
        }
        return best;
    }
}`,
      explain: "Starting value array se hi lo, koi \"magic\" 0 nahi. Ek pass: <b>O(n) time, O(1) space</b>. Ye galti (0 se shuru) max subarray, min price jaise problems mein bhi hoti hai."
    },
    {
      type: "exercise",
      id: "ex-reverse-array",
      title: "Array in-place reverse karo",
      level: "Easy",
      task: "<p><code>reverse(arr)</code> usi array ko ulta kar de (naya array mat banao, method <code>void</code> hai). O(1) extra space.</p>",
      examples: "<code>[1, 2, 3, 4]</code> → <code>[4, 3, 2, 1]</code><br><code>[1, 2, 3]</code> → <code>[3, 2, 1]</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    void reverse(int[] arr) {
        // two pointers: i = 0, j = arr.length - 1
    }
}`,
      harness: `import seekho.Check;

public class Main {
    static int[] run(Solution s, int[] a) { s.reverse(a); return a; }

    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("[1, 2, 3, 4]", new int[]{4, 3, 2, 1}, () -> run(s, new int[]{1, 2, 3, 4}));
        Check.eq("[1, 2, 3]", new int[]{3, 2, 1}, () -> run(s, new int[]{1, 2, 3}));
        Check.hiddenFromHere();
        Check.eq("empty []", new int[]{}, () -> run(s, new int[]{}));
        Check.eq("single [7]", new int[]{7}, () -> run(s, new int[]{7}));
        Check.eq("two [1, 2]", new int[]{2, 1}, () -> run(s, new int[]{1, 2}));
        Check.eq("negatives", new int[]{-3, 0, -1}, () -> run(s, new int[]{-1, 0, -3}));
        int n = 200000;
        Check.eq("bada array (2 lakh): pehla element", n - 1, () -> {
            int[] a = new int[n];
            for (int i = 0; i < n; i++) a[i] = i;
            s.reverse(a);
            return a[0];
        });
    }
}`,
      hints: [
        "<code>i</code> shuru pe, <code>j</code> end pe. Swap karo, i++ j--.",
        "Loop <code>while (i &lt; j)</code>. Swap ke liye temp: <code>int t = arr[i]; arr[i] = arr[j]; arr[j] = t;</code>"
      ],
      solution: `class Solution {
    void reverse(int[] arr) {
        int i = 0, j = arr.length - 1;
        while (i < j) {
            int t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
            i++;
            j--;
        }
    }
}`,
      explain: "<p>Two pointers: n/2 swaps, <b>O(n) time, O(1) space</b>. Method void hai phir bhi caller ka array badalta hai, kyunki method ko same array ka reference mila. (Ye \"pass-by-value of reference\" agle chapter mein detail mein.)</p>"
    },
    {
      type: "exercise",
      id: "ex-transpose",
      title: "Matrix transpose (rectangle bhi)",
      level: "Easy",
      task: "<p><code>transpose(m)</code> naya matrix return kare jisme rows columns ban jaayein: <code>result[c][r] = m[r][c]</code>. Matrix square nahi bhi ho sakta (2 × 3 ka transpose 3 × 2). <a href=\"https://leetcode.com/problems/transpose-matrix/\" target=\"_blank\">LeetCode 867</a></p>",
      examples: "<code>[[1,2,3],[4,5,6]]</code> → <code>[[1,4],[2,5],[3,6]]</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    int[][] transpose(int[][] m) {
        // ye sirf square matrix pe chalta hai
        int n = m.length;
        int[][] res = new int[n][n];
        for (int r = 0; r < n; r++)
            for (int c = 0; c < n; c++)
                res[c][r] = m[r][c];
        return res;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("2x2 [[1,2],[3,4]]", new int[][]{{1, 3}, {2, 4}}, () -> s.transpose(new int[][]{{1, 2}, {3, 4}}));
        Check.eq("2x3 [[1,2,3],[4,5,6]]", new int[][]{{1, 4}, {2, 5}, {3, 6}}, () -> s.transpose(new int[][]{{1, 2, 3}, {4, 5, 6}}));
        Check.hiddenFromHere();
        Check.eq("1x1 [[9]]", new int[][]{{9}}, () -> s.transpose(new int[][]{{9}}));
        Check.eq("1x4 row", new int[][]{{1}, {2}, {3}, {4}}, () -> s.transpose(new int[][]{{1, 2, 3, 4}}));
        Check.eq("3x1 column", new int[][]{{5, 6, 7}}, () -> s.transpose(new int[][]{{5}, {6}, {7}}));
        Check.eq("3x3 negatives", new int[][]{{-1, -4, -7}, {-2, -5, -8}, {-3, -6, -9}},
            () -> s.transpose(new int[][]{{-1, -2, -3}, {-4, -5, -6}, {-7, -8, -9}}));
    }
}`,
      hints: [
        "rows = <code>m.length</code>, cols = <code>m[0].length</code>. Result ka size ulta: <code>new int[cols][rows]</code>.",
        "Loop r &lt; rows, c &lt; cols, aur <code>res[c][r] = m[r][c]</code>."
      ],
      solution: `class Solution {
    int[][] transpose(int[][] m) {
        int rows = m.length, cols = m[0].length;
        int[][] res = new int[cols][rows];
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
                res[c][r] = m[r][c];
        return res;
    }
}`,
      explain: "<p>Har element ek baar copy: <b>O(rows × cols) time</b>, result ke liye utni hi space. Square matrix ho to in-place bhi ho sakta hai (sirf upper triangle swap karo, <code>c &gt; r</code>), par rectangle mein naya array chahiye kyunki shape badal jaati hai.</p>"
    },
    {
      type: "think",
      id: "think-array",
      q: "Interview question: <b>\"Array mein index se access O(1) kyun hai, par beech mein insert O(n) kyun? ArrayList kab lena chahiye?\"</b>",
      rubric: [
        { point: "Contiguous memory: address = base + index × size, seedha calculate", keys: ["contiguous", "lagaatar", "base", "address", "index × size", "index * size", "calculate"], weight: 2 },
        { point: "Beech mein insert/delete pe baaki elements <b>shift</b> karne padte hain: O(n)", keys: ["shift", "khiskana", "move", "sarkana"], weight: 2 },
        { point: "Array ka size fixed hai; ArrayList andar array rakhta hai aur bhar jaane pe bade array mein copy karke grow karta hai", keys: ["fixed", "resize", "grow", "dynamic", "copy"] },
        { point: "Array: primitives seedha (no boxing), kam memory, fast; size pehle se pata ho to array", keys: ["primitive", "boxing", "memory", "size pata", "performance"] },
        { point: "Bonus: contiguous hone se CPU cache friendly", keys: ["cache", "locality"] }
      ],
      answer: `<p>Array ke elements memory mein <b>lagaatar</b> hain aur sab same size ke. To <code>arr[i]</code> ka address seedha nikalta hai: <code>base + i × elementSize</code>. Koi search nahi, isliye <b>O(1)</b>.</p>
                <p>Beech mein insert (ya delete) karne ke liye uske baad ke saare elements ek jagah aage (ya peeche) <b>shift</b> karne padte hain. Worst case n elements: <b>O(n)</b>. Aur array ka size fixed hai, to jagah na ho to naya bada array banake copy karna padta hai.</p>
                <p><b>ArrayList</b> yahi kaam aapke liye karta hai: andar ek array, bhar gaya to ~1.5x bada array banake copy. Append amortized O(1).</p>
                <p><b>Kab kya:</b> size pehle se pata hai, primitives hain, performance chahiye (DP table, counting array <code>int[26]</code>) → array. Size badalta hai ya Collections/Streams API chahiye → ArrayList. Bonus: contiguous memory CPU cache ke liye achhi hai, isliye array scan bahut tez hota hai.</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Array problem shuru karte hi edge cases zor se bolo: <b>empty array, single element, saare negative, duplicates, bahut bada n</b>. Aur 2D mein pehle confirm karo: \"matrix square hai ya rectangle? jagged ho sakta hai?\" Ye sawaal hi senior signal hai."
    }
  ],
  references: [
    { title: "Arrays (Java Tutorials)", by: "Oracle", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/arrays.html", type: "docs" },
    { title: "Arrays (dev.java)", by: "dev.java", url: "https://dev.java/learn/language-basics/arrays/", type: "docs" },
    { title: "java.util.Arrays (Java 17 API)", by: "Oracle", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html", type: "docs" },
    { title: "Transpose Matrix", by: "LeetCode", url: "https://leetcode.com/problems/transpose-matrix/", type: "article" }
  ]
});
