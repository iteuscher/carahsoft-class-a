---
id: CA-16
title: Self Check and submit
phase: 2
sequence: 16
summary: Refresh, validate, verify against FedRAMP's Self Check, then submit the 20x Certification Application Form yourself.
rules: [FRC-APP-MLF, FRC-APP-AFC, FRC-APP-FCP, FRC-APP-NTP]
tasks:
  - { id: CA-16.1, text: "Confirm your Marketplace listing is live", role: Lead, ahead: false, done_when: "Listing visible on the FedRAMP Marketplace" }
  - { id: CA-16.2, text: "Regenerate your SDR within 7 days of submitting", role: Lead, ahead: false, done_when: "SDR revision dated within the last 7 days", rules: [FRC-APP-FCP] }
  - { id: CA-16.6, text: "Validate your CPO JSON with FedRAMP's JSON Schema Validator", role: Tech, ahead: false, done_when: "Passes with the FedRAMP Certification Package Overview (FRC-CSO-PKG) schema", link_key: fedramp_forms.json_schema_validator }
  # Help line says you can use our Self Check checklist on this page or FedRAMP's own page (the button).
  - { id: CA-16.5, text: "Last step before you submit: verify your package and trust center against FedRAMP's 20x Class A Self Check", help: "Use our \"FedRAMP Self Check\" checklist near the bottom of this page, or follow FedRAMP's Self Check page (button below).", role: "Lead, Sponsor", ahead: false, done_when: "Every Self Check item verified, so you can attest to it on the application form", link_key: fedramp_forms.class_a_self_check }
  # Pointed to the field-by-field help further down the page, as a small help line like CA-07.1.
  - { id: CA-16.3, text: "Submit the FedRAMP 20x Certification Application Form yourself", help: "Need help filling it out? Scroll to \"How to fill out the 20x Certification Application Form\" near the bottom of this page.", role: Sponsor, ahead: false, done_when: "Confirmation received", rules: [FRC-APP-AFC, FRC-APP-NTP], link_key: fedramp_forms.certification_application }
  - { id: CA-16.4, text: "Watch your FedRAMP Security Inbox for follow-up", role: Comms, ahead: false, done_when: "Every FedRAMP message answered" }
checklists:
  - id: self-check-package
    title: "Certification Package Composition"
    source: "FedRAMP 20x Class A Self Check (updated October 7, 2026)"
    items:
      - { id: SC-P1, text: "Alternative Security Framework materials (like SOC 2 Type II Report, Bridge Letter, RAR, etc)" }
      - { id: SC-P2, text: "Certification Package Overview (CPO)" }
      - { id: SC-P3, text: "Security Decision Record (SDR)" }
      - { id: SC-P4, text: "Referenced Artifacts" }
      - { id: SC-P5, text: "Sample schemas (referenced by applicable rules): Initial Incident Report (IEC-CSO-IIR) SHOULD; Ongoing Incident Report (IEC-CSO-OIR) SHOULD; Final Incident Report (IEC-CSO-FIR) MUST; Historical VER Activity (VER-TFR-MRH) MAY - if Rule is included in SDR; Ongoing Certification Report (CCM-OCR-AVL) MUST" }
      - { id: SC-P6, text: "Anything that adds additional context or value - FedRAMP sets the minimum but provides you the CSP with the freedom to exceed!" }
  - id: self-check-sdr
    title: "Security Decision Record (SDR) Completeness"
    source: "FedRAMP 20x Class A Self Check (updated October 7, 2026)"
    items:
      - { id: SC-S1, text: "Ensure ALL rules applicable to Class A are in scope, both MUST and SHOULD are required to be addressed even if Not Implemented or Partially Implemented." }
      - { id: SC-S2, text: "Each Rule and Key Security Indicator (KSI) should have an Alternative Security Framework mapping, an associated artifact, or even both." }
      - { id: SC-S3, text: "Each Rule and KSI should have an implementation status (Implemented, Partially Implemented, or Not Implemented). This should be accurate and if Partially or Not Implemented, a clear explanation of why including any future plans with timeframes for implementation." }
      - { id: SC-S4, text: "If an optional IV&V was performed, the Independent Assessor's Assessment Summary should be included for each Rule and KSI." }
form:
  title: "How to fill out the 20x Certification Application Form"
  confirm_note: "The JSON Schema URL and Trust Center fields appear after you choose a Certification Class."
  fields:
    - { field: "Form dropdown", value: "[For CSPs] FedRAMP 20x Certification Application Form" }
    - { field: "Your email address*", value: "Your FedRAMP Security Inbox", draft: true }
    - { field: "I am currently listed on the FedRAMP Marketplace*", value: "Yes.", fedramp_note: "Class, Type or Pilot status changes for an existing service can use current Marketplace listing. New submissions must first be listed in Initial Implementation status." }
    - { field: "I have performed a 20x Self Check and attest to the completeness of my submission.*", value: "Yes, once CA-16.5 is done" }
    - { field: "Cloud Service Offering Name*", value: "The same name as on your Marketplace listing and CPO", draft: true }
    - { field: "Certification Class*", value: "Class A" }
    - { field: "JSON Schema URL (CR26: FRC-CSO-PKG)*", value: "Your public CPO JSON link (CA-15).", fedramp_note: "Ensure you are using the \"FedRAMP Certification Package Overview (FRC-CSO-PKG)\" schema. Don't submit your website URL with a link to your JSON elsewhere on the page, enter the direct URL to your JSON itself." }
    - { field: "Trust Center URL*", value: "Human-readable Trust Center URL. For example, trust.paramify.com/your-slug" }
    - { field: "Trust Center Access Instructions", value: "Instructions for authenticated access (if applicable) or link to where instructions exist if not obvious from Trust Center URL." }
    - { field: "Optional Additional Information*", value: "Enter 'N/A' if not applicable." }
resources:
  - { title: "FedRAMP 20x Class A Self Check", url: "https://help.fedramp.gov/hc/en-us/articles/56860150862491-20x-Class-A-Self-Check", type: fedramp }
  - { title: "September 20x Community Update", url: "https://youtu.be/8XCfY-lRNtY", type: video }
---

Submit your SDR with a link to your CPO, including your FedRAMP ID, all hosted on your trust center. You submit it yourself; your partner cannot submit for you.

> [!FEDRAMP] FRC-APP-MLF
> Providers MUST be listed in the FedRAMP Marketplace before applying for FedRAMP Certification.

> [!FEDRAMP] FRC-APP-AFC
> Providers MUST complete the FedRAMP Certification Application Form in full to request an initial assessment by FedRAMP.

> [!FEDRAMP] FRC-APP-FCP
> Providers MUST supply a fresh initial FedRAMP Certification Package that shows the current status of the cloud service offering as verified and validated by the provider within the previous 7 days.

## FedRAMP's pro-tips

Before requests are placed in the Review Queue, the Trust Center and package materials are verified. Speedy Trust Center access + package completeness = accelerated Review Queue entry. A 20x Class A is not intended to be a heavy lift. If it feels too hard, you may be overthinking!
