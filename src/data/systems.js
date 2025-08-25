// src/data/systems.js

// 12 systems advocates sign into during training
export const SYSTEMS = [
  {
    id: "shieldlink",
    name: "ShieldLink",
    description: "Imaging & routing for Small Group submissions.",
    quickTip: "Use Submission Search to track packages by Group or Broker."
  },
  {
    id: "facets",
    name: "Facets",
    description: "Eligibility & enrollment history; confirms application status.",
    quickTip: "Search by Subscriber ID or SSN, then check Eligibility → History."
  },
  {
    id: "broker-connection",
    name: "Broker Connection",
    description: "Portal for forms, SCRs, and broker-facing resources.",
    quickTip: "SCRs: Small Business → Forms & Applications → Subscriber Change Request."
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM for broker interactions, cases, and follow-ups.",
    quickTip: "Log call outcomes and next steps to keep the case moving."
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    description: "Ticketing/knowledge for operations & escalations.",
    quickTip: "Search Knowledge first; attach case numbers for traceability."
  },
  {
    id: "onbase",
    name: "OnBase / ImageRight",
    description: "Document imaging and retrieval for group files.",
    quickTip: "Filter by Employer or Group # to find the correct folder fast."
  },
  {
    id: "documentum",
    name: "Documentum",
    description: "Legacy repository for historical documents.",
    quickTip: "Confirm the freshest source before advising a broker."
  },
  {
    id: "outlook",
    name: "Outlook / Email",
    description: "Official communications and case handoffs.",
    quickTip: "Use templates; include Group # and Subscriber ID in subject."
  },
  {
    id: "nice",
    name: "NICE / Contact Center",
    description: "Telephony: call controls, recordings, and metrics.",
    quickTip: "Tag dispositions accurately—QA will thank you."
  },
  {
    id: "workfront",
    name: "Workfront",
    description: "Project/task management and cross-team work queues.",
    quickTip: "Update status and assignees to avoid black holes."
  },
  {
    id: "broker-portal",
    name: "Broker Portal",
    description: "Broker self-service enrollment and quoting tools.",
    quickTip: "Know the flow so you can guide brokers quickly."
  },
  {
    id: "knowledge-base",
    name: "Knowledge Base",
    description: "Policies, procedures, and job aids.",
    quickTip: "Link the article in your case notes for easy audits."
  }
];

// Handy helpers (optional)
export const SYSTEM_IDS = SYSTEMS.map((s) => s.id);

export const SYSTEM_MAP = Object.fromEntries(SYSTEMS.map((s) => [s.id, s]));

export function systemName(id) {
  return SYSTEM_MAP[id]?.name || id;
}
