/* ============================================
   SIGNATURE SECURE USA — form.js
   Handles intake form submission → /api/intake
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const form   = document.getElementById('intakeForm');
    const status = document.getElementById('formStatus');
    if (!form) return;

    /* ─── FILE INPUT LABEL UPDATE ─── */
    const fileInput = document.getElementById('file');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const label = this.closest('.form-group').querySelector('label');
            if (this.files.length > 0) {
                label.innerHTML = `<i class="fas fa-check-circle" style="color:#6ee89a"></i> ${this.files[0].name}`;
            } else {
                label.innerHTML = '<i class="fas fa-upload"></i> Upload Document for Free Pre-Audit';
            }
        });
    }

    /* ─── INPUT ANIMATION ENHANCEMENT ─── */
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('focus', () => {
            input.closest('.form-group').style.zIndex = '1';
        });
        input.addEventListener('blur', () => {
            input.closest('.form-group').style.zIndex = '';
        });
    });

    /* ─── FORM SUBMIT ─── */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn  = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        // Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="btn-bg"></span>
            <i class="fas fa-spinner fa-spin"></i>
            <span>Sending Request…</span>
            <div class="btn-shine"></div>
        `;
        status.style.display = 'none';
        status.className = 'form-status';

        try {
            const formData = new FormData(form);

            const response = await fetch('/api/intake', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success state
                submitBtn.innerHTML = `
                    <span class="btn-bg"></span>
                    <i class="fas fa-check-circle"></i>
                    <span>Request Sent!</span>
                    <div class="btn-shine"></div>
                `;
                submitBtn.style.background = 'linear-gradient(135deg,#2d7a4f,#1e5c38)';
                submitBtn.style.color = '#6ee89a';

                status.innerHTML = `
                    <i class="fas fa-check-circle" style="font-size:1.5rem;display:block;margin-bottom:8px;"></i>
                    <strong>Thank you! Signature Secure USA has received your request.</strong><br>
                    We are currently performing your pre-audit and will send your custom quote within 2 business hours.<br>
                    <small style="opacity:0.7;margin-top:8px;display:block;">Check your email for a confirmation from us.</small>
                `;
                status.className = 'form-status success';
                status.style.display = 'block';
                form.reset();

                // Reset file label
                if (fileInput) {
                    const label = fileInput.closest('.form-group').querySelector('label');
                    label.innerHTML = '<i class="fas fa-upload"></i> Upload Document for Free Pre-Audit';
                }

                status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // Reset button after 4s
                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                }, 4000);

            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Form error:', error);

            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;

            status.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size:1.3rem;display:block;margin-bottom:8px;"></i>
                <strong>Submission failed.</strong> Please try again or contact us directly at info@signaturesecureusa.com
            `;
            status.className = 'form-status error';
            status.style.display = 'block';
            status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
});
