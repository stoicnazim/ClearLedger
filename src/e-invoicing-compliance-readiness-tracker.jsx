import { useState } from "react";
import { useLiveActuals, liveBadgeStyle, getKpiActual } from "./liveActuals";

// ─── TIER DEFINITIONS ───
const TIERS = [
  { id: "sme", label: "SME", accent: "#10B981" },
  { id: "mid", label: "Mid-Market", accent: "#3B82F6" },
  { id: "large", label: "Large Enterprise", accent: "#A855F7" },
  { id: "global", label: "Global MNC", accent: "#F59E0B" },
];

const TABS = [
  { id: "landscape", label: "Regulatory Landscape", icon: "⬡" },
  { id: "readiness", label: "Technical Readiness", icon: "⬢" },
  { id: "impact", label: "Process Impact", icon: "◈" },
  { id: "roadmap", label: "Implementation Roadmap", icon: "◇" },
  { id: "kpi", label: "Compliance KPIs", icon: "◎" },
];

// ─── STATUS & MODEL COLORS ───
const STATUS_COLORS = {
  Live: "#10B981",
  Announced: "#3B82F6",
  Draft: "#F59E0B",
  Voluntary: "#8B5CF6",
  "Not Applicable": "#475569",
};

const MODEL_COLORS = {
  CTC: "#EF4444",
  "Post-Audit": "#F59E0B",
  "Real-Time": "#3B82F6",
  Hybrid: "#A855F7",
  Voluntary: "#8B5CF6",
  "N/A": "#475569",
};

