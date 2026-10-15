---
id: CA-05
title: FedRAMP Security Inbox
phase: 1
sequence: 5
summary: A shared inbox FedRAMP can always reach, with no portals, CAPTCHAs, or spam filtering in the way.
rules: [AFC-CSO-INB, AFC-CSO-RCV, AFC-CSO-CRA]
choice:
  id: email
  question: Which email platform runs your FedRAMP Security Inbox?
  hint: You'll only see the setup steps for your platform.
  options:
    - { id: google, label: "Google Workspace (Gmail)" }
    - { id: microsoft, label: "Microsoft 365 (Outlook)" }
    - { id: other, label: "Other" }
tasks:
  - id: CA-05.1
    text: "Create a shared group address, e.g. fedramp@yourcompany.com"
    role: Comms
    ahead: true
    done_when: "Group exists with at least two members"
    inputs:
      - { field: fedramp_security_inbox, label: "Your FedRAMP Security Inbox address", placeholder: "fedramp@yourcompany.com" }
  - { id: CA-05.2, text: "Google: in Group Settings, configure it to be a collaborative inbox with shared labels", role: Comms, ahead: true, done_when: "All members see the same conversations", variant: google }
  # Pointed to the suggested wording under "Auto-reply text", now as a small help line instead of part of the task text.
  - { id: CA-05.3, text: "Google: under Auto-replies, enable auto-reply to members outside the organization", help: "Suggested wording is under \"Auto-reply text\" near the bottom of this page.", role: Comms, ahead: true, done_when: "Auto-reply text saved", variant: google }
  # Named the two FedRAMP sender addresses instead of "the two FedRAMP senders". Readers following only the Google tasks couldn't tell who the senders were.
  - { id: CA-05.4, text: "Google: in admin.google.com, Apps > Google Workspace > Gmail > Compliance, add a Content compliance rule that bypasses the spam filter for fedramp_security@gsa.gov and fedramp_security@fedramp.gov", role: Comms, ahead: true, done_when: "Rule \"FedRAMP Security Emails\" active", variant: google }
  - { id: CA-05.5, text: "Google: allow posting from outside the organization and turn off moderation", role: Comms, ahead: true, done_when: "External test message is not held", variant: google, draft: true }
  # Named the two FedRAMP sender addresses instead of "the two FedRAMP senders". Readers following only the Microsoft tasks couldn't tell who the senders were.
  # Added an auto-reply step (and the auto-reply to done_when), since CA-05.7's test expects one and Microsoft users were never told to set it up.
  # The pointer to the suggested wording is now a small help line instead of part of the task text.
  - { id: CA-05.6, text: "Microsoft 365: use a shared mailbox or Microsoft 365 group; turn on \"Allow external senders\" (group) or turn off \"Require that all senders are authenticated\" (distribution list); add a mail flow rule that sets SCL -1 for fedramp_security@gsa.gov and fedramp_security@fedramp.gov; set automatic replies for senders outside your organization", help: "Suggested wording is under \"Auto-reply text\" near the bottom of this page.", role: Comms, ahead: true, done_when: "External test message lands in the inbox and gets the auto-reply", variant: microsoft, draft: true }
  # Pointed to the suggested wording under "Auto-reply text", now as a small help line instead of part of the task text.
  - { id: CA-05.9, text: "Configure your email platform: allow messages from outside your organization without moderation or approval, set an auto-reply for outside senders, and make sure messages from fedramp_security@gsa.gov and fedramp_security@fedramp.gov skip spam filtering", help: "Suggested wording is under \"Auto-reply text\" near the bottom of this page.", role: Comms, ahead: true, done_when: "External test message lands in the inbox and gets the auto-reply", variant: other, draft: true, added: 2026-10-08 }
  - { id: CA-05.7, text: "Send a test from an outside address", role: Comms, ahead: true, done_when: "Auto-reply received; message visible to every member", draft: true }
  - { id: CA-05.8, text: "Recommended: route Emergency messages to your Sponsor", role: Comms, ahead: true, done_when: "Sponsor is a member or receives a forward" }
resources:
  - { title: "FedRAMP Security Inbox: What You Need to Know", url: "https://www.paramify.com/blog/fedramp-security-inbox", type: blog }
---

It's pretty basic: FedRAMP wants a reliable way to directly contact security and compliance staff operating FedRAMP authorized cloud service offerings without having to go through extra customer support portals, do CAPTCHAs, or take other service-specific actions that might prevent the security team from receiving the message. For Emergency and Emergency Test messages specifically, FedRAMP will use the sender addresses fedramp_security@gsa.gov or fedramp_security@fedramp.gov.

> [!FEDRAMP] AFC-CSO-INB
> Providers MUST establish and maintain an email address to receive messages from FedRAMP; this inbox is a FedRAMP Security Inbox (FSI).
>
> *Be careful using a personal email tied to an individual for this inbox due to the significant risk to future communications after a change in personnel!*

> [!FEDRAMP] AFC-CSO-RCV
> Providers MUST receive and react to email messages from FedRAMP without disruption and without requiring additional actions from FedRAMP.

> [!FEDRAMP] AFC-CSO-CRA
> Providers MUST complete the required actions in Emergency or Emergency Test designated messages sent by FedRAMP within the timeframe included in the message.

## Response timeframe

Each FedRAMP email states the time period to respond, usually a few days to a week. An active KEV response may be due within days; a generic test may allow about a week. Follow the timeframe in the message.

## Auto-reply text

> This email has been received and will be routed to the [Your Company] FedRAMP security team for review and response. Note: This is an auto-reply message.
