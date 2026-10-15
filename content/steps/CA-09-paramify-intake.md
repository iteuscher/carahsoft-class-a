---
id: CA-09
title: Paramify intake
phase: 2
# Moved ahead of CA-11: you log in and meet Paramify here, which has to happen before uploading anything to Paramify.
sequence: 8
# Summary now says the workspace is set up for you, matching the gate after CA-08.
summary: Your workspace is set up for you. On the intake call, tell Paramify the people, process, and technology you use; then apply them to your Class A program.
rules: [VDR-CSO-DET]
tasks:
  # Section 1 (new): workspace setup for Class A. Draft with no owner while Paramify decides who does each part.
  - { id: CA-09.7, text: "Create a Stack", done_when: "The stack appears under Stacks", link: "https://support.paramify.com/hc/en-us/articles/55866357226259-Creating-Stacks-Setting-Risk-Profiles", link_label: "Creating Stacks guide", draft: true, added: 2026-10-15 }
  # Linked the Class A risk profile and preset exports so whoever sets this up has the exact files.
  - { id: CA-09.8, text: "Apply the FedRAMP 20x Class A risk profile and risk solution preset to the stack", help: "If your account doesn't have them yet, an account admin can recreate them from the two Class A files below.", done_when: "The stack's Risk Settings show the Class A profile and preset", link: "https://support.paramify.com/hc/en-us/articles/54676504489107-Risk-Profiles-and-Risk-Solution-Presets", link_label: "Risk Profiles and Presets guide", link_key: templates.risk_profile, template: risk_solution_preset, draft: true, added: 2026-10-15 }
  - { id: CA-09.9, text: "Create a program and choose CR26 FedRAMP 20x as its type", help: "The guide shows an older FedRAMP program type; pick CR26 FedRAMP 20x instead.", done_when: "The program appears under Programs", link: "https://support.paramify.com/hc/en-us/articles/33826752647059-Creating-Programs", link_label: "Creating Programs guide", draft: true, added: 2026-10-15 }
  - { id: CA-09.10, text: "In the program, go to Controls > Edit Selection > Reset to Baseline Defaults > Save Selection", done_when: "The program's controls match the Class A baseline", draft: true, added: 2026-10-15 }
  # Section 2: the intake call. CA-09.1 no longer says "invite your team", since users are added for you at the gate.
  - { id: CA-09.1, text: "Log in and confirm your team is there", role: Lead, ahead: false, help: "Your partner or Paramify added your team when they set up your workspace (see the gate after CA-08).", done_when: "Every role owner has a Paramify login" }
  # CA-09.3 now covers only the risk-solution review; creating the stack and applying the profile moved to section 1.
  # Help line points to the AI prompt at the bottom of the page, like the other "near the bottom" pointers.
  - { id: CA-09.3, text: "On the intake call, review the Solution Status of the 22 pre-populated Risk Solutions, and set the Solution Parameter and Status for the 8 empty ones", role: Tech, ahead: false, help: "To list your tools quickly before the call, use the AI prompt \"Pull your tool inventory from your SOC 2\" near the bottom of this page.", done_when: "All 30 Risk Solutions have a status", link: "https://support.paramify.com/hc/en-us/articles/55866471520915-Stack-Intake-Creating-Solution-Capabilities", link_label: "Stack Intake guide" }
  - { id: CA-09.4, text: "List tools that changed since your SOC 2 audit period", role: Tech, ahead: false, done_when: "List saved; each item gets supplementary evidence in CA-13", draft: true }
  # Now a true optional task (chip, not counted toward progress) instead of "Optional:" in the title.
  - { id: CA-09.2, text: "Connect your LLM to the Paramify MCP during your intake session", optional: true, role: Tech, ahead: false, done_when: "Your LLM can list your Paramify programs", link: "https://support.paramify.com/hc/en-us/articles/48687059699347-Paramify-MCP-Setup", link_label: "Paramify MCP setup guide" }
  # Section 3: after intake. CA-09.5 now gives the exact menu path; the program itself is created in section 1.
  - { id: CA-09.5, text: "Apply your Stack's Solution Capabilities to your program: Implementation > Controls > Apply Stack Solution Capabilities > Submit", role: Lead, ahead: false, done_when: "The program shows your Stack's solution capabilities", link: "https://support.paramify.com/hc/en-us/articles/46488460115475-Solution-Capabilities-Overview", link_label: "Solution Capabilities guide" }
  # Linked the walkthrough for uploading scan data, which turns findings into Issues.
  - { id: CA-09.6, text: "Use your vulnerability scan data file to create issues within Paramify", role: SecOps, ahead: false, done_when: "Scan findings appear as issues", rules: [VDR-CSO-DET], link: "https://support.paramify.com/hc/en-us/articles/46555535314451-Create-a-Cycle-Within-an-Assessment-in-Paramify", link_label: "Uploading scan data guide" }
