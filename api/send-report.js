function buildSummary(overallScore, domainScores, quickWins) {
  if (!overallScore && overallScore !== 0) return '';
  let s = '';
  if (overallScore < 2) {
    s = 'Your Order-to-Cash operations are running on manual processes with limited standardization. This creates significant operational risk, slows cash conversion, and exposes the business to compliance gaps. ';
  } else if (overallScore < 3.5) {
    s = 'Your OTC processes have standardized foundations in place, but automation gaps across key domains are limiting throughput, creating data silos, and preventing scalable growth. ';
  } else if (overallScore < 4.5) {
    s = 'Your OTC operations demonstrate solid process maturity. Core domains are well-managed; targeted AI and automation investments can unlock autonomous processing and predictive intelligence. ';
  } else {
    s = 'Your OTC operations exhibit industry-leading maturity with strong automation and process discipline. Continued innovation in autonomous workflows will maintain competitive advantage. ';
  }
  const crit = (domainScores || []).filter(d => d.score < 2);
  if (crit.length > 0) {
    s += `${crit.length} critical ${crit.length === 1 ? 'area requires' : 'areas require'} immediate attention: ${crit.map(d => d.name).join(', ')}. `;
  }
  const high = (domainScores || []).filter(d => d.score >= 2 && d.score < 3);
  if (high.length > 0) {
    s += `${high.length} ${high.length === 1 ? 'domain' : 'domains'} (${high.map(d => d.name).join(', ')}) would benefit from structured optimization. `;
  }
  const topWin = (quickWins || [])[0];
  if (topWin) {
    s += `A priority first step: ${topWin.domain ? topWin.domain + ' — ' : ''}${topWin.title || topWin.desc}.`;
  }
  return s;
}

function estimateImpact(domainScores) {
  const rates = [{ max: 2, label: 'Critical gap', annual: 120000 }, { max: 3, label: 'High gap', annual: 50000 }, { max: 4, label: 'Medium gap', annual: 15000 }, { max: 5, label: 'Optimized', annual: 0 }];
  let total = 0;
  const items = (domainScores || []).map(d => {
    const r = rates.find(x => d.score < x.max) || rates[rates.length - 1];
    total += r.annual;
    return { name: d.name, amount: r.annual, label: r.label };
  });
  return { total, items };
}

function buildRoadmap(quickWins) {
  const buckets = { '30 Days': [], '60 Days': [], '90+ Days': [] };
  (quickWins || []).forEach(qw => {
    if (qw.severity === 'Critical' || !qw.severity) buckets['30 Days'].push(qw);
    else if (qw.severity === 'High') buckets['60 Days'].push(qw);
    else buckets['90+ Days'].push(qw);
  });
  if (buckets['30 Days'].length === 0 && (quickWins || []).length > 0) buckets['30 Days'].push(quickWins[0]);
  if (buckets['60 Days'].length === 0 && (quickWins || []).length > 1) buckets['60 Days'].push(quickWins[1]);
  return buckets;
}

function getColor(score, target) {
  return score >= target ? '#3DDC84' : score >= target - 0.5 ? '#FFAB40' : '#FF6B6B';
}

