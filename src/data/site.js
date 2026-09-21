/* All copy comes from Kaushal's resume, GitHub and what he told me. No invented metrics. */
export const K = {
  name: "Kaushal Subramani",
  fullName: "Kaushal Kumar Subramani",
  role: "AI/ML engineer",
  intro: "Computer science at Wilfrid Laurier University, graduating December 2026. I work on agents, evaluation and small models that run where the data lives, and I research how robots and drones plan their routes.",
  home: "Waterloo, Ontario",
  school: "Honours BSc Computer Science, co-op",
  grad: "Graduating Dec 2026",
  links: {
    email: "kaushalkmrgr8@gmail.com",
    github: "https://github.com/rkhexed",
    linkedin: "https://www.linkedin.com/in/kaushal-subramani-040a22224/",
    paper: "https://ieeexplore.ieee.org/abstract/document/11592564",
    planner: "https://github.com/rkhexed/SPIN---quadhrrt_nav",
    casehacks: "https://github.com/ShayanDhillon/CaseHacks-Showcase",
    resume: "/Kaushal-Subramani-Resume.pdf"
  },
  work: [
    { org: "Kinara Systems", role: "AI/ML Software Engineer, co-op", when: "Jan to Apr 2026", metric: "+10%", metricLabel: "log classification over baseline",
      body: "Fine-tuned and benchmarked Qwen 2.5 3B on edge hardware so customer data stays on the device, and built a self-hosted OpenAI-compatible service that lets local models drop into existing LLM workflows.",
      tags: ["Qwen 2.5 3B", "LoRA", "Qdrant", "semchunk"] },
    { org: "Dawson Partners", role: "Machine Learning Engineer, co-op", when: "May to Aug 2025", metric: "+33%", metricLabel: "reliability on time-sensitive financial maths",
      body: "Built a LangSmith evaluation system that runs LangGraph agents in parallel, and deployed the team's first custom MCP Excel server on Cloud Run with Terraform.",
      tags: ["LangGraph", "LangSmith", "MCP", "Terraform"] },
    { org: "IGS", role: "Junior ML/AI Engineer, co-op", when: "Sep to Dec 2024", metric: "+13%", metricLabel: "RAG accuracy from an auto-tester I wrote",
      body: "Wrote an auto-tester that scores retrieval quality, which lifted RAG accuracy 13% and ROUGE 6%, then reached 80% accuracy classifying user stories across domains and stacks.",
      tags: ["RAG", "ROUGE", "Hugging Face"] },
    { org: "Wilfrid Laurier University", role: "Quantum ML Research Assistant", when: "Jun 2026 to now", metric: "PQC", metricLabel: "as the Q-function for multi-drone navigation",
      body: "Swapping a DQN's classical value network for a parameterized quantum circuit in a multi-agent framework for decentralized drone navigation, and benchmarking returns and parameter counts against the classical baseline.",
      tags: ["Quantum ML", "MARL", "DQN"] },
    { org: "[case]HACKS", role: "VP of Technology", when: "Sep 2025 to May 2026", metric: "200", metricLabel: "hackers ran on the platform I shipped",
      body: "Shipped the organizer control plane and the participant portal for a 200-hacker event: constraint-based team matching, realtime QR check-in and a sponsor dashboard.",
      tags: ["Next.js", "Supabase", "Flask", "React"] }
  ],
  research: [
    { id: "planner", title: "LLM-guided semantic path planning for ROS2 Nav2", short: "Semantic RRT* for Nav2", when: "May to Sep 2026",
      metrics: [["2-7%", "shorter paths than NavFn"], ["97%", "goal reach"], ["0", "collisions"]],
      body: "Ran a research RRT* planner as a drop-in Nav2 global planner, then taught it to bend around people and hazards. Found that stopping at the first solution silently switched off rewiring, and converted it to anytime RRT*.",
      linkLabel: "Code on GitHub", link: "planner" },
    { id: "paper", title: "Multi-Agent Email Security System", short: "IEEE paper, 2026", when: "Published 2026", venue: "23rd L&T Conference, IEEE",
      metrics: [["84.1%", "zero-shot phishing detection"], ["Parallel", "agents on dedicated Mistral-small instances"]],
      body: "Three CrewAI agents, each on its own Mistral-small instance, analyze every email in parallel (BERT classification, WHOIS checks, threat intelligence). A coordination agent fuses their confidence and decides whether to quarantine.",
      linkLabel: "Read the paper", link: "paper" }
  ],
  projects: [
    { title: "[case]HACKS platform", body: "Organizer dashboard and hacker portal for a 200-person hackathon, open-sourced after the event.",
      tags: ["Next.js", "Supabase", "Flask"], link: "casehacks", linkLabel: "Showcase repo" }
  ],
  club: { title: "President, AI/ML Club at Laurier", when: "Jan 2026 to now",
    body: "The university's first AI/ML club backed by AI faculty: project teams, workshops that bring first-years into the field, research groups and hackathon teams." },
  exif: { dumbo: "Sony a6000, 25 mm, 1/640 s, f/4, ISO 100" },
};

