---
id: CA-07
title: Marketplace listing
phase: 2
sequence: 15
summary: Request your FedRAMP Marketplace listing once your trust center hosts your CPO, then add the FedRAMP ID to your CPO.
rules: [MKT-CSO-PML, MKT-IIP-DCP, MKT-IIP-DLA]
tasks:
  # Pointed to the field-by-field help further down the page, as a small help line rather than part of the task text.
  - { id: CA-07.1, text: "Submit the Marketplace Listing Request Form, with your public CPO JSON link (CA-15) in the Machine-readable package URL field", help: "Need help filling it out? Scroll to \"How to fill out the Marketplace Listing Request Form\" near the bottom of this page.", role: Lead, ahead: false, done_when: "Submission confirmation received", link_key: fedramp_forms.marketplace_listing }
  - id: CA-07.2
    text: "Record your FedRAMP ID, add it to both versions of your CPO, and re-upload them to your trust center"
    role: Lead
    ahead: false
    lead_time: "FedRAMP IDs usually arrive in 3–5 business days, sometimes 2"
    done_when: "FedRAMP ID appears in both CPO versions on your trust center"
    inputs:
      - { field: package_id, label: "Your FedRAMP Package ID", placeholder: "e.g. FR2024000123" }
  - { id: CA-07.3, text: "Publish your goals and milestones", role: Lead, ahead: false, done_when: "Page live on trust center or website; quarterly update reminder set", rules: [MKT-IIP-DCP] }
  # Removed CA-07.4 ("Record your 2-year assessment deadline") as too obvious to be a task. Retired ID: never reuse CA-07.4.
form:
  title: "How to fill out the Marketplace Listing Request Form"
  confirm_note: "[Draft] The rows from Provider-CSP Name through Machine-readable package URL appear after you choose a new listing; confirm them against the live form."
  fields:
    - { field: "Form dropdown", value: "[For CSPs] Marketplace Listing Request Form" }
    - { field: "Your email address*", value: "A group or shared inbox for the team that will communicate with the FedRAMP PMO. Not one person's inbox; people take vacations and change jobs, and rule AFC-CSO-RCV expects you to receive email without disruption." }
    - { field: "Marketplace Listing Request*", value: "New listing.", fedramp_note: "Note for updating existing listings: CSPs that have already onboarded via JSON should update their content in their JSON directly; CSPs who previously only used manual entry must create and submit a JSON URL per CR26." }
    - { field: "Provider-CSP Name", value: "Your company's name (e.g., Paramify)" }
    - { field: "Provider-CSO Name", value: "Your product's name, matching how you market it to federal agencies (e.g., Paramify Cloud)" }
    - { field: "Certification Type", value: "20x" }
    - { field: "Machine-readable package URL", value: "The direct link to your public CPO JSON on your trust center (CA-15)" }
    - { field: "Optional Additional Information*", value: "Anything else FedRAMP should know; enter \"N/A\" if nothing applies." }
    - { field: "Attachments", value: "Not needed; everything lives on your trust center", draft: true }
---

Submit the listing after your trust center hosts your CPO. The FedRAMP ID usually comes in 3–5 business days, sometimes in as little as 2, but timing isn't consistent.

> [!FEDRAMP] MKT-CSO-PML
> Providers MUST notify FedRAMP using the FedRAMP Marketplace Providing Listing Request Form to request a listing in the FedRAMP Marketplace.
>
> *FedRAMP does not accept applications for a FedRAMP Marketplace Listing via email!*

> [!FEDRAMP] MKT-IIP-DCP
> Providers MUST demonstrate continuous progress towards a FedRAMP Certification, documented in their Trust Center or website and updated at least quarterly; progress is measured by the provider against documented goals and milestones.
>
> *This is an opportunity for a business to showcase its goals and progress, and should be seen as a marketing and customer experience challenge instead of a compliance challenge.*

> [!FEDRAMP] MKT-IIP-DLA
> Providers MUST demonstrate that an assessment for a FedRAMP Certification Class B, C, or D has been scheduled within 2 years of initial listing in the Initial Implementation Phase.
