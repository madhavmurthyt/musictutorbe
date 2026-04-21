const express = require('express');
const router = express.Router();

const APP_NAME = 'Naada Guru';
const CONTACT_EMAIL = 'madhavmurthyt@gmail.com';
const EFFECTIVE_DATE = 'April 21, 2026';

const pageWrapper = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — ${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: #1a1a2e;
      background: #fafafa;
      padding: 2rem 1rem;
    }
    .container { max-width: 720px; margin: 0 auto; }
    h1 {
      font-size: 1.75rem;
      color: #312e81;
      margin-bottom: 0.25rem;
    }
    .app-name { color: #92400e; font-weight: 600; }
    .effective { color: #6b7280; font-size: 0.9rem; margin-bottom: 2rem; }
    h2 {
      font-size: 1.15rem;
      color: #312e81;
      margin-top: 1.75rem;
      margin-bottom: 0.5rem;
    }
    p, li { font-size: 0.95rem; margin-bottom: 0.5rem; }
    ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
    a { color: #4f46e5; }
    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.85rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p><span class="app-name">${APP_NAME}</span> — A Carnatic music tutoring marketplace</p>
      <p>Questions? Contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
    </div>
  </div>
</body>
</html>`;

router.get('/privacy', (req, res) => {
  const html = pageWrapper('Privacy Policy', `
    <h1>Privacy Policy</h1>
    <p class="effective">Effective date: ${EFFECTIVE_DATE}</p>

    <p><span class="app-name">${APP_NAME}</span> ("we", "us", or "our") operates a mobile application that connects Carnatic music students with teachers. This Privacy Policy explains what information we collect, how we use it, and your choices.</p>

    <h2>1. Information We Collect</h2>

    <p><strong>Account information</strong> — When you sign up we collect your name, email address, and profile photo. If you use Google, Apple, or Facebook sign-in, we receive basic profile data from that provider (name, email, profile picture). We do not receive or store your social-account password.</p>

    <p><strong>Profile information</strong> — Teachers provide instrument(s) taught, hourly rate, location, bio, availability, and teaching experience. Students provide their skill level, preferred instruments, and bio.</p>

    <p><strong>Enquiry &amp; messaging data</strong> — When a student contacts a teacher through the app, we store the enquiry details (message, status, timestamps) to facilitate the connection.</p>

    <p><strong>Reviews &amp; ratings</strong> — Students may leave ratings and written reviews for teachers. These are visible to other users.</p>

    <p><strong>Photos</strong> — If you upload a profile photo, it is stored on our servers and associated with your account.</p>

    <p><strong>Device &amp; usage data</strong> — We may collect device type, operating system version, and general usage analytics to improve the app experience. We do not collect precise GPS location.</p>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>To create and manage your account</li>
      <li>To connect students with teachers and facilitate enquiries</li>
      <li>To display teacher profiles, reviews, and ratings</li>
      <li>To send transactional notifications (enquiry updates, account changes)</li>
      <li>To improve, maintain, and secure the app</li>
    </ul>

    <h2>3. Information Sharing</h2>
    <p>We do <strong>not</strong> sell your personal data. We share information only in these circumstances:</p>
    <ul>
      <li><strong>Between users</strong> — Teacher profiles (name, photo, instrument, rate, location, bio, ratings) are visible to students. Enquiry details are shared between the student and teacher involved.</li>
      <li><strong>Service providers</strong> — We use third-party services for hosting, authentication (Google, Apple, Facebook OAuth), and analytics. These providers access data only as needed to perform their services.</li>
      <li><strong>Legal requirements</strong> — We may disclose information if required by law or to protect the safety of our users.</li>
    </ul>

    <h2>4. Data Storage &amp; Security</h2>
    <p>Your data is stored in a secured database with encrypted connections. Passwords are hashed using bcrypt and are never stored in plain text. Authentication tokens (JWT) are used for session management and transmitted over HTTPS.</p>

    <h2>5. Your Rights &amp; Choices</h2>
    <ul>
      <li><strong>Access &amp; update</strong> — You can view and edit your profile information at any time through the app.</li>
      <li><strong>Delete your account</strong> — You can request account deletion by contacting us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. We will delete your account and associated data within 30 days. We plan to add in-app account deletion in a future update.</li>
      <li><strong>Withdraw OAuth access</strong> — You can revoke ${APP_NAME}'s access through your Google, Apple, or Facebook account settings at any time.</li>
    </ul>

    <h2>6. Children's Privacy</h2>
    <p>${APP_NAME} is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us personal information, please contact us and we will delete it.</p>

    <h2>7. Third-Party Links</h2>
    <p>The app may contain links to external websites or services. We are not responsible for the privacy practices of those third parties.</p>

    <h2>8. Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify you of material changes through the app or by email. The "Effective date" at the top indicates when the policy was last revised.</p>

    <h2>9. Contact Us</h2>
    <p>If you have questions about this Privacy Policy or your data, contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  `);

  res.type('html').send(html);
});

router.get('/terms', (req, res) => {
  const html = pageWrapper('Terms of Service', `
    <h1>Terms of Service</h1>
    <p class="effective">Effective date: ${EFFECTIVE_DATE}</p>

    <p>Welcome to <span class="app-name">${APP_NAME}</span>. By using our app you agree to these terms. Please read them carefully.</p>

    <h2>1. About the Service</h2>
    <p>${APP_NAME} is a marketplace that connects Carnatic music students with teachers. We facilitate discovery and initial contact between students and teachers — we are not a party to any teaching arrangement, payment, or agreement between users.</p>

    <h2>2. Eligibility</h2>
    <p>You must be at least 13 years old to create an account. If you are under 18, you must have parental or guardian consent to use the app.</p>

    <h2>3. User Accounts</h2>
    <ul>
      <li>You are responsible for maintaining the security of your account credentials.</li>
      <li>Information you provide must be accurate and up to date.</li>
      <li>You may not create multiple accounts or impersonate another person.</li>
    </ul>

    <h2>4. Teacher Listings</h2>
    <p>Teachers are responsible for the accuracy of their profile information, including qualifications, rates, and availability. ${APP_NAME} does not verify teacher credentials and makes no guarantees about the quality of instruction.</p>

    <h2>5. Enquiries &amp; Connections</h2>
    <p>Students may send enquiries to teachers through the app. Teachers may accept or decline enquiries at their discretion. Any teaching arrangement, including scheduling, payment, and lesson terms, is solely between the student and teacher.</p>

    <h2>6. Reviews</h2>
    <p>Reviews must be honest, relevant to the teaching experience, and free of abusive or defamatory content. We reserve the right to remove reviews that violate these guidelines.</p>

    <h2>7. Prohibited Conduct</h2>
    <ul>
      <li>Posting false, misleading, or fraudulent information</li>
      <li>Harassing, threatening, or abusing other users</li>
      <li>Using the app for any unlawful purpose</li>
      <li>Attempting to access other users' accounts or our systems without authorization</li>
      <li>Scraping or automated collection of data from the app</li>
    </ul>

    <h2>8. Intellectual Property</h2>
    <p>The ${APP_NAME} name, logo, and app design are our property. Content you create (profile text, reviews, photos) remains yours, but you grant us a license to display it within the app.</p>

    <h2>9. Limitation of Liability</h2>
    <p>${APP_NAME} is provided "as is." We are not liable for any disputes between students and teachers, the quality of lessons, or any damages arising from use of the app. Our total liability is limited to the amount you have paid us (if any).</p>

    <h2>10. Termination</h2>
    <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>

    <h2>11. Changes to These Terms</h2>
    <p>We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.</p>

    <h2>12. Contact Us</h2>
    <p>Questions about these terms? Contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  `);

  res.type('html').send(html);
});

module.exports = router;
