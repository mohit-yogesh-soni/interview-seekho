// Normalization (1NF, 2NF, 3NF)
registerLesson("lld", "normalization", {
  why: "Normalization ka ek hi goal hai: ek fact ek hi jagah ho, taaki update karte waqt data aapas mein contradict na kare. Normal forms ke rules ratne ki zaroorat nahi; har rule ek specific 'anomaly' (bug) ko rokta hai. Wo bug dikh gaya to rule khud samajh aata hai.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Ek kharab table</h2>
        <table>
          <tr><th>order_id</th><th>customer</th><th>customer_city</th><th>items</th><th>product_name</th><th>product_price</th></tr>
          <tr><td>1</td><td>Riya</td><td>Pune</td><td>P1, P2</td><td>Pen, Book</td><td>10, 200</td></tr>
          <tr><td>2</td><td>Riya</td><td>Mumbai</td><td>P1</td><td>Pen</td><td>10</td></tr>
        </table>
        <p>Teen tarah ke bugs (anomalies):</p>
        <ul>
          <li><b>Update anomaly:</b> Riya shift hui, ek row mein city badli, doosri mein nahi. Ab Riya Pune mein hai ya Mumbai?</li>
          <li><b>Insert anomaly:</b> naya product jo kisi ne order nahi kiya, uska price kahan rakhein? Order ke bina row hi nahi.</li>
          <li><b>Delete anomaly:</b> order 2 delete kiya aur agar wahi Pen ka akela order tha, Pen ka price bhi gaya.</li>
        </ul>
        <h2>1NF: har cell mein ek atomic value</h2>
        <p>"P1, P2" ek cell mein = list. Search ("kisne P2 kharida?"), join, FK sab mushkil. Fix: <code>order_items(order_id, product_id)</code> mein har item ek row.</p>
        <h2>2NF: composite key ke <b>poore</b> hisse pe depend karo</h2>
        <p><code>order_items(order_id, product_id, qty, product_name)</code>: PK = (order_id, product_id). <code>qty</code> dono pe depend karta hai (is order mein is product kitne). Par <code>product_name</code> sirf <code>product_id</code> pe: <b>partial dependency</b>. Har order mein naam copy = update anomaly. Fix: <code>products(id, name, price)</code> alag.</p>
        <h2>3NF: non-key column doosre non-key column pe depend na kare</h2>
        <p><code>orders(id, customer_id, customer_city)</code>: city customer pe depend karti hai, order pe nahi (<b>transitive</b>: order → customer → city). Fix: city <code>customers</code> mein.</p>
        <p>Yaad rakhne ki ek line (classic): <i>"Every non-key attribute must depend on the key, the whole key, and nothing but the key."</i> — key (1NF ke baad), whole key (2NF), nothing but the key (3NF).</p>`
    },
    {
      type: "pick",
      id: "pick-nf",
      q: "<code>enrollments(student_id, course_id, grade, student_name, course_instructor, instructor_phone)</code>, PK = (student_id, course_id). Kaunse columns galat jagah hain?",
      options: [
        { text: "<code>grade</code>", correct: false, why: "Is student ka is course mein grade: poori key pe depend. Sahi jagah." },
        { text: "<code>student_name</code>", correct: true, why: "Sirf student_id pe (partial, 2NF toota). students table mein." },
        { text: "<code>course_instructor</code>", correct: true, why: "Sirf course_id pe (2NF). courses table mein." },
        { text: "<code>instructor_phone</code>", correct: true, why: "Instructor pe depend (transitive, 3NF bhi). instructors table mein." }
      ],
      answer: "Fix: <code>students(id, name)</code>, <code>instructors(id, phone)</code>, <code>courses(id, instructor_id)</code>, <code>enrollments(student_id, course_id, grade)</code>."
    },
    {
      type: "text",
      html: `
        <h2>Denormalization: kab jaan-boojh ke todte hain</h2>
        <p>Normalized schema writes ke liye safe hai par reads mein joins badhte hain. Bahut read-heavy jagah pe ek fact copy karte hain, <b>reason ke saath</b>:</p>
        <ul>
          <li><b>Counters:</b> <code>posts.like_count</code> (har baar <code>COUNT(*)</code> on likes mehenga). Like pe dono update, ek transaction mein.</li>
          <li><b>Read models / reporting:</b> analytics tables jahan join pehle se karke rakha.</li>
          <li><b>NoSQL documents:</b> order document mein customer ka naam embed (sql-nosql lesson).</li>
          <li><b>Historical snapshot</b> (<code>order_items.unit_price</code>) denormalization nahi hai: wo alag fact hai.</li>
        </ul>
        <p>Rule: pehle normalize, phir measured performance problem pe denormalize, aur copy ko sync rakhne ka tareeka (transaction / trigger / event) batao.</p>`
    },
    {
      type: "think",
      id: "think-normalize",
      q: "Is table ko 3NF tak todo: <code>rides(ride_id, rider_name, rider_phone, driver_id, driver_name, car_number, car_model, fare, city)</code>. Ek driver ki ek car hai. (city = ride ki city.)",
      rubric: [
        { point: "<b>riders</b> alag (rider_id, name, phone); rides mein rider_id FK", keys: ["riders", "rider_id"], weight: 2 },
        { point: "<b>drivers</b> alag (driver_id, name)", keys: ["drivers", "driver table"], weight: 2 },
        { point: "Car driver pe depend (transitive): <b>cars</b> table ya drivers mein car columns", keys: ["cars", "car_number", "car table", "transitive"], weight: 2 },
        { point: "rides mein sirf ride ki cheezein: fare, city, rider_id, driver_id", keys: ["fare", "city", "ride ki"] }
      ],
      answer: `<pre class="code-static">riders(id PK, name, phone UNIQUE)
drivers(id PK, name)
cars(number PK, model, driver_id FK UNIQUE)      -- 1:1 driver-car
rides(id PK, rider_id FK, driver_id FK, fare, city, started_at)</pre>
        <p>Har fact ek jagah: driver ka naam badla to ek row. Car model galti se do rides mein alag nahi ho sakta. Agar driver gaadi badalta hai aur historical ride ki car chahiye, to <code>rides.car_number</code> bhi rakho (snapshot, reason ke saath).</p>`
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> NF ke naam se zyada ye bolo: <i>\"Main har fact ek jagah rakhta hoon taaki update anomaly na ho; like_count jaise hot read ke liye denormalize karunga aur same transaction mein update.\"</i>"
    }
  ],
  references: [
    { title: "Designing Data-Intensive Applications, Ch. 2", by: "Martin Kleppmann", url: "https://dataintensive.net/", type: "book" },
    { title: "Database System Concepts (Ch. on Relational Database Design)", by: "Silberschatz, Korth, Sudarshan", type: "book" }
  ]
});
