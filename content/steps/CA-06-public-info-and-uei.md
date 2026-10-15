---
id: CA-06
title: Public info and UEI
phase: 1
sequence: 6
summary: Fill in the public part of your Certification Package Overview. Your Paramify Trust Center publishes it later.
rules: [CDS-CSO-PUB, MKT-CSO-MLR, SCG-CSO-RSC, SCG-CSO-AUP, SCG-CSO-PUB]
cpo_sections: [identification, properties, contacts, services]
tasks:
  - id: CA-06.1
    text: "Get or confirm your UEI in SAM.gov"
    role: Lead
    ahead: true
    lead_time: "New SAM.gov registrations can take weeks"
    # Removed the "leave it blank for now" option, which read like a way to skip the task. Done now means you have your UEI and entered it.
    done_when: "You've received your UEI and entered it here"
    link_key: fedramp_forms.sam_entity_registration
    inputs:
      - { field: uei_number, label: "Your UEI", placeholder: "12 letters and numbers" }
    draft: true
  # Moved CA-06.4 ahead of the form tasks: the form asks for the Secure Configuration Guide link, so write or find the guide first.
  - { id: CA-06.4, text: "Link your Secure Configuration Guide, or write one if you don't have it", role: Tech, ahead: true, lead_time: "Takes real writing time if it doesn't exist", done_when: "Its public link is in section 2", rules: [SCG-CSO-RSC], draft: true }
  # Split into one task per form section so each section gets its own explanation. CA-06.2 now covers section 1 only; Contact Information moved to the new CA-06.7.
  - { id: CA-06.2, text: "Fill in Service Identification (section 1)", role: Lead, ahead: true, done_when: "Every required field is filled in, except the FedRAMP Package ID (added in CA-07)", complete_when: { cpo: [identification] }, draft: true }
  # Done-when now names the three fields needed today, since the trust center and report fields are collapsed for later.
  - { id: CA-06.6, text: "Fill in Service Properties (section 2)", role: Lead, ahead: true, done_when: "Service model, deployment model, and Secure Configuration Guide link are filled in. The collapsed fields come later.", complete_when: { cpo: [properties] }, draft: true, added: 2026-10-08 }
  # New task: Contact Information used to share CA-06.2 with section 1.
  - { id: CA-06.7, text: "Fill in Contact Information (section 3)", role: Lead, ahead: true, done_when: "Every required field is filled in", complete_when: { cpo: [contacts] }, draft: true, added: 2026-10-13 }
  - { id: CA-06.3, text: "List your services and their security categories (section 5)", role: Tech, ahead: true, done_when: "Every service your customers use is listed with a security category", draft: true }
  - { id: CA-06.5, text: "Copy or download your answers so they're ready for your CPO (CA-10)", role: Lead, ahead: true, done_when: "Answers saved outside this browser", draft: true }
resources:
  - { title: "Register your entity or get a Unique Entity ID (SAM.gov)", url: "https://sam.gov/entity-registration", type: form }
  - { title: "Paramify Cloud on the FedRAMP Marketplace", url: "https://www.fedramp.gov/marketplace/products/FR2428769635XL/", type: fedramp }
  - { title: "FedRAMP Secure Configuration Guide rules", url: "https://www.fedramp.gov/2026/reference/secure-configuration-guide/", type: fedramp }
prompts:
  - title: "Draft your public info for the form"
    caution: "Public information only. Paste website and product copy, nothing confidential."
    text: |
      I am preparing the public information for a FedRAMP Marketplace listing, which is published as a Certification Package Overview (CPO). Using only the material I paste below (our website copy and product overview), draft: Service Model, Deployment Model, Business Category, Overall Service Description (under 150 words), and a list of specific services. Mark anything you cannot find as MISSING. Do not invent details.

      Give your response in exactly the order and format below. Write one line per field as "Field name: value", keeping the field names exactly as written. Follow the note in square brackets after each field, and leave the notes out of your answer. Where a field lists allowed values, use only those values, spelled exactly as listed. Keep the numbered section headings on their own lines.

      {{cpo_prompt_fields}}

      Here is our material:
---

<!-- Reorganized into numbered sections so each task sits next to its how-to and the form. The FedRAMP rule callouts moved to the end, unchanged. -->

Your public information goes into your Certification Package Overview (CPO), the machine-readable version of your FedRAMP Marketplace listing.

[Draft] Your Paramify Trust Center hosts the finished CPO files, both human-readable and JSON, along with the rest of your package. Paramify sets it up with you in CA-15, so you don't need to host anything yourself.

## What a listing looks like

