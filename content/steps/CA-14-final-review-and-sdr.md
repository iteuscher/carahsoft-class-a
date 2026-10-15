---
id: CA-14
title: Final review and SDR
phase: 2
sequence: 13
summary: Review every requirement, then generate your Security Decision Record.
rules: [SDR-CSO-FRR, FRC-CSO-PKG]
tasks:
  # Reworded as a confirmation pass, not a third review: statuses and notes are set in CA-13.
  - { id: CA-14.1, text: "Final check: confirm every KSI and rule has the status and audit assurance note you set in CA-13, and add any last remarks", role: Lead, ahead: false, done_when: "Nothing is missing a status or note" }
  # Linked Paramify's Document Robot guide, since the task never said where Document Robot is.
  - { id: CA-14.2, text: "Generate the SDR revision with Document Robot", role: Lead, ahead: false, done_when: "Human-readable and JSON versions generated", link: "https://support.paramify.com/hc/en-us/articles/33972974931475-Document-Robot-Generating-Compliance-Deliverables", link_label: "Document Robot guide" }
  - { id: CA-14.3, text: "Sponsor approves the SDR", role: Sponsor, ahead: false, done_when: "Approval recorded" }
resources:
  - { title: "Security Decision Record video", url: "https://www.youtube.com/watch?v=vAS4QVlcSm8", type: video }
---

Do a final review of the KSIs and every other requirement and add any remarks needed. Then use Document Robot to generate a revision of your SDR (security decision record).

> [!FEDRAMP] SDR-CSO-FRR
> Providers MUST supply a Security Decision Record, in both human-readable and JSON formats, that includes at least all of the following information for each applicable FedRAMP rule:
> 1. Explanation of how the rule is followed, or an explanation of the reason and resulting risk to customers for not following the rule.
> 2. Verification that the implementation is appropriate for the rule, or that the reason for not implementing is accepted by a senior official.
> 3. Validation that the implementation is in place and working as intended, or that the reason for not implementing is accepted by a senior official.
> 4. Independent verification.
> 5. Independent validation.
> 6. Any responses or clarifications to the comments in the independent verification or validation.
> 7. Rule-specific artifacts (if applicable).

> [!FEDRAMP] FRC-CSO-PKG
> Providers seeking a Certification MUST supply a complete FedRAMP Certification Package to FedRAMP for initial certification; the FedRAMP Certification Package MUST include at least the following information:
> 1. Information about the Cloud Service Offering following CPO-CSO-OVR
> 2. Implementation, Validation, and Assessment information for each relevant FedRAMP requirement/control/ksi as defined in SDR-CSO-FRR
> 3. A real or example Ongoing Certification Report following CCM-OCR-AVL.