// ─── TAB 1: REGULATORY LANDSCAPE DATA ───
const REGULATORY_DATA = {
  sme: [
    { country: "Poland", region: "EU", status: "Live", model: "CTC", platform: "KSeF", format: "FA(2) XML", goLive: "2026-02-01", penalty: "Up to 100% of VAT amount for non-compliance; PLN 500 per invoice for late submission", notes: "Mandatory B2B since Feb 2026. Structured XML schema. Real-time validation." },
    { country: "Italy", region: "EU", status: "Live", model: "CTC", platform: "SDI (Sistema di Interscambio)", format: "FatturaPA XML", goLive: "2019-01-01", penalty: "90–180% of VAT on unreported invoices; €250–€2,000 per quarter", notes: "Pioneer EU CTC. All B2B/B2C/B2G mandatory. 12-second SLA for clearance." },
    { country: "Germany", region: "EU", status: "Announced", model: "CTC", platform: "TBD (Peppol-based likely)", format: "XRechnung / ZUGFeRD", goLive: "2027-01-01", penalty: "TBD — expected alignment with EU ViDA directive penalties", notes: "B2B mandate from 2027. Reception mandatory 2025, issuance 2027. Transition period for SMEs." },
    { country: "France", region: "EU", status: "Live", model: "CTC", platform: "PPF / PDP (Partner Dematerialisation Platforms)", format: "Factur-X / UBL / CII", goLive: "2026-09-01", penalty: "€15 per invoice (capped €15,000/year); additional VAT penalties for non-reporting", notes: "Phased rollout: Large enterprises first (2024), then mid/SME. E-reporting of B2C transactions." },
    { country: "Spain", region: "EU", status: "Live", model: "Real-Time", platform: "SII (Suministro Inmediato de Información)", format: "TicketBAI / Facturae XML", goLive: "2017-07-01", penalty: "0.5% of invoice value per quarter (min €300, max €6,000); late submission surcharges", notes: "Real-time VAT reporting within 4 days. B2B mandatory for large taxpayers, expanding." },
    { country: "Romania", region: "EU", status: "Live", model: "CTC", platform: "RO e-Factura / SPV", format: "UBL 2.1 (CIUS-RO)", goLive: "2024-01-01", penalty: "Up to 15% of invoice value; RON 5,000–10,000 for non-compliance", notes: "Mandatory B2B since Jan 2024. XML submission via SPV portal. 5-day clearance window." },
    { country: "Belgium", region: "EU", status: "Live", model: "Hybrid", platform: "Peppol BIS (BNB)", format: "UBL 2.1 (CIUS-BE)", goLive: "2026-01-01", penalty: "TBD under royal decree; administrative fines expected", notes: "Mandatory B2B e-invoicing via Peppol since Jan 2026. BNB platform. Phased: large first, SME by mid-2026." },
    { country: "Portugal", region: "EU", status: "Live", model: "Real-Time", platform: "AT (ARe / SAF-T)", format: "SAF-T / UBL 2.1", goLive: "2025-01-01", penalty: "€500–€22,500 depending on severity; business closure for repeated non-compliance", notes: "Mandatory SAF-T reporting. ARe e-invoicing expanding. Interoperability with EU standards." },
  ],
  mid: [
    { country: "Poland", region: "EU", status: "Live", model: "CTC", platform: "KSeF", format: "FA(2) XML", goLive: "2026-02-01", penalty: "Up to 100% of VAT amount; PLN 500/invoice for late submission", notes: "Mandatory B2B since Feb 2026. Real-time validation. API integration required." },
    { country: "Italy", region: "EU", status: "Live", model: "CTC", platform: "SDI", format: "FatturaPA XML", goLive: "2019-01-01", penalty: "90–180% of VAT on unreported; €250–€2,000/quarter", notes: "All B2B/B2C/B2G mandatory. 12-second SLA. Cross-border via Peppol." },
    { country: "Germany", region: "EU", status: "Announced", model: "CTC", platform: "TBD (Peppol-based)", format: "XRechnung / ZUGFeRD", goLive: "2027-01-01", penalty: "TBD — ViDA alignment expected", notes: "B2B mandate 2027. Reception 2025, issuance 2027." },
    { country: "France", region: "EU", status: "Live", model: "CTC", platform: "PPF / PDP", format: "Factur-X / UBL / CII", goLive: "2026-09-01", penalty: "€15/invoice (cap €15K/year); VAT penalties for non-reporting", notes: "Phased rollout. E-reporting for B2C. PDP certification required." },
    { country: "Spain", region: "EU", status: "Live", model: "Real-Time", platform: "SII", format: "TicketBAI / Facturae", goLive: "2017-07-01", penalty: "0.5% of invoice value/quarter (min €300, max €6,000)", notes: "4-day reporting SLA. Expanding to SMEs." },
    { country: "Romania", region: "EU", status: "Live", model: "CTC", platform: "RO e-Factura / SPV", format: "UBL 2.1 (CIUS-RO)", goLive: "2024-01-01", penalty: "Up to 15% invoice value; RON 5,000–10,000", notes: "Mandatory B2B. 5-day clearance." },
    { country: "Belgium", region: "EU", status: "Live", model: "Hybrid", platform: "Peppol BIS (BNB)", format: "UBL 2.1 (CIUS-BE)", goLive: "2026-01-01", penalty: "Administrative fines; gradual escalation for repeat non-compliance", notes: "Peppol-based B2B mandate since Jan 2026. BNB platform. E-reporting integration with VAT return." },
    { country: "Portugal", region: "EU", status: "Live", model: "Real-Time", platform: "AT (ARe / SAF-T)", format: "SAF-T / UBL 2.1", goLive: "2024-01-01", penalty: "€500–€22,500; business closure risk for severe non-compliance", notes: "ARe e-invoicing for B2G/B2B. SAF-T real-time VAT reporting. Expanding mandate scope." },
    { country: "Saudi Arabia", region: "MENA", status: "Live", model: "CTC", platform: "ZATCA (FATOORA)", format: "UBL 2.1 (ZATCA ext.)", goLive: "2023-01-01", penalty: "SAR 10,000 first offence; SAR 50,000 repeat; business suspension", notes: "Phase 2 (Integration) rolling by wave. QR code mandatory on simplified invoices." },
    { country: "India", region: "APAC", status: "Live", model: "CTC", platform: "IRP (Invoice Registration Portal)", format: "e-Invoice JSON Schema", goLive: "2020-10-01", penalty: "100% of tax due or INR 10,000 (whichever greater); e-way bill linkage", notes: "Threshold-based rollout (now ≥₹5 Cr turnover). IRN generation mandatory. GST integration." },
    { country: "Turkey", region: "MENA", status: "Live", model: "CTC", platform: "GIB (e-Fatura / e-Arşiv)", format: "UBL-TR", goLive: "2014-01-01", penalty: "Approx. 10% of unreported revenue; criminal penalties for fraud", notes: "Mature CTC. e-Fatura for B2B registered, e-Arşiv for others. Annual threshold review." },
    { country: "EU (ViDA)", region: "EU", status: "Draft", model: "CTC", platform: "EU-wide framework (Peppol backbone)", format: "EN 16931 (UBL/CII)", goLive: "2028-07-01", penalty: "Member state-defined under ViDA framework", notes: "VAT in the Digital Age directive. Mandatory intra-EU e-invoicing by 2028. Real-time reporting 2030." },
  ],
  large: [
    { country: "Poland", region: "EU", status: "Live", model: "CTC", platform: "KSeF", format: "FA(2) XML", goLive: "2026-02-01", penalty: "Up to 100% VAT; PLN 500/invoice late", notes: "Mandatory B2B. API-first. Batch & real-time modes." },
    { country: "Italy", region: "EU", status: "Live", model: "CTC", platform: "SDI", format: "FatturaPA XML", goLive: "2019-01-01", penalty: "90–180% VAT; €250–€2K/quarter", notes: "Full B2B/B2C/B2G. 12s SLA. Peppol cross-border." },
    { country: "Germany", region: "EU", status: "Announced", model: "CTC", platform: "TBD (Peppol)", format: "XRechnung / ZUGFeRD", goLive: "2027-01-01", penalty: "TBD — ViDA alignment", notes: "Reception 2025, issuance 2027." },
    { country: "France", region: "EU", status: "Live", model: "CTC", platform: "PPF / PDP", format: "Factur-X / UBL / CII", goLive: "2026-09-01", penalty: "€15/invoice (cap €15K); VAT penalties", notes: "PDP certification. E-reporting for B2C." },
    { country: "Spain", region: "EU", status: "Live", model: "Real-Time", platform: "SII", format: "TicketBAI / Facturae", goLive: "2017-07-01", penalty: "0.5%/quarter (min €300, max €6K)", notes: "4-day SLA. Expanding mandate." },
    { country: "Romania", region: "EU", status: "Live", model: "CTC", platform: "RO e-Factura / SPV", format: "UBL 2.1 (CIUS-RO)", goLive: "2024-01-01", penalty: "Up to 15% invoice value", notes: "Mandatory B2B. 5-day clearance." },
    { country: "Belgium", region: "EU", status: "Live", model: "Hybrid", platform: "Peppol BIS (BNB)", format: "UBL 2.1 (CIUS-BE)", goLive: "2026-01-01", penalty: "Administrative fines; escalation for repeat offenders", notes: "B2B Peppol mandate since Jan 2026. Multi-entity compliance. Enterprise-level BNB integration." },
    { country: "Portugal", region: "EU", status: "Live", model: "Real-Time", platform: "AT (ARe / SAF-T)", format: "SAF-T / UBL 2.1", goLive: "2024-01-01", penalty: "€500–€22,500; business closure for systematic non-compliance", notes: "Enterprise SAF-T + ARe compliance. Real-time tax authority reporting. Multi-entity consolidated submissions." },
    { country: "Saudi Arabia", region: "MENA", status: "Live", model: "CTC", platform: "ZATCA (FATOORA)", format: "UBL 2.1 (ZATCA)", goLive: "2023-01-01", penalty: "SAR 10K first; SAR 50K repeat", notes: "Phase 2 Integration waves." },
    { country: "India", region: "APAC", status: "Live", model: "CTC", platform: "IRP", format: "e-Invoice JSON", goLive: "2020-10-01", penalty: "100% tax or ₹10K", notes: "≥₹5 Cr threshold. IRN + GST." },
    { country: "Turkey", region: "MENA", status: "Live", model: "CTC", platform: "GIB", format: "UBL-TR", goLive: "2014-01-01", penalty: "~10% unreported revenue", notes: "Mature CTC. Annual threshold." },
    { country: "Brazil", region: "LATAM", status: "Live", model: "CTC", platform: "SEFAZ (NF-e / NFS-e)", format: "NF-e XML 4.0", goLive: "2008-01-01", penalty: "1% of invoice value; business licence suspension risk", notes: "Most mature LATAM CTC. Federal (NF-e) + Municipal (NFS-e). Real-time SEFAZ authorization." },
    { country: "Mexico", region: "LATAM", status: "Live", model: "CTC", platform: "SAT (CFDI)", format: "CFDI 4.0 XML", goLive: "2014-01-01", penalty: "70–100% of tax evaded; criminal prosecution for systematic non-compliance", notes: "CFDI 4.0 mandatory. PAC (Authorized Certification Provider) required. Complement schemas." },
    { country: "EU (ViDA)", region: "EU", status: "Draft", model: "CTC", platform: "EU framework (Peppol)", format: "EN 16931", goLive: "2028-07-01", penalty: "Member state-defined", notes: "Intra-EU e-invoicing 2028. Real-time reporting 2030." },
    { country: "Chile", region: "LATAM", status: "Live", model: "CTC", platform: "SII (Servicio de Impuestos Internos)", format: "DTE XML", goLive: "2014-01-01", penalty: "50–300% of tax; business closure for repeat", notes: "Full CTC. Electronic Taxpayer Documents. Set exchange required." },
    { country: "Egypt", region: "MENA", status: "Live", model: "CTC", platform: "ETA (e-Invoice / e-Receipt)", format: "JSON (ETA schema)", goLive: "2022-01-01", penalty: "EGP 20,000–100,000; tax deduction denial", notes: "Phased rollout complete. e-Receipt expanding to B2C." },
  ],
  global: [
    { country: "Poland", region: "EU", status: "Live", model: "CTC", platform: "KSeF", format: "FA(2) XML", goLive: "2026-02-01", penalty: "Up to 100% VAT; PLN 500/invoice", notes: "API-first. Batch & real-time." },
    { country: "Italy", region: "EU", status: "Live", model: "CTC", platform: "SDI", format: "FatturaPA XML", goLive: "2019-01-01", penalty: "90–180% VAT; €250–€2K/qtr", notes: "Full mandatory. 12s SLA." },
    { country: "Germany", region: "EU", status: "Announced", model: "CTC", platform: "TBD (Peppol)", format: "XRechnung / ZUGFeRD", goLive: "2027-01-01", penalty: "TBD", notes: "Reception 2025, issuance 2027." },
    { country: "France", region: "EU", status: "Live", model: "CTC", platform: "PPF / PDP", format: "Factur-X / UBL / CII", goLive: "2026-09-01", penalty: "€15/inv (cap €15K)", notes: "PDP certified. E-reporting B2C." },
    { country: "Spain", region: "EU", status: "Live", model: "Real-Time", platform: "SII", format: "TicketBAI / Facturae", goLive: "2017-07-01", penalty: "0.5%/qtr", notes: "4-day SLA." },
    { country: "Romania", region: "EU", status: "Live", model: "CTC", platform: "RO e-Factura", format: "UBL 2.1", goLive: "2024-01-01", penalty: "Up to 15%", notes: "5-day clearance." },
    { country: "Belgium", region: "EU", status: "Live", model: "Hybrid", platform: "Peppol BIS (BNB)", format: "UBL 2.1 (CIUS-BE)", goLive: "2026-01-01", penalty: "Admin fines; escalation", notes: "B2B Peppol since Jan 2026. Multi-hub compliance." },
    { country: "Portugal", region: "EU", status: "Live", model: "Real-Time", platform: "AT (ARe / SAF-T)", format: "SAF-T / UBL 2.1", goLive: "2024-01-01", penalty: "€500–€22,500", notes: "ARe + SAF-T. Multi-entity." },
    { country: "Saudi Arabia", region: "MENA", status: "Live", model: "CTC", platform: "ZATCA", format: "UBL 2.1", goLive: "2023-01-01", penalty: "SAR 10–50K", notes: "Integration waves." },
    { country: "India", region: "APAC", status: "Live", model: "CTC", platform: "IRP", format: "JSON", goLive: "2020-10-01", penalty: "100% tax or ₹10K", notes: "≥₹5 Cr." },
    { country: "Turkey", region: "MENA", status: "Live", model: "CTC", platform: "GIB", format: "UBL-TR", goLive: "2014-01-01", penalty: "~10% revenue", notes: "Mature CTC." },
    { country: "Brazil", region: "LATAM", status: "Live", model: "CTC", platform: "SEFAZ", format: "NF-e XML 4.0", goLive: "2008-01-01", penalty: "1% invoice value", notes: "NF-e + NFS-e. Real-time." },
    { country: "Mexico", region: "LATAM", status: "Live", model: "CTC", platform: "SAT (CFDI)", format: "CFDI 4.0", goLive: "2014-01-01", penalty: "70–100% tax evaded", notes: "PAC required. CFDI 4.0." },
    { country: "Chile", region: "LATAM", status: "Live", model: "CTC", platform: "SII", format: "DTE XML", goLive: "2014-01-01", penalty: "50–300% tax", notes: "Full CTC." },
    { country: "Egypt", region: "MENA", status: "Live", model: "CTC", platform: "ETA", format: "JSON", goLive: "2022-01-01", penalty: "EGP 20–100K", notes: "e-Receipt expanding." },
    { country: "EU (ViDA)", region: "EU", status: "Draft", model: "CTC", platform: "EU Peppol", format: "EN 16931", goLive: "2028-07-01", penalty: "Member-state", notes: "Intra-EU 2028. RT 2030." },
    { country: "Malaysia", region: "APAC", status: "Live", model: "CTC", platform: "MyInvois (LHDN)", format: "UBL 2.1 (MY ext.)", goLive: "2024-08-01", penalty: "MYR 200–20,000 per offence; imprisonment up to 6 months", notes: "Phased: RM100M+ Aug 2024, all taxpayers by Jul 2025. API-based." },
    { country: "South Korea", region: "APAC", status: "Live", model: "CTC", platform: "NTS (e-Tax Invoice)", format: "XML (NTS schema)", goLive: "2011-01-01", penalty: "2% of supply value for non-issuance; 1% for late", notes: "Mature system. Threshold-based. Cross-border via Peppol pilot." },
    { country: "Colombia", region: "LATAM", status: "Live", model: "CTC", platform: "DIAN (Factura Electrónica)", format: "UBL 2.1 (DIAN ext.)", goLive: "2019-01-01", penalty: "5% of undeclared amounts; closure for systematic non-compliance", notes: "Full CTC. Validation within 10 minutes. Attached document support." },
    { country: "Nigeria", region: "Africa", status: "Live", model: "CTC", platform: "FIRS (eInvoice)", format: "JSON/XML (FIRS)", goLive: "2024-01-01", penalty: "₦50,000 per invoice; denial of tax deductions", notes: "Phased rollout. IRN generation required." },
    { country: "Philippines", region: "APAC", status: "Announced", model: "CTC", platform: "BIR (EIS)", format: "TBD (JSON likely)", goLive: "2025-07-01", penalty: "PHP 25,000 per offence; business permit risk", notes: "Electronic Invoicing System pilot. Large taxpayers first." },
    { country: "Japan", region: "APAC", status: "Live", model: "Post-Audit", platform: "Qualified Invoice System (Peppol JP)", format: "Peppol BIS / JP-PINT", goLive: "2023-10-01", penalty: "Denial of input tax credit for non-qualifying invoices", notes: "Qualified Invoice Preservation. Peppol adopted for e-invoice exchange. Not CTC — post-audit." },
    { country: "Australia", region: "APAC", status: "Voluntary", model: "Voluntary", platform: "Peppol (ATO endorsed)", format: "Peppol BIS 3.0", goLive: "N/A", penalty: "No penalty — voluntary adoption", notes: "Government endorsement of Peppol. B2G increasingly mandated." },
    { country: "Singapore", region: "APAC", status: "Voluntary", model: "Voluntary", platform: "InvoiceNow (Peppol)", format: "Peppol BIS 3.0", goLive: "N/A", penalty: "No penalty — voluntary (B2G may mandate)", notes: "InvoiceNow network. IMDA-led. B2G pilot expanding." },
  ],
};

