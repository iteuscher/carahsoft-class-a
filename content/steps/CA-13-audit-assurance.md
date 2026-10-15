---
id: CA-13
title: "Audit assurance: map your SOC 2"
phase: 2
# Shifted down one so CA-10 can sit right after CA-09.
sequence: 12
summary: For every KSI and rule, show reviewers exactly where your SOC 2 covers it, or attach an artifact.
rules: [FRC-CLA-MFR, KSI-CED-RAT, KSI-CMT-LMC, KSI-CNA-RNT, KSI-IAM-AAM, KSI-IAM-APM, KSI-INR-RIR, KSI-SVC-SIN]
tasks:
  # New: the audit assurance notes are written by Assessor users per Paramify's guide. Draft until Paramify confirms this applies to Class A.
  - { id: CA-13.6, text: "Make sure whoever writes the audit assurance notes has Assessor access in Paramify", role: Lead, ahead: false, help: "Paramify's audit assessment guide says assurance is filled in by Assessor users. Set this up with your CSM.", done_when: "Each person writing notes can open Assessments > Audit", link: "https://support.paramify.com/hc/en-us/articles/55523335780371-How-to-Securely-Add-Assessors-to-your-Workspace", link_label: "How to add Assessors", draft: true, added: 2026-10-14 }
  # New: nothing told people to create the audit assessment where all the CA-13 work happens.
  - { id: CA-13.7, text: "Create an Audit Assessment on your Class A program, with all of its controls selected", role: Lead, ahead: false, done_when: "The assessment appears under Assessments > Audit and lists your KSIs and rules", link: "https://support.paramify.com/hc/en-us/articles/52282771308819-Create-an-Audit-Assessment-in-Paramify", link_label: "Create an Audit Assessment guide", added: 2026-10-14 }
  # Added where to find each KSI and its note, with Paramify's walkthrough (written for agencies, hence the caveat).
  - { id: CA-13.1, text: "Fill in the audit assurance note for each required KSI", role: "Tech, Lead", ahead: false, help: "In your audit assessment, open the Implementation tab and select a KSI. The note goes in its capability assurance section. Paramify's agency review guide shows these screens (steps 10–18). It's written for agencies, so skip the login and agency steps.", done_when: "All seven KSIs have a completed note", link: "https://support.paramify.com/hc/en-us/articles/49303303994003-Accessing-Paramify-as-an-Agency-to-Review-an-Assessment", link_label: "Finding KSIs in an assessment" }
  # Help line says where to attach evidence to a KSI (confirmed by Paramify), which no task or support article covered.
  - { id: CA-13.2, text: "Create and associate an evidence set for each gap and each tool change from CA-09.4", role: Tech, ahead: false, help: "Open the KSI in your audit assessment, or in your program under Implementation > KSIs. In the right sidebar, go to Evidence to associate an existing evidence set or create a new one.", done_when: "No KSI gap is left without evidence" }
  - { id: CA-13.3, text: "Repeat for optional KSIs and MAY rules your SOC 2 already covers", role: Lead, ahead: false, done_when: "Done or skipped by decision" }
  - { id: CA-13.4, text: "For every other MUST and SHOULD rule in your Class A program, add a direct SOC 2 mapping, an artifact link, or both", role: "Tech, Lead", ahead: false, done_when: "Every rule has a mapping or an artifact", source: "FedRAMP Class A Self Check" }
  # Help line separates this from CA-12 (wording review) and CA-14 (final check), so it doesn't read as a repeat.
  - { id: CA-13.5, text: "Set an implementation status for every rule and KSI; for Partially or Not Implemented, explain why and give future plans with timeframes", role: Lead, ahead: false, help: "CA-12 checked that the wording is true; this records how fully you meet each rule (Implemented, Partially Implemented, or Not Implemented).", done_when: "No rule or KSI is left without a status", source: "FedRAMP Class A Self Check" }
