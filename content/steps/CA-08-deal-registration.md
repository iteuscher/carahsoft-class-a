---
id: CA-08
title: Deal registration and workspace
phase: 1
sequence: 7
# The gate now lists what your partner or Paramify sets up for you, so you know you don't have to do it.
gate_done_for_you:
  - "Create your Paramify workspace"
  - "Add your company name, logo, and team members to it"
  - "Turn on CR26 FedRAMP 20x Class A as your program license"
gate_after: "Workspace ready, usually 1–2 business days after signing. Everything after this happens in Paramify, starting with CA-09."
summary: Your partner sends the purchase order, you sign Paramify's agreement, and Paramify provisions your workspace.
tasks:
  - { id: CA-08.1, text: "Register the deal with Paramify", role: Partner, ahead: true, done_when: "Deal registered" }
  - { id: CA-08.2, text: "Issue and accept the purchase order", role: "Partner, Lead", ahead: true, done_when: "PO accepted" }
  - { id: CA-08.3, text: "Sign the Paramify platform agreement", role: Sponsor, ahead: true, done_when: "Signed", link: "https://www.paramify.com/legal/access-and-services-agreement" }
  # Retired CA-08.4 ("Paramify provisions your workspace"): the gate's "done for you" list replaces it. Never reuse CA-08.4.
---

Your partner sends a purchase order to you. In some cases the partner pays for it on your behalf. Either way, you sign and agree to Paramify's terms and conditions before your Paramify workspace is provisioned.