// ─── TAB 2: TECHNICAL READINESS DATA ───
const READINESS_DIMENSIONS = {
  sme: [
    { dimension: "Format Support", description: "Ability to generate compliant e-invoice formats (UBL, CII, local schemas)", maxScore: 5, questions: ["Can your system generate UBL 2.1 XML?", "Can it produce local schema variants (FA(2), FatturaPA)?", "Is Factur-X / ZUGFeRD hybrid PDF+XML supported?", "Can format mapping be configured without code changes?", "Is there a format validation engine pre-submission?"] },
    { dimension: "Connectivity", description: "Technical connection to government platforms and trading partners", maxScore: 5, questions: ["Is API connectivity to KSeF/SDI/other platforms configured?", "Is there a Peppol Access Point relationship?", "Can SFTP/AS4 be used as fallback?", "Are connection credentials and certificates managed securely?", "Is there a connectivity health monitoring dashboard?"] },
    { dimension: "ERP Integration", description: "Depth of integration between e-invoicing and core ERP/accounting system", maxScore: 5, questions: ["Are invoices auto-generated from ERP billing runs?", "Does e-invoice status flow back to AR subledger in real-time?", "Is tax determination integrated (correct VAT codes per jurisdiction)?", "Are credit notes and corrections handled in the same flow?", "Can batch and real-time modes be toggled per jurisdiction?"] },
    { dimension: "Digital Signatures", description: "Cryptographic signing and certificate management capabilities", maxScore: 5, questions: ["Are qualified electronic signatures (QES) supported?", "Is certificate lifecycle management automated (renewal alerts)?", "Are HSM/cloud-based signing options available?", "Is the signing compliant with eIDAS / local requirements?", "Can different signing policies be applied per jurisdiction?"] },
    { dimension: "Archiving", description: "Compliant storage and retrieval of e-invoices per legal retention periods", maxScore: 5, questions: ["Are e-invoices archived in original XML format?", "Is the retention period configurable per jurisdiction (5–10+ years)?", "Is tamper-proof storage (WORM or equivalent) in place?", "Can archived invoices be retrieved within audit SLA?", "Is there a destruction policy aligned with retention expiry?"] },
    { dimension: "Tax Engine Alignment", description: "Integration with tax determination and reporting engines", maxScore: 5, questions: ["Is VAT/GST determination automated per jurisdiction?", "Are tax codes mapped to e-invoice schema requirements?", "Is the tax engine updated for rate/rule changes?", "Can reverse charge / withholding tax scenarios be handled?", "Is there reconciliation between tax engine output and submitted invoices?"] },
  ],
  mid: [
    { dimension: "Format Support", description: "Multi-format generation capability for jurisdictions served", maxScore: 5, questions: ["UBL 2.1 XML generation?", "Local schema variants (FA(2), FatturaPA, CFDI, ZATCA)?", "Factur-X / ZUGFeRD hybrid?", "No-code format mapping configuration?", "Pre-submission format validation engine?"] },
    { dimension: "Connectivity", description: "Government platform and Peppol network connectivity", maxScore: 5, questions: ["API connectivity to all required platforms?", "Peppol Access Point (direct or via provider)?", "SFTP/AS4 fallback channels?", "Secure credential and certificate management?", "Connectivity health monitoring and alerting?"] },
    { dimension: "ERP Integration", description: "Bidirectional ERP-to-e-invoicing data flow", maxScore: 5, questions: ["Auto-generation from ERP billing?", "Real-time status feedback to AR subledger?", "Integrated tax determination?", "Credit note and correction handling?", "Batch/real-time mode per jurisdiction?"] },
    { dimension: "Digital Signatures", description: "Qualified signing and certificate lifecycle management", maxScore: 5, questions: ["QES supported?", "Automated certificate renewal?", "HSM/cloud signing?", "eIDAS / local compliance?", "Per-jurisdiction signing policies?"] },
    { dimension: "Archiving", description: "Compliant long-term storage with audit retrieval", maxScore: 5, questions: ["Original XML archiving?", "Configurable retention per jurisdiction?", "Tamper-proof (WORM) storage?", "Audit SLA retrieval?", "Retention expiry destruction policy?"] },
    { dimension: "Tax Engine", description: "Automated tax determination and reconciliation", maxScore: 5, questions: ["Auto VAT/GST per jurisdiction?", "Tax-to-schema mapping?", "Rate/rule change updates?", "Reverse charge / WHT handling?", "Tax engine-to-submission reconciliation?"] },
    { dimension: "Error Handling", description: "Rejection management, retry logic, and exception workflows", maxScore: 5, questions: ["Automated rejection parsing and error categorization?", "Retry logic with exponential backoff?", "Exception queue with SLA tracking?", "Root cause analytics on rejection patterns?", "Automated correction suggestions?"] },
    { dimension: "Multi-Entity Support", description: "Ability to handle multiple legal entities and tax registrations", maxScore: 5, questions: ["Multi-entity configuration without code changes?", "Per-entity tax registration and platform credentials?", "Consolidated vs. entity-level submission modes?", "Inter-company e-invoice handling?", "Entity-level compliance reporting?"] },
  ],
  large: [
    { dimension: "Format Support", description: "Enterprise multi-format generation across all jurisdictions", maxScore: 5, questions: ["UBL 2.1 + all local schemas?", "Hybrid PDF+XML (Factur-X/ZUGFeRD)?", "No-code configurable mapping engine?", "Pre-submission validation with jurisdiction rules?", "Version management for schema updates?"] },
    { dimension: "Connectivity", description: "Enterprise-grade platform connectivity with failover", maxScore: 5, questions: ["API to all government platforms?", "Peppol Access Point (direct)?", "Multi-channel fallback (AS4/SFTP/API)?", "HSM-secured credentials?", "Real-time connectivity monitoring + auto-failover?"] },
    { dimension: "ERP Integration", description: "Deep bidirectional integration with ERP landscape", maxScore: 5, questions: ["Auto-generation from ERP?", "Real-time status to AR/AP subledgers?", "Integrated tax engine?", "Full document lifecycle (CN, corrections, cancellations)?", "Configurable batch/real-time per entity+jurisdiction?"] },
    { dimension: "Digital Signatures", description: "Enterprise PKI and qualified signature infrastructure", maxScore: 5, questions: ["QES + advanced electronic signatures?", "Enterprise PKI or cloud HSM?", "Automated lifecycle (renewal, revocation)?", "Multi-jurisdiction eIDAS + local compliance?", "Audit trail for all signing events?"] },
    { dimension: "Archiving", description: "Enterprise-grade compliant archival with global retention", maxScore: 5, questions: ["Original format archiving (XML + PDF)?", "Global retention policy engine?", "WORM / immutable storage?", "Sub-second audit retrieval?", "Automated destruction with compliance logging?"] },
    { dimension: "Tax Engine", description: "Global tax determination and compliance engine", maxScore: 5, questions: ["Global VAT/GST/WHT automation?", "Dynamic tax-to-schema mapping?", "Real-time rate/rule updates?", "Complex scenarios (triangulation, reverse charge, margin scheme)?", "Cross-system tax reconciliation?"] },
    { dimension: "Error Handling", description: "Enterprise exception management with AI-assisted resolution", maxScore: 5, questions: ["AI-powered rejection categorization?", "Intelligent retry with context-aware backoff?", "SLA-tracked exception queues?", "Pattern analytics and root cause dashboards?", "Auto-correction engine?"] },
    { dimension: "Multi-Entity", description: "Complex multi-entity, multi-registration architecture", maxScore: 5, questions: ["Unlimited entity configuration?", "Per-entity credentials and tax registrations?", "IC e-invoice automation?", "Consolidated compliance reporting?", "Entity hierarchy and delegation rules?"] },
    { dimension: "Testing & Sandbox", description: "Pre-production testing and sandbox environment capability", maxScore: 5, questions: ["Sandbox environments for all platforms?", "Automated regression testing suite?", "Schema version migration testing?", "Load testing for peak volume periods?", "Production-like test data generation?"] },
    { dimension: "Vendor Management", description: "E-invoicing service provider governance and SLA management", maxScore: 5, questions: ["Provider SLA monitoring dashboard?", "Multi-provider strategy (primary + backup)?", "Contractual SLA penalties enforced?", "Provider switch-over playbook?", "Annual provider performance review?"] },
  ],
  global: [
    { dimension: "Format Support", description: "Global multi-format engine across 20+ jurisdictions", maxScore: 5, questions: ["All major schema families (UBL, CII, local)?", "Hybrid formats (Factur-X, ZUGFeRD)?", "No-code mapping with version control?", "AI-assisted validation per jurisdiction?", "Schema update pipeline with regression testing?"] },
    { dimension: "Connectivity", description: "Global platform connectivity mesh with geo-redundancy", maxScore: 5, questions: ["API to 20+ government platforms?", "Multi-region Peppol Access Points?", "Geo-redundant failover architecture?", "Zero-trust credential management?", "Global connectivity SLA dashboard?"] },
    { dimension: "ERP Integration", description: "Multi-ERP landscape integration (SAP, Oracle, etc.)", maxScore: 5, questions: ["Multi-ERP support (SAP, Oracle, D365, etc.)?", "Real-time bidirectional for all ERPs?", "Unified tax engine across ERP landscape?", "Full lifecycle across all systems?", "Middleware / integration platform (MuleSoft, Dell Boomi)?"] },
    { dimension: "Digital Signatures", description: "Global PKI infrastructure with sovereign key management", maxScore: 5, questions: ["Global qualified + advanced signature support?", "Regional HSM / sovereign key storage?", "Automated lifecycle across all jurisdictions?", "Cross-border eIDAS mutual recognition?", "Cryptographic algorithm agility (post-quantum readiness)?"] },
    { dimension: "Archiving", description: "Global compliant archival with data sovereignty", maxScore: 5, questions: ["Multi-region archival with data sovereignty compliance?", "Global retention policy engine (per jurisdiction)?", "WORM + encryption at rest?", "Global audit retrieval SLA?", "Cross-border data transfer compliance (GDPR, etc.)?"] },
    { dimension: "Tax Engine", description: "Global tax automation across all regimes", maxScore: 5, questions: ["Global VAT/GST/sales tax/WHT automation?", "Dynamic mapping across all jurisdictions?", "Real-time legislative change tracking?", "Complex multi-jurisdiction scenarios?", "Global tax-to-submission reconciliation?"] },
    { dimension: "Error Handling", description: "Global exception management with ML-driven resolution", maxScore: 5, questions: ["ML-powered rejection analysis?", "Jurisdiction-aware retry strategies?", "Global exception SLA tracking?", "Cross-jurisdiction pattern analytics?", "Auto-correction with human-in-the-loop?"] },
    { dimension: "Multi-Entity", description: "Global entity management across 50+ legal entities", maxScore: 5, questions: ["50+ entity configuration?", "Per-entity platform credentials globally?", "Global IC e-invoice automation with TP alignment?", "Consolidated global compliance reporting?", "Entity lifecycle (M&A, spin-off, closure)?"] },
    { dimension: "Testing & Sandbox", description: "Global testing infrastructure with production parity", maxScore: 5, questions: ["Sandbox for all 20+ platforms?", "Global regression suite?", "Multi-jurisdiction load testing?", "Schema migration testing pipeline?", "Synthetic test data per jurisdiction?"] },
    { dimension: "Vendor Management", description: "Global provider governance across regions", maxScore: 5, questions: ["Multi-region provider SLA dashboard?", "Regional primary/backup provider strategy?", "Global SLA enforcement framework?", "Cross-provider interoperability testing?", "Annual global provider scorecard?"] },
    { dimension: "Data Sovereignty", description: "Compliance with cross-border data transfer regulations", maxScore: 5, questions: ["Data residency per jurisdiction mapped?", "Cross-border transfer mechanisms (SCCs, adequacy)?", "GDPR / local privacy law compliance?", "Government access request protocols?", "Data localization architecture (regional data centers)?"] },
    { dimension: "Sanctions & Compliance", description: "Sanctions screening integration for cross-border invoicing", maxScore: 5, questions: ["OFAC/EU/UN sanctions list screening on invoices?", "Denied party screening integrated?", "Dual-use goods flagging?", "Compliance hold workflow for flagged invoices?", "Audit trail for all screening decisions?"] },
  ],
};

