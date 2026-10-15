---
id: CA-12
title: Review solution capabilities
phase: 2
# Shifted down one so CA-10 can sit right after CA-09.
sequence: 11
summary: Your solution capabilities become the wording of your SDR. Review every one and sign off.
rules: [FRC-CSO-MRA, FRC-CLA-MFR, SDR-CSO-FRR]
tasks:
  - { id: CA-12.1, text: "Assign a reviewer to each solution capability", role: Lead, ahead: false, done_when: "Every solution capability has a reviewer" }
  # Reworded so this pass has one job (is the wording true?) and one place, distinct from CA-13 (prove it) and CA-14 (final check).
  # Clarified the count (confirmed by Paramify): 77 requirements in all, of which 7 are KSIs and the rest are FedRAMP process rules.
  - { id: CA-12.2, text: "In Implementation > Solution Capabilities, review and correct each solution capability across your 77 Class A requirements: the 7 KSIs plus the FedRAMP rules about your processes", role: "Tech, SecOps", ahead: false, help: "This pass checks that each description is true for your offering today. You'll prove it with your SOC 2 in CA-13.", done_when: "Every solution capability reads as true for your offering today, its Assurance Review is marked Reviewed, and the dashboard shows 100%" }
  - { id: CA-12.3, text: "Stand up any process your SOC 2 never required (incident reportability evaluation, Ongoing Certification Report)", role: SecOps, ahead: false, done_when: "Process has an owner and a written procedure", draft: true }
  # Paramify has no formal sign-off feature (confirmed), so this is now a review-and-approve process step, not something "recorded in Paramify".
  - { id: CA-12.4, text: "Sponsor reviews and approves the solution capabilities, including the reason for any rule you don't follow", role: Sponsor, ahead: false, help: "This is a process step, not a button in Paramify. It has to happen before your SDR is submitted on behalf of your cloud service.", done_when: "The Sponsor has reviewed and approved them" }
resources:
  - { title: "Managing Solution Capabilities", url: "https://support.paramify.com/hc/en-us/articles/33859302205843-Managing-Solution-Capabilities", type: help }
  - { title: "Solution Capabilities Overview", url: "https://support.paramify.com/hc/en-us/articles/46488460115475-Solution-Capabilities-Overview", type: help }
---

Every KSI and every other Class A requirement in your Paramify Class A program has out-of-the-box solution capabilities, driven by your intake, that describe how you implement the requirement. Review them: they become the wording of your SDR. Paramify's solution capability dashboards support statuses, reviews, and assigned reviewers, so your team can keep them up to date. Solution capabilities also map to NIST 800-53, NIST 800-171 for CMMC, DoD Impact Levels, SOC 2, ISO, and custom control frameworks, so this review benefits future compliance programs.

Who is responsible for the review can be assigned by Responsible Role and/or by individual users. Any time a Solution is modified, the review status is updated to "Not Reviewed". The Solution Capabilities Dashboard provides a quick status of your implementation status. The percentage indicates the number of Solution Capabilities that have been reviewed.

> [!FEDRAMP] FRC-CSO-MRA
> Providers MUST maintain responsibility and accountability for the accuracy and completeness of all information in the FedRAMP Certification Package, especially when they engage a third party (such as an independent assessor, advisory service, or external tools) to supply information on their behalf.

> [!FEDRAMP] FRC-CLA-MFR (note)
> *Some of these specific FedRAMP rules may not have similar counterparts in external frameworks and providers will need to implement new processes to follow these rules.*

<!-- Added a hand-off so readers know CA-13 moves into Paramify's Assessments feature. -->

[Draft] Next, in CA-13, you'll map your SOC 2 to each KSI and rule in Paramify's **Assessments** feature.
