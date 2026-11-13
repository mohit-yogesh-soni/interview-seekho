// AI, ML, Deep Learning: farak kya hai
registerLesson("ai", "ml-basics", {
  why: `LLM ek bahut bada "model" hai jo data se seekha gaya hai. Model kya hota hai, "seekhna" (training) asal mein kya karta hai, aur training vs inference ka farak samajh liya to aage ka saara AI module (tokens, transformer, fine-tuning, cost) logical lagega. Interviews mein ye basic sawaal aksar pehle aata hai.`,
  blocks: [
    {
      type: "text",
      html: `
        <h2>Problem: rules se kaam nahi chalta</h2>
        <p>Maan lo aapko email spam filter banana hai. Pehla tareeka: rules likho. "Agar subject mein 'lottery' ho to spam." Phir spammer 'l0ttery' likhne lagta hai. Aap naya rule likhte ho. Ek saal baad 2,000 rules hain, aur phir bhi naye spam nikal jaate hain, aur kuch asli emails bhi spam mein jaane lagte hain.</p>
        <p>Doosra tareeka: lakhs emails do jinpe likha hai "spam" ya "not spam", aur computer ko <b>khud pattern dhoondhne do</b>. Yahi <b>Machine Learning (ML)</b> hai: rules hum nahi likhte, <b>examples</b> dete hain, aur program examples se rules (numbers ke roop mein) nikaalta hai.</p>
        <table>
          <tr><th>Term</th><th>Matlab</th><th>Example</th></tr>
          <tr><td><b>AI</b></td><td>Koi bhi system jo "samajhdaari wala" kaam kare. Sabse bada daira.</td><td>Chess engine (rules + search), spam filter, ChatGPT</td></tr>
          <tr><td><b>ML</b></td><td>AI ka hissa jahan program data se seekhta hai</td><td>Spam filter, Swiggy ka delivery time prediction</td></tr>
          <tr><td><b>Deep Learning</b></td><td>ML jisme model ek bada <b>neural network</b> hai (kai layers)</td><td>Photo mein chehra pehchaanna, speech-to-text</td></tr>
          <tr><td><b>LLM</b></td><td>Deep learning model jo bahut saare text pe train hua aur text banata hai</td><td>GPT, Claude, Llama, Gemini</td></tr>
        </table>
        <p>Har line upar wali ke andar hai: LLM ⊂ deep learning ⊂ ML ⊂ AI.</p>`
    },
    {
      type: "text",
      html: `
        <h2>Model = ek function jiske andar "knobs" hain</h2>
        <p>Sabse chhota example: Zomato ko delivery time predict karna hai distance se. Model:</p>
        <pre class="code-static">time = w × distance</pre>
        <p><code>w</code> ek <b>parameter</b> (ya <b>weight</b>) hai: ek knob jise ghuma ke model ka behaviour badalta hai. Shuru mein humein <code>w</code> nahi pata. Data hai: 1 km → 10 min, 2 km → 20 min, 3 km → 30 min.</p>
        <p><b>Kitna galat hai, kaise naapein?</b> Har example pe (prediction − asli)² lo aur average karo. Isse <b>loss</b> kehte hain (yahan mean squared error). Loss kam = model achha.</p>
        <p><b>Knob kis taraf ghumaayein?</b> Loss ka slope (<b>gradient</b>) batata hai ki w thoda badhane se loss badhega ya ghatega. Ulti taraf chhota kadam lo. Kadam ka size = <b>learning rate</b>. Isse <b>gradient descent</b> kehte hain, aur poori deep learning isi idea pe chalti hai.</p>`
    },
    {
      type: "steps",
      title: "Gradient descent: w = 0 se shuru, learning rate 0.05",
      steps: [
        { title: "Step 0: w = 0", html: "<p>Predictions 0, 0, 0. Errors −10, −20, −30. Loss = (100 + 400 + 900) / 3 ≈ <b>466.7</b>. Gradient bahut negative hai, matlab w badhao.</p>" },
        { title: "Step 1: w ≈ 4.67", html: "<p>Gradient = (2/3) × Σ(error × distance) = (2/3) × (−140) ≈ −93.3. Naya w = 0 − 0.05 × (−93.3) ≈ 4.67. Loss ≈ <b>132.7</b>.</p>" },
        { title: "Step 2: w ≈ 7.16", html: "<p>Errors ab chhote hain, to gradient bhi chhota (≈ −49.8), kadam bhi chhota. Loss ≈ <b>37.8</b>.</p>" },
        { title: "Step 3: w ≈ 8.48", html: "<p>Loss ≈ <b>10.7</b>. Har step pe w aur 10 ka gap ~0.53 guna ho raha hai.</p>" },
        { title: "Kuch aur steps: w → 10", html: "<p>Model ne khud seekh liya: 1 km ≈ 10 min. Humne rule nahi likha, sirf data aur 'galti kam karo' diya. Yahi <b>training</b> hai.</p>" }
      ]
    },
    {
      type: "text",
      html: `
        <h2>Ek knob se arbon knobs tak</h2>
        <p>Asli duniya mein time sirf distance pe depend nahi karta: traffic, baarish, restaurant ki speed... Ek seedhi line kaafi nahi. <b>Neural network</b> bahut saare aise chhote units (neurons) ki layers hai: har neuron inputs × weights jodta hai, phir ek non-linear function (jaise "negative ho to 0") lagata hai. Layers jodne se network curved, complex patterns pakad leta hai. Training wahi gradient descent hai, bas weights crores ya arbon hain, aur gradients nikaalne ka tareeka (<b>backpropagation</b>) chain rule se sab layers ke liye ek saath gradient nikaalta hai.</p>
        <table>
          <tr><th>Model</th><th>Parameters (approx)</th></tr>
          <tr><td>Hamara delivery model</td><td>1</td></tr>
          <tr><td>GPT-2 small (2019)</td><td>~12.4 crore (124M)</td></tr>
          <tr><td>GPT-3 (2020)</td><td>17,500 crore (175B)</td></tr>
        </table>
        <h2>Training vs Inference</h2>
        <table>
          <tr><th></th><th>Training</th><th>Inference</th></tr>
          <tr><td>Kya hota hai</td><td>Weights badalte hain (loss kam karne ke liye)</td><td>Weights fixed; naye input pe jawab</td></tr>
          <tr><td>Kitni baar</td><td>Ek baar (ya kabhi kabhi), hafton tak</td><td>Har user request pe</td></tr>
          <tr><td>Kharcha</td><td>Bahut bada, ek baar</td><td>Har request pe chhota, par crores requests</td></tr>
          <tr><td>Example</td><td>Model ko internet ke text pe train karna</td><td>ChatGPT mein aapka sawaal</td></tr>
        </table>
        <p>Important: ChatGPT se baat karte waqt model <b>kuch nahi seekhta</b>. Weights fixed hain. Wo "yaad" isliye rakhta hai kyunki app pichhli baatein har baar prompt mein dobara bhejti hai (HLD ka ChatGPT lesson).</p>`
    },
    {
      type: "quiz",
      q: "Learning rate bahut bada rakh diya (jaise 0.5, upar wale jaise data pe). Kya hoga?",
      options: ["Training aur tez converge hogi, hamesha", "w sahi value ke aas-paas jhoolega aur door hota jaayega (diverge)", "Loss turant 0 ho jaayega", "Kuch farak nahi padta"],
      answer: 1,
      why: "Bada kadam minimum ke paar chala jaata hai. Agar har kadam pe gap ulti taraf aur bada ho jaaye (factor ki value −1 se kam), to w har step pe door hota jaata hai. Isliye learning rate chhota, ya training ke saath ghatane wala rakhte hain."
    },
    {
      type: "exercise",
      id: "ex-gd",
      title: "Gradient descent khud likho",
      level: "Easy",
      task: `<p><code>fit(x, y, lr, steps)</code>: model <code>y = w × x</code> (bias nahi). <code>w = 0</code> se shuru karo. Har step pe:</p>
        <pre class="code-static">grad = (2 / n) × Σ (w × x[i] − y[i]) × x[i]
w    = w − lr × grad</pre>
        <p><code>steps</code> baar ye karke final <code>w</code> return karo.</p>`,
      examples: "<code>x=[1,2], y=[2,4], lr=0.1, steps=1</code> → <code>1.0</code><br><code>x=[1,2,3], y=[3,6,9], lr=0.05, steps=200</code> → <code>≈ 3.0</code>",
      userFile: "Solution.java",
      starter: `class Solution {
    double fit(double[] x, double[] y, double lr, int steps) {
        // yahan likho
        return -1;
    }
}`,
      harness: `import seekho.Check;

public class Main {
    public static void main(String[] args) {
        Solution s = new Solution();
        Check.eq("1 step: x=[1,2], y=[2,4], lr=0.1", 1.0, () -> s.fit(new double[]{1, 2}, new double[]{2, 4}, 0.1, 1));
        Check.eq("y=3x, 200 steps", 3.0, () -> s.fit(new double[]{1, 2, 3}, new double[]{3, 6, 9}, 0.05, 200));
        Check.hiddenFromHere();
        Check.eq("0 steps: w wahi 0", 0.0, () -> s.fit(new double[]{1, 2}, new double[]{2, 4}, 0.1, 0));
        Check.eq("negative slope y=-2x", -2.0, () -> s.fit(new double[]{1, 2}, new double[]{-2, -4}, 0.1, 100));
        Check.eq("lr bada (0.5): 3 steps mein diverge", 8.75, () -> s.fit(new double[]{1, 2}, new double[]{2, 4}, 0.5, 3));
    }
}`,
      hints: [
        "Har step mein pehle poore data pe gradient jodo, phir w update karo (beech mein nahi).",
        "Loop ke andar: <code>double g = 0; for (i...) g += (w * x[i] - y[i]) * x[i]; g = 2 * g / n;</code>",
        "<code>w -= lr * g;</code> aur end mein <code>return w;</code>"
      ],
      solution: `class Solution {
    double fit(double[] x, double[] y, double lr, int steps) {
        int n = x.length;
        double w = 0;
        for (int s = 0; s < steps; s++) {
            double g = 0;
            for (int i = 0; i < n; i++) g += (w * x[i] - y[i]) * x[i];
            g = 2 * g / n;
            w -= lr * g;
        }
        return w;
    }
}`,
      explain: `<p>Ye wahi loop hai jo PyTorch jaise frameworks arbon weights ke liye karte hain: loss ka gradient nikaalo, ulti taraf chhota kadam. Diverge wala test dikhata hai ki learning rate galat ho to training bigad jaati hai. Time: O(steps × n).</p>`
    },
    {
      type: "think",
      id: "think-ml-when",
      q: "Interviewer: \"Har problem ke liye ML/LLM kyun nahi? Kab simple rules ya normal code behtar hai?\" 3-4 points mein jawab do.",
      rubric: [
        { point: "Rules saaf aur kam badalne wale hon to code (jaise GST calculation, tax slabs)", keys: ["rule", "deterministic", "fixed", "tax", "saaf", "simple logic"], weight: 2 },
        { point: "ML ko labelled data chahiye; data nahi to model nahi", keys: ["data", "label", "examples", "training data"], weight: 2 },
        { point: "ML galat ho sakta hai (probabilistic); exact/100% sahi chahiye to code", keys: ["galat", "probabil", "accuracy", "exact", "error", "mistake"], weight: 2 },
        { point: "Kharcha, latency, explain karna mushkil", keys: ["cost", "kharcha", "latency", "explain", "debug", "slow"], weight: 1 }
      ],
      answer: `<ul><li>Jab rules saaf hain aur kam badalte hain (tax, discount, validation), normal code sasta, tez aur hamesha sahi hai.</li><li>ML ko achha, labelled data chahiye. Data nahi hai to pehle rules se shuru karo aur data jama karo.</li><li>ML probabilistic hai: kabhi kabhi galat hoga. Payment amount jaisi cheez pe ye chalega nahi.</li><li>ML model ka kharcha (training, GPUs), latency aur "isne aisa kyun kiya" explain karna mushkil hai.</li></ul><p>ML tab jab pattern itne complex ya badalte hue hon ki rules likhna practically namumkin ho (spam, image, language).</p>`
    },
    {
      type: "tip",
      html: `🎤 <b>Interview tip:</b> "Model = parameters wala function, training = loss kam karne ke liye gradient descent se parameters badalna, inference = fixed parameters se jawab" ye ek line mein bol do. Phir batao ki LLM mein bhi yahi hai, bas parameters arbon hain aur task "agla token predict karo" hai.`
    }
  ],
  references: [
    { title: "Build a Large Language Model (From Scratch), Appendix A (PyTorch basics)", by: "Sebastian Raschka (Manning)", url: "https://www.manning.com/books/build-a-large-language-model-from-scratch", type: "book" },
    { title: "Neural Networks: Zero to Hero", by: "Andrej Karpathy (YouTube)", url: "https://www.youtube.com/@karpathy", type: "video" },
    { title: "Generative AI and LLMs For Dummies", by: "David Baum (Snowflake Special Edition)", url: "https://www.snowflake.com/resource/generative-ai-and-llms-for-dummies/", type: "book" }
  ]
});