resources:
  - { title: "Start with Elements, Solution Capabilities, and Programs", url: "https://support.paramify.com/hc/en-us/articles/33817330853779-Start-with-Elements-Solution-Capabilities-and-Programs", type: help }
  - { title: "Managing Elements (People, Places, and Things)", url: "https://support.paramify.com/hc/en-us/articles/33859299952787-Managing-Elements-People-Places-and-Things", type: help }
  # Added the intake walkthroughs linked from the tasks above.
  - { title: "Creating Stacks/Setting Risk Profiles", url: "https://support.paramify.com/hc/en-us/articles/55866357226259-Creating-Stacks-Setting-Risk-Profiles", type: help }
  - { title: "Risk Profiles and Risk Solution Presets", url: "https://support.paramify.com/hc/en-us/articles/54676504489107-Risk-Profiles-and-Risk-Solution-Presets", type: help }
  - { title: "Stack Intake | Creating Solution Capabilities", url: "https://support.paramify.com/hc/en-us/articles/55866471520915-Stack-Intake-Creating-Solution-Capabilities", type: help }
  - { title: "Risk Solutions (AKA Solution Parameters)", url: "https://support.paramify.com/hc/en-us/articles/46641064255507-Risk-Solutions-AKA-Solution-Parameters", type: help }
  - { title: "Paramify subprocessors and AI data processing", url: "https://trust.paramify.com/paramify/paramify-cloud/subprocessors", type: trust }
prompts:
  - title: "Pull your tool inventory from your SOC 2"
    caution: "Only use an LLM your organization has approved for confidential documents, and only after SOC 2 release clearance (CA-11.1)."
    text: |
      I am about to paste my SOC 2 Type II system description. Extract the tools and services we use, grouped as: identity provider, SIEM or logging, endpoint security, vulnerability scanning, network traffic controls, encryption and key management, security awareness training, incident response tooling, ticketing and change management, cloud provider, and third-party services. For each, give the product name, its category, and the page number where it appears. If a category is not mentioned, write NOT FOUND. Do not invent products.
---

<!-- Reorganized into three sections (set up, intake call, after intake) so it's clear what happens when. Section 1 is draft until Paramify decides who owns it. -->

Intake is where you select the components you use: the people, process, and technologies your business uses to manage risk to your cloud service offering. For example: we use SentinelOne as our SIEM, KnowBe4 for security awareness training, AWS security groups to restrict inbound and outbound network traffic, Paramify as our GRC tool, and Paramify as our FedRAMP Trust Center.

[Draft] Your workspace itself is already set up for you (see the gate after CA-08). This step has three parts: get the workspace ready for Class A, walk through intake on a call with Paramify, then apply what you chose to your Class A program.

## 1. Set up your workspace for Class A

[Draft] Who handles each of these is still being decided, so they're marked "Owner TBD". Paramify will tell you before your intake call.

{{tasks: CA-09.7, CA-09.8, CA-09.9, CA-09.10}}

## 2. Your intake call

<!-- Explains what the 22 + 8 Risk Solutions are for (confirmed by Paramify), so the vendor knows why the 8 empty ones matter most. -->

Your 30 Risk Solutions (22 pre-filled, 8 empty) create the solution capabilities for all 77 Class A requirements: the 7 Key Security Indicators (KSIs), such as passwordless login, logging and monitoring, and employee training, plus the FedRAMP rules about your processes. The 8 empty ones mostly drive the solution capabilities for the 7 KSIs, so give them the most care.

{{tasks: CA-09.1, CA-09.3, CA-09.4, CA-09.2}}

[Draft] Tip: answer intake from your SOC 2 system description, and note any tool that changed since the audit period. Those tools need supplementary evidence in CA-13.

## 3. After intake

{{tasks: CA-09.5, CA-09.6}}
