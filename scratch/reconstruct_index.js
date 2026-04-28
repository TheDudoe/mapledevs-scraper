const fs = require('fs');
const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

const privacyStart = '<div id="privacy-view" class="view" role="main"><div class="about-c">';
const scriptStart = '<script>';

const startIndex = content.indexOf(privacyStart);
const endIndex = content.indexOf(scriptStart);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers', { startIndex, endIndex });
  process.exit(1);
}

const fixedMiddle = `
  <button class="back-b" onclick="showBoard()">← Back to jobs</button>
  <h1>Privacy <em>Policy</em></h1>
  <p style="font-size:12px; color:var(--text-3); margin-bottom:1.5rem;">Last updated: April 26, 2026</p>
  
  <h2>1. Who we are</h2>
  <p>MapleDevs (mapledevs.ca) is Canada's #1 game industry job board. We are a Canadian-owned and operated platform dedicated to helping talent find roles at verified Canadian studios. You can contact us at <a href="mailto:mapledevsbusiness@gmail.com">mapledevsbusiness@gmail.com</a>.</p>
  
  <h2>2. Data we collect</h2>
  <p><strong>For Job Seekers:</strong> We do not require account creation to browse jobs. If you create an account, we store the profile, resume, saved job, and studio/candidate information you choose to provide. Candidate profiles stay private unless you mark them Public for the MapleDevs Talent Directory. Public directory pages do not show login email addresses. We collect your email address if you voluntarily sign up for our newsletter or job alerts. Basic usage data is collected via Google Analytics, Datadog RUM, and PostHog to help us improve the platform.</p>
  <p><strong>For Employers:</strong> We collect your name, studio email, and job details when you submit a listing. We do <strong>not</strong> collect or store credit card or banking information. All payments for featured listings are handled externally via Interac e-Transfer.</p>
  
  <h2>3. Automated Data Collection</h2>
  <p>We aggregate job listings from official studio career pages (via Greenhouse, Lever, and other ATS platforms). This information is publicly available and we process it to provide a centralized hub for Canadian developers. If you are a studio owner and wish to have your listings removed or updated, please contact us.</p>
  
  <h2>4. Third-Party Services</h2>
  <p>We use the following services to power MapleDevs:</p>
  <ul>
    <li><strong>Google Analytics:</strong> To understand site traffic (anonymous).</li>
    <li><strong>Datadog RUM:</strong> To monitor frontend errors, page performance, and user experience. Form input is masked by default.</li>
    <li><strong>PostHog:</strong> To understand page views, feature usage, and product flow across MapleDevs.</li>
    <li><strong>Mailchimp:</strong> To manage our newsletter and job alert emails.</li>
    <li><strong>Google Sheets:</strong> To securely store our job database.</li>
    <li><strong>Discord:</strong> Our community the hub is hosted on Discord, which has its own privacy policy.</li>
  </ul>
  
  <h2>5. Your Rights</h2>
  <p>You have the right to request the deletion of your email from our newsletter at any time using the "Unsubscribe" link in any email, or by contacting us directly. We do not sell or trade your personal data with third parties.</p>
</div></div>

<!-- ═══════ TERMS VIEW ═══════ -->
<div id="terms-view" class="view" role="main"><div class="about-c">
  <button class="back-b" onclick="showBoard()">← Back to jobs</button>
  <h1>Terms of <em>Use</em></h1>
  <p style="font-size:12px; color:var(--text-3); margin-bottom:1.5rem;">Last updated: April 27, 2026</p>
  
  <h2>1. Acceptance of Terms</h2>
  <p>By using MapleDevs (mapledevs.ca), you agree to these terms. If you do not agree, please discontinue use of the site. We reserve the right to update these terms at any time.</p>
  
  <h2>2. Our Verification Guarantee</h2>
  <p>We promise that every job listing on MapleDevs is for a <strong>verified Canadian studio</strong>. We manually vet new studios to ensure they have a real presence in Canada. We do not post "ghost jobs," unpaid roles (unless internships), or roles from studios outside of Canada.</p>

  <h2>3. For Job Seekers</h2>
  <p>MapleDevs is free for job seekers. We provide links to external application portals. We are not responsible for the content of external sites, nor are we involved in the hiring process or decisions made by studios.</p>
  
  <h2>4. For Employers & Payments</h2>
  <p>Standard job listings are currently free. <strong>Paid Listings</strong> are available starting from <strong>$19 CAD</strong>. Paid roles stay at the top of the board, receive priority in our newsletter, and are highlighted on social media. 
  <br><br>Payments must be sent via <strong>Interac e-Transfer</strong> to <a href="mailto:wupeiheng11@gmail.com">wupeiheng11@gmail.com</a>. Listings are published/featured only after payment is confirmed. All sales are final and non-refundable once the listing is live.</p>
  
  <h2>5. Featured Listing Refund Policy</h2>
  <p>Featured listing payments are final and non-refundable once the listing has been published or moved into featured placement. MapleDevs may remove stale, expired, inaccurate, or non-Canadian listings to protect candidate trust; removal after publication does not create a refund obligation. If MapleDevs cannot publish the featured placement, we will contact the employer before accepting payment or return the payment if already sent.</p>
  
  <h2>6. Intellectual Property</h2>
  <p>The MapleDevs brand, logo, and custom code are property of MapleDevs. Job titles and studio logos remain the intellectual property of their respective owners.</p>
  
  <h2>7. Governing Law</h2>
  <p>These terms are governed by the laws of British Columbia, Canada.</p>
</div></div>

<!-- ═══════ FOOTER ═══════ -->
<footer role="contentinfo">
  <section class="ft-discovery">
    <div class="ft-disc-in">
      <div class="ft-col">
        <h4>Categories</h4>
        <ul>
          <li><a href="/#exp=junior">Junior Roles</a></li>
          <li><a href="/#mode=Remote">Remote Jobs</a></li>
          <li><a href="/#type=Internship">Internships</a></li>
          <li><a href="/#exp=senior">Senior Roles</a></li>
        </ul>
      </div>
      <div class="ft-col">
        <h4>Latest jobs</h4>
        <ul class="ft-latest-jobs" id="ft-latest-jobs">
          <li><span class="ft-job-meta">Loading fresh roles...</span></li>
        </ul>
      </div>
      <div class="ft-col">
        <h4>Resources</h4>
        <ul>
          <li><a href="/about/">About MapleDevs</a></li>
          <li><a href="#studios" onclick="showStudios()">Top Studios</a></li>
          <li><a href="mailto:mapledevsbusiness@gmail.com">Partner with us</a></li>
        </ul>
      </div>
    </div>
  </section>
  <div class="ft-inner">
    <div class="ft-brand"><img src="/favicon.png" alt="MapleDevs" width="16" height="16" style="border-radius:2px;"> Maple<span>Devs</span></div>
    <nav class="ft-links"><a href="/talent/" onclick="goLocalPage(event,'talent')">Talent</a><button onclick="showStudios()">Studios</button><button onclick="showAbout()">About</button><a href="/account/" onclick="goAccount(event)">Account</a><button onclick="openPostModal()">Post a Job</button><a href="/contact/">Contact</a><button onclick="showPrivacy()">Privacy</button><button onclick="showTerms()">Terms</button></nav>
    <p class="ft-copy">© 2026 MapleDevs · Canada's game industry job board · <a href="mailto:mapledevsbusiness@gmail.com">mapledevsbusiness@gmail.com</a></p>
  </div>
</footer>
`;

const newContent = content.substring(0, startIndex + privacyStart.length) + fixedMiddle + content.substring(endIndex);
fs.writeFileSync(path, newContent);
console.log('Reconstructed index.html successfully.');
