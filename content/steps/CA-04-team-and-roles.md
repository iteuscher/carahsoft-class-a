---
id: CA-04
title: Team and roles
phase: 1
sequence: 4
optional: true
summary: Type a name for each role, and add your partner and Paramify contacts.
rules: [SDR-CSO-FRR]
tasks:
  - { id: CA-04.1, text: "Type a name for each role in the table below", role: Lead, ahead: true, done_when: "Every role in the table below has at least one name", complete_when: team_named }
roles:
  - { id: Sponsor, title: "CEO, CTO, CISO", owns: "Risk acceptance, solution capability sign-off, submission approval" }
  - { id: Lead, title: "Project or compliance manager", owns: "The checklist and the Paramify program" }
  - { id: Tech, title: "Engineering or DevOps lead", owns: "Scope, intake, KSI implementation, evidence" }
  - { id: SecOps, title: "Security or vulnerability management lead", owns: "Incident evaluation, vulnerability detection, Ongoing Certification Report" }
  - { id: Comms, title: "Security or compliance contact", owns: "FedRAMP Security Inbox, FedRAMP and agency notices" }
---

Type a name for each role. One person can hold several roles, and a role can have several people. Once a role has a name, every task for that role shows the name instead of the role, so everyone can see what they own. Names are saved in this browser only.

Why a Sponsor: FedRAMP requires that, for any rule you don't follow, the reason for not implementing it is accepted by a senior official (SDR-CSO-FRR).