ksis:
  - { id: KSI-CED-RAT, statement: "The effectiveness of relevant cybersecurity education and training is persistently reviewed, including at least general training for all employees, role-specific training for employees in high risk roles, training for development and engineering staff on secure software delivery, and training for staff involved with incident response or disaster recovery.", soc2_gap: "SOC 2 usually tests annual general training only" }
  - { id: KSI-CMT-LMC, statement: "Modifications to the cloud service offering are logged and monitored.", soc2_gap: "Usually covered by SOC 2 change management" }
  - { id: KSI-CNA-RNT, statement: "Machine-based information resources are persistently reviewed to ensure they are appropriately configured to limit inbound and outbound network traffic.", soc2_gap: "Annual firewall review rather than persistent review" }
  - { id: KSI-IAM-AAM, statement: "The lifecycle and privileges of all accounts, roles, and groups are securely managed using automation.", soc2_gap: "Manual quarterly access reviews rather than automation" }
  - { id: KSI-IAM-APM, statement: "Secure passwordless methods are used for user authentication and authorization when feasible, otherwise strong passwords with phishing-resistant MFA is used.", soc2_gap: "SOC 2 tests \"MFA\"; SMS or TOTP is not phishing-resistant" }
  - { id: KSI-INR-RIR, statement: "The effectiveness of documented incident response procedures is persistently reviewed.", soc2_gap: "Plan exists, but no tabletop or post-incident review" }
  - { id: KSI-SVC-SIN, statement: "Information is encrypted or otherwise secured from unwanted access or modification.", soc2_gap: "Related controls include SC-13 and SC-20/21/22 (DNSSEC), which SOC 2 rarely tests" }
resources:
  - { title: "Create an Audit Assessment in Paramify", url: "https://support.paramify.com/hc/en-us/articles/52282771308819-Create-an-Audit-Assessment-in-Paramify", type: help }
  # Added the KSI walkthrough and the Assessor setup guide alongside the audit assessment guide.
  - { title: "Accessing Paramify as an Agency to Review an Assessment (shows how to find KSIs)", url: "https://support.paramify.com/hc/en-us/articles/49303303994003-Accessing-Paramify-as-an-Agency-to-Review-an-Assessment", type: help }
  - { title: "How to Securely Add Assessors to your Workspace", url: "https://support.paramify.com/hc/en-us/articles/55523335780371-How-to-Securely-Add-Assessors-to-your-Workspace", type: help }
  - { title: "FedRAMP 20x Class A Self Check", url: "https://help.fedramp.gov/hc/en-us/articles/56860150862491-20x-Class-A-Self-Check", type: fedramp }
prompts:
  - title: "Map your SOC 2 to the KSIs"
    caution: "Only use an LLM your organization has approved for confidential documents, and only after SOC 2 release clearance (CA-11.1)."
    text: |
      I am about to paste a SOC 2 Type II report. For each FedRAMP Key Security Indicator listed below, find the SOC 2 controls that address it. For each match, return: criterion and control ID; the control description quoted exactly; the auditor's test procedure quoted exactly; the result quoted exactly (including any exception and management response); the section and page number; and what the KSI requires that the control does not cover. If nothing matches, write NO MATCH. Quote only text that appears in the report.
      {{ksi_statements}}
---

<!-- Said up front that this step happens in Paramify's Assessments feature, and pointed "where" at the capability assurance section. -->

[Draft] You'll do this step in Paramify's **Assessments** feature. Create an audit assessment on your Class A program, then open each KSI and rule there to write its notes.

Associate your SOC 2 documentation with every required KSI, and any optional KSI, where the SOC 2 covered the same security controls. Do this in the capability assurance section of each KSI in your audit assessment, which feeds the KSI assessment in your SDR. In most cases a user on your team fills in these notes.

Don't just say "see SOC 2 report." State the SOC 2 control, how it was tested, any noted findings, and the exact section or page, ideally quoting the relevant text. If your SOC 2 does not cover the full breadth of a KSI, create an evidence set, upload the artifacts, and associate it with the KSI. Example: your SOC 2 tested SMS MFA, but the KSI is stricter about passwordless.

"See SOC 2 report" is not an answer. It is a homework assignment for a reviewer, and reviewers do not do homework.

> [!FEDRAMP] FRC-CLA-MFR (note)
> *In general, for each of these FedRAMP requirements, providers should include a sufficiently detailed summary that reviewers will not need to dig into the related security framework materials to understand the related decisions - just saying "see SOC 2 report" is not particularly helpful.*

> [!FEDRAMP] Class A Self Check
> Each Rule and Key Security Indicator (KSI) should have an Alternative Security Framework mapping, an associated artifact, or even both. A mapping should be direct like page 2, section 3, table 1 or CC8.1 NOT "See SOC report". An artifact could be a link to a webpage, an email address, a policy document, etc. It should be directly linked or easy to find.

## Audit assurance note template

Assessors can select a control, review the capability implementation, and fill out the capability assurance section. This section includes a plan, result, method, user, and status. [Draft] Use this mapping:

```text
Plan: SOC 2 criterion and control ID; control description (quoted) ""
Method: auditor's test procedure (quoted) ""
Result: No exceptions noted | Exception noted: "" Management response: ""; report section and page
User: who completed this note
Status: Complete
Gap against this KSI: None | <describe> -> Evidence set: <name>
```