// ─── TAB 3: PROCESS IMPACT DATA ───
const PROCESS_IMPACT = {
  sme: [
    { process: "Invoice Generation (L4: 8.3.1.1)", severity: "High", status: "Modify", description: "Must generate structured XML in addition to PDF. Tax codes and mandatory fields must align with e-invoice schema.", raci: "AR Clerk (R), Controller (A)", effort: "Medium" },
    { process: "Invoice Delivery (L4: 8.3.1.2)", severity: "High", status: "New Workflow", description: "Delivery shifts from email/print to API submission to government platform (KSeF, SDI, etc.). New connectivity layer required.", raci: "System (R), AR Manager (A)", effort: "High" },
    { process: "Credit Note Processing (L4: 8.3.1.3)", severity: "High", status: "Modify", description: "Credit notes must reference original e-invoice ID. Correction workflows must comply with platform-specific rules.", raci: "AR Clerk (R), Controller (A)", effort: "Medium" },
    { process: "Cash Application (L4: 8.3.2.1)", severity: "Low", status: "Unaffected", description: "Cash application process largely unchanged. Benefit: e-invoice IDs improve auto-matching accuracy.", raci: "AR Clerk (R), AR Manager (A)", effort: "Low" },
    { process: "Collections Follow-up (L4: 8.3.3.2)", severity: "Low", status: "Unaffected", description: "Collections process unchanged. e-Invoice status (accepted/rejected) provides additional data point for customer communication.", raci: "AR Clerk (R), AR Manager (A)", effort: "Low" },
    { process: "Dispute Management (L4: 8.3.4.1)", severity: "Medium", status: "Modify", description: "Disputes referencing e-invoices must include platform invoice ID. Dispute resolution may trigger credit note e-submission.", raci: "AR Manager (R), Controller (A)", effort: "Medium" },
    { process: "AR Reporting (L4: 8.3.5.1)", severity: "Medium", status: "Modify", description: "New compliance metrics needed: acceptance rate, rejection rate, submission latency. Dashboard integration required.", raci: "AR Manager (R), Controller (A)", effort: "Medium" },
    { process: "Archiving & Retention (L4: 8.3.6.1)", severity: "High", status: "New Workflow", description: "Original XML must be archived alongside PDF. Retention periods per jurisdiction. Tamper-proof storage required.", raci: "IT (R), Controller (A)", effort: "High" },
  ],
  mid: [
    { process: "Invoice Generation (L4: 8.3.1.1)", severity: "High", status: "Modify", description: "Multi-format XML generation. Tax code alignment across jurisdictions. PO reference and mandatory field validation.", raci: "Billing Team (R), AR Director (A)", effort: "High" },
    { process: "Invoice Delivery (L4: 8.3.1.2)", severity: "High", status: "New Workflow", description: "Multi-platform API connectivity. Peppol network for cross-border. Platform-specific submission rules and SLAs.", raci: "System (R), IT Lead (A), AR Director (A)", effort: "High" },
    { process: "Credit Note Processing (L4: 8.3.1.3)", severity: "High", status: "Modify", description: "Multi-platform credit note submission. Original invoice cross-referencing. Correction vs. cancellation per jurisdiction.", raci: "Billing Team (R), AR Director (A)", effort: "Medium" },
    { process: "Cash Application (L4: 8.3.2.1)", severity: "Low", status: "Minor Enhance", description: "e-Invoice IDs enhance auto-matching. Platform-issued invoice numbers may differ from internal — mapping needed.", raci: "Cash App Specialist (R), AR Director (A)", effort: "Low" },
    { process: "Collections Follow-up (L4: 8.3.3.2)", severity: "Low", status: "Unaffected", description: "e-Invoice acceptance confirmation provides proof of delivery — strengthens collections position.", raci: "Collections Specialist (R), Collections Manager (A)", effort: "Low" },
    { process: "Dispute Management (L4: 8.3.4.1)", severity: "Medium", status: "Modify", description: "Platform invoice IDs in dispute reference. Automated credit note e-submission on dispute resolution. Multi-jurisdiction dispute routing.", raci: "Dispute Analyst (R), AR Director (A)", effort: "Medium" },
    { process: "AR Reporting (L4: 8.3.5.1)", severity: "Medium", status: "Modify", description: "Compliance KPI integration. Multi-jurisdiction acceptance/rejection dashboards. Penalty exposure tracking.", raci: "FP&A (R), Controller (A)", effort: "Medium" },
    { process: "Archiving & Retention (L4: 8.3.6.1)", severity: "High", status: "New Workflow", description: "Multi-jurisdiction archival. Per-country retention periods. WORM storage. Audit trail compliance.", raci: "IT (R), Controller (A), Compliance (C)", effort: "High" },
    { process: "Vendor/Provider Management (L4: 8.3.7.1)", severity: "Medium", status: "New Workflow", description: "E-invoicing provider selection, onboarding, SLA management. PDP/PAC certification verification.", raci: "Procurement (R), IT Lead (A)", effort: "Medium" },
  ],
  large: [
    { process: "Invoice Generation (L4: 8.3.1.1)", severity: "High", status: "Modify", description: "Enterprise multi-format engine. Dynamic field mapping per jurisdiction. ERP-native generation preferred. Schema versioning.", raci: "Billing Team (R), AR Director (A), IT Architect (C)", effort: "High" },
    { process: "Invoice Delivery (L4: 8.3.1.2)", severity: "High", status: "New Workflow", description: "Enterprise API mesh to 10+ platforms. Peppol direct access point. Failover architecture. SLA monitoring.", raci: "System (R), Enterprise Architect (A), IT Ops (C)", effort: "Very High" },
    { process: "Credit Note Processing (L4: 8.3.1.3)", severity: "High", status: "Modify", description: "Multi-platform CN workflow. Jurisdiction-specific correction rules. Automated original invoice linkage.", raci: "Billing Team (R), AR Director (A)", effort: "High" },
    { process: "Cash Application (L4: 8.3.2.1)", severity: "Medium", status: "Enhance", description: "AI-enhanced matching using e-invoice IDs. Platform number-to-internal number mapping. Real-time status integration.", raci: "Cash App Lead (R), AR Director (A)", effort: "Medium" },
    { process: "Collections Follow-up (L4: 8.3.3.2)", severity: "Low", status: "Minor Enhance", description: "e-Invoice delivery confirmation as proof-of-receipt. Integration with collections worklist for compliance status.", raci: "Collections Manager (R), AR Director (A)", effort: "Low" },
    { process: "Dispute Management (L4: 8.3.4.1)", severity: "Medium", status: "Modify", description: "Platform-aware dispute workflow. Automated CN e-submission. Multi-jurisdiction dispute complexity scoring.", raci: "Dispute Manager (R), AR Director (A)", effort: "Medium" },
    { process: "AR Reporting (L4: 8.3.5.1)", severity: "High", status: "Modify", description: "Enterprise compliance dashboard. Multi-entity, multi-jurisdiction views. Real-time penalty exposure. Audit readiness scoring.", raci: "FP&A Lead (R), CFO (A)", effort: "High" },
    { process: "Archiving & Retention (L4: 8.3.6.1)", severity: "High", status: "New Workflow", description: "Enterprise archival platform. Global retention engine. WORM + encryption. Sub-second retrieval. Automated destruction.", raci: "IT Architect (R), Legal (A), Compliance (C)", effort: "Very High" },
    { process: "Vendor Management (L4: 8.3.7.1)", severity: "High", status: "New Workflow", description: "Multi-provider strategy. SLA governance framework. Provider failover playbook. Annual performance review.", raci: "Procurement (R), IT Director (A), CFO (I)", effort: "High" },
    { process: "Testing & QA (L4: 8.3.8.1)", severity: "High", status: "New Workflow", description: "Sandbox testing per platform. Regression suite. Schema migration testing. Load testing for peak periods.", raci: "QA Lead (R), IT Director (A)", effort: "High" },
  ],
  global: [
    { process: "Invoice Generation (L4: 8.3.1.1)", severity: "High", status: "Modify", description: "Global multi-format engine across 20+ schemas. AI-validated field mapping. Multi-ERP native generation. Schema version pipeline.", raci: "Global Billing (R), Group AR Director (A), Enterprise Architect (C)", effort: "Very High" },
    { process: "Invoice Delivery (L4: 8.3.1.2)", severity: "High", status: "New Workflow", description: "Global API mesh to 20+ platforms. Multi-region Peppol. Geo-redundant failover. Zero-downtime deployment. Global SLA monitoring.", raci: "System (R), Global IT (A), Regional IT (C)", effort: "Very High" },
    { process: "Credit Note Processing (L4: 8.3.1.3)", severity: "High", status: "Modify", description: "Global CN workflow with per-jurisdiction rules. IC credit notes. Transfer pricing alignment. Cross-entity correction chains.", raci: "Global Billing (R), Group AR Director (A), TP Team (C)", effort: "High" },
    { process: "Cash Application (L4: 8.3.2.1)", severity: "Medium", status: "Enhance", description: "Global AI matching with e-invoice IDs. Multi-currency platform number mapping. IC netting integration.", raci: "Global Cash App (R), Group AR Director (A)", effort: "Medium" },
    { process: "Collections Follow-up (L4: 8.3.3.2)", severity: "Low", status: "Minor Enhance", description: "Global e-invoice delivery confirmation. Collections worklist compliance flag per jurisdiction.", raci: "Regional Collections (R), Group AR Director (A)", effort: "Low" },
    { process: "Dispute Management (L4: 8.3.4.1)", severity: "Medium", status: "Modify", description: "Global dispute workflow with platform references. Multi-jurisdiction CN auto-submission. IC dispute e-invoice handling.", raci: "Regional Dispute (R), Group AR Director (A)", effort: "Medium" },
    { process: "AR Reporting (L4: 8.3.5.1)", severity: "High", status: "Modify", description: "Global compliance command center. Multi-entity, multi-jurisdiction, multi-currency views. Real-time penalty exposure. Board reporting.", raci: "Group FP&A (R), Group CFO (A)", effort: "Very High" },
    { process: "Archiving (L4: 8.3.6.1)", severity: "High", status: "New Workflow", description: "Global archival with data sovereignty. Regional data centers. WORM + encryption. Cross-border transfer compliance. Global retention.", raci: "Global IT (R), Group Legal (A), DPO (C)", effort: "Very High" },
    { process: "Vendor Management (L4: 8.3.7.1)", severity: "High", status: "New Workflow", description: "Global multi-provider governance. Regional primary/backup. Cross-provider interoperability. Global SLA scorecard.", raci: "Global Procurement (R), Group IT Director (A)", effort: "High" },
    { process: "Testing & QA (L4: 8.3.8.1)", severity: "High", status: "New Workflow", description: "Global sandbox infrastructure. Multi-jurisdiction regression. Schema migration pipeline. Synthetic test data per country.", raci: "Global QA (R), Group IT Director (A)", effort: "Very High" },
    { process: "Sanctions Screening (L4: 8.3.9.1)", severity: "High", status: "New Workflow", description: "Invoice-level sanctions/AML screening for cross-border e-invoices. Compliance hold workflow. Audit trail.", raci: "Compliance (R), Group Legal (A), Group CFO (I)", effort: "High" },
    { process: "Data Sovereignty (L4: 8.3.10.1)", severity: "High", status: "New Workflow", description: "Cross-border data transfer impact assessment. GDPR / local privacy compliance. Government access protocols. Regional architecture.", raci: "DPO (R), Group Legal (A), Global IT (C)", effort: "Very High" },
  ],
};

