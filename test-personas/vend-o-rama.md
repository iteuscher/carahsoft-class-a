# Vend-O-Rama, Inc.: Class A walkthrough test persona

A fictional company for dry-running the FedRAMP 20x Class A walkthrough on the SOC 2 path. Everything here is made up.

*"We know you want Funyuns before you do."*

## Overview

Vend-O-Rama sells **SnackSense**, a SaaS platform that reads telemetry from vending machines, predicts when each slot will run out, and sends restock routes to service crews. Its pitch to the government: GSA facilities and military bases keep running out of Diet Coke on the third floor, and SnackSense ends that.

## Company facts

| Fact | Detail |
|---|---|
| Founded | 2019, Boise, Idaho |
| Headcount | 42 (28 engineering, 6 sales, 8 everything else) |
| Revenue | About $9M ARR, mostly convenience-store chains and university campuses |
| Hosting | AWS us-east-1 only: EKS, RDS Postgres, S3, and Lambda for ingesting machine telemetry |
| Identity | Okta for staff and GitHub for code. Customers log in with email and password, and MFA is optional (a likely finding) |
| Existing compliance | SOC 2 Type II, second year, clean opinion, audited by "Pinecrest CPA" (fictional) |
| Federal hook | A GSA facilities manager in Denver wants to pilot SnackSense in 15 federal buildings and was told "it needs to be FedRAMP" |
| Data sensitivity | Machine IDs, slot inventory, building locations, and restock driver names and phone numbers. Low-impact data, which is why Class A fits |
| Walkthrough path | SOC 2 (the default) |
| Partner build | Standalone Paramify first, then Carahsoft (a GSA buyer makes a reseller plausible) |

## The team

Roles match CA-04.

| Person | Title | CA-04 role(s) | Personality |
|---|---|---|---|
| Dana Fizz | CEO and co-founder | Sponsor | Ex-Frito-Lay sales. Will sign anything if you say "federal market." Has never read a policy |
| Marcus Chen-Okafor | CTO and co-founder | Sponsor (backup), Tech | Built the telemetry pipeline at 2 a.m. in 2019. Knows where every skeleton is buried |
| Priya Ramaswamy | Compliance and ops manager | Lead, Comms | Ran the SOC 2 alone and is now running this alone. Owns the shared spreadsheet that holds everything together |
| Theo Brandt | Senior DevOps engineer | Tech | Terraform zealot. Thrilled that "evidence" could mean API output instead of screenshots |
| Jules Abernathy | Security engineer (the only one) | SecOps | Runs Wiz and handles on-call. Quietly worried about the vulnerability response timelines |
| Kevin "Keys" Morales | IT and office manager | Unofficial helper | Manages Okta and laptops, and somehow also the company snack machine |

Priya holding both Lead and Comms puts the "one person, several roles" rule in CA-04 to a realistic test.

## Notes and facts by step

- **CA-03 Eligibility:** One region, one cloud, and low-impact data, so it should clearly qualify. A good test of whether the step makes a clear "yes" feel clear.
- **CA-05 Security inbox:** It doesn't have one yet. Today security email goes to `priya@vendorama.example`. It will need something like `fedramp@vendorama.example`.
- **CA-06 Public info and UEI:** It has never registered in SAM.gov, so there is no UEI yet. That registration can take weeks, which is a good test of whether the workshop view flags lead time early enough.
- **CA-07 Marketplace listing:** The marketing site says "military-grade encryption." Priya will have to talk Dana out of putting that in the listing.
- **CA-10 Scope:** This is where the gray areas live:
  - Telemetry comes from third-party IoT modems (a fictional "CellBridge") that the company doesn't control. Are they in scope?
  - A legacy Heroku app still serves the old driver mobile API. Everyone forgot it exists until scoping.
  - Support runs on Zendesk and Slack, and customers sometimes paste building addresses into Slack.
- **CA-11 Upload materials:** It has the SOC 2 report, about 14 policies (half last updated in 2023), and an incident response plan nobody has tested. There is no formal vulnerability management SLA.
- **CA-13 Audit assurance:** The SOC 2 auditor has never done FedRAMP work. Good for checking whether the walkthrough explains what to ask them.
- **CA-15 Trust Center:** It currently has a "Security" page with a padlock icon and one paragraph.
- **CA-17 Ongoing:** Jules is the single point of failure for monthly vulnerability reporting. Test whether the step makes that risk visible.

## Built-in gotchas to watch for

1. **Optional customer MFA.** Does the checklist surface this before CA-12 or CA-13, or does it come as a surprise?
2. **The forgotten Heroku app.** Does CA-10 make scoping thorough enough that it would be found?
3. **No UEI.** Does the workshop view get SAM.gov registration started on day one?
4. **One person running compliance.** Is the volume of work survivable for Priya, or does the checklist assume a bigger team?

When the walkthrough raises a question Priya would normally have to email someone about, log it with the step's feedback link. Those are the gaps the checklist is supposed to close.
