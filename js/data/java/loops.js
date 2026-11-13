// Loops
registerLesson("java", "loops", {
  why: "Har DSA solution loops pe chalta hai. Interview mein off-by-one, galat break/continue aur digit-wala math (reverse number, prime check) sabse common warm-up questions hain.",
  blocks: [
    {
      type: "text",
      html: `
              <h2>Teen loops, teen situations</h2>
              <table>
                <tr><th>Loop</th><th>Kab use karein</th><th>Example</th></tr>
                <tr><td><code>for</code></td><td>Kitni baar chalana hai pata hai</td><td>Cart ke 5 items pe GST lagao</td></tr>
                <tr><td><code>while</code></td><td>Condition pe chalana hai, count pata nahi</td><td>Jab tak number 0 na ho, digit nikalo</td></tr>
                <tr><td><code>do-while</code></td><td>Body <b>kam se kam ek baar</b> chalni hi chahiye</td><td>OTP bhejo, phir check karo galat hai to dobara</td></tr>
                <tr><td>for-each</td><td>Array/collection ke har element pe, index nahi chahiye</td><td><code>for (int price : prices)</code></td></tr>
              </table>
              <pre class="code-static">for (init; condition; update) { body }
//  1. init ek baar   2. condition check   3. body   4. update   phir 2 se</pre>
              <p><code>for</code> mein declare kiya <code>i</code> sirf loop ke andar dikhta hai. Loop ke baad i chahiye to bahar declare karo.</p>
              <p>for-each mein loop variable ek <b>copy</b> hai. <code>for (int x : arr) x = 0;</code> se array nahi badlega.</p>`
    },
    {
      type: "code",
      title: "Teeno loops + for-each ka copy trap",
      code: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) System.out.print("for" + i + " ");
        System.out.println();

        int n = 4096, digits = 0;
        while (n > 0) {          // kitni baar chalega pata nahi tha
            n /= 10;
            digits++;
        }
        System.out.println("digits = " + digits);

        int attempts = 0;
        do {
            attempts++;
            System.out.println("OTP bheja, attempt " + attempts);
        } while (false);         // condition false hai, phir bhi ek baar chala

        int[] prices = {100, 200, 300};
        for (int p : prices) p = 0;          // sirf copy badli
        System.out.println(prices[0]);        // 100
        for (int i = 0; i < prices.length; i++) prices[i] = 0;   // index se asli element badla
        System.out.println(prices[0]);        // 0

        // Stray semicolon trap: loop ki body khali hai, block ek hi baar chalta hai
        int count = 0;
        for (int i = 0; i < 5; i++); {
            count++;
        }
        System.out.println("count = " + count);   // 1, 5 nahi
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">int i = 10;
do {
    System.out.print(i + " ");
    i++;
} while (i &lt; 5);
while (i &lt; 5) {
    System.out.print("W ");
}
System.out.print(i);</pre>`,
      options: ["11", "10 11", "10 W 11", "Infinite loop"],
      answer: 1,
      why: "do-while ki body pehle chalti hai: <code>10</code> print, i = 11. Phir condition 11 &lt; 5 false, loop khatam. while ki condition shuru mein hi false hai to body ek baar bhi nahi chali. Last mein <code>11</code>."
    },
    {
      type: "text",
      html: `
              <h2>break, continue, labelled break</h2>
              <ul>
                <li><code>break</code>: <b>sabse andar wala</b> loop (ya switch) turant khatam.</li>
                <li><code>continue</code>: is iteration ka baaki code skip, agli iteration pe jao. <code>for</code> mein update (i++) phir bhi chalta hai. <code>while</code> mein update continue ke baad likha ho to skip ho jaata hai: infinite loop ka common reason.</li>
                <li><b>Labelled break</b>: nested loop mein <b>bahar wale</b> loop se nikalna ho. Loop ke upar label likho: <code>outer:</code>, phir <code>break outer;</code>. <code>continue outer;</code> bhi chalta hai.</li>
              </ul>
              <p>Real example: theatre seats ke 2D grid mein pehli khaali seat dhoondhni hai. Mil gayi to dono loops se nikalna hai. Bina label ke flag variable rakhna padta.</p>`
    },
    {
      type: "code",
      title: "continue aur labelled break",
      code: `public class Main {
    public static void main(String[] args) {
        // continue: odd numbers skip
        int sumEven = 0;
        for (int i = 1; i <= 10; i++) {
            if (i % 2 != 0) continue;
            sumEven += i;
        }
        System.out.println("sumEven = " + sumEven);   // 2+4+6+8+10 = 30

        // Labelled break: pehli khaali seat (0) dhoondho
        int[][] seats = {
            {1, 1, 1},
            {1, 0, 1},
            {0, 1, 1}
        };
        int foundRow = -1, foundCol = -1;
        search:
        for (int r = 0; r < seats.length; r++) {
            for (int c = 0; c < seats[r].length; c++) {
                if (seats[r][c] == 0) {
                    foundRow = r;
                    foundCol = c;
                    break search;          // dono loops se bahar
                }
            }
        }
        System.out.println("Khaali seat: row " + foundRow + ", col " + foundCol);

        // Simple break sirf andar wale loop ko todta hai
        for (int r = 0; r < 2; r++) {
            for (int c = 0; c < 3; c++) {
                if (c == 1) break;
                System.out.print("(" + r + "," + c + ") ");
            }
        }
        System.out.println();
    }
}`
    },
    {
      type: "quiz",
      q: `Output kya hoga?<pre class="code-static">int total = 0;
for (int i = 0; i &lt; 5; i++) {
    if (i == 1) continue;
    if (i == 3) break;
    total += i;
}
System.out.println(total);</pre>`,
      options: ["2", "3", "6", "10"],
      answer: 0,
      why: "i = 0: total 0. i = 1: continue (skip). i = 2: total 2. i = 3: break. Answer <code>2</code>."
    },
    {
      type: "text",
      html: `
              <h2>Nested loops aur patterns</h2>
              <p>Bahar wala loop <b>rows</b>, andar wala <b>columns</b>. Pattern questions mein bas ye socho: row number <code>r</code> pe kitne items print karne hain? (r, n - r, 2r - 1...)</p>
              <p>Cost: bahar n baar, andar m baar = <b>O(n × m)</b>. Do nested loops jo dono n tak jaate hain = O(n²). n = 10⁵ pe ye 10¹⁰ operations, matlab TLE. Interview mein nested loop likhte hi complexity bolo.</p>`
    },
    {
      type: "code",
      title: "Patterns: row number se socho",
      code: `public class Main {
    public static void main(String[] args) {
        int n = 4;

        // Right triangle: row r pe r stars
        for (int r = 1; r <= n; r++) {
            for (int c = 1; c <= r; c++) System.out.print("*");
            System.out.println();
        }

        // Pyramid: row r pe (n - r) spaces, phir (2r - 1) stars
        for (int r = 1; r <= n; r++) {
            for (int s = 0; s < n - r; s++) System.out.print(" ");
            for (int c = 0; c < 2 * r - 1; c++) System.out.print("*");
            System.out.println();
        }

        // Multiplication table ka chhota grid
        for (int r = 1; r <= 3; r++) {
            for (int c = 1; c <= 3; c++) System.out.print(r * c + "\\t");
            System.out.println();
        }
    }
}`
    },
    {
      type: "exercise",
      id: "ex-number-triangle",
      title: "Number triangle print karo",
      level: "Easy",
      task: "<p>n = 4 ke liye exactly ye print karo (numbers ke beech ek space):</p><pre class='code-static'>1\n1 2\n1 2 3\n1 2 3 4</pre>",
      starter: `public class Main {
    public static void main(String[] args) {
        int n = 4;
        // nested loop likho
    }
}`,
      expectedOutput: `1
1 2
1 2 3
1 2 3 4`,
      hints: [
        "Bahar ka loop r = 1 se n tak. Andar ka loop c = 1 se r tak.",
        "Andar <code>System.out.print(c + \" \")</code>, aur andar ka loop khatam hone pe <code>System.out.println()</code>. Line ke end ka extra space checker ignore karta hai."
      ],
      solution: `public class Main {
    public static void main(String[] args) {
        int n = 4;
        for (int r = 1; r <= n; r++) {
            StringBuilder line = new StringBuilder();
            for (int c = 1; c <= r; c++) {
                if (c > 1) line.append(' ');
                line.append(c);
            }
            System.out.println(line);
        }
    }
}`,
      explain: "Row r pe 1 se r tak numbers. StringBuilder se line banake ek baar print karna trailing space bhi bachata hai aur fast bhi hai."
    },
    {
      type: "steps",
      title: "Dry run: reverse(1234) using % aur /",
      steps: [
        { title: "Shuru: n = 1234, rev = 0", html: `<div class="arr"><span class="cell">1</span><span class="cell">2</span><span class="cell">3</span><span class="cell hl">4</span></div><p><code>n % 10</code> = aakhri digit. <code>n / 10</code> = aakhri digit hata do.</p>` },
        { title: "Step 1: digit = 4", html: `<div class="arr"><span class="cell">1</span><span class="cell">2</span><span class="cell hl">3</span><span class="cell dim">4</span></div><p>rev = 0 × 10 + 4 = <b>4</b>, n = 123</p>` },
        { title: "Step 2: digit = 3", html: `<div class="arr"><span class="cell">1</span><span class="cell hl">2</span><span class="cell dim">3</span><span class="cell dim">4</span></div><p>rev = 4 × 10 + 3 = <b>43</b>, n = 12</p>` },
        { title: "Step 3: digit = 2", html: `<div class="arr"><span class="cell hl">1</span><span class="cell dim">2</span><span class="cell dim">3</span><span class="cell dim">4</span></div><p>rev = 43 × 10 + 2 = <b>432</b>, n = 1</p>` },
        { title: "Step 4: digit = 1", html: `<div class="arr"><span class="cell dim">1</span><span class="cell dim">2</span><span class="cell dim">3</span><span class="cell dim">4</span></div><p>rev = 432 × 10 + 1 = <b>4321</b>, n = 0. Loop khatam (<code>while (n != 0)</code>).</p>` },
        { title: "Trap: overflow", html: `<p><code>reverse(1534236469)</code> = 9646324351, jo int (max ~2.1 × 10⁹) mein fit nahi hota. <code>rev * 10</code> karne se <b>pehle</b> check karo, ya rev ko <code>long</code> mein rakho aur end mein range check karo.</p><p>Negative numbers: Java mein <code>-123 % 10 = -3</code> aur <code>-123 / 10 = -12</code>, to same loop negative pe bhi sahi chalta hai (condition <code>n != 0</code> rakho, <code>n &gt; 0</code> nahi).</p>` }
      ]
    },
    {
      type: "exercise",
      id: "ex-prime",
      title: "Prime check (fast)",
      level: "Easy",
      task: "<p><code>isPrime(n)</code>: n prime hai to <code>true</code>. Prime = 1 se bada number jo sirf 1 aur khud se divide ho. 0, 1 aur negative prime nahi.</p><p>Hidden tests mein ~2 × 10⁹ jaise bade primes hain, to n tak loop chalana slow hoga.</p>",
      examples: "<code>isPrime(7)</code> → <code>true</code><br><code>isPrime(9)</code> → <code>false</code><br><code>isPrime(1)</code> → <code>false</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    boolean isPrime(int n) {
        for (int i = 2; i < n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("isPrime(7)", true, () -> s.isPrime(7));
        Check.eq("isPrime(9)", false, () -> s.isPrime(9));
        Check.eq("isPrime(1)", false, () -> s.isPrime(1));
        Check.hiddenFromHere();
        Check.eq("isPrime(0)", false, () -> s.isPrime(0));
        Check.eq("isPrime(-7)", false, () -> s.isPrime(-7));
        Check.eq("isPrime(2)", true, () -> s.isPrime(2));
        Check.eq("isPrime(49) (7*7)", false, () -> s.isPrime(49));
        Check.eq("bada prime 1000000007", true, () -> s.isPrime(1000000007));
        Check.eq("Integer.MAX_VALUE (prime hai)", true, () -> s.isPrime(Integer.MAX_VALUE));
        Check.eq("bada composite 2146654199 (46327*46337)", false, () -> s.isPrime(2146654199));
        Check.eq("bada prime 2147483629", true, () -> s.isPrime(2147483629));
    }
}`,
      hints: [
        "Starter 1 ko bhi prime bolta hai. Pehle <code>n &lt; 2</code> pe false.",
        "Agar n = a × b, to a aur b mein se ek <b>√n se chhota ya barabar</b> hoga. To sirf √n tak check karo.",
        "Loop condition <code>i * i &lt;= n</code> bade n pe overflow karti hai (46341² int se bada). <code>i &lt;= n / i</code> ya <code>(long) i * i &lt;= n</code> likho."
      ],
      solution: `class Solution {
    boolean isPrime(int n) {
        if (n < 2) return false;
        if (n % 2 == 0) return n == 2;
        for (int i = 3; i <= n / i; i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }
}`,
      explain: "<p>Divisors pairs mein aate hain (a × b = n), aur ek hamesha √n tak hota hai. Isliye <b>O(√n)</b>: 2 × 10⁹ ke liye ~46,000 checks, n tak loop ke 2 billion nahi. Even numbers pehle hi hata diye, to aadhe checks aur kam.</p><p><code>i &lt;= n / i</code> overflow-safe hai. <code>i * i &lt;= n</code> n ≈ Integer.MAX_VALUE pe overflow karke negative ho jaata hai aur loop galat chalta hai.</p>"
    },
    {
      type: "exercise",
      id: "ex-digits",
      title: "Sum of digits aur reverse number",
      level: "Medium",
      task: "<p>Do methods likho:</p><ul><li><code>sumOfDigits(n)</code>: digits ka sum. Negative ho to sign ignore (<code>-123</code> → 6).</li><li><code>reverse(n)</code>: digits ulte, sign same rahe (<code>-123</code> → <code>-321</code>). Agar ulta number <code>int</code> range se bahar jaaye to <b>0</b> return karo. <a href=\"https://leetcode.com/problems/reverse-integer/\" target=\"_blank\">LeetCode 7</a></li></ul>",
      examples: "<code>sumOfDigits(4096)</code> → <code>19</code><br><code>reverse(1234)</code> → <code>4321</code><br><code>reverse(120)</code> → <code>21</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    int sumOfDigits(int n) {
        return 0;
    }

    int reverse(int n) {
        return 0;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("sumOfDigits(4096)", 19, () -> s.sumOfDigits(4096));
        Check.eq("reverse(1234)", 4321, () -> s.reverse(1234));
        Check.eq("reverse(120)", 21, () -> s.reverse(120));
        Check.hiddenFromHere();
        Check.eq("sumOfDigits(0)", 0, () -> s.sumOfDigits(0));
        Check.eq("sumOfDigits(-123)", 6, () -> s.sumOfDigits(-123));
        Check.eq("sumOfDigits(Integer.MAX_VALUE)", 46, () -> s.sumOfDigits(Integer.MAX_VALUE));
        Check.eq("reverse(-123)", -321, () -> s.reverse(-123));
        Check.eq("reverse(0)", 0, () -> s.reverse(0));
        Check.eq("overflow: reverse(1534236469)", 0, () -> s.reverse(1534236469));
        Check.eq("overflow: reverse(Integer.MIN_VALUE)", 0, () -> s.reverse(Integer.MIN_VALUE));
        Check.eq("reverse(-2147483412) fits", -2143847412, () -> s.reverse(-2147483412));
    }
}`,
      hints: [
        "Digit loop: <code>while (n != 0) { int d = n % 10; ...; n /= 10; }</code>",
        "Sum ke liye <code>Math.abs(d)</code> jodo (negative n pe d bhi negative aata hai). <code>Math.abs(n)</code> pehle karne se MIN_VALUE pe dikkat hoti hai.",
        "Reverse ke liye <code>long rev</code> rakho: <code>rev = rev * 10 + d</code>. End mein <code>rev &gt; Integer.MAX_VALUE || rev &lt; Integer.MIN_VALUE</code> to 0, warna <code>(int) rev</code>."
      ],
      solution: `class Solution {
    int sumOfDigits(int n) {
        int sum = 0;
        while (n != 0) {
            sum += Math.abs(n % 10);
            n /= 10;
        }
        return sum;
    }

    int reverse(int n) {
        long rev = 0;
        while (n != 0) {
            rev = rev * 10 + n % 10;
            n /= 10;
        }
        if (rev > Integer.MAX_VALUE || rev < Integer.MIN_VALUE) return 0;
        return (int) rev;
    }
}`,
      explain: "<p><code>% 10</code> aakhri digit deta hai, <code>/ 10</code> use hata deta hai. Loop digits ki ginti jitna chalta hai: <b>O(log₁₀ n) time, O(1) space</b>.</p><p>Java mein negative ka remainder negative hota hai, isliye reverse loop bina sign alag kiye kaam karta hai. <code>long</code> mein jodne se overflow detect karna aasan hai. Agar interviewer bole \"long allowed nahi\", to har step pe <code>rev &gt; Integer.MAX_VALUE / 10</code> pehle check karo.</p>"
    },
    {
      type: "think",
      id: "think-sqrt",
      q: "Interview question: <b>\"Prime check mein √n tak hi loop kyun kaafi hai? Aur kya edge cases handle karoge?\"</b>",
      rubric: [
        { point: "Divisors <b>pairs</b> mein aate hain: n = a × b, to dono √n se bade nahi ho sakte", keys: ["pair", "a * b", "a × b", "a*b", "dono bade", "factor", "jodi"], weight: 2 },
        { point: "Isliye complexity <b>O(√n)</b>, O(n) nahi", keys: ["o(√n)", "o(sqrt", "sqrt(n)", "root n", "√n"], weight: 2 },
        { point: "Edge cases: n &lt; 2 (0, 1, negative) prime nahi; 2 prime hai", keys: ["n < 2", "0 aur 1", "1 prime nahi", "negative", "2 prime"] },
        { point: "Overflow: <code>i * i</code> bade n pe int se bahar; <code>i &lt;= n / i</code> ya long", keys: ["overflow", "n / i", "n/i", "long"] },
        { point: "Bonus: even skip (i += 2); bahut saare primes chahiye to Sieve of Eratosthenes", keys: ["even", "i += 2", "odd", "sieve"] }
      ],
      answer: `<p>Agar n composite hai to <code>n = a × b</code>. Agar a aur b dono √n se bade hote to <code>a × b &gt; n</code>, jo possible nahi. Matlab koi ek divisor <b>√n ya usse chhota</b> zaroor hai. √n tak koi divisor nahi mila to n prime hai. Complexity <b>O(√n)</b>: n = 10⁹ pe ~31,623 checks.</p>
                <p><b>Edge cases:</b> n &lt; 2 (0, 1, negative) prime nahi. 2 akela even prime. Loop condition <code>i * i &lt;= n</code> n ≈ 2³¹ pe overflow karti hai, isliye <code>i &lt;= n / i</code> likho.</p>
                <p><b>Optimization:</b> 2 alag check karke sirf odd i (<code>i += 2</code>). Agar 1 se N tak <b>saare</b> primes chahiye (jaise count primes) to har number pe √n ke bajaye <b>Sieve of Eratosthenes</b>: O(N log log N).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Loop likhne se pehle 3 cheezein bolo: <b>start, end (&lt; ya &lt;=?), update</b>. Off-by-one bugs yahin hote hain. Aur loop likhte hi uski complexity bolo: \"ye O(n) hai\" ya \"nested hai to O(n²), n = 10⁵ pe slow hoga\". Interviewer yahi sunna chahta hai."
    }
  ],
  references: [
    { title: "The for Statement", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/for.html", type: "docs" },
    { title: "Branching Statements (break, continue, labels)", by: "Oracle Java Tutorials", url: "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/branch.html", type: "docs" },
    { title: "Loops", by: "dev.java", url: "https://dev.java/learn/language-basics/loops/", type: "docs" },
    { title: "Reverse Integer", by: "LeetCode", url: "https://leetcode.com/problems/reverse-integer/", type: "article" }
  ]
});