// ─── TAB 4: ROADMAP DATA ───
const ROADMAP_PHASES = {
  sme: [
    { phase: "Discovery", weeks: "1–2", color: "#22D3EE", tasks: ["Map current invoice workflow end-to-end", "Identify jurisdictions requiring e-invoicing", "Assess current ERP e-invoicing capabilities", "Document gap between current state and mandate requirements", "Select e-invoicing provider (if needed)"] },
    { phase: "Design", weeks: "3–4", color: "#3B82F6", tasks: ["Define target e-invoice format per jurisdiction", "Design API connectivity architecture", "Map tax code-to-schema field alignment", "Design archival and retention approach", "Define error handling and exception workflow"] },
    { phase: "Build", weeks: "5–7", color: "#A855F7", tasks: ["Configure e-invoice generation in ERP or middleware", "Establish API connectivity to government platforms", "Implement digital signature capability", "Set up compliant archival storage", "Build rejection handling and retry logic"] },
    { phase: "Test", weeks: "8–9", color: "#F59E0B", tasks: ["Platform sandbox testing (KSeF test, SDI test, etc.)", "End-to-end invoice lifecycle testing", "Credit note and correction flow testing", "Volume and performance testing", "User acceptance testing with AR team"] },
    { phase: "Go-Live", weeks: "10", color: "#10B981", tasks: ["Production cutover (parallel run recommended)", "Monitor acceptance/rejection rates closely", "Escalation path for rejected invoices", "Communication to customers about new invoice format", "Post go-live daily health check"] },
    { phase: "Hypercare", weeks: "11–12", color: "#6366F1", tasks: ["Daily monitoring of acceptance rates", "Rapid response to rejections and errors", "Customer feedback collection", "Process refinement based on live data", "Handover to BAU operations"] },
  ],
  mid: [
    { phase: "Discovery", weeks: "1–3", color: "#22D3EE", tasks: ["Multi-jurisdiction mandate mapping", "ERP capability assessment across entities", "Provider landscape evaluation (3+ vendors)", "Current process documentation with gap analysis", "Stakeholder alignment (Finance, IT, Tax, Legal)", "Budget and resource planning"] },
    { phase: "Design", weeks: "4–6", color: "#3B82F6", tasks: ["Multi-format target architecture", "API connectivity design per platform", "Tax engine alignment specification", "Archival architecture with retention matrix", "Error handling and exception workflow design", "Testing strategy and sandbox planning", "Change management and training plan"] },
    { phase: "Build", weeks: "7–11", color: "#A855F7", tasks: ["ERP configuration for e-invoice generation", "Multi-platform API connectivity build", "Digital signature infrastructure", "Archival platform setup", "Exception management workflow build", "Dashboard and reporting development", "Integration testing environment setup"] },
    { phase: "Test", weeks: "12–14", color: "#F59E0B", tasks: ["Per-jurisdiction sandbox testing", "Multi-entity end-to-end testing", "Credit note and correction testing", "Volume and peak load testing", "Tax determination accuracy testing", "UAT with Finance and AR teams", "Parallel run preparation"] },
    { phase: "Go-Live", weeks: "15–16", color: "#10B981", tasks: ["Phased rollout by jurisdiction priority", "Parallel run for first jurisdiction (2 weeks)", "Real-time monitoring dashboard activation", "Customer communication program", "Escalation path and war room setup"] },
    { phase: "Hypercare", weeks: "17–20", color: "#6366F1", tasks: ["Per-jurisdiction health monitoring", "Rejection root cause analysis", "Process optimization based on live metrics", "Provider SLA validation", "Training reinforcement", "BAU handover and documentation"] },
  ],
  large: [
    { phase: "Discovery", weeks: "1–4", color: "#22D3EE", tasks: ["Global mandate landscape mapping (10+ jurisdictions)", "Enterprise ERP landscape assessment", "Provider RFP process (5+ vendors)", "Process impact analysis across OtC value stream", "Enterprise stakeholder alignment (C-suite, Tax, Legal, IT, Treasury)", "Business case and investment approval", "Program governance structure"] },
    { phase: "Design", weeks: "5–9", color: "#3B82F6", tasks: ["Enterprise integration architecture (API mesh, middleware)", "Multi-format engine specification", "Global tax engine alignment", "Enterprise archival with data sovereignty design", "Exception management and AI resolution design", "Multi-jurisdiction testing strategy", "Global change management program", "Vendor SLA framework design"] },
    { phase: "Build", weeks: "10–18", color: "#A855F7", tasks: ["Enterprise e-invoice engine build/configure", "Multi-platform API connectivity (10+ platforms)", "Enterprise PKI / signing infrastructure", "Archival platform with global retention engine", "AI-powered exception management", "Compliance dashboard and real-time monitoring", "Integration with collections, cash app, disputes", "Load balancing and failover architecture"] },
    { phase: "Test", weeks: "19–23", color: "#F59E0B", tasks: ["Per-jurisdiction sandbox certification", "Multi-entity integration testing", "Cross-border (Peppol) testing", "Enterprise load and performance testing", "Tax determination accuracy validation", "IFRS / SOX compliance testing", "Parallel run (jurisdiction wave 1)", "Security and penetration testing"] },
    { phase: "Go-Live", weeks: "24–28", color: "#10B981", tasks: ["Wave 1: Highest-risk/highest-volume jurisdictions", "Wave 2: Remaining EU jurisdictions", "Wave 3: Non-EU mandated jurisdictions", "Global monitoring command center", "Customer and trading partner communication", "Per-wave parallel run and cutover"] },
    { phase: "Hypercare", weeks: "29–36", color: "#6366F1", tasks: ["Per-jurisdiction health monitoring and SLA tracking", "Global rejection analysis and provider feedback", "Process optimization program", "Vendor performance review", "Compliance audit readiness validation", "Model recalibration and policy updates", "BAU transition and knowledge transfer"] },
  ],
  global: [
    { phase: "Discovery", weeks: "1–6", color: "#22D3EE", tasks: ["Global mandate mapping (20+ jurisdictions, 50+ entities)", "Multi-ERP landscape assessment (SAP, Oracle, D365, etc.)", "Global provider RFP (10+ vendors, regional strategy)", "End-to-end OtC impact analysis across all regions", "C-suite and Board investment approval", "Global program governance (PMO, steering committee, regional leads)", "Data sovereignty and privacy impact assessment", "Sanctions and compliance screening requirements"] },
    { phase: "Design", weeks: "7–14", color: "#3B82F6", tasks: ["Global integration architecture (multi-ERP, API mesh, middleware)", "Universal format engine with jurisdiction plug-ins", "Global tax engine harmonization across ERPs", "Multi-region archival with data sovereignty", "ML-powered exception management design", "Global testing infrastructure architecture", "Multi-region provider governance framework", "Cross-border compliance framework (GDPR, sanctions)", "Global change management and training program"] },
    { phase: "Build", weeks: "15–28", color: "#A855F7", tasks: ["Global e-invoice engine (multi-ERP native connectors)", "API mesh to 20+ government platforms", "Multi-region PKI / sovereign key management", "Global archival with regional data centers", "ML exception engine with jurisdiction-aware rules", "Global compliance command center", "IC e-invoice automation with TP alignment", "Sanctions screening integration", "Performance architecture (geo-redundant, auto-scaling)"] },
    { phase: "Test", weeks: "29–36", color: "#F59E0B", tasks: ["Per-jurisdiction sandbox certification (20+ platforms)", "Multi-entity, multi-ERP integration testing", "Cross-border and Peppol interoperability testing", "Global load testing (peak volume simulation)", "Multi-jurisdiction tax accuracy validation", "IFRS / SOX / local compliance testing", "Sanctions screening accuracy testing", "Security, penetration, and data sovereignty testing", "Wave 1 parallel run"] },
    { phase: "Go-Live", weeks: "37–48", color: "#10B981", tasks: ["Wave 1: EU mandated (Poland, Italy, France, Spain, Romania)", "Wave 2: MENA (Saudi Arabia, Turkey, Egypt)", "Wave 3: LATAM (Brazil, Mexico, Chile, Colombia)", "Wave 4: APAC (India, Malaysia, S. Korea, Philippines)", "Wave 5: Voluntary / Peppol-only (Japan, Australia, Singapore)", "Global monitoring command center 24/7", "Per-wave customer/partner communication", "Per-wave parallel run and cutover ceremony"] },
    { phase: "Hypercare", weeks: "49–60", color: "#6366F1", tasks: ["Global health monitoring and SLA enforcement", "Cross-jurisdiction rejection pattern analysis", "ML model recalibration on live data", "Global vendor scorecard review", "Compliance audit readiness (SOX, IFRS, local tax)", "Policy update and lessons learned documentation", "Global BAU operating model handover", "Continuous improvement program establishment"] },
  ],
};

