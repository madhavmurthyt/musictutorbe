const express = require('express');
const router = express.Router();
// const tutorService = require('../services/tutor.service');

const APP_NAME = 'Naada Guru';
const CONTACT_EMAIL = '';

// function escapeHtml(str) {
//   if (!str) return '';
//   return String(str)
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;');
// }

// function getInitials(name) {
//   if (!name) return '?';
//   return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
// }

// function renderStars(rating) {
//   const full = Math.floor(rating);
//   let stars = '';
//   for (let i = 0; i < full; i++) stars += '&#9733;';
//   for (let i = full; i < 5; i++) stars += '&#9734;';
//   return stars + ' ' + rating.toFixed(1);
// }

// function renderTeacherCards(tutors) {
//   if (!tutors || tutors.length === 0) {
//     return '<div class="teachers-empty">Teachers are joining soon. Check back shortly!</div>';
//   }
//
//   return tutors.map(t => {
//     const name = escapeHtml(t.name) || 'Teacher';
//     const instrument = escapeHtml(t.instrument) || 'Music';
//     const experience = t.yearsOfExperience;
//     const rating = parseFloat(t.rating) || 0;
//     const reviewCount = t.reviewCount || 0;
//     const loc = t.location || {};
//     const location = [loc.city, loc.state].filter(Boolean).map(escapeHtml).join(', ');
//
//     const avatarContent = t.photoUrl
//       ? `<img src="${escapeHtml(t.photoUrl)}" alt="${name}">`
//       : getInitials(t.name);
//
//     const detailParts = [];
//     if (experience) detailParts.push(experience + ' yrs experience');
//     if (location) detailParts.push(location);
//
//     return `<div class="teacher-card">
//       <div class="teacher-avatar">${avatarContent}</div>
//       <h4>${name}</h4>
//       <div class="instrument">${instrument}</div>
//       ${detailParts.length ? `<div class="details">${detailParts.join(' &middot; ')}</div>` : ''}
//       ${rating > 0 ? `<div class="rating">${renderStars(rating)} (${reviewCount})</div>` : ''}
//     </div>`;
//   }).join('');
// }

function buildLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME} — Learn Indian Classical Music from Expert Teachers</title>
  <meta name="description" content="Connect with expert Indian classical music teachers. Learn Mridangam, Vocal, Violin, Veena, Flute, Tabla and more from the comfort of your home.">
  <meta property="og:title" content="${APP_NAME} — Learn Indian Classical Music">
  <meta property="og:description" content="Find your perfect guru. Learn Carnatic and Hindustani classical music from expert teachers worldwide.">
  <meta property="og:type" content="website">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --primary: #312E81;
      --primary-light: #4338CA;
      --secondary: #0D9488;
      --secondary-light: #14B8A6;
      --student-accent: #3B82F6;
      --teacher-accent: #10B981;
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --text: #0F172A;
      --text-muted: #64748B;
      --amber: #92400E;
      --amber-light: #F59E0B;
      --amber-bg: #FFFBEB;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
    }

    /* ---- NAV ---- */
    nav {
      background: var(--primary);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .nav-brand {
      color: #F59E0B;
      font-size: 1.5rem;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: 0.5px;
    }
    .nav-links { display: flex; gap: 1.5rem; align-items: center; }
    .nav-links a {
      color: #E0E7FF;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: #F59E0B; }

    /* ---- HERO ---- */
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, #1E1B4B 100%);
      color: white;
      padding: 5rem 2rem 4rem;
      text-align: center;
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    .hero h1 .gold { color: #F59E0B; }
    .hero p {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      color: #C7D2FE;
      max-width: 640px;
      margin: 0 auto 2.5rem;
    }
    .hero-cta {
      display: inline-flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .btn {
      display: inline-block;
      padding: 0.85rem 2rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
      cursor: pointer;
      border: none;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .btn-student { background: var(--student-accent); color: white; }
    .btn-teacher { background: var(--teacher-accent); color: white; }
    .btn-outline { background: transparent; color: white; border: 2px solid rgba(255,255,255,0.4); }
    .btn-outline:hover { border-color: #F59E0B; color: #F59E0B; }

    /* ---- INSTRUMENTS BAR ---- */
    .instruments-bar {
      background: var(--amber-bg);
      border-top: 3px solid var(--amber-light);
      padding: 1.5rem 2rem;
      text-align: center;
    }
    .instruments-bar p {
      color: var(--amber);
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
    }
    .instrument-tags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }
    .instrument-tag {
      background: white;
      border: 1px solid #F59E0B;
      color: var(--amber);
      padding: 0.35rem 0.85rem;
      border-radius: 2rem;
      font-size: 0.85rem;
      font-weight: 500;
    }

    /* ---- SECTIONS ---- */
    section { padding: 4rem 2rem; }
    .container { max-width: 1100px; margin: 0 auto; }
    .section-title {
      text-align: center;
      font-size: 1.75rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    .section-subtitle {
      text-align: center;
      color: var(--text-muted);
      font-size: 1.05rem;
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* ---- TWO-COLUMN CARDS ---- */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }

    .role-card {
      background: var(--surface);
      border-radius: 1rem;
      padding: 2.5rem 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border-top: 4px solid transparent;
      transition: box-shadow 0.2s;
    }
    .role-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .role-card.student { border-top-color: var(--student-accent); }
    .role-card.teacher { border-top-color: var(--teacher-accent); }
    .role-card .icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .role-card h3 {
      font-size: 1.35rem;
      margin-bottom: 0.75rem;
      color: var(--primary);
    }
    .role-card ul {
      list-style: none;
      padding: 0;
    }
    .role-card li {
      padding: 0.4rem 0;
      padding-left: 1.5rem;
      position: relative;
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    .role-card li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.7rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .role-card.student li::before { background: var(--student-accent); }
    .role-card.teacher li::before { background: var(--teacher-accent); }

    /* ---- HOW IT WORKS ---- */
    .how-it-works { background: white; }
    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 2rem;
    }
    .step {
      text-align: center;
      padding: 1.5rem;
    }
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .step h4 {
      font-size: 1.1rem;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    .step p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* ---- FEATURED TEACHERS ---- */
    .teachers-section { background: var(--bg); }
    .teachers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .teacher-card {
      background: var(--surface);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: box-shadow 0.2s;
    }
    .teacher-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .teacher-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    .teacher-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .teacher-card h4 {
      font-size: 1.05rem;
      color: var(--text);
      margin-bottom: 0.25rem;
    }
    .teacher-card .instrument {
      color: var(--secondary);
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.35rem;
    }
    .teacher-card .details {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .teacher-card .rating {
      color: var(--amber);
      font-weight: 600;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    .teachers-empty {
      text-align: center;
      color: var(--text-muted);
      padding: 2rem;
      font-size: 1rem;
    }

    /* ---- WHY SECTION ---- */
    .why-section { background: white; }
    .why-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .why-card {
      padding: 1.5rem;
      border-radius: 0.75rem;
      background: var(--bg);
    }
    .why-card .icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .why-card h4 {
      color: var(--primary);
      margin-bottom: 0.5rem;
      font-size: 1.05rem;
    }
    .why-card p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    /* ---- CTA BANNER ---- */
    .cta-banner {
      background: linear-gradient(135deg, var(--primary) 0%, #1E1B4B 100%);
      color: white;
      text-align: center;
      padding: 4rem 2rem;
    }
    .cta-banner h2 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    .cta-banner p {
      color: #C7D2FE;
      margin-bottom: 2rem;
      font-size: 1.05rem;
    }

    /* ---- FOOTER ---- */
    footer {
      background: #1E1B4B;
      color: #94A3B8;
      padding: 2.5rem 2rem;
      text-align: center;
      font-size: 0.9rem;
    }
    footer a { color: #A5B4FC; text-decoration: none; }
    footer a:hover { color: #F59E0B; }
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .footer-brand {
      color: #F59E0B;
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav>
    <a href="/" class="nav-brand">${APP_NAME}</a>
    <div class="nav-links">
      <a href="#students">Students</a>
      <a href="#teachers">Teachers</a>
      <a href="#how-it-works">How It Works</a>
    </div>
  </nav>

  <!-- HERO -->
  <div class="hero">
    <h1>Learn Indian Classical Music<br>from <span class="gold">Expert Teachers</span></h1>
    <p>
      ${APP_NAME} connects you with experienced Carnatic and Hindustani classical music
      teachers. Learn Mridangam, Vocal, Violin, Veena, Flute, and more — from the comfort of your home.
    </p>
    <div class="hero-cta">
      <a href="#students" class="btn btn-student">I Want to Learn</a>
      <a href="#teachers" class="btn btn-teacher">I Want to Teach</a>
    </div>
  </div>

  <!-- INSTRUMENTS BAR -->
  <div class="instruments-bar">
    <p>Instruments on ${APP_NAME}</p>
    <div class="instrument-tags">
      <span class="instrument-tag">Mridangam</span>
      <span class="instrument-tag">Vocal</span>
      <span class="instrument-tag">Violin</span>
      <span class="instrument-tag">Veena</span>
      <span class="instrument-tag">Flute</span>
      <span class="instrument-tag">Ghatam</span>
      <span class="instrument-tag">Kanjira</span>
      <span class="instrument-tag">Morsing</span>
      <span class="instrument-tag">Tabla</span>
      <span class="instrument-tag">&amp; More</span>
    </div>
  </div>

  <!-- FOR STUDENTS / FOR TEACHERS -->
  <section>
    <div class="container">
      <h2 class="section-title">Who Is ${APP_NAME} For?</h2>
      <p class="section-subtitle">Whether you want to learn or teach, ${APP_NAME} brings the guru-shishya tradition into the digital age.</p>
      <div class="two-col">
        <div class="role-card student" id="students">
          <div class="icon">&#127891;</div>
          <h3>For Students</h3>
          <ul>
            <li>Find your Indian classical music teacher</li>
            <li>Browse by instrument, location, rate, and experience level</li>
            <li>Read reviews and ratings from other students</li>
            <li>Send inquiries with your preferred schedule</li>
            <li>From beginner to advanced — teachers for every level</li>
          </ul>
        </div>
        <div class="role-card teacher" id="teachers">
          <div class="icon">&#127911;</div>
          <h3>For Teachers</h3>
          <ul>
            <li>Reach students who are actively looking for a guru</li>
            <li>Create your professional profile in minutes</li>
            <li>Set your own rates, availability, and instruments</li>
            <li>Manage student inquiries from a simple dashboard</li>
            <li>Build your reputation with reviews and ratings</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="how-it-works" id="how-it-works">
    <div class="container">
      <h2 class="section-title">How It Works</h2>
      <p class="section-subtitle">Get started in three simple steps</p>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h4>Sign Up</h4>
          <p>Create your account with Google, Apple, or Facebook. Choose your role — student or teacher.</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h4>Connect</h4>
          <p>Students browse teachers and send inquiries. Teachers review and accept students that are a good fit.</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h4>Learn</h4>
          <p>Start your musical journey with personalized lessons from an expert teacher.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURED TEACHERS (coming soon) -->
  <section class="teachers-section" id="featured-teachers">
    <div class="container">
      <h2 class="section-title">Meet Our Teachers</h2>
      <p class="section-subtitle">Expert musicians ready to share their knowledge</p>
      <div class="teachers-empty" style="padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 1rem;">&#127925;</div>
        <p style="font-size: 1.1rem; font-weight: 600; color: #312E81; margin-bottom: 0.5rem;">Coming Soon</p>
        <p style="color: #64748B;">We are onboarding talented teachers. Check back shortly!</p>
      </div>
    </div>
  </section>

  <!-- WHY NAADA GURU -->
  <section class="why-section">
    <div class="container">
      <h2 class="section-title">Why ${APP_NAME}?</h2>
      <p class="section-subtitle">Built with respect for the guru-shishya tradition</p>
      <div class="why-grid">
        <div class="why-card">
          <div class="icon">&#127758;</div>
          <h4>Learn from Anywhere</h4>
          <p>Connect with teachers across time zones. Set your availability and find a teacher whose schedule works for you.</p>
        </div>
        <div class="why-card">
          <div class="icon">&#11088;</div>
          <h4>Verified Reviews</h4>
          <p>Read honest reviews from real students. Choose a teacher with confidence based on ratings and experience.</p>
        </div>
        <div class="why-card">
          <div class="icon">&#127925;</div>
          <h4>Every Instrument</h4>
          <p>Mridangam, Vocal, Violin, Veena, Flute, Ghatam, Tabla, and more. Find the right teacher for your instrument.</p>
        </div>
        <div class="why-card">
          <div class="icon">&#128176;</div>
          <h4>No Ads, Ever</h4>
          <p>Learning music deserves a distraction-free environment. ${APP_NAME} will never show you ads.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA BANNER -->
  <div class="cta-banner">
    <h2>Ready to Start Your Musical Journey?</h2>
    <p>Download ${APP_NAME} and connect with your perfect guru today.</p>
    <div class="hero-cta">
      <a href="#how-it-works" class="btn btn-outline">Learn More</a>
    </div>
  </div>

  <!-- FOOTER -->
  <footer>
    <div class="footer-brand">${APP_NAME}</div>
    <div class="footer-links">
      <a href="/legal/privacy">Privacy Policy</a>
      <a href="/legal/terms">Terms of Service</a>
    </div>
    <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    <p style="margin-top: 0.5rem; font-size: 0.8rem; color: #64748B;">
      "Teacher of Divine Sound" — Connecting the guru-shishya tradition with the digital world.
    </p>
  </footer>

</body>
</html>`;
}

router.get('/', (req, res) => {
  res.type('html').send(buildLandingPage());
});

// router.get('/', async (req, res, next) => {
//   try {
//     const result = await tutorService.listTutors({
//       sortBy: 'rating',
//       sortOrder: 'desc',
//       limit: 6,
//       page: 1,
//     });
//     const teacherCardsHtml = renderTeacherCards(result.tutors);
//     res.type('html').send(buildLandingPage(teacherCardsHtml));
//   } catch (err) {
//     const teacherCardsHtml = renderTeacherCards([]);
//     res.type('html').send(buildLandingPage(teacherCardsHtml));
//   }
// });

module.exports = router;
