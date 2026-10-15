---
id: CA-17
title: Ongoing responsibilities and what's next
phase: 3
sequence: 17
summary: What you keep doing after certification, and where to go from Class A.
rules: [AFC-CSO-CRA, IEC-CSO-EFR, IEC-CSO-FIR, CCM-OCR-AVL, CCM-OCR-NRD, MKT-IIP-DCP, CPO-CSX-CPM, VDR-CSO-DET, IVV-CSX-AIA, CDS-UTC-AAD, MKT-IIP-DLA]
recurring:
  - { id: CA-17.1, text: "Complete required actions in FedRAMP Emergency and Emergency Test messages", cadence: "Within the timeframe in the message: usually days for an active KEV response, about a week for a test", rules: [AFC-CSO-CRA], role: Comms }
  - { id: CA-17.2, text: "Evaluate incidents for reportability; send a Final Incident Report", cadence: "Per incident; final report within 3 business days of recovery", rules: [IEC-CSO-EFR, IEC-CSO-FIR], role: SecOps }
  - { id: CA-17.3, text: "Publish your Ongoing Certification Report and next report date", cadence: "Every 3 months", rules: [CCM-OCR-AVL, CCM-OCR-NRD], role: SecOps }
  - { id: CA-17.4, text: "Update your goals and milestones", cadence: "At least quarterly", rules: [MKT-IIP-DCP], role: Lead }
  - { id: CA-17.5, text: "Keep your certification package current", cadence: "As changes occur; at least every 3 months", rules: [CPO-CSX-CPM], role: Lead }
  - { id: CA-17.6, text: "Detect vulnerabilities, including out-of-date SDR statements", cadence: "Persistent", rules: [VDR-CSO-DET], role: SecOps }
  - { id: CA-17.7, text: "Keep your SOC 2 current: renewal report or bridge letter", cadence: "Annually", rules: [IVV-CSX-AIA], role: Sponsor }
  - { id: CA-17.8, text: "Report any denied agency access request", cadence: "Within 5 business days", rules: [CDS-UTC-AAD], role: Comms, link_key: fedramp_forms.agency_access_denial }
  - { id: CA-17.9, text: "Schedule a Class B or C assessment", cadence: "Within 2 years of listing", rules: [MKT-IIP-DLA], role: Sponsor }
keeping_current:
  - { when: "Your Marketplace information changes", update: "CPO", note: "To update the FedRAMP Marketplace, you update your CPO" }
  - { when: "A solution capability changes", update: "SDR (regenerate)", note: "Its review status resets to Not Reviewed; re-review it, then regenerate. Stale SDR statements count as vulnerabilities under VDR-CSO-DET", draft: true }
  - { when: "You receive a new SOC 2 report or bridge letter", update: "SOC 2 materials on your trust center", note: "Keeps you inside the 12-month window", draft: true }
  - { when: "A quarter ends", update: "Ongoing Certification Report, goals and milestones", note: "" }
  - { when: "A file on your trust center is out of date", update: "Replace the file", note: "Delete the old deliverable in Trust Center > Content, add the new one, and publish again" }
resources:
  - { title: "When Do You Have to Report an Incident to FedRAMP?", url: "https://www.paramify.com/blog/fedramp-incident-reporting-requirements", type: blog }
  - { title: "Incident reporting video", url: "https://www.youtube.com/watch?v=MhbOHH7okxg", type: video }
  - { title: "How Paramify automates evidence collection and validation", url: "https://www.paramify.com/blog/how-paramify-automates-evidence-collection-and-validation", type: blog }
---

Once you're certified, your ongoing responsibilities are: send a final incident report for any FedRAMP reportable incident, publish an Ongoing Certification Report every quarter, keep your goals and milestones up to date, and within two years schedule a Class B or Class C assessment if you want to stay in the Marketplace. Ideally a real agency customer that wants to use you drives that next step.

## Incident reporting

The short version: only if the incident has affected, or is likely to affect, the confidentiality or integrity of federal customer data. Availability alone does not trigger anything. The final report is a MUST at every class, including Class A. Three things have to exist before you have an incident to report:

1. A reportability decision your on-call can make.
2. A generated JSON file (not a handcrafted one).
3. A notification path that hits every party at once.

> [!FEDRAMP] IEC-CSO-EFR
> Providers MUST promptly evaluate incidents to determine if they affect confidentiality or integrity of federal customer data or are likely to affect confidentiality or integrity of federal customer data; such incidents are FedRAMP Reportable Incidents and must be reported following the FedRAMP Incident Evaluation and Communication rules.

> [!FEDRAMP] IEC-CSO-FIR
> Providers with Class A Certifications MUST responsibly notify all affected parties by providing a Final Incident Report once the incident has been resolved and recovery is complete, including final updates to all previously reported information. Notify FedRAMP via email: fedramp_security@fedramp.gov. Notify Agency Customers via the appropriate recipient-specific method. Notify All Necessary Parties via an update: Provider's Trust Center.

> [!FEDRAMP] VDR-CSO-DET (note)
> *An out-of-date control statement in the Security Decision Record is a vulnerability that must be detected and remediated just like any other vulnerability.*

> [!FEDRAMP] IVV-CSX-AIA
> Providers with 20x Class A Certifications MUST meet the expectations of their underlying alternative security framework as part of their persistent independent verification and validation assessment.

> [!FEDRAMP] CPO-CSX-CPM
> Providers with 20x Class A Certifications SHOULD persistently maintain their FedRAMP Certification Package to ensure it is up to date and complete at least once every 3 months.
>
> *Providers are expected to maintain their FedRAMP Certification Package using automation as changes occur to ensure they are never out of date.*

## What's next

### Your two-year window

You now have two years. Have your sales team start reaching out to agencies for pilots, RFPs, and RFQs. Within two years, you must schedule a FedRAMP Class B or Class C assessment. Once you have 6 months of evidence at Class C, you can begin moving to Class D. These classes require additional licensing and requirements, so contact your Paramify representative.

### Automated evidence collection

[Draft] Classes B, C, and D add automated validation of the KSIs.

### Department of Defense

If you want to go the DoD route, talk to your Paramify rep. There's no direct reciprocity between FedRAMP 20x and DoD impact levels, but there's overlap in the security capabilities you need to implement. Paramify can help you manage both your FedRAMP 20x requirements and deliverables and your DoD or CMMC requirements and deliverables in one place.
