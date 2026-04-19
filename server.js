const express    = require('express');
const multer     = require('multer');
const cors       = require('cors');
const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─── ENSURE UPLOADS DIR EXISTS ─── */
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

/* ─── MIDDLEWARE ─── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

/* ─── MULTER FILE UPLOAD ─── */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg','image/png','image/jpg','image/webp','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload JPG, PNG, PDF, or Word documents.'), false);
        }
    }
});

/* ─── EMAIL TRANSPORTER ─── */
const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

/* ─── ROUTES ─── */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ─── INTAKE API ─── */
app.post('/api/intake', upload.single('file'), async (req, res) => {
    try {
        const {
            name        = '',
            email       = '',
            phone       = '',
            service     = '',
            docType     = '',
            destination = '',
            numDocs     = '1',
            timeline    = '',
            message     = ''
        } = req.body;

        const fileInfo = req.file
            ? `<p><strong>📎 Uploaded File:</strong> ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)</p>`
            : '<p><em>No document uploaded.</em></p>';

        const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'full', timeStyle: 'short' });

        /* ── ADMIN EMAIL ── */
        const adminMail = {
            from:    `"Signature Secure USA" <${process.env.EMAIL_USER}>`,
            to:      process.env.ADMIN_EMAIL,
            replyTo: email,
            subject: `🔔 New Intake Request: ${service} — ${name}`,
            html: `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#0d1729; color:#f7f5f0; margin:0; padding:0; }
  .wrap { max-width:640px; margin:0 auto; background:#1a2744; border:1px solid rgba(201,168,76,0.3); border-radius:8px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#1a2744,#243660); padding:32px; border-bottom:2px solid #c9a84c; text-align:center; }
  .header h1 { color:#c9a84c; font-size:1.6rem; margin:0 0 6px; }
  .header p { color:rgba(247,245,240,0.6); font-size:0.85rem; margin:0; }
  .body { padding:32px; }
  .field { margin-bottom:20px; }
  .field label { display:block; color:#c9a84c; font-size:0.72rem; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; font-weight:700; }
  .field value { display:block; background:rgba(13,23,41,0.6); border:1px solid rgba(201,168,76,0.2); border-radius:4px; padding:12px 16px; color:#f7f5f0; font-size:0.95rem; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .highlight { background:linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05)); border:1px solid rgba(201,168,76,0.4) !important; }
  .footer-bar { background:#0d1729; padding:20px 32px; text-align:center; color:rgba(247,245,240,0.4); font-size:0.78rem; border-top:1px solid rgba(201,168,76,0.1); }
  .badge { display:inline-block; background:#c9a84c; color:#0d1729; padding:4px 12px; border-radius:20px; font-size:0.72rem; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-top:8px; }
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>⭐ New Client Request</h1>
    <p>Received: ${now} (Central Time)</p>
    <span class="badge">${service}</span>
  </div>
  <div class="body">
    <div class="grid">
      <div class="field">
        <label>Client Name</label>
        <value>${name}</value>
      </div>
      <div class="field">
        <label>Phone</label>
        <value>${phone || 'Not provided'}</value>
      </div>
    </div>
    <div class="field">
      <label>Email</label>
      <value>${email}</value>
    </div>
    <div class="field">
      <label>Service Requested</label>
      <value class="highlight">${service}</value>
    </div>
    <div class="grid">
      <div class="field">
        <label>Document Type</label>
        <value>${docType || 'Not specified'}</value>
      </div>
      <div class="field">
        <label>Number of Docs</label>
        <value>${numDocs}</value>
      </div>
    </div>
    <div class="grid">
      <div class="field">
        <label>Country of Destination</label>
        <value>${destination || 'Not specified'}</value>
      </div>
      <div class="field">
        <label>Timeline</label>
        <value>${timeline || 'Not specified'}</value>
      </div>
    </div>
    ${message ? `<div class="field"><label>Additional Notes</label><value>${message}</value></div>` : ''}
    <div class="field">
      <label>Uploaded Document</label>
      ${fileInfo}
    </div>
  </div>
  <div class="footer-bar">Signature Secure USA · Austin, Texas · info@signaturesecureusa.com</div>
</div>
</body>
</html>`
        };

        /* ── CLIENT CONFIRMATION EMAIL ── */
        const clientMail = {
            from:    `"Signature Secure USA" <${process.env.EMAIL_USER}>`,
            to:      email,
            subject: '✅ We\'ve Received Your Request — Signature Secure USA Pre-Audit Started',
            html: `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f0f0f0; margin:0; padding:0; }
  .wrap { max-width:600px; margin:24px auto; background:#1a2744; border-radius:8px; overflow:hidden; border:1px solid rgba(201,168,76,0.3); }
  .header { background:linear-gradient(135deg,#0d1729,#1a2744); padding:36px; text-align:center; border-bottom:2px solid #c9a84c; }
  .header h1 { color:#c9a84c; font-size:1.5rem; margin:0 0 8px; }
  .header p { color:rgba(247,245,240,0.65); font-size:0.9rem; margin:0; }
  .body { padding:36px; color:#f7f5f0; }
  .body p { line-height:1.8; color:rgba(247,245,240,0.85); margin-bottom:16px; }
  .body strong { color:#f7f5f0; }
  .steps { background:rgba(13,23,41,0.5); border:1px solid rgba(201,168,76,0.2); border-radius:6px; padding:24px; margin:24px 0; }
  .step { display:flex; gap:16px; margin-bottom:16px; }
  .step:last-child { margin-bottom:0; }
  .step-num { background:#c9a84c; color:#0d1729; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; flex-shrink:0; }
  .step-text h4 { color:#c9a84c; font-size:0.85rem; margin:0 0 4px; letter-spacing:1px; text-transform:uppercase; }
  .step-text p { color:rgba(247,245,240,0.7); font-size:0.87rem; margin:0; line-height:1.6; }
  .cta-box { background:linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.04)); border:1px solid rgba(201,168,76,0.3); border-radius:6px; padding:20px; text-align:center; margin:24px 0; }
  .cta-box p { margin:0 0 12px; color:rgba(247,245,240,0.8); font-size:0.88rem; }
  .cta-box a { display:inline-block; background:linear-gradient(135deg,#c9a84c,#a8893a); color:#0d1729; font-weight:700; padding:10px 24px; border-radius:4px; text-decoration:none; font-size:0.82rem; letter-spacing:1px; }
  .footer-bar { background:#0d1729; padding:20px; text-align:center; color:rgba(247,245,240,0.35); font-size:0.75rem; border-top:1px solid rgba(201,168,76,0.1); }
  .sig { color:rgba(247,245,240,0.6); font-size:0.88rem; }
  .sig strong { color:#c9a84c; }
</style></head>
<body>
<div class="wrap">
  <div class="header">
    <h1>✅ Request Received!</h1>
    <p>Your Pre-Audit has been started</p>
  </div>
  <div class="body">
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for contacting <strong>Signature Secure USA</strong>. We have successfully received your intake form and your request for <strong>${service}</strong>.</p>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-text">
          <h4>Expert Pre-Audit</h4>
          <p>Our team is reviewing the document images you provided, checking notary seals, signatures, and jurisdictional wording for 100% compliance.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-text">
          <h4>Custom Quote</h4>
          <p>Within the next <strong>2 business hours</strong>, you will receive your total quote including state fees and expedited courier options.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-text">
          <h4>Secure Hand-off</h4>
          <p>Once the quote is approved, we'll provide instructions for local pickup in Austin or secure mailing to our office.</p>
        </div>
      </div>
    </div>

    <div class="cta-box">
      <p>Have an urgent same-day request? Don't wait for email.</p>
      <a href="mailto:info@signaturesecureusa.com">Reply to This Email</a>
    </div>

    <p class="sig">
      Best regards,<br>
      <strong>The Signature Secure USA Team</strong><br>
      <em>Secure · Certified · Expedited</em><br>
      Austin, Texas
    </p>
  </div>
  <div class="footer-bar">
    Signature Secure USA · Austin, Texas<br>
    This is an automated confirmation. Please do not reply to this address if your request is urgent — call us directly.
  </div>
</div>
</body>
</html>`
        };

        /* ── SEND BOTH EMAILS ── */
        await transporter.sendMail(adminMail);
        await transporter.sendMail(clientMail);

        res.json({ success: true, message: 'Request processed successfully' });

    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

/* ─── HEALTH CHECK ─── */
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Signature Secure USA', timestamp: new Date().toISOString() });
});

/* ─── START ─── */
app.listen(PORT, () => {
    console.log(`\n🌟 Signature Secure USA Server`);
    console.log(`🚀 Running on port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`📧 Admin email: ${process.env.ADMIN_EMAIL}`);
    console.log(`❤️  Health: http://localhost:${PORT}/health\n`);
});