// ─── TAB 5: COMPLIANCE KPI DATA ───
const COMPLIANCE_KPIS = {
  sme: [
    { name: "E-Invoice Acceptance Rate", formula: "Accepted Invoices / Total Submitted × 100", topQ: "≥ 98%", median: "95–97%", bottomQ: "< 95%", target: "97%", description: "Percentage of submitted e-invoices accepted by government platform on first attempt" },
    { name: "Rejection / Error Rate", formula: "Rejected Invoices / Total Submitted × 100", topQ: "< 2%", median: "2–5%", bottomQ: "> 5%", target: "< 3%", description: "Rate of e-invoice rejections requiring correction and resubmission" },
    { name: "Submission Latency", formula: "Average Time from Invoice Creation to Platform Submission", topQ: "< 1 hour", median: "1–4 hours", bottomQ: "> 4 hours", target: "< 2 hours", description: "Speed of e-invoice submission after creation in ERP" },
    { name: "Penalty Exposure", formula: "Total Penalties Incurred / Total Invoice Value × 100", topQ: "0%", median: "0–0.1%", bottomQ: "> 0.1%", target: "0%", description: "Financial exposure from non-compliance penalties" },
    { name: "Format Compliance %", formula: "Schema-Valid Invoices / Total Generated × 100", topQ: "≥ 99.5%", median: "97–99.4%", bottomQ: "< 97%", target: "99%", description: "Percentage of invoices passing schema validation before submission" },
    { name: "Archive Retrieval Time", formula: "Average Time to Retrieve Archived Invoice for Audit", topQ: "< 30 seconds", median: "30s–5 min", bottomQ: "> 5 min", target: "< 2 min", description: "Speed of retrieving archived e-invoices for audit requests" },
    { name: "Correction Cycle Time", formula: "Average Days from Rejection to Successful Resubmission", topQ: "< 1 day", median: "1–3 days", bottomQ: "> 3 days", target: "< 2 days", description: "Speed of correcting and resubmitting rejected e-invoices" },
    { name: "Platform Uptime Alignment", formula: "Successful Submissions / Total Attempts (excl. platform downtime)", topQ: "≥ 99.5%", median: "98–99.4%", bottomQ: "< 98%", target: "99%", description: "Submission success rate accounting for platform availability windows" },
  ],
  mid: [
    { name: "E-Invoice Acceptance Rate", formula: "Accepted / Total Submitted × 100", topQ: "≥ 98.5%", median: "96–98.4%", bottomQ: "< 96%", target: "97.5%", description: "First-attempt acceptance across all jurisdictions" },
    { name: "Rejection / Error Rate", formula: "Rejected / Total Submitted × 100", topQ: "< 1.5%", median: "1.5–4%", bottomQ: "> 4%", target: "< 2.5%", description: "Multi-jurisdiction rejection rate" },
    { name: "Submission Latency", formula: "Avg Time: Invoice Creation → Platform Submission", topQ: "< 30 min", median: "30 min–2 hours", bottomQ: "> 2 hours", target: "< 1 hour", description: "Submission speed across all platforms" },
    { name: "Penalty Exposure", formula: "Total Penalties / Total Invoice Value × 100", topQ: "0%", median: "0–0.05%", bottomQ: "> 0.05%", target: "0%", description: "Financial penalty exposure across jurisdictions" },
    { name: "Format Compliance %", formula: "Schema-Valid / Total Generated × 100", topQ: "≥ 99.7%", median: "98–99.6%", bottomQ: "< 98%", target: "99.5%", description: "Pre-submission validation pass rate" },
    { name: "Archive Retrieval Time", formula: "Avg Retrieval Time for Audit Request", topQ: "< 15 seconds", median: "15s–3 min", bottomQ: "> 3 min", target: "< 1 min", description: "Audit retrieval speed across all jurisdictions" },
    { name: "Correction Cycle Time", formula: "Avg Days: Rejection → Successful Resubmission", topQ: "< 4 hours", median: "4–24 hours", bottomQ: "> 24 hours", target: "< 1 day", description: "Rejection resolution speed" },
    { name: "Platform Uptime Alignment", formula: "Successful Submissions / Total Attempts", topQ: "≥ 99.7%", median: "98.5–99.6%", bottomQ: "< 98.5%", target: "99.5%", description: "Submission reliability across platforms" },
  ],
  large: [
    { name: "E-Invoice Acceptance Rate", formula: "Accepted / Total Submitted × 100", topQ: "≥ 99%", median: "97–98.9%", bottomQ: "< 97%", target: "98.5%", description: "First-attempt acceptance across 10+ jurisdictions" },
    { name: "Rejection / Error Rate", formula: "Rejected / Total Submitted × 100", topQ: "< 1%", median: "1–3%", bottomQ: "> 3%", target: "< 1.5%", description: "Enterprise-wide rejection rate with root cause tracking" },
    { name: "Submission Latency", formula: "Avg Time: Invoice Creation → Platform Acceptance", topQ: "< 15 min", median: "15 min–1 hour", bottomQ: "> 1 hour", target: "< 30 min", description: "End-to-end submission speed including platform processing" },
    { name: "Penalty Exposure", formula: "Total Penalties / Total Invoice Value × 100", topQ: "0%", median: "0–0.02%", bottomQ: "> 0.02%", target: "0%", description: "Zero-penalty target across all jurisdictions" },
    { name: "Format Compliance %", formula: "Schema-Valid / Total Generated × 100", topQ: "≥ 99.9%", median: "99–99.8%", bottomQ: "< 99%", target: "99.8%", description: "Enterprise validation accuracy with AI-assisted checks" },
    { name: "Archive Retrieval Time", formula: "Avg Retrieval Time", topQ: "< 5 seconds", median: "5s–1 min", bottomQ: "> 1 min", target: "< 30 sec", description: "Sub-second target for enterprise audit response" },
    { name: "Correction Cycle Time", formula: "Avg Time: Rejection → Resubmission", topQ: "< 2 hours", median: "2–12 hours", bottomQ: "> 12 hours", target: "< 4 hours", description: "AI-assisted rapid correction" },
    { name: "Platform Uptime Alignment", formula: "Successful / Total Attempts", topQ: "≥ 99.8%", median: "99–99.7%", bottomQ: "< 99%", target: "99.7%", description: "Enterprise reliability with failover" },
  ],
  global: [
    { name: "E-Invoice Acceptance Rate", formula: "Accepted / Total Submitted × 100", topQ: "≥ 99.2%", median: "97.5–99.1%", bottomQ: "< 97.5%", target: "99%", description: "First-attempt acceptance across 20+ jurisdictions, 50+ entities" },
    { name: "Rejection / Error Rate", formula: "Rejected / Total Submitted × 100", topQ: "< 0.8%", median: "0.8–2.5%", bottomQ: "> 2.5%", target: "< 1%", description: "Global rejection rate with ML root cause classification" },
    { name: "Submission Latency", formula: "Avg Time: Creation → Platform Acceptance", topQ: "< 10 min", median: "10 min–45 min", bottomQ: "> 45 min", target: "< 20 min", description: "Global end-to-end speed with geo-routing optimization" },
    { name: "Penalty Exposure", formula: "Total Global Penalties / Total Invoice Value × 100", topQ: "0%", median: "0–0.01%", bottomQ: "> 0.01%", target: "0%", description: "Zero-penalty mandate across all jurisdictions and entities" },
    { name: "Format Compliance %", formula: "Schema-Valid / Total Generated × 100", topQ: "≥ 99.95%", median: "99.5–99.94%", bottomQ: "< 99.5%", target: "99.9%", description: "AI-validated global schema compliance" },
    { name: "Archive Retrieval Time", formula: "Avg Retrieval Time (any jurisdiction)", topQ: "< 3 seconds", median: "3s–30s", bottomQ: "> 30s", target: "< 10 sec", description: "Global sub-second retrieval across regional data centers" },
    { name: "Correction Cycle Time", formula: "Avg Time: Rejection → Resubmission", topQ: "< 1 hour", median: "1–8 hours", bottomQ: "> 8 hours", target: "< 2 hours", description: "ML-assisted auto-correction with human-in-the-loop" },
    { name: "Platform Uptime Alignment", formula: "Successful / Total Attempts", topQ: "≥ 99.9%", median: "99.2–99.8%", bottomQ: "< 99.2%", target: "99.8%", description: "Global geo-redundant reliability" },
  ],
};


