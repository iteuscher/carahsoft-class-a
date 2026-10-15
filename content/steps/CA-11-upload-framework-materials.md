---
id: CA-11
title: Upload your SOC 2 materials
phase: 2
# Moved after CA-09, since uploading needs the workspace login set up there. ID unchanged so saved progress is kept.
# Shifted down one so CA-10 can sit right after CA-09.
sequence: 10
summary: Create an evidence set for your SOC 2 package in Paramify, then upload every document to it.
rules: [FRC-CLA-EAM]
tasks:
  - { id: CA-11.1, text: "Get SOC 2 release clearance", role: Sponsor, ahead: true, lead_time: "Depends on your legal review", done_when: "Approval recorded to share the report with agencies through your trust center and to quote it in audit assurance notes. Check your auditor's terms on excerpting", draft: true }
  - { id: CA-11.7, text: "Create an evidence set for your assessment materials, named for your report (for example, SOC 2 Type II 2026)", role: Lead, ahead: false, done_when: "The evidence set appears in Implementation > Evidence Sets", draft: true, added: 2026-10-08 }
  - { id: CA-11.2, text: "Upload the complete SOC 2 Type II report to your evidence set", role: Lead, ahead: false, done_when: "Uploaded" }
  - { id: CA-11.4, text: "Upload verified audit engagement documentation", role: Lead, ahead: false, done_when: "Uploaded" }
  - { id: CA-11.5, text: "Upload the estimated schedule for your upcoming report", role: Lead, ahead: false, done_when: "Uploaded" }
  # Marked optional and moved to the bottom: most people don't have a bridge letter, so it shouldn't read as required or block the step.
  - { id: CA-11.3, text: "Upload your bridge or gap letter, if you have one", optional: true, role: Lead, ahead: false, done_when: "Uploaded. Skip this if you don't have one." }
  # Marked optional and moved to the bottom, like CA-11.3: most people don't have supplemental evidence for this step.
  - { id: CA-11.6, text: "Upload supplemental compliance evidence, if you have any", optional: true, role: Lead, ahead: false, done_when: "Uploaded. Skip this if you don't have any." }
resources:
  - { title: "Manually Uploading Evidence to a Channel", url: "https://support.paramify.com/hc/en-us/articles/55868678007571-Manually-Uploading-Evidence-to-a-Channel", type: help }
---

> [!FEDRAMP] FRC-CLA-EAM
> Providers seeking a FedRAMP Class A Certification MUST supply the following materials from their alternative security framework assessment to all necessary parties: 1. SOC 2 Type II: Complete report, bridge or gap letter (if applicable), verified audit engagement documentation, estimated schedule for upcoming report, supplemental compliance evidence (if applicable).

## Create your evidence set

An evidence set is a folder in Paramify that holds related evidence artifacts. You'll create several more in CA-13 for KSI gaps, so it's worth learning now.

[Draft] In Paramify, go to Implementation > Evidence Sets and add a new evidence set. Name it for the report it holds, for example "SOC 2 Type II 2026", so reviewers know what's inside.

## Upload your materials

Navigate to Implementation > Evidence Sets, open your evidence set, click "Add Artifact", then "Upload File", set the Channel Owner, upload your evidence artifact, set its name and any notes, and click "OK".
