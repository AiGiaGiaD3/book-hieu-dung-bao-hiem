/* =====================================================================
   NỘI DUNG SÁCH — tách riêng khỏi giao diện và tương tác.
   ---------------------------------------------------------------------
   Muốn thay bằng tài liệu thật, chỉ cần sửa file này:

   • Trang dạng HTML:   { type: "html",  html: "<div>…</div>" }
   • Trang dạng ảnh:    { type: "image", src: "assets/pages/p01.jpg",
                          alt: "Mô tả ngắn nội dung trang" }

   Quy ước cấu trúc:
   • cover            : bìa trước (bìa cứng)
   • insideFrontCover : mặt trong bìa trước (bìa cứng)
   • pages            : các trang nội dung — SỐ TRANG PHẢI LÀ SỐ CHẴN
                        (nếu lẻ, hệ thống tự thêm 1 trang ghi chú trống)
   • insideBackCover  : mặt trong bìa sau (bìa cứng)
   • backCover        : bìa sau (bìa cứng)

   Toàn bộ nội dung dưới đây là NỘI DUNG MINH HỌA cho bản mẫu,
   không mô tả bất kỳ sản phẩm hay quyền lợi bảo hiểm cụ thể nào.
   ===================================================================== */

(function () {
  /* ---------- Bộ hình line art dùng lại ---------- */
  const C = "#2B2B2B";   // charcoal
  const R = "#DA291C";   // đỏ Prudential
  const T = "#FBE3E0";   // đỏ nhạt (tint)

  const person = (x, y, s = 1, accent = false) => `
    <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="0" cy="-14" r="7" stroke="${accent ? R : C}" stroke-width="2" fill="${accent ? T : "none"}"/>
      <path d="M-12 12 C-12 -2 12 -2 12 12" stroke="${accent ? R : C}" stroke-width="2" fill="${accent ? T : "none"}"/>
    </g>`;

  const ART = {
    cover: `
      <svg viewBox="0 0 300 230" aria-hidden="true">
        <g fill="none" stroke="#FFF7EC" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M40 112 Q150 10 260 112"/>
          <path d="M40 112 Q58 98 76 112 Q94 98 112 112 Q131 98 150 112 Q169 98 188 112 Q206 98 224 112 Q242 98 260 112"/>
          <path d="M150 34 V28"/>
          <path d="M150 112 V196 Q150 210 138 210 Q128 210 126 200"/>
          <path d="M96 112 Q112 60 150 34 Q188 60 204 112" opacity=".55"/>
          <path d="M92 196 V158 L120 136 L148 158 V196 Z"/>
          <path d="M112 196 V176 H128 V196"/>
          <circle cx="198" cy="160" r="7"/><path d="M186 196 C186 176 210 176 210 196"/>
          <circle cx="224" cy="168" r="5.5"/><path d="M215 196 C215 182 233 182 233 196"/>
          <path d="M60 196 H250"/>
        </g>
      </svg>`,

    openBook: `
      <svg viewBox="0 0 200 110" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M100 30 C78 18 46 16 22 22 V92 C46 86 78 88 100 100 Z" stroke="${C}" fill="#fff"/>
          <path d="M100 30 C122 18 154 16 178 22 V92 C154 86 122 88 100 100 Z" stroke="${C}" fill="#fff"/>
          <path d="M100 30 V100" stroke="${C}"/>
          <path d="M36 40 C54 37 72 38 88 44 M36 54 C54 51 72 52 88 58 M36 68 C54 65 72 66 88 72" stroke="${C}" opacity=".45"/>
          <path d="M140 38 L148 50 L162 52 L152 62 L154 76 L140 69 L126 76 L128 62 L118 52 L132 50 Z" stroke="${R}" fill="${T}"/>
        </g>
      </svg>`,

    pooling: `
      <svg viewBox="0 0 240 170" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <circle cx="120" cy="86" r="58" stroke="${C}" stroke-dasharray="3 6" opacity=".55"/>
          <path d="M120 64 L140 71 V88 C140 100 131 108 120 112 C109 108 100 100 100 88 V71 Z" stroke="${R}" fill="${T}"/>
          <path d="M112 88 L118 94 L129 82" stroke="${R}"/>
        </g>
        ${person(120, 30, 0.9)} ${person(170, 52, 0.9)} ${person(170, 118, 0.9)}
        ${person(120, 150, 0.9)} ${person(70, 118, 0.9)} ${person(70, 52, 0.9, true)}
      </svg>`,

    umbrella: `
      <svg viewBox="0 0 220 120" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M40 62 Q110 0 180 62" stroke="${R}" fill="${T}"/>
          <path d="M40 62 Q57 52 75 62 Q92 52 110 62 Q127 52 145 62 Q162 52 180 62" stroke="${R}"/>
          <path d="M110 62 V100 Q110 110 101 110 Q94 110 93 103" stroke="${C}"/>
          <path d="M22 30 l-6 14 M34 18 l-6 14 M196 26 l-6 14 M206 44 l-6 14" stroke="${C}" opacity=".4"/>
        </g>
      </svg>`,

    risks: {
      health: `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M32 52 C14 40 8 30 8 22 a12 12 0 0 1 24 -4 a12 12 0 0 1 24 4 c0 8 -6 18 -24 30z" stroke="${C}"/><path d="M14 30 H24 L28 22 L34 38 L38 30 H50" stroke="${R}"/></g></svg>`,
      accident: `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="22" width="44" height="20" rx="10" transform="rotate(-35 32 32)" stroke="${C}"/><path d="M27 27 l10 10 M37 27 l-10 10" stroke="${R}"/></g></svg>`,
      income: `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="18" width="40" height="30" rx="5" stroke="${C}"/><path d="M48 28 H38 a5 5 0 0 0 0 10 H48" stroke="${C}"/><path d="M54 10 V26 M48 20 L54 26 L60 20" stroke="${R}"/></g></svg>`,
      aging: `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8 H46 M18 56 H46 M20 8 C20 24 44 24 44 32 C44 40 20 40 20 56 M44 8 C44 24 20 24 20 32 C20 40 44 40 44 56" stroke="${C}"/><path d="M26 50 Q32 44 38 50" stroke="${R}"/></g></svg>`
    },

    timeline: `
      <svg viewBox="0 0 300 74" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-width="2">
          <path d="M14 30 H286" stroke="${C}" opacity=".5"/>
          <circle cx="30" cy="30" r="9" stroke="${R}" fill="${T}"/>
          <circle cx="90" cy="30" r="9" stroke="${R}" fill="${T}"/>
          <circle cx="150" cy="30" r="9" stroke="${R}" fill="${T}"/>
          <circle cx="210" cy="30" r="9" stroke="${R}" fill="${T}"/>
          <circle cx="270" cy="30" r="9" stroke="${R}" fill="${T}"/>
        </g>
        <g font-family="Be Vietnam Pro, system-ui, sans-serif" font-size="10.5" fill="${C}" text-anchor="middle" font-weight="600">
          <text x="30" y="34" fill="${R}" font-size="9">1</text><text x="90" y="34" fill="${R}" font-size="9">2</text>
          <text x="150" y="34" fill="${R}" font-size="9">3</text><text x="210" y="34" fill="${R}" font-size="9">4</text>
          <text x="270" y="34" fill="${R}" font-size="9">5</text>
          <text x="30" y="58">Lập nghiệp</text><text x="90" y="58">Gia đình</text>
          <text x="150" y="58">Nuôi con</text><text x="210" y="58">Trung niên</text>
          <text x="270" y="58">Nghỉ hưu</text>
        </g>
      </svg>`,

    roles: `
      <svg viewBox="0 0 260 150" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M112 50 H148 L156 58 V100 H112 Z" stroke="${R}" fill="${T}"/>
          <path d="M120 66 H146 M120 76 H146 M120 86 H136" stroke="${R}"/>
          <path d="M70 40 L106 60 M190 40 L154 60 M70 112 L106 92 M190 112 L154 92" stroke="${C}" stroke-dasharray="3 5" opacity=".6"/>
        </g>
        ${person(52, 40, 0.95)} ${person(208, 40, 0.95)} ${person(52, 118, 0.95)}
        <g fill="none" stroke="${C}" stroke-width="2" stroke-linejoin="round"><path d="M194 132 V108 L208 98 L222 108 V132 Z M202 132 V120 H214 V132"/></g>
      </svg>`,

    steps: `
      <svg viewBox="0 0 300 60" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-width="2">
          <path d="M30 30 C60 4 70 56 90 30 S130 4 150 30 S190 56 210 30 S250 4 270 30" stroke="${C}" opacity=".35" stroke-dasharray="2 5"/>
        </g>
        <g font-family="Be Vietnam Pro, system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle">
          ${[30, 90, 150, 210, 270].map((x, i) => `<circle cx="${x}" cy="30" r="15" fill="${i === 4 ? R : "#fff"}" stroke="${R}" stroke-width="2"/><text x="${x}" y="35" fill="${i === 4 ? "#fff" : R}">${i + 1}</text>`).join("")}
        </g>
      </svg>`,

    bulb: `
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2">
          <path d="M40 14 a18 18 0 0 0 -10 33 V56 H50 V47 a18 18 0 0 0 -10 -33z" stroke="${R}" fill="${T}"/>
          <path d="M32 62 H48 M34 68 H46" stroke="${C}"/>
          <path d="M40 4 V8 M16 14 l3 3 M64 14 l-3 3 M8 36 h4 M68 36 h4" stroke="${C}" opacity=".5"/>
        </g>
      </svg>`
  };

  /* ---------- Nội dung sách ---------- */
  window.BOOK_CONTENT = {
    meta: {
      title: "Hiểu đúng bảo hiểm",
      subtitle: "Cẩm nang nền tảng cho người làm tư vấn",
      edition: "Bản mẫu tương tác",
      disclaimer: "Nội dung minh họa"
    },

    cover: {
      type: "html",
      html: `
        <div class="cover">
          <div class="cover-top">
            <span class="cover-tag">Bản mẫu · Nội dung minh họa</span>
          </div>
          <div class="cover-art">${ART.cover}</div>
          <div class="cover-text">
            <h1 class="cover-title">Hiểu đúng<br>bảo hiểm</h1>
            <p class="cover-sub">Cẩm nang nền tảng cho người làm tư vấn</p>
          </div>
          <div class="cover-bottom"><span class="cover-rule"></span><span>Tư vấn viên · Quản lý · Giảng viên</span></div>
        </div>`
    },

    insideFrontCover: {
      type: "html",
      html: `
        <div class="endpaper">
          <div class="endpaper-pattern" aria-hidden="true"></div>
          <div class="endpaper-card">
            <p class="kicker">Lưu ý</p>
            <p>Đây là <strong>bản mẫu</strong> để thử nghiệm trải nghiệm đọc sách tương tác.</p>
            <p>Toàn bộ nội dung bên trong là <strong>nội dung minh họa</strong>, không mô tả sản phẩm, điều khoản hay quyền lợi bảo hiểm cụ thể nào.</p>
          </div>
        </div>`
    },

    pages: [
      /* 1 — Trang tên sách */
      {
        type: "html",
        html: `
          <div class="pg-center">
            <div class="fig fig--sm">${ART.openBook}</div>
            <p class="kicker">Cẩm nang nền tảng</p>
            <h2 class="title title--xl">Hiểu đúng<br>bảo hiểm</h2>
            <p class="lead">Những ý niệm cốt lõi giúp người làm tư vấn giải thích bảo hiểm một cách rõ ràng, trung thực và gần gũi.</p>
            <div class="divider"></div>
            <p class="small">Dành cho tư vấn viên mới, quản lý kèm cặp<br>và giảng viên dẫn dắt lớp học.</p>
          </div>`
      },

      /* 2 — Mục lục */
      {
        type: "html",
        html: `
          <p class="kicker">Mục lục</p>
          <h2 class="title">Trong cuốn sách này</h2>
          <ol class="toc">
            <li><span class="toc-n">01</span><span class="toc-t">Bảo hiểm là gì?</span><span class="toc-p">3</span></li>
            <li><span class="toc-n">02</span><span class="toc-t">Hình dung bằng một chiếc ô</span><span class="toc-p">4</span></li>
            <li><span class="toc-n">03</span><span class="toc-t">Những rủi ro trong cuộc đời</span><span class="toc-p">5</span></li>
            <li><span class="toc-n">04</span><span class="toc-t">Nhu cầu thay đổi theo từng giai đoạn</span><span class="toc-p">6</span></li>
            <li><span class="toc-n">05</span><span class="toc-t">Các vai trò trong một hợp đồng</span><span class="toc-p">7</span></li>
            <li><span class="toc-n">06</span><span class="toc-t">Tư vấn có trách nhiệm</span><span class="toc-p">8</span></li>
            <li><span class="toc-n">07</span><span class="toc-t">Những hiểu lầm thường gặp</span><span class="toc-p">9</span></li>
            <li><span class="toc-n">08</span><span class="toc-t">Ghi nhớ &amp; tự kiểm tra</span><span class="toc-p">10</span></li>
          </ol>
          <div class="box box--quiet">
            <p><strong>Cách dùng:</strong> đọc theo thứ tự, hoặc mở đúng chương cần ôn trước buổi gặp khách hàng.</p>
          </div>`
      },

      /* 3 — Chương 1 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 01</p>
          <h2 class="title">Bảo hiểm là gì?</h2>
          <p class="lead">Bảo hiểm là cách nhiều người cùng góp một phần nhỏ để san sẻ gánh nặng tài chính khi rủi ro xảy đến với một vài người trong số đó.</p>
          <div class="fig">${ART.pooling}</div>
          <ul class="list">
            <li><strong>Số đông bù số ít:</strong> rủi ro của một người được chia sẻ cho cả cộng đồng tham gia.</li>
            <li><strong>Chuyển giao rủi ro:</strong> thay vì tự gánh toàn bộ, người tham gia chuyển một phần gánh nặng tài chính cho doanh nghiệp bảo hiểm.</li>
          </ul>`
      },

      /* 4 — Chương 2 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 02</p>
          <h2 class="title">Hình dung bằng một chiếc ô</h2>
          <div class="fig fig--md">${ART.umbrella}</div>
          <p>Không ai mang ô vì chắc chắn trời sẽ mưa. Ta mang ô vì <strong>không biết lúc nào trời mưa</strong>, và khi mưa đến thì đã quá muộn để đi mua.</p>
          <div class="grid2">
            <div class="box"><p class="box-h">Chiếc ô không ngăn mưa</p><p>Bảo hiểm không ngăn rủi ro xảy ra.</p></div>
            <div class="box"><p class="box-h">Nhưng giúp ta không ướt sũng</p><p>Bảo hiểm giúp giảm tác động tài chính khi rủi ro xảy ra.</p></div>
          </div>
          <p class="note">Gợi ý cho giảng viên: hỏi học viên một ví dụ “chiếc ô” trong đời sống của chính họ.</p>`
      },

      /* 5 — Chương 3 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 03</p>
          <h2 class="title">Những rủi ro trong cuộc đời</h2>
          <p class="lead">Mỗi người, mỗi gia đình đều có thể đối mặt với những nhóm rủi ro phổ biến sau:</p>
          <div class="icon-grid">
            <div class="icon-card"><div class="ic">${ART.risks.health}</div><p class="box-h">Sức khỏe</p><p>Ốm đau, bệnh tật cần điều trị dài ngày.</p></div>
            <div class="icon-card"><div class="ic">${ART.risks.accident}</div><p class="box-h">Tai nạn</p><p>Sự cố bất ngờ trong sinh hoạt, đi lại, làm việc.</p></div>
            <div class="icon-card"><div class="ic">${ART.risks.income}</div><p class="box-h">Gián đoạn thu nhập</p><p>Khi trụ cột tài chính không thể tiếp tục làm việc.</p></div>
            <div class="icon-card"><div class="ic">${ART.risks.aging}</div><p class="box-h">Tuổi già</p><p>Sống lâu hơn dự tính mà chưa đủ nguồn chi tiêu.</p></div>
          </div>
          <p class="note">Câu hỏi gợi mở: “Nếu một trong những điều này xảy ra, ai trong gia đình sẽ chịu ảnh hưởng nhiều nhất?”</p>`
      },

      /* 6 — Chương 4 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 04</p>
          <h2 class="title">Nhu cầu thay đổi theo từng giai đoạn</h2>
          <p class="lead">Không có một giải pháp chung cho mọi người. Nhu cầu bảo vệ thay đổi theo trách nhiệm tài chính ở mỗi chặng đời.</p>
          <div class="fig">${ART.timeline}</div>
          <table class="tbl">
            <tr><th>Giai đoạn</th><th>Điều thường được quan tâm</th></tr>
            <tr><td>Lập nghiệp</td><td>Xây nền tảng, thói quen tiết kiệm</td></tr>
            <tr><td>Gia đình</td><td>Trách nhiệm với người thân, khoản vay</td></tr>
            <tr><td>Nuôi con</td><td>Kế hoạch học tập cho con</td></tr>
            <tr><td>Trung niên</td><td>Sức khỏe, tích lũy cho tương lai</td></tr>
            <tr><td>Nghỉ hưu</td><td>Nguồn chi tiêu ổn định, an tâm</td></tr>
          </table>`
      },

      /* 7 — Chương 5 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 05</p>
          <h2 class="title">Các vai trò trong một hợp đồng</h2>
          <div class="fig fig--md">${ART.roles}</div>
          <dl class="defs">
            <dt>Bên mua bảo hiểm</dt><dd>Người đứng tên ký hợp đồng và đóng phí.</dd>
            <dt>Người được bảo hiểm</dt><dd>Người mà rủi ro của họ được hợp đồng bảo vệ.</dd>
            <dt>Người thụ hưởng</dt><dd>Người được chỉ định nhận quyền lợi theo hợp đồng.</dd>
            <dt>Doanh nghiệp bảo hiểm</dt><dd>Tổ chức nhận chuyển giao rủi ro và thực hiện cam kết.</dd>
          </dl>
          <p class="note">Mô tả khái niệm chung để học tập. Luôn đối chiếu quy định hiện hành và tài liệu chính thức.</p>`
      },

      /* 8 — Chương 6 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 06</p>
          <h2 class="title">Tư vấn có trách nhiệm</h2>
          <p class="lead">Một cuộc tư vấn tốt bắt đầu từ khách hàng, không bắt đầu từ sản phẩm.</p>
          <div class="fig">${ART.steps}</div>
          <ol class="steps">
            <li><strong>Lắng nghe</strong> — hiểu hoàn cảnh và mối bận tâm thật sự.</li>
            <li><strong>Tìm hiểu</strong> — hỏi về gia đình, thu nhập, kế hoạch.</li>
            <li><strong>Phân tích</strong> — cùng khách hàng xác định nhu cầu ưu tiên.</li>
            <li><strong>Giải thích rõ</strong> — nói cả quyền lợi lẫn giới hạn, trách nhiệm.</li>
            <li><strong>Đồng hành</strong> — theo sát khi hoàn cảnh khách hàng thay đổi.</li>
          </ol>`
      },

      /* 9 — Chương 7 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 07</p>
          <h2 class="title">Những hiểu lầm thường gặp</h2>
          <div class="myth">
            <p class="myth-q">“Tôi còn trẻ, khỏe, chưa cần nghĩ tới.”</p>
            <p class="myth-a">Nhu cầu bảo vệ gắn với trách nhiệm tài chính và kế hoạch của mỗi người, không chỉ phụ thuộc vào tuổi tác.</p>
          </div>
          <div class="myth">
            <p class="myth-q">“Bảo hiểm nào cũng giống nhau.”</p>
            <p class="myth-a">Mỗi giải pháp có mục đích, điều kiện và giới hạn riêng. Cần đọc kỹ tài liệu trước khi quyết định.</p>
          </div>
          <div class="myth">
            <p class="myth-q">“Ký xong là xong.”</p>
            <p class="myth-a">Hợp đồng cần được xem lại định kỳ khi gia đình, công việc hay mục tiêu thay đổi.</p>
          </div>`
      },

      /* 10 — Chương 8 */
      {
        type: "html",
        html: `
          <p class="kicker">Chương 08</p>
          <h2 class="title">Ghi nhớ &amp; tự kiểm tra</h2>
          <div class="recap">
            <div class="fig fig--icon">${ART.bulb}</div>
            <ul class="list list--tight">
              <li>Bảo hiểm là chia sẻ và chuyển giao rủi ro.</li>
              <li>Nhu cầu khác nhau theo từng giai đoạn.</li>
              <li>Tư vấn bắt đầu từ việc lắng nghe.</li>
            </ul>
          </div>
          <p class="box-h">Tự hỏi mình</p>
          <ol class="quiz">
            <li>Tôi có thể giải thích “số đông bù số ít” trong một câu không?</li>
            <li>Tôi đã hỏi đủ về hoàn cảnh khách hàng chưa?</li>
            <li>Tôi đã nói rõ cả giới hạn của giải pháp chưa?</li>
          </ol>
          <div class="lines" aria-hidden="true"><span></span><span></span><span></span></div>`
      }
    ],

    insideBackCover: {
      type: "html",
      html: `
        <div class="endpaper">
          <div class="endpaper-pattern" aria-hidden="true"></div>
          <div class="endpaper-card">
            <p class="kicker">Hết sách</p>
            <p>Cảm ơn bạn đã đọc bản mẫu.</p>
            <p class="small">Phiên bản chính thức sẽ thay các trang này bằng tài liệu đào tạo thật.</p>
          </div>
        </div>`
    },

    backCover: {
      type: "html",
      html: `
        <div class="cover cover--back">
          <div class="back-text">
            <p class="back-quote">“Hiểu đúng để tư vấn đúng —<br>tư vấn đúng để khách hàng an tâm.”</p>
            <span class="cover-rule"></span>
            <p class="back-note">Bản mẫu trải nghiệm đọc sách tương tác.<br>Nội dung minh họa, không dùng để tư vấn thực tế.</p>
          </div>
        </div>`
    }
  };
})();