// ─── STYLES ───
const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');`;
const baseStyles = { fontFamily: "'DM Sans', sans-serif", background: "#0B0F1A", color: "#E2E8F0", minHeight: "100vh" };
const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

// ─── SHARED COMPONENTS ───
function TierSelector({ tier, setTier }) {
  return (
    <div style={{ display: "flex", gap: 4, background: "#131829", borderRadius: 10, padding: 4 }}>
      {TIERS.map((t) => (
        <button key={t.id} onClick={() => setTier(t.id)} style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s", background: tier === t.id ? t.accent + "22" : "transparent", color: tier === t.id ? t.accent : "#64748B", boxShadow: tier === t.id ? `inset 0 0 0 1.5px ${t.accent}44` : "none" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TabBar({ tab, setTab, accent }) {
  return (
    <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 2 }}>
      {TABS.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", transition: "all 0.2s", background: tab === t.id ? accent + "18" : "transparent", color: tab === t.id ? accent : "#64748B", borderBottom: tab === t.id ? `2px solid ${accent}` : "2px solid transparent" }}>
          <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: "#131829", borderRadius: 12, border: "1px solid #1E293B", padding: 20, ...style }}>{children}</div>;
}

function Badge({ text, color }) {
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: color + "22", color, ...monoFont }}>{text}</span>;
}

