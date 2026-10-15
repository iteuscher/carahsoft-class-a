---
id: CA-10
title: Scope and CPO
phase: 2
# Moved back right after CA-09 (user decision); later steps shift down one.
sequence: 9
summary: Confirm what's in scope and fill out your Certification Package Overview, the machine-readable version of your Marketplace listing.
rules: [MAS-CSO-IIR, CPO-CSO-OVR, FRC-CSO-JSN]
cpo_sections: [assessor, resources, framework, third_party, summary]
tasks:
  # Linked the video right on the task so you don't have to scroll to Resources; it stays listed there too.
  - { id: CA-10.1, text: "Watch the Minimum Assessment Scope video and review your in-scope components", role: Tech, ahead: false, done_when: "Every component that handles or impacts federal customer data is in scope", link: "https://www.youtube.com/watch?v=hVe6tmv2rZY", link_label: "Minimum Assessment Scope video" }
  - { id: CA-10.2, text: "Finish the CPO form (sections 4 and 6–9 below; sections 1–3 and 5 are in CA-06) and send your answers to your CSM for conversion to JSON", role: Lead, ahead: false, done_when: "CSM returns the JSON; the FedRAMP ID is added after CA-07", draft: true }
  - { id: CA-10.3, text: "Confirm the CPO is available as human-readable and JSON, and the JSON passes FedRAMP's JSON Schema Validator", role: Lead, ahead: false, done_when: "Validator passes with the FedRAMP Certification Package Overview (FRC-CSO-PKG) schema" }
resources:
  - { title: "Minimum Assessment Scope video", url: "https://www.youtube.com/watch?v=hVe6tmv2rZY", type: video }
  - { title: "Certification Package Overview video", url: "https://www.youtube.com/watch?v=ifBuEyA3HuY", type: video }
  - { title: "FedRAMP JSON Schema Validator", url: "https://www.fedramp.gov/schemas/validator/", type: fedramp }
---

> [!FEDRAMP] MAS-CSO-IIR
> Providers MUST identify a set of information resources to assess for FedRAMP Certification that includes all information resources that are likely to handle federal customer data or likely to impact the confidentiality, integrity, or availability of federal customer data handled by the cloud service offering; this set of information resources is the cloud service offering.

## What is the CPO?

The CPO is a machine-readable version of your FedRAMP Marketplace listing. If you ever want to update the information on the FedRAMP Marketplace, you update your CPO. You include a link to your public CPO with all the other FedRAMP deliverables you submit, so it serves as a tracking identifier for your cloud service offering.

## Finish your CPO

[Draft] You filled in the public sections in CA-06. The form below has the rest: your assessor, information resources, alternative security framework, and third-party resources. When you're done, use **Copy all answers** or **Download** and send them to your CSM, who converts them to JSON. Some fields, like the FedRAMP ID, get filled in later.

<details><summary>How Paramify builds your CPO</summary>

Information flows and third-party resources are pulled in automatically from intake, where you describe the components you use and the third parties you rely on.
</details>

> [!FEDRAMP] CPO-CSO-OVR
> Providers MUST supply a Certification Package Overview within their FedRAMP Certification Package, in both human-readable and JSON formats, that includes at least all of the information required by the following rules: CPO-CSO-MTD (Certification Package Overview Metadata), CDS-CSO-PUB (Public Information), CDS-CSO-SVC (Public Service List), CDS-CSO-IRP (Include Relevant Policies), MAS-CSO-IIR (Identify Information Resources), MAS-CSO-FLO (Information Flows and Security Categories), MAS-CSO-TPR (Third-Party Information Resources), CMU-CSO-CMD (Cryptographic Module Documentation), IVV-CSO-ICP (Inclusion in Certification Package).
>
> *This list of rules may not apply to all FedRAMP Certification Classes or Types - if a rule does not apply then the information is not required.*
