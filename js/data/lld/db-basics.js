// Entities se tables
registerLesson("lld", "db-basics", {
  why: "LLD interview mein class diagram ke baad aksar poocha jaata hai: 'iska schema kya hoga?' Classes se tables ka rasta ek seedha process hai: entity → table, relationship ki multiplicity → foreign key ya junction table. Ye samajh liya to kisi bhi problem ka schema khud bana loge.",
  blocks: [
    {
      type: "text",
      html: `
        <h2>Basics: table, row, primary key, foreign key</h2>
        <ul>
          <li><b>Table</b> = ek entity type (users, orders). <b>Row</b> = ek object. <b>Column</b> = field.</li>
          <li><b>Primary key (PK)</b>: har row ki unique pehchaan. Aksar ek surrogate id (<code>BIGINT</code> auto-increment ya UUID). Natural keys (email, phone) badal sakte hain, isliye PK mat banao; unpe UNIQUE constraint lagao.</li>
          <li><b>Foreign key (FK)</b>: ek table ka column jo doosri table ki PK ko point kare. DB guarantee deta hai ki wo row exist karti hai (referential integrity).</li>
        </ul>
        <h2>Multiplicity → schema (yahi pura rule hai)</h2>
        <table>
          <tr><th>Rishta</th><th>Example</th><th>Schema</th></tr>
          <tr><td><b>1 : N</b></td><td>Customer 1 ── * Order</td><td>"N" wali table mein FK: <code>orders.customer_id → customers.id</code></td></tr>
          <tr><td><b>1 : 1</b></td><td>User 1 ── 1 Profile</td><td>Ek table mein FK + <b>UNIQUE</b> (<code>profiles.user_id UNIQUE</code>), ya same table mein columns</td></tr>
          <tr><td><b>M : N</b></td><td>Student * ── * Course</td><td>Beech mein <b>junction table</b>: <code>enrollments(student_id, course_id, enrolled_at)</code>, PK = (student_id, course_id)</td></tr>
          <tr><td>Composition (◆)</td><td>Order ◆── OrderItem</td><td>1:N + <code>ON DELETE CASCADE</code></td></tr>
        </table>
        <p><b>FK hamesha "many" side pe kyun?</b> Ek order ka ek hi customer hai, to order row mein ek <code>customer_id</code> aaram se aata hai. Customer row mein "saare order ids" rakhne ke liye list chahiye, jo ek column mein nahi aati (aur 1NF todti hai, agla lesson).</p>
        <pre class="code-static">CREATE TABLE customers (
  id      BIGINT PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  email   VARCHAR(255) NOT NULL UNIQUE
);
CREATE TABLE orders (
  id          BIGINT PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  status      VARCHAR(20) NOT NULL,
  created_at  TIMESTAMP NOT NULL
);
CREATE TABLE order_items (
  order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  BIGINT NOT NULL REFERENCES products(id),
  qty         INT NOT NULL CHECK (qty &gt; 0),
  unit_price  DECIMAL(10,2) NOT NULL,          -- order ke time ka price (snapshot)
  PRIMARY KEY (order_id, product_id)
);</pre>`
    },
    {
      type: "quiz",
      q: "<code>order_items</code> mein <code>unit_price</code> kyun rakha jab <code>products.price</code> already hai?",
      options: [
        "Galti hai, duplicate data",
        "Product ka price baad mein badal sakta hai; purane order ka bill us waqt ke price se hona chahiye (historical snapshot)",
        "Join se bachne ke liye",
        "DB ko zaroorat hai"
      ],
      answer: 1,
      why: "Ye denormalization nahi, alag fact hai: 'is order mein kis price pe bika'. Interview mein ye point bahut log miss karte hain."
    },
    {
      type: "think",
      id: "think-schema-library",
      q: "Library schema banao: <b>books</b> (ek title ki kai copies), <b>members</b>, <b>loans</b> (kaunsi copy kis member ne kab li, kab lautayi), aur <b>authors</b> (ek book ke kai authors, ek author ki kai books). Tables + main columns + PK/FK likho.",
      rubric: [
        { point: "<b>books</b> aur <b>book_copies</b> alag (copy → book_id FK)", keys: ["book_copies", "copies", "copy", "book_copy", "book_items"], weight: 2 },
        { point: "Authors M:N → <b>junction table</b> (book_authors)", keys: ["book_authors", "book_author", "junction", "author_id", "many to many", "m:n"], weight: 2 },
        { point: "<b>loans</b>: copy_id FK, member_id FK, issued_at, due_at, returned_at (nullable)", keys: ["loans", "loan", "copy_id", "member_id", "due", "returned"], weight: 2 },
        { point: "Copy ka status / ek copy ka ek hi active loan (unique jab returned_at null)", keys: ["status", "active loan", "unique", "returned_at is null", "available"] }
      ],
      answer: `<pre class="code-static">books(id PK, isbn UNIQUE, title)
authors(id PK, name)
book_authors(book_id FK, author_id FK, PK(book_id, author_id))     -- M:N
book_copies(id PK, book_id FK → books, status)                     -- 1:N
members(id PK, name, type, email UNIQUE)
loans(id PK, copy_id FK → book_copies, member_id FK → members,
      issued_at, due_at, returned_at NULL)                          -- action ka record</pre>
        <p>Process: har entity (noun) ek table → har 1:N ke liye many side mein FK → har M:N ke liye junction → har "action jiska record chahiye" (issue) ek table with timestamps. Ek copy ke do active loans na hon, ye agle lessons (constraints) mein enforce karenge.</p>`
    },
    {
      type: "order",
      id: "order-schema-process",
      q: "Class diagram se schema banane ka process:",
      items: [
        "Har entity (jiska apna identity / data ho) ke liye ek table + surrogate PK",
        "Value fields ko columns banao (type, NOT NULL, UNIQUE jahan zaroori)",
        "Har 1:N rishte ke liye 'many' side mein FK",
        "Har M:N rishte ke liye junction table (dono FKs, composite PK, apne extra columns)",
        "Composition wale rishton pe ON DELETE CASCADE, baaki pe RESTRICT",
        "Queries socho aur unke liye indexes (indexes lesson)"
      ]
    },
    {
      type: "pick",
      id: "pick-schema-mistakes",
      q: "Kaunse schema choices <b>galat</b> hain?",
      options: [
        { text: "<code>customers.order_ids</code> column mein comma-separated ids", correct: true, why: "Join/FK/index nahi ho sakta, aur 1NF toota. FK orders mein." },
        { text: "Email ko PK banana", correct: true, why: "Email badal sakta hai; har FK update karna padega. Surrogate id + UNIQUE email." },
        { text: "Paise ke liye <code>DECIMAL(12,2)</code> ya paise mein <code>BIGINT</code>", correct: false, why: "Sahi. FLOAT/DOUBLE galat hota." },
        { text: "Status ke liye ek column with allowed values (CHECK / enum)", correct: false, why: "Sahi aur simple." },
        { text: "Student-Course ke liye students table mein course1, course2, course3 columns", correct: true, why: "Repeating groups. Junction table chahiye." }
      ]
    },
    {
      type: "tip",
      html: "🎤 <b>Interview tip:</b> Schema bolte waqt har table ke saath ek line ka reason: <i>\"loans alag table kyunki issue ka apna data hai (dates) aur history chahiye.\"</i> Aur hamesha poocho: \"main queries kya hain?\" — schema queries ke liye bante hain."
    }
  ],
  references: [
    { title: "Designing Data-Intensive Applications, Ch. 2 (Data Models)", by: "Martin Kleppmann", url: "https://dataintensive.net/", type: "book" },
    { title: "Hello Interview: Low Level Design", by: "Hello Interview", url: "https://www.hellointerview.com/learn/low-level-design", type: "course" }
  ]
});
