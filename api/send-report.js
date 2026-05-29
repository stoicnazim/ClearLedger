import { Resend } from 'resend';

function buildEmailHtml(data) {
  const { overallScore, maturityLevel, maturityColor, domainScores, quickWins, recommendedPkg, target, company } = data;

  const scoreColor = maturityColor || (overallScore >= 4.5 ? '#4FC3F7' : overallScore >= 3.5 ? '#3DDC84' : overallScore >= 2.5 ? '#FFAB40' : '#FF6B6B');

  const bars = domainScores.map(d => {
    const pct = Math.round((d.score / 5) * 100);
    const color = d.score >= target ? '#3DDC84' : d.score >= target - 0.5 ? '#FFAB40' : '#FF6B6B';
    return `
      <tr>
        <td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:#c8c6d0">${d.icon} ${d.name}</td>
        <td style="padding:8px 0;font-family:ui-monospace,'JetBrains Mono',monospace;font-size:14px;color:${color};font-weight:600;text-align:right">${d.score.toFixed(1)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 0 12px 0">
          <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${color};border-radius:3px"></div>
          </div>
        </td>
      </tr>`;
  }).join('');

  const quickWinItems = quickWins.map(qw => `
    <tr>
      <td style="padding:10px 14px;background:rgba(61,220,132,0.06);border-radius:8px;margin-bottom:8px;border:1px solid rgba(61,220,132,0.12)">
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#e8e6f0;font-weight:500">${qw.title}</div>
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:rgba(232,230,240,0.62);margin-top:4px">${qw.desc}</div>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#08090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08090E">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;background:#0D1117;border-radius:16px;border:1px solid rgba(255,255,255,0.06)">

          <tr>
            <td style="padding:32px 36px 0;text-align:center">
              <div style="font-family:Georgia,serif;font-size:22px;color:#e8e6f0;margin-bottom:4px">ClearLedger</div>
              <div style="font-family:ui-monospace,'JetBrains Mono',monospace;font-size:10px;color:rgba(232,230,240,0.45);letter-spacing:2px;text-transform:uppercase">OtC Maturity Assessment Report</div>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 36px 24px;text-align:center">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:130px;height:130px;border-radius:50%;border:3px solid ${scoreColor};margin-bottom:12px">
                <div>
                  <div style="font-size:44px;font-weight:300;color:${scoreColor};font-family:Georgia,serif">${overallScore.toFixed(1)}</div>
                  <div style="font-family:ui-monospace,'JetBrains Mono',monospace;font-size:10px;color:rgba(232,230,240,0.45)">/ 5.0</div>
                </div>
              </div>
              <div style="font-family:Georgia,serif;font-size:22px;color:${scoreColor};margin-bottom:4px">${maturityLevel}</div>
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:rgba(232,230,240,0.62)">
                ${overallScore >= target ? '✓ Above target' : 'Gap: ' + (target - overallScore).toFixed(1)}
              </div>
              ${company?.name ? `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:rgba(232,230,240,0.45);margin-top:8px">${company.name}</div>` : ''}
            </td>
          </tr>

          <tr>
            <td style="padding:0 36px 20px">
              <div style="font-family:ui-monospace,'JetBrains Mono',monospace;font-size:10px;color:#6B5CE7;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px">Domain Scorecard</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${bars}
              </table>
            </td>
          </tr>

          ${quickWins.length > 0 ? `
          <tr>
            <td style="padding:0 36px 20px">
              <div style="font-family:ui-monospace,'JetBrains Mono',monospace;font-size:10px;color:#3DDC84;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">&#9889; Priority Quick Wins</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${quickWinItems}
              </table>
            </td>
          </tr>` : ''}

          <tr>
            <td style="padding:0 36px 36px">
              <div style="background:rgba(107,92,231,0.08);border-radius:12px;padding:24px;text-align:center;border:1px solid rgba(107,92,231,0.15)">
                <div style="font-family:Georgia,serif;font-size:20px;color:#e8e6f0;margin-bottom:8px">Ready to close the gaps?</div>
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:rgba(232,230,240,0.62);margin-bottom:20px;line-height:1.5">
                  Book a 30-minute call to walk through your results and discuss next steps.
                </div>
                <a href="https://calendly.com/clearledger/otc-review" style="display:inline-block;padding:14px 32px;border-radius:8px;text-decoration:none;background:#6B5CE7;color:white;font-size:14px;font-weight:500">Book a Call</a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 36px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06)">
              <div style="font-family:ui-monospace,'JetBrains Mono',monospace;font-size:10px;color:rgba(232,230,240,0.35)">
                APQC PCF v8.0-aligned · ClearLedger
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { email, ...reportData } = body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const resend = new Resend(apiKey);
    const html = buildEmailHtml(reportData);

    await resend.emails.send({
      from: 'ClearLedger <onboarding@resend.dev>',
      to: email,
      subject: `Your OtC Maturity Score: ${reportData.overallScore?.toFixed(1)}/5.0 — ClearLedger Report`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Send report error:', error);
    return res.status(500).json({ error: 'Failed to send report' });
  }
}
