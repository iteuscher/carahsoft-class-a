---
id: CA-03
title: Eligibility
phase: 1
sequence: 3
summary: Confirm you have a qualifying assessment from the past 12 months and a federal use case.
rules: [FRC-CLA-ASF, MKT-IIP-AGU, MAS-CSO-IIR, FRC-CSO-POP]
tasks:
  - { id: CA-03.1, text: "Choose your path: the framework of your most recent assessment", role: Lead, ahead: true, done_when: "Path chosen below. Your report must be completed within the past 12 months", rules: [FRC-CLA-ASF], widget: path_choice, complete_when: path_chosen }
  - { id: CA-03.2, text: "Confirm an agency use case", role: Lead, ahead: true, done_when: "You can name a direct or indirect agency use", rules: [MKT-IIP-AGU] }
  - { id: CA-03.3, text: "Exclude software you ship but don't operate", role: Tech, ahead: true, done_when: "Agents, clients, and apps installed on agency systems are out of your offering", rules: [MAS-CSO-IIR] }
  - id: CA-03.4
    text: "Name your company and product, and confirm your report covers them"
    role: Lead
    ahead: true
    done_when: "Both names entered, and the entity and system named in your report match them"
    inputs:
      - { field: provider_name, label: "Company name (cloud service provider)", placeholder: "e.g. Microsoft, Adobe" }
      - { field: service_name, label: "Product name (cloud service offering)", placeholder: "e.g. Office 365, Creative Cloud" }
  - { id: CA-03.5, text: "Rev5 holders only: pick one program certification", role: Sponsor, ahead: true, done_when: "Decision recorded", rules: [FRC-CSO-POP], paths: [rev5] }
resources:
  - { title: "Class A blog: Do You Already Qualify for Class A?", url: "https://www.paramify.com/blog/fedramp-class-a-certification", type: blog }
---

> [!FEDRAMP] FRC-CLA-ASF
> Providers seeking a FedRAMP Class A Certification MUST have completed a certification or equivalent process, including an independent assessment if applicable, from one of the following alternative security frameworks within the past 12 months:
> 1. FedRAMP Rev5 (including FedRAMP Ready) at any historical Impact Level
> 2. SOC 2 Type II
> 3. GovRAMP at any Impact Level

> [!FEDRAMP] MKT-IIP-AGU
> Providers MUST demonstrate that a cloud service offering is intended for one of the following use cases:
> 1. Direct Use: The product will be used directly by agency customers for integration into a federal information system that falls within the scope of 44 USC § 3506 and will receive an agency Authorization to Operate.
> 2. Indirect Use: The product will be included as a third-party information resource in other cloud service offerings that are directly used by agency customers.
>
> *Services used by private companies to meet other compliance requirements (such as CMMC) that do not also meet one of the above use cases are outside the scope of FedRAMP.*

> [!FEDRAMP] MAS-CSO-IIR (note)
> *Software produced by cloud service providers that is delivered separately for installation on agency systems and not operated in a shared responsibility model (typically including agents, application clients, mobile applications, etc. that are not fully managed by the cloud service provider) is not a cloud computing product or service and is entirely outside the scope of FedRAMP.*

> [!FEDRAMP] FRC-CSO-POP
> Providers MUST NOT seek both FedRAMP Rev5 Program Certification and FedRAMP 20x Program Certification for the same cloud service offering; pick one type.

## Not eligible yet?

If your most recent report is older than 12 months, you do not qualify until your next assessment cycle completes. [Draft] Talk to your partner or Paramify rep about timing.