export const hobbies = [
  ["Badminton", "I play often and lose gracefully."],
  ["Bouldering", "Currently dreaming of getting halfway up a V3."],
  ["Drone flying", "A DJI Mini 3, a birthday gift I fly every chance I get."],
  ["Photography", "Learning on a Canon Rebel T6i, one blown highlight at a time."],
  ["Video games", "Pok\u00e9mon Emerald, Horizon Zero Dawn, Expedition 33, God of War."]
];

/* the hiring headline streams through these */
export const roles = ["an AI/ML engineer?", "an AI/ML software engineer?", "a Python developer?", "an applied AI engineer?", "a software engineer?"];

/* scripted samples for the multi-agent demo: [content, sender, threat intel] scores */
export const emails = [
  { label: "Invoice from a known supplier", from: "billing@northwind-supply.ca", subj: "Invoice #4821 for September", s: [0.08, 0.05, 0.02] },
  { label: "\u201cYour account is locked\u201d", from: "security@acct-verify-login.com", subj: "Your account is locked. Verify within 24 hours", s: [0.93, 0.81, 0.74] },
  { label: "Lookalike payroll domain", from: "payroll@laurier-hr-portal.net", subj: "Update your direct deposit details", s: [0.41, 0.88, 0.35] }
];

/* the photo roll; mark = grease-pencil circle on the contact sheet */
export const roll = [
  ["dumbo", "Manhattan Bridge from Washington Street", "New York, Aug 2026", "Sony a6000, 25 mm, 1/640 s, f/4, ISO 100. The Empire State Building sits inside the arch.", "keeper"],
  ["timesSq", "Times Square after dark", "New York, Aug 2026", "Everything in the frame is a light source.", "blown"],
  ["nycAerial", "Manhattan from above", "New York, Aug 2026", "The whole island in soft haze."],
  ["portrait", "Portrait", "Sony a6000", "Low-key light, warm tones.", "keeper"],
  ["aurArc", "Aurora arc over the spruce", "Yellowknife, Jan 2026", "A green arc over a line of black spruce.", "keeper"],
  ["aurSweep", "The band breaks up", "Yellowknife, Jan 2026", "The arc broke up and spread across the sky."],
  ["aurPink", "Pink lower fringe", "Yellowknife, Jan 2026", "The pink lower edge is nitrogen."],
  ["aurCorona", "Straight up", "Yellowknife, Jan 2026", "Rays converging overhead."],
  ["aurMoon", "Moon and aurora", "Yellowknife, Jan 2026", "A bright moon, a starburst and the aurora behind it.", "moon"],
  ["aurCrowd", "Everyone looking up", "Yellowknife, Jan 2026", "Every camera on the lake pointed the same way."],
  ["vanChair", "Lunch on the chairlift", "Grouse Mountain, 2026", "Lunch on the Grouse Mountain chairlift.", "keeper"],
  ["vanCreek", "Lynn Canyon", "North Vancouver, 2026", "Boulders I did not climb, in keeping with my record."],
  ["vanLake", "The drowned forest", "British Columbia, 2026", "A lake full of drowned trees."],
  ["vanCanopy", "Looking up in the forest", "Vancouver, 2026", "Straight up through the canopy."],
  ["ubcBear", "Me and the UBC bear", "UBC, Vancouver", "The bear has better posture."],
  ["homeNight", "Night above the city", "Night walk", "A silhouette above the city lights."]
];
