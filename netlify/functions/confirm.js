exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  let data;
  try { data = JSON.parse(event.body); } catch(e) {
    const p = new URLSearchParams(event.body);
    data = Object.fromEntries(p.entries());
  }

  const { name, email, service, date, message } = data;
  if (!email) return { statusCode: 400, body: 'No email' };

  const body = {
    personalizations: [{ to: [{ email, name: name || 'there' }] }],
    from: { email: 'soulturnaround@icloud.com', name: 'Luxe & Glow by Pauli' },
    reply_to: { email: 'Paulina.hartmann@outlook.com' },
    subject: 'Booking Request Received — Luxe & Glow ✨',
    content: [{
      type: 'text/html',
      value: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#2a1a1a;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7E3D3D,#DBA492);padding:24px 32px;">
            <h1 style="margin:0;font-size:1.4rem;">✨ Luxe & Glow</h1>
            <p style="margin:4px 0 0;opacity:0.85;font-size:0.9rem;">Hair & Makeup · Somerset County, NJ</p>
          </div>
          <div style="padding:32px;">
            <h2 style="margin-top:0;">Request Received! 💄</h2>
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for reaching out to Luxe & Glow! Pauli received your booking request and will get back to you <strong>within 24 hours</strong> to confirm your appointment.</p>
            <div style="background:#3a2a2a;border:1px solid #4a3a3a;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 8px;font-size:0.85rem;color:#DBA492;">YOUR REQUEST</p>
              ${service ? `<p style="margin:4px 0;"><strong>Service:</strong> ${service}</p>` : ''}
              ${date ? `<p style="margin:4px 0;"><strong>Preferred Date:</strong> ${date}</p>` : ''}
              ${message ? `<p style="margin:4px 0;"><strong>Details:</strong> ${message}</p>` : ''}
            </div>
            <p>Can't wait to work with you! Feel free to reply to this email with any questions.</p>
            <p style="margin-top:32px;color:#aaa;font-size:0.85rem;">— Pauli Hartmann, Luxe & Glow<br>luxeandglow.netlify.app</p>
          </div>
        </div>`
    }]
  };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  return { statusCode: res.ok ? 200 : 500, body: res.ok ? 'OK' : 'Error' };
};
