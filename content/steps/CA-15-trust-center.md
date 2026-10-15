---
id: CA-15
title: Trust center
phase: 2
sequence: 14
summary: Publish your package on your Paramify trust center so FedRAMP and agencies can reach it.
rules: [CDS-CSO-UTC, CCM-OCR-AVL, CCM-OCR-NRD, CDS-UTC-AAD]
tasks:
  - { id: CA-15.1, text: "Your CSM activates the Trust Center and a Super Admin sets your company slug. Add your logo, icon, and company name in Trust Center > Settings, and add your program to the Trust Center (system details must be set in program settings)", role: Lead, ahead: false, done_when: "trust.paramify.com/your-slug shows your branding and program, with instructions for requesting access" }
  - { id: CA-15.2, text: "Upload the human-readable and JSON versions of your CPO; make the JSON Publicly Available and copy its download link (steps below)", role: Lead, ahead: false, done_when: "JSON link works for a logged-out visitor" }
  - { id: CA-15.3, text: "Upload the human-readable and JSON versions of your SDR as Restricted", role: Lead, ahead: false, done_when: "Visitors see them and can request access" }
  - { id: CA-15.4, text: "Upload your SOC 2 materials from CA-11 as Restricted, after release clearance", role: Lead, ahead: false, done_when: "FedRAMP can reach them without an NDA" }
  - { id: CA-15.5, text: "Fill out Paramify's Ongoing Certification Report template and upload human-readable and JSON versions as your example OCR", role: SecOps, ahead: false, done_when: "Published; next report date set", template: ocr }
  - { id: CA-15.6, text: "Upload a sample Final Incident Report (required) and, recommended, sample Initial and Ongoing Incident Reports, each in human-readable and JSON", role: SecOps, ahead: false, done_when: "Samples published", template: incident_report }
  - { id: CA-15.7, text: "Publish your goals and milestones, if not done in CA-07.3", role: Lead, ahead: false, done_when: "Page live" }
  - { id: CA-15.8, text: "Name who approves requests in Trust Center > User Access > Access Requests", role: Comms, ahead: false, done_when: "Owner named; FedRAMP gets access without an NDA; agency denials go to FedRAMP within 5 business days", rules: [CDS-UTC-AAD] }
  - { id: CA-15.9, text: "Click Publish, then Confirm and Publish, and check the live site", role: Lead, ahead: false, done_when: "Last Published timestamp is current; every Public item is meant to be public" }
procedures:
  - title: "Getting your CPO link"
    steps:
      - "Select the \"Included Deliverables\" link."
      - "Drag and drop the JSON and human-readable versions of your CPO into the modal."
      - "Make the JSON version \"Publicly Available\" and click Save."
      - "Republish your trust center by clicking Publish."
      - "Select \"Confirm and Publish\"."
      - "Go to your Trust Center, scroll down to the \"Deliverables\" section, right-click the CPO's \"Download\" link, and select \"Copy Link Address\"."
      - "Paste the link into the FedRAMP form: the Marketplace listing (CA-07) and the Class A application (CA-16)."
resources:
  - { title: "Managing your Trust Center with Paramify", url: "https://support.paramify.com/hc/en-us/articles/50857315618963-Managing-your-Trust-Center-with-Paramify", type: help }
  - { title: "You Need a Trust Center for FedRAMP 20x", url: "https://www.paramify.com/blog/fedramp-20x-trust-center", type: blog }
---

To start configuring your Trust Center, a system name needs to be set in the program settings, and the workspace needs to contain necessary controls or KSIs. Your Trust Center only reflects what was published at the time of your last publish action.

> [!FEDRAMP] CDS-CSO-UTC
> Providers MUST use a FedRAMP-compatible trust center to store and share FedRAMP Certification Data with all necessary parties.

> [!FEDRAMP] CCM-OCR-AVL
> Providers MUST supply an Ongoing Certification Report to all necessary parties every 3 months, covering the entire period since the previous summary, in a consistent format that is human readable.

> [!FEDRAMP] CCM-OCR-NRD
> Providers MUST supply the target date for their next Ongoing Certification Report with other public FedRAMP Certification Data.

> [!FEDRAMP] CDS-UTC-AAD
> Providers MUST notify FedRAMP within 5 business days of denying an agency access request for FedRAMP Certification Data.

> [!FEDRAMP] Class A Self Check
> All files should be accessible to FedRAMP from the Trust Center without signing an NDA or agreeing to terms of service or conditions. GSA federal personnel do not execute vendor-specific nondisclosure agreements in order to access security information submitted to FedRAMP for review. All FedRAMP schemas referenced by rules (like SDR or OCR) should be presented in both machine-readable and human-readable versions. Even if the activity has not occurred yet (like an incident or OCR), samples/examples should be provided.