// ─── TAB 1: REGULATORY LANDSCAPE ───
function LandscapeTab({ tier, accent }) {
  const data = REGULATORY_DATA[tier];
  const [selectedCountry, setSelectedCountry] = useState(0);
  const [filterRegion, setFilterRegion] = useState("All");

  const regions = ["All", ...new Set(data.map((d) => d.region))];
  const filtered = filterRegion === "All" ? data : data.filter((d) => d.region === filterRegion);
  const selected = filtered[selectedCountry] || filtered[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.1</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>E-Invoicing Regulatory Landscape</span>
        <Badge text={`${data.length} jurisdictions`} color={accent} />
      </div>

      {/* Region filter */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {regions.map((r) => (
          <button key={r} onClick={() => { setFilterRegion(r); setSelectedCountry(0); }} style={{ padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: filterRegion === r ? accent + "22" : "#0B0F1A", color: filterRegion === r ? accent : "#64748B", boxShadow: filterRegion === r ? `inset 0 0 0 1.5px ${accent}44` : "inset 0 0 0 1px #1E293B" }}>
            {r}
          </button>
        ))}
      </div>

      {/* Status legend */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            <span style={{ fontSize: 10, color: "#94A3B8" }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Country selector grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
        {filtered.map((d, i) => {
          const sc = STATUS_COLORS[d.status] || "#475569";
          return (
            <button key={d.country} onClick={() => setSelectedCountry(i)} style={{ padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif", background: selectedCountry === i ? sc + "15" : "#0B0F1A", boxShadow: selectedCountry === i ? `inset 0 0 0 1.5px ${sc}66` : "inset 0 0 0 1px #1E293B", transition: "all 0.2s" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: selectedCountry === i ? sc : "#CBD5E1" }}>{d.country}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <Badge text={d.status} color={sc} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Country detail card */}
      {selected && (
        <Card style={{ borderLeft: `3px solid ${STATUS_COLORS[selected.status] || "#475569"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#F8FAFC" }}>{selected.country}</h3>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                <Badge text={selected.status} color={STATUS_COLORS[selected.status]} />
                <Badge text={selected.model} color={MODEL_COLORS[selected.model] || "#475569"} />
                <Badge text={selected.region} color={accent} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase" }}>Go-Live</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: accent, ...monoFont }}>{selected.goLive}</div>
            </div>
          </div>

          {[
            { label: "Platform", value: selected.platform },
            { label: "Format", value: selected.format },
            { label: "Penalty Regime", value: selected.penalty },
            { label: "Notes", value: selected.notes },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.5 }}>{item.value}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ─── TAB 2: TECHNICAL READINESS ───
function ReadinessTab({ tier, accent }) {
  const dimensions = READINESS_DIMENSIONS[tier];
  const [scores, setScores] = useState(() => {
    const s = {};
    dimensions.forEach((d) => { s[d.dimension] = Array(d.questions.length).fill(false); });
    return s;
  });
  const [expandedDim, setExpandedDim] = useState(null);

  const getScore = (dim) => scores[dim]?.filter(Boolean).length || 0;
  const totalScore = dimensions.reduce((sum, d) => sum + getScore(d.dimension), 0);
  const maxTotal = dimensions.reduce((sum, d) => sum + d.maxScore, 0);
  const pct = Math.round((totalScore / maxTotal) * 100);

  const toggleQuestion = (dim, idx) => {
    setScores((prev) => {
      const arr = [...(prev[dim] || [])];
      arr[idx] = !arr[idx];
      return { ...prev, [dim]: arr };
    });
  };

  const getScoreColor = (score, max) => {
    const r = score / max;
    if (r >= 0.8) return "#10B981";
    if (r >= 0.5) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.1</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>Technical Readiness Assessment</span>
        <Badge text={`${dimensions.length} dimensions`} color={accent} />
      </div>

      {/* Overall score */}
      <Card style={{ background: "#0f1520", borderColor: accent + "33" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Overall Readiness Score</div>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Click each dimension to assess individual questions</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: getScoreColor(totalScore, maxTotal), ...monoFont }}>{totalScore}/{maxTotal}</div>
            <div style={{ fontSize: 13, color: getScoreColor(totalScore, maxTotal), ...monoFont }}>{pct}% ready</div>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: getScoreColor(totalScore, maxTotal), borderRadius: 4, transition: "width 0.4s" }} />
        </div>
      </Card>

      {/* Dimension cards */}
      {dimensions.map((d) => {
        const score = getScore(d.dimension);
        const sc = getScoreColor(score, d.maxScore);
        const isExpanded = expandedDim === d.dimension;
        return (
          <Card key={d.dimension} style={{ cursor: "pointer", background: isExpanded ? "#1a1d2e" : "#131829", transition: "all 0.2s" }}>
            <div onClick={() => setExpandedDim(isExpanded ? null : d.dimension)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{d.dimension}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{d.description}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 60, height: 6, background: "#1E293B", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(score / d.maxScore) * 100}%`, background: sc, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ ...monoFont, fontSize: 14, fontWeight: 700, color: sc, minWidth: 30, textAlign: "right" }}>{score}/{d.maxScore}</span>
                </div>
              </div>
            </div>
            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E293B" }}>
                {d.questions.map((q, qi) => (
                  <div key={qi} onClick={() => toggleQuestion(d.dimension, qi)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${scores[d.dimension]?.[qi] ? "#10B981" : "#475569"}`, background: scores[d.dimension]?.[qi] ? "#10B98122" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", marginTop: 1 }}>
                      {scores[d.dimension]?.[qi] && <span style={{ color: "#10B981", fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: scores[d.dimension]?.[qi] ? "#E2E8F0" : "#94A3B8", lineHeight: 1.4 }}>{q}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── TAB 3: PROCESS IMPACT ───
function ImpactTab({ tier, accent }) {
  const data = PROCESS_IMPACT[tier];
  const [expandedProcess, setExpandedProcess] = useState(null);

  const severityColors = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981" };
  const statusColors = { "New Workflow": "#A855F7", Modify: "#3B82F6", Enhance: "#22D3EE", "Minor Enhance": "#6366F1", Unaffected: "#475569" };
  const effortColors = { "Very High": "#EF4444", High: "#F97316", Medium: "#F59E0B", Low: "#10B981" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.x</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>E-Invoicing Process Impact Matrix</span>
        <Badge text={`${data.length} processes`} color={accent} />
      </div>

      {/* Impact summary bar */}
      <Card>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Impact Summary</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["New Workflow", "Modify", "Enhance", "Minor Enhance", "Unaffected"].map((s) => {
            const count = data.filter((d) => d.status === s).length;
            if (count === 0) return null;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: statusColors[s] || "#475569" }} />
                <span style={{ fontSize: 12, color: "#CBD5E1" }}>{s}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: statusColors[s] || "#475569", ...monoFont }}>{count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Process cards */}
      {data.map((p, i) => {
        const isExpanded = expandedProcess === i;
        const sc = severityColors[p.severity] || "#475569";
        return (
          <Card key={i} style={{ borderLeft: `3px solid ${sc}`, cursor: "pointer", background: isExpanded ? "#1a1d2e" : "#131829", transition: "all 0.2s" }}>
            <div onClick={() => setExpandedProcess(isExpanded ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 4 }}>{p.process}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Badge text={`Severity: ${p.severity}`} color={sc} />
                    <Badge text={p.status} color={statusColors[p.status] || "#475569"} />
                    <Badge text={`Effort: ${p.effort}`} color={effortColors[p.effort] || "#475569"} />
                  </div>
                </div>
              </div>
            </div>
            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E293B" }}>
                {[
                  { label: "Impact Description", value: p.description },
                  { label: "RACI", value: p.raci },
                ].map((row) => (
                  <div key={row.label} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{row.label}</div>
                    <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.5 }}>{row.value}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* Cross-reference */}
      <Card style={{ background: "#0f1520", borderColor: accent + "33" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Cross-References</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { ref: "1.1", desc: "L3/L4 taxonomy codes referenced" },
            { ref: "1.2", desc: "RACI role alignment" },
            { ref: "1.3", desc: "Collections e-invoice status" },
            { ref: "1.5", desc: "Compliance KPI feed" },
            { ref: "1.6", desc: "Maturity domain: Technology" },
          ].map((x) => (
            <div key={x.ref} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge text={x.ref} color={accent} />
              <span style={{ fontSize: 11, color: "#94A3B8" }}>{x.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── TAB 4: IMPLEMENTATION ROADMAP ───
function RoadmapTab({ tier, accent }) {
  const phases = ROADMAP_PHASES[tier];
  const [expandedPhase, setExpandedPhase] = useState(null);
  const totalWeeks = phases.reduce((sum, p) => {
    const parts = p.weeks.split("–");
    return Math.max(sum, parseInt(parts[parts.length - 1]) || sum);
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.1</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>Implementation Roadmap</span>
        <Badge text={`${totalWeeks} weeks total`} color={accent} />
      </div>

      {/* Gantt-style overview */}
      <Card>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>Phase Timeline</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {phases.map((p) => {
            const parts = p.weeks.split("–");
            const start = parseInt(parts[0]);
            const end = parseInt(parts[parts.length - 1]) || start;
            const startPct = ((start - 1) / totalWeeks) * 100;
            const widthPct = ((end - start + 1) / totalWeeks) * 100;
            return (
              <div key={p.phase} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: p.color, textAlign: "right", flexShrink: 0 }}>{p.phase}</div>
                <div style={{ flex: 1, height: 24, background: "#0B0F1A", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: `${startPct}%`, width: `${widthPct}%`, height: "100%", background: p.color + "33", borderRadius: 4, border: `1px solid ${p.color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: p.color, ...monoFont }}>W{p.weeks}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 10, color: "#475569", ...monoFont }}>Week 1</span>
          <span style={{ fontSize: 10, color: "#475569", ...monoFont }}>Week {totalWeeks}</span>
        </div>
      </Card>

      {/* Phase detail cards */}
      {phases.map((p, i) => {
        const isExpanded = expandedPhase === i;
        return (
          <Card key={p.phase} style={{ borderLeft: `3px solid ${p.color}`, cursor: "pointer", background: isExpanded ? "#1a1d2e" : "#131829", transition: "all 0.2s" }}>
            <div onClick={() => setExpandedPhase(isExpanded ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: p.color }}>{p.phase}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Weeks {p.weeks} · {p.tasks.length} tasks</div>
                </div>
                <Badge text={`W${p.weeks}`} color={p.color} />
              </div>
            </div>
            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E293B" }}>
                {p.tasks.map((task, ti) => (
                  <div key={ti} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.4 }}>{task}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── TAB 5: COMPLIANCE KPIs ───
function ComplianceKpiTab({ tier, accent }) {
  const live = useLiveActuals();
  const kpis = COMPLIANCE_KPIS[tier];
  const [expandedKpi, setExpandedKpi] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", ...monoFont }}>APQC PCF 8.3.1</span>
        <span style={{ fontSize: 13, color: "#475569" }}>·</span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>E-Invoicing Compliance KPI Scorecard</span>
        <Badge text={`${kpis.length} metrics`} color={accent} />
      </div>

      {/* Benchmark legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { label: "Top Quartile", color: "#10B981" },
          { label: "Median", color: "#F59E0B" },
          { label: "Bottom Quartile", color: "#EF4444" },
        ].map((b) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: b.color + "33", border: `1.5px solid ${b.color}` }} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{b.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: accent + "33", border: `1.5px solid ${accent}` }} />
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Tier Target</span>
        </div>
      </div>

      {kpis.map((kpi, i) => {
        const isExpanded = expandedKpi === i;
        return (
          <Card key={kpi.name} style={{ cursor: "pointer", transition: "all 0.2s", background: isExpanded ? "#1a1d2e" : "#131829" }}>
            <div onClick={() => setExpandedKpi(isExpanded ? null : i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 4 }}>{kpi.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{kpi.description}</div>
                </div>
                <Badge text={`Target: ${kpi.target}`} color={accent} />
              </div>
              {getKpiActual(kpi.name, live) && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>ACTUAL</span>
                  <span style={{ fontSize: 14, color: "#fff", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{getKpiActual(kpi.name, live)}</span>
                  <span style={{ ...liveBadgeStyle() }}>● LIVE</span>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                {[
                  { label: "Top Quartile", value: kpi.topQ, color: "#10B981" },
                  { label: "Median", value: kpi.median, color: "#F59E0B" },
                  { label: "Bottom Quartile", value: kpi.bottomQ, color: "#EF4444" },
                ].map((b) => (
                  <div key={b.label} style={{ background: b.color + "11", borderRadius: 8, padding: "8px 12px", border: `1px solid ${b.color}22` }}>
                    <div style={{ fontSize: 10, color: b.color, fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>{b.label}</div>
                    <div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600, ...monoFont }}>{b.value}</div>
                  </div>
                ))}
              </div>
            </div>
            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E293B" }}>
                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>Formula</div>
                <div style={{ fontSize: 12, color: "#94A3B8", ...monoFont, lineHeight: 1.6, background: "#0B0F1A", padding: 12, borderRadius: 6 }}>{kpi.formula}</div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ───
export default function EInvoicingComplianceTracker() {
  const [tier, setTier] = useState("sme");
  const [tab, setTab] = useState("landscape");
  const accent = TIERS.find((t) => t.id === tier)?.accent || "#10B981";

  const renderTab = () => {
    switch (tab) {
      case "landscape": return <LandscapeTab tier={tier} accent={accent} />;
      case "readiness": return <ReadinessTab tier={tier} accent={accent} key={tier} />;
      case "impact": return <ImpactTab tier={tier} accent={accent} />;
      case "roadmap": return <RoadmapTab tier={tier} accent={accent} />;
      case "kpi": return <ComplianceKpiTab tier={tier} accent={accent} />;
      default: return null;
    }
  };

  return (
    <div style={baseStyles}>
      <style>{fonts}</style>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: accent, ...monoFont, fontWeight: 600, letterSpacing: 1 }}>DELIVERABLE 1.4</span>
            <span style={{ fontSize: 11, color: "#475569" }}>·</span>
            <span style={{ fontSize: 11, color: "#64748B", ...monoFont }}>OtC Consulting Toolkit — Phase 1</span>
          </div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: 26, fontWeight: 700, color: "#F8FAFC", letterSpacing: -0.5 }}>
            E-Invoicing Compliance Readiness Tracker
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#64748B", lineHeight: 1.5 }}>
            Regulatory landscape mapping, technical readiness assessment, process impact analysis, implementation roadmap, and compliance KPI benchmarking.
          </p>
        </div>

        <div style={{ marginBottom: 16 }}><TierSelector tier={tier} setTier={setTier} /></div>
        <div style={{ marginBottom: 20 }}><TabBar tab={tab} setTab={setTab} accent={accent} /></div>
        {renderTab()}

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#475569", ...monoFont }}>APQC PCF 8.3.1 · E-Invoicing Compliance</span>
          <span style={{ fontSize: 10, color: "#475569", ...monoFont }}>OtC Consulting Toolkit v1.0</span>
        </div>
      </div>
    </div>
  );
}