function buildEmailHtml(data) {
  const { overallScore, maturityLevel, maturityColor, domainScores, quickWins, target, company } = data;
  const scoreColor = maturityColor || (overallScore >= 4.5 ? '#4FC3F7' : overallScore >= 3.5 ? '#3DDC84' : overallScore >= 2.5 ? '#FFAB40' : '#FF6B6B');

  const topWins = (quickWins || []).slice(0, 3);

  const summary = buildSummary(overallScore, domainScores, quickWins);
  const impact = estimateImpact(domainScores);
  const roadmap = buildRoadmap(quickWins);
  const complianceFlags = (quickWins || []).filter(qw => qw.soxControl).slice(0, 3);

  const bars = (domainScores || []).map(d => {
    const pct = Math.round((d.score / 5) * 100);
    const color = getColor(d.score, target);
    return `<tr><td style="padding:8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:#c8c6d0">${d.icon || ''} ${d.name}</td><td style="padding:8px 0;font-family:ui-monospace,'JetBrains Mono',monospace;font-size:14px;color:${color};font-weight:600;text-align:right">${d.score.toFixed(1)}</td></tr><tr><td colspan="2" style="padding:0 0 12px 0"><div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${color};border-radius:3px"></div></div></td></tr>`;
  }).join('');

  const quickWinItems = topWins.map(qw =>
    `<tr><td style="padding:10px 14px;background:rgba(61,220,132,0.06);border-radius:8px;margin-bottom:8px;border:1px solid rgba(61,220,132,0.12)"><div style="font-size:14px;color:#e8e6f0;font-weight:500">${qw.title}</div><div style="font-size:12px;color:rgba(232,230,240,0.62);margin-top:4px">${qw.desc}</div></td></tr>`
  ).join('');

  const impactRows = impact.items.filter(i => i.amount > 0).map(i =>
    `<tr><td style="padding:6px 0;font-size:13px;color:#c8c6d0">${i.name}</td><td style="padding:6px 0;font-size:12px;color:rgba(232,230,240,0.62);text-align:right">${i.label}</td><td style="padding:6px 0;font-size:13px;color:#FFAB40;font-weight:600;text-align:right;font-family:ui-monospace,monospace">~$${(i.amount / 1000).toFixed(0)}K/yr</td></tr>`
  ).join('');

  const roadmapHtml = Object.entries(roadmap).map(([bucket, items]) =>
    `<td style="width:33%;vertical-align:top;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px"><div style="font-family:ui-monospace,monospace;font-size:10px;color:#6B5CE7;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">${bucket}</div>${items.length > 0 ? items.map((qw, i) => `<div style="font-size:12px;color:#e8e6f0;margin-bottom:4px">${qw.domain ? `<span style="color:rgba(232,230,240,0.5)">${qw.domain}</span>: ` : ''}${qw.title || qw.desc}</div>`).join('') : '<div style="font-size:11px;color:rgba(232,230,240,0.35)">No items</div>'}</td>`
  ).join('');

  const complianceRows = complianceFlags.map(cf =>
    `<tr><td style="padding:8px 0;font-size:13px;color:#c8c6d0">${cf.domain || cf.title}</td><td style="padding:8px 0;font-size:12px;font-family:ui-monospace,monospace;color:#FF6B6B">${cf.soxControl}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#08090E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#08090E"><tr><td align="center" style="padding:40px 20px"><table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;background:#0D1117;border-radius:16px;border:1px solid rgba(255,255,255,0.06)">
<tr><td style="padding:32px 36px 0;text-align:center"><div style="font-family:Georgia,serif;font-size:22px;color:#e8e6f0;margin-bottom:4px">ClearLedger</div><div style="font-family:ui-monospace,monospace;font-size:10px;color:rgba(232,230,240,0.45);letter-spacing:2px;text-transform:uppercase">OtC Maturity Assessment Report</div></td></tr>
<tr><td style="padding:36px 36px 20px;text-align:center"><table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 12px auto;"><tr><td align="center" valign="middle" style="width:130px;height:130px;border-radius:50%;border:3px solid ${scoreColor};text-align:center;vertical-align:middle"><div style="font-size:44px;font-weight:300;color:${scoreColor};font-family:Georgia,serif;line-height:1.1;margin:0">${overallScore?.toFixed(1) || 'N/A'}</div><div style="font-family:ui-monospace,monospace;font-size:10px;color:rgba(232,230,240,0.45);line-height:1">/ 5.0</div></td></tr></table><div style="font-family:Georgia,serif;font-size:22px;color:${scoreColor};margin-bottom:4px">${maturityLevel || 'N/A'}</div><div style="font-size:13px;color:rgba(232,230,240,0.62)">${overallScore >= target ? '\u2713 Above target' : 'Gap: ' + ((target || 4) - (overallScore || 0)).toFixed(1)}</div>${company?.name ? `<div style="font-size:12px;color:rgba(232,230,240,0.45);margin-top:8px">${company.name}</div>` : ''}</td></tr>
${summary ? `<tr><td style="padding:0 36px 24px"><div style="font-family:Georgia,serif;font-size:16px;color:#e8e6f0;margin-bottom:8px">Executive Summary</div><div style="font-size:13px;color:rgba(232,230,240,0.72);line-height:1.6">${summary}</div></td></tr>` : ''}
<tr><td style="padding:0 36px 20px"><div style="font-family:ui-monospace,monospace;font-size:10px;color:#6B5CE7;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:16px">Domain Scorecard</div><table width="100%" cellpadding="0" cellspacing="0">${bars}</table></td></tr>
${impact.total > 0 ? `<tr><td style="padding:0 36px 20px"><div style="font-family:ui-monospace,monospace;font-size:10px;color:#FFAB40;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">Estimated Annual Impact</div><div style="font-size:12px;color:rgba(232,230,240,0.52);margin-bottom:10px">Revenue leakage and operational cost exposure based on current maturity gaps.</div><table width="100%" cellpadding="0" cellspacing="0">${impactRows}</table><div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);text-align:right;font-size:15px;color:#FFAB40;font-weight:600;font-family:ui-monospace,monospace">~$${(impact.total / 1000).toFixed(0)}K total estimated annual impact</div></td></tr>` : ''}
${topWins.length > 0 ? `<tr><td style="padding:0 36px 20px"><div style="font-family:ui-monospace,monospace;font-size:10px;color:#3DDC84;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">&#9889; Priority Quick Wins</div><table width="100%" cellpadding="0" cellspacing="0">${quickWinItems}</table></td></tr>` : ''}
<tr><td style="padding:0 36px 24px"><div style="font-family:ui-monospace,monospace;font-size:10px;color:#4FC3F7;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">Recommended Action Roadmap</div><table width="100%" cellpadding="0" cellspacing="0"><tr>${roadmapHtml}</tr></table></td></tr>
${complianceFlags.length > 0 ? `<tr><td style="padding:0 36px 24px"><div style="font-family:ui-monospace,monospace;font-size:10px;color:#FF6B6B;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">Compliance Controls at Risk</div><div style="font-size:12px;color:rgba(232,230,240,0.52);margin-bottom:8px">SOX/Internal control gaps identified in current process maturity assessment.</div><table width="100%" cellpadding="0" cellspacing="0">${complianceRows}</table></td></tr>` : ''}
<tr><td style="padding:0 36px 36px"><div style="background:rgba(107,92,231,0.08);border-radius:12px;padding:24px;text-align:center;border:1px solid rgba(107,92,231,0.15)"><div style="font-family:Georgia,serif;font-size:20px;color:#e8e6f0;margin-bottom:8px">Ready to close the gaps?</div><div style="font-size:13px;color:rgba(232,230,240,0.62);margin-bottom:20px;line-height:1.5">Book a 30-minute call to walk through your results and build your personalized implementation roadmap.</div><a href="https://calendly.com/clearledger/otc-review" style="display:inline-block;padding:14px 32px;border-radius:8px;text-decoration:none;background:#6B5CE7;color:white;font-size:14px;font-weight:500">Book a Call</a></div></td></tr>
<tr><td style="padding:20px 36px 32px;text-align:center;border-top:1px solid rgba(255,255,255,0.06)"><div style="font-family:ui-monospace,monospace;font-size:10px;color:rgba(232,230,240,0.35)">APQC PCF v8.0-aligned &middot; ClearLedger</div></td></tr>
</table></td></tr></table></body></html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const raw = await new Promise((resolve, reject) => {
      const a = []; req.on('data', c => a.push(c)); req.on('end', () => resolve(Buffer.concat(a).toString())); req.on('error', reject);
    });
    if (!raw) return res.status(400).json({ error: 'Empty body' });
    const parsed = JSON.parse(raw);
    const { email, ...reportData } = parsed;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' });

    const html = buildEmailHtml(reportData);

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({
        from: 'ClearLedger <onboarding@resend.dev>',
        to: email,
        subject: `Your OtC Maturity Score: ${reportData.overallScore?.toFixed(1)}/5.0 — ClearLedger Report`,
        html,
      }),
    });
    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return res.status(500).json({ error: 'Resend API error', detail: errText });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unknown' });
  }
}