![Paramify Cloud's listing on the FedRAMP Marketplace, showing the provider and service name, Package ID, service description, Sales and Security contacts, product website, UEI, business categories, service model, and deployment model](/images/marketplace-paramify-cloud.jpg)

This is Paramify Cloud on the FedRAMP Marketplace ([see the live listing](https://www.fedramp.gov/marketplace/products/FR2428769635XL/)). Each part comes from the CPO: provider and service name, Package ID, service description, Sales and Security contacts, product website, UEI, business categories, service model, and deployment model.

## 1. Get your UEI from SAM.gov

{{tasks: CA-06.1}}

Your Unique Entity ID (UEI) is the 12-character ID SAM.gov assigns to your company.

1. Check whether you're already registered. On [SAM.gov entity registration](https://sam.gov/entity-registration), choose **Check Entity Status**. If you're registered, you already have a UEI.
2. If not, choose **Get Started**. You can request a UEI only, or complete a full registration. [Draft] A UEI alone is enough for your CPO. A full registration is what you need to bid on federal contracts or apply for federal awards as a prime.
3. [Draft] Sign in with a Login.gov account; SAM.gov uses Login.gov for sign-in.
4. A full registration must be renewed every 365 days to stay active.

## 2. Link or write your Secure Configuration Guide

{{tasks: CA-06.4}}

A Secure Configuration Guide tells your customers how to set up and run your offering securely: how to access, configure, operate, and decommission the top-level administrative accounts that control the whole service, and what the security-related settings those accounts control do. FedRAMP requires one and recommends making it public. It can be a help-center section or a single web page; it doesn't have to be a formal document. The exact rules are at the bottom of this page, and the full guidance is on [FedRAMP's Secure Configuration Guide page](https://www.fedramp.gov/2026/reference/secure-configuration-guide/).

## 3. Fill in your CPO

<!-- Split the form into its four sections, each under its own task with its own explanation. The AI shortcut stays at the top; Copy/Download is in section 4. -->

The CPO form has four sections to fill in now. Your answers are saved in this browser as you type. To start faster, have AI draft them from your website copy.

{{cpo_tools}}

### Section 1: Service Identification

{{tasks: CA-06.2}}

[Draft] Who you are and what you're listing: your company and service names, a short description, your website, and your logo. Leave the FedRAMP Package ID blank; FedRAMP assigns it in CA-07.

- **Logo URL.** A direct link to the image file, so opening it in a browser shows only the logo. It must end in .png, .jpg, .gif, .svg, .webp, .ico, .bmp, or .tiff. Use a version that shows on a white background; a fully transparent or white-on-transparent logo disappears. The form previews it for you.

{{cpo_form: identification}}

### Section 2: Service Properties

{{tasks: CA-06.6}}

[Draft] How your service is delivered: its service model, deployment model, and business categories, plus the link to the Secure Configuration Guide from step 2. The trust center and report fields are collapsed at the bottom of the section. Expand them to see what's coming; you fill them in later.

- **Business categories.** Up to 10 from FedRAMP's fixed list, shown in the form.

{{cpo_form: properties}}

### Section 3: Contact Information

{{tasks: CA-06.7}}

[Draft] Where FedRAMP and agencies reach you. Use the FedRAMP Security Inbox you set up in CA-05.

- **Sales and security contacts.** Group addresses such as sales@ or security@yourcompany.com, not one person's inbox. People change jobs; group addresses keep working.

{{cpo_form: contacts}}

### Section 5: Certified Services

{{tasks: CA-06.3}}

[Draft] List each service your customers use and choose its security category: Low, Moderate, or High. Section 4 (Independent Assessor) comes later, in CA-10.

{{cpo_form: services}}

## 4. Save your answers

{{tasks: CA-06.5}}

<!-- Moved the Copy/Download buttons here, right after the last form section, so they're there when you finish. -->

Your answers live only in this browser until you copy or download them.

{{cpo_save}}

## FedRAMP rules behind this step

> [!FEDRAMP] SCG-CSO-RSC
> Providers MUST create, maintain, and make available recommendations for securely configuring their cloud services (the Secure Configuration Guide) that includes at least the following information:
> 1. Required: Instructions on how to securely access, configure, operate, and decommission top-level administrative accounts that control enterprise access to the entire cloud service offering.
> 2. Required: Explanations of security-related settings that can be operated only by top-level administrative accounts and their security implications.
> 3. Recommended: Explanations of security-related settings that can be operated only by privileged accounts and their security implications.
>
> *These rules refer to this guidance as a Secure Configuration Guide but cloud service providers may make this guidance available in various appropriate forms that provide the best customer experience.*
>
> *This guidance should explain how top-level administrative accounts and privileged accounts are named and referred to in the cloud service offering.*

> [!FEDRAMP] SCG-CSO-AUP
> Providers MUST include instructions in the FedRAMP Certification Package that explain how to obtain and use the Secure Configuration Guide.
>
> *These instructions may appear in a variety of ways; it is up to the provider to do so in the most appropriate and effective ways for their specific customer needs.*

> [!FEDRAMP] SCG-CSO-PUB
> Providers SHOULD make the Secure Configuration Guide available publicly.

> [!FEDRAMP] CDS-CSO-PUB
> Providers MUST publicly share up-to-date information about the cloud service offering in both human-readable and JSON formats, including at least the following information that is available and applicable:
> 1. FedRAMP ID
> 2. Service Model
> 3. Deployment Model
> 4. Business Category
> 5. UEI Number
> 6. Sales Contact Information
> 7. Security Contact Information
> 8. Product Website Link
> 9. Link to Product Logo
> 10. Overall Service Description
> 11. Detailed list of specific services and their security categories
> 12. Link to Secure Configuration Guidance
> 13. Overview of documentation supplied by the provider for the cloud service offering
> 14. Link to Trust Center landing page that includes instructions on accessing information in the trust center
> 15. Next Ongoing Certification Report date
> 16. Current FedRAMP Recognized independent assessment service
>
> *Generally, this information should be available on a public webpage or publicly shared in a FedRAMP-compatible trust center.*

> [!FEDRAMP] MKT-CSO-MLR
> Providers MUST address at least these FedRAMP rules to apply for a new FedRAMP Marketplace listing OR to request updates to an existing listing: 1. Certification Data Sharing: CDS-CSO-PUB (Public Information).
