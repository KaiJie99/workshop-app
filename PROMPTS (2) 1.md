# Build with AI: Zero to Shipped — Workshop Prompts

Copy-paste prompts for each hands-on exercise. The facilitator shares the prompt you need at each activity — paste it into your AI coding agent (Claude Code or Codex) exactly as written — every prompt works in both. Do not retype from the screen.

Numbering: **M2-1** = Module 2, Prompt 1. **M2-R** = Module 2 recovery prompt (use only when something fails).

> **Skills vs prompts.** Three steps use a shipped *skill* (same `SKILL.md` in `.claude/skills/` and `.agents/skills/`, so both tools use it natively): customize-app (M3-2), review-security (M6-3), prepare-deployment (M7-1/M7-2). Invoke with `/name` in Claude Code or `$name` in Codex. Every skill entry below also has a plain-prompt fallback in case a skill does not trigger. All other steps are plain prompts that work in both tools.

*Contents: Module 2 (Coding Agent Foundations) · Module 3 (MCP + Skills) · Module 4 (Customize + Build) · Module 5 (Supabase + Auth) · Module 6 (Security + Verification) · Module 7 (Vercel + Domain). This is the complete workshop prompt set.*

---

## Module 2 — Coding Agent Foundations

### PROMPT M2-1 · Confirm the workspace + understand the project (read-only)

Use in: Activity 2. Goal: the agent proves it is in YOUR fork, then explains the app in plain English — changing nothing.

```
You are inside my workshop application repository.
Inspect only. Do not edit files, install packages, or run any command that changes the project.

Part 1 — Confirm the workspace:
1. Confirm the repository root folder.
2. Show the current Git branch.
3. Summarize the origin remote without exposing credentials — I need to see my GitHub username in it.
4. Confirm whether the working tree is clean.

Part 2 — Explain the project in simple English:
5. What is this application designed to do?
6. What is the main technology and framework?
7. What is the purpose of each important folder?
8. Where do the homepage, authentication and data code live?
9. Which environment variable NAMES does .env.example require? Never search for or display any values.
10. Which existing commands exist for install, development, build and checks?

End with a short glossary of any technical term you used, and a "Ready to run" checklist.
If anything looks wrong — wrong repository, dirty working tree, unexpected remote — stop and explain the issue in simple English.
```

**Expected result:** your username confirmed in the remote · plain-English app summary · folder map · variable names only (no values) · the dev command identified · zero permission requests.

---

### PROMPT M2-2 · Start the app (uses the existing script only)

Use in: Activity 3. Goal: start the development server with full visibility of what runs. (Manual alternative: type `npm run dev` in the terminal yourself.)

```
Start this project in development mode using the existing package.json script.
Before running anything, tell me the exact command you will run and what it does, then wait for my approval.

Constraints:
- Do not edit any file.
- Do not install or upgrade packages.
- Do not create or read environment values.
- Do not change ports without asking me first.
- Keep the development server running after it starts.

After it starts, tell me the exact local URL to open in my browser, and what successful terminal output looks like.
```

**Expected result:** the agent names `npm run dev`, waits for approval, runs it, and reports a local URL like `http://localhost:3000`. No file changes.

---

### PROMPT M2-R · Recovery — something failed (diagnose only)

Use when: any command or step in Module 2 fails. Replace the two placeholders before sending.

```
I tried to run this:
<PASTE THE EXACT COMMAND>

Here is the complete error:
<PASTE THE COMPLETE ERROR TEXT>

Diagnose only — do not edit files, install anything, or run any fix yet.
1. Explain the likely cause in simple English.
2. Show the evidence from the error and the project files.
3. Give me the ONE safest next step.
4. Tell me exactly what that step will change.
5. Wait for my approval.

Never suggest force flags, deleting files, resetting Git, exposing secrets, or changing the lockfile.
```

**Expected result:** one explained cause, one narrow proposed step, nothing executed. Read it, then raise your hand together with the diagnosis.

---

## Module 3 — MCP + Skills

### M3-SETUP · No setup commands — both configs ship in the repo

Use in: Activity 1. The starter repo already contains BOTH `.mcp.json` (Claude Code) and `.codex/config.toml` (Codex), so nobody registers servers by hand.

- **Claude Code:** type `/mcp`, approve the three project servers, then Authenticate each (a browser sign-in opens).
- **Codex:** when VS Code asks, **trust the project** — Codex then reads `.codex/config.toml` and sees the same three servers. Sign in to each when prompted.

Then sign in to each server in the browser and click Authorize (your own account).

**Expected result:** all three servers (github, supabase read-only, vercel) show connected/authenticated. Nobody types or pastes any token or key — browser sign-in only.

---

### PROMPT M3-1 · First live tool call (read-only)

Use in: Activity 2. Goal: prove the agent now reads live data from YOUR accounts.

```
You now have MCP servers connected.

1. List the tools you can use, grouped by server (github, supabase, vercel). One line per tool.
2. Using the GitHub tools, find my account username and my workshop fork repository.
3. Show the latest commit on my fork: the commit message, author and date.

Rules:
- Read-only: do not create, edit, comment, or write anything on any service.
- Ask for my approval before each tool call and tell me which server and tool you are about to use.
- If any server is not connected, tell me which one and stop.
```

**Expected result:** tool list by server · your username · your fork · the exact commit message you pushed in Module 1 ("chore: initialize workshop profile"). Every tool call asked for approval first.

---

### PROMPT M3-2 · Run the customize-app SKILL, choose your build

Use in: Activity 3. Both tools ship the SAME skill (`.claude/skills/customize-app` and `.agents/skills/customize-app`). Run it and add your app idea:

- **Claude Code:** `/customize-app`
- **Codex:** `$customize-app`

Then, in the same message, add:

```
My app idea, in one line: <ONE LINE ABOUT YOUR APP IDEA>
Stay in plan mode / planning only. Do not edit any file.
```

**Fallback prompt** (use ONLY if the skill does not trigger — works in either tool):

```
Act as a careful customization planner for this repository. Planning only — do not edit any file.
Inspect the real project structure first. Then give me 3–5 safe customization options for MY app idea: <ONE LINE ABOUT YOUR APP IDEA>
For each option: (1) what visibly changes in the browser, (2) which existing files are involved (real paths), (3) what stays untouched.
Rules: only options that are visible, reversible, and need no database changes, no authentication changes, and no new packages. Reuse existing components and styles. Do not edit, install, or run anything.
```

**Expected result:** 3–5 options referencing real files, no edits made. Then YOU pick one and write it as one sentence — that sentence is your Module 4 build. Example: "Change the homepage headline and tagline to my app idea."

---

### PROMPT M3-R · Recovery — an MCP server won't connect

```
One of my MCP servers is not working.
Server: <github / supabase / vercel>
What I see: <PASTE THE EXACT MESSAGE OR DESCRIBE THE SCREEN>

Diagnose only — do not change any configuration file yet.
1. Tell me the likely cause in simple English.
2. Tell me the ONE safest next step (for example: re-run the authenticate step, check which account the browser is signed into, or re-add the server).
3. Never ask me to paste a token, key or password into this chat.
Wait for my approval.
```

**Expected result:** one cause, one step, no secrets. Most connection issues are: browser signed into the wrong account, a blocked popup, or authentication that simply needs re-running.

---

## Module 4 — Customize + Build with AI

### PROMPT M4-1 · Plan the customization (no edits)

Use in: Activity 1. Replace the placeholder with your one-sentence build choice from Module 3.

```
Plan this customization for me. Planning only — do not edit any file yet.

My customization, in one sentence:
<PASTE YOUR ONE SENTENCE>

Inspect the real project first, then give me:
1. The current behavior and where it lives (real file paths).
2. The proposed result in one sentence.
3. The MINIMUM files that need to change.
4. What will stay untouched.
5. A definition-of-done checklist I can verify myself in the browser, at desktop and mobile width.

Rules: reuse the existing framework, components and styles. No new packages. No database, authentication, environment, MCP or deployment changes. One change only — if my sentence contains two changes, tell me and plan only the first.
```

**Expected result:** a short plan with real file paths, explicit non-goals, and a browser-verifiable done-checklist. You approve it — or reply with a one-line revision ("remove the extra feature, keep only X") until it matches your sentence.

---

### PROMPT M4-2 · Implement the approved plan (smallest edit)

Use in: Activity 2. Paste your goal sentence again so the contract is explicit.

```
Implement ONLY the plan we just agreed.

Goal: <PASTE YOUR ONE SENTENCE>

Constraints:
- Change only the files from the approved plan.
- Make the smallest coherent edit that delivers the goal.
- Reuse existing components, styles and assets.
- Do not install or upgrade anything.
- Do not touch authentication, database, environment files, MCP configuration or deployment settings.
- Keep the page responsive and keep labels/alt text intact.
- No optional improvements, no cleanup of unrelated code.

Before each file edit, tell me in one line why it is necessary. When done, show me the full diff, then STOP. Do not commit.
```

**Expected result:** a small diff touching only planned files, shown to you, with the agent stopped before commit. Then read the diff with the five questions (files? changed? removed? added? explainable?).

---

### PROMPT M4-3 · Run checks, summarize, propose the commit message

Use in: Activity 4, after the browser verification passed.

```
My change is verified in the browser. Now:

1. Look at package.json and run the existing validation commands appropriate for this change (for example lint and build). Before running each one, tell me its exact name and purpose. Report each as PASS or FAIL.
2. If a check FAILS because of my change, explain the narrowest fix and wait for my approval. Do not touch failures or warnings that existed before my change.
3. Then summarize my uncommitted changes from the diff:
   - the user-visible result in one sentence,
   - one line per changed file,
   - any limitation or leftover risk,
   - a concise commit message starting with an action verb.

Rules: no package installs or upgrades, no force flags, no config changes to silence a failure, no edits beyond an approved narrow fix. Do not commit.
```

**Expected result:** every check PASS (or one approved narrow fix, then PASS), a summary that matches what you saw in the browser, and a ready commit message like "Update homepage headline and tagline for <your app>".

---

### PROMPT M4-R · Recovery — the result is wrong

Use when: the browser shows something different from your approved plan.

```
My customization does not match the approved result.

Expected: <WHAT THE PLAN SAID YOU WOULD SEE>
Observed: <WHAT YOU ACTUALLY SEE — OR PASTE THE ERROR>

Inspect the current diff and the relevant files. Do not edit yet.
1. Explain the smallest likely cause, pointing to the exact changed lines.
2. Propose ONE narrow correction.
3. Wait for my approval.

Never: reset Git, delete files, rewrite history, install packages, or change unrelated code.
```

**Expected result:** cause tied to specific lines in the current diff, one proposed correction. Approve it, re-verify in the browser, continue. If a second correction is needed, raise your hand with the diagnosis on screen.

---

## Module 5 — Supabase + Authentication

### PROMPT M5-1 · Explain the supplied SQL (read-only)

Use in: Activity 2, BEFORE running anything in the SQL Editor.

```
Read supabase/workshop-schema.sql. Do not edit it and do not run any SQL.

Explain in simple English:
1. Which tables and columns it creates, and how they relate.
2. Which column identifies the OWNER of each row.
3. Where Row Level Security is enabled.
4. Which SELECT, INSERT, UPDATE and DELETE policies exist, and what each allows.
5. How auth.uid() is used in those policies.
6. Any seed rows or indexes included.
7. Whether the script contains any destructive statement such as DROP or TRUNCATE — flag them clearly.

Do not generate replacement or "improved" SQL. If the file looks different from a straightforward workshop schema, say so and stop.
```

**Expected result:** you can answer one question with confidence: *which column marks the owner of a row?* Destructive statements flagged (there should be none beyond safe setup). The file itself untouched.

---

### PROMPT M5-2 · Verify environment variable NAMES (never values)

Use in: Activity 3, AFTER you typed the values into .env.local yourself and restarted the dev server.

```
Inspect .env.example and the existing Supabase client files in this project.

Strict rule: do NOT open, read, print, or search .env.local. Never display any environment value.

Tell me:
1. The exact public variable NAMES the app expects.
2. Where each name is used in the code (file paths).
3. Whether the browser and server Supabase clients are already prepared, or something still needs connecting.
4. The manual checks that would prove my connection works (what I should see in the app).

Do not edit any file and do not create or suggest any values.
```

**Expected result:** the names match what you typed into .env.local (typo in a name = the most common bug, found here). No value ever appears in the chat.

---

### PROMPT M5-3 · Connect the prepared auth + CRUD (plan first)

Use in: Activity 4. This step uses a plain prompt (not a shipped skill) — paste it in either tool.

```
My Supabase project is created, the supplied SQL ran successfully, and I added the public environment values myself.

Inspect the existing authentication pages, Supabase clients and prepared CRUD components. Plan the MINIMUM changes needed to connect them.

Rules: do not read .env.local, do not change SQL or the schema, do not add any secret or service-role key, do not install packages, do not create a new data model.

Show me:
1. Which files already work as prepared.
2. Which files need connection changes, and what changes.
3. The sign-up / sign-in / sign-out / protected-route checks I will run.
4. The create / read / update / delete checks for user-owned items.

Wait for my approval before editing anything.
```

**Expected result:** a short plan that connects existing pieces. Red flags to reject: new tables, new packages, any secret key. After approval, the agent implements; read the diff with the Module 4 five questions.

---

### PROMPT M5-R · Recovery — a Supabase step failed

```
This Supabase step failed.

Action: <SIGN UP / SIGN IN / CREATE / READ / UPDATE / DELETE>
Exact browser or terminal error: <PASTE — with no keys, tokens or personal data>

Diagnose only. Do not open .env.local, reveal any value, edit SQL, disable RLS, use a secret or service-role key, install packages, or change unrelated files.

Check: the prepared client code, the variable NAMES, my authentication state, the table name, and the expected RLS behavior. Explain ONE likely cause with evidence and propose ONE narrow next step. Wait for my approval.
```

**Expected result:** the failure classified (configuration / session / code / table / policy) and one narrow step. The two forbidden "fixes" to refuse if ever suggested: disabling RLS, and switching to a secret key.

---

## Module 6 — Security + Verification

### PROMPT M6-1 · Secret exposure scan (read-only, values redacted)

Use in: Activity 2.

```
Review the tracked files, .gitignore and the current Git diff for accidental secret exposure.
Do not open .env.local and do not print any environment value.

Look for:
- any tracked .env-style file that should be ignored,
- hardcoded keys, tokens or passwords in the code,
- sb_secret_ or service_role values anywhere,
- URLs that contain credentials,
- debug logs that print sessions or tokens.

Report the file paths and a short description of each finding WITHOUT repeating the suspected secret. If a real secret may be exposed in a tracked file, stop and tell me to rotate it — deleting the line is not enough. Do not commit, rewrite Git history, or delete anything.
```

**Expected result:** on a clean app, "nothing exposed." Note: the publishable key appearing in browser code is NOT a leak — it is public by design. A tracked secret is a BLOCKER → use M6-ROTATE.

---

### PROMPT M6-2 · Untrusted tools + input review (read-only)

Use in: Activity 3.

```
Do a read-only review of how this project handles connected tools and untrusted content. Do not change anything.

1. List my connected MCP servers and, for each, the access level it has (read-only vs write).
2. Point out any server that is broader than this app needs, or any I don't recognize from the workshop (github, supabase read-only, vercel).
3. In the app code, show where content from the database, an API, or the web is displayed or passed to the agent, and whether that content is treated purely as data (not as instructions).
4. Explain, in one or two lines, the risk if fetched content contained hidden instructions, and whether this app is exposed to it.

Report findings only. Do not edit files, change MCP configuration, or run write-capable tools.
```

**Expected result:** your three expected servers (Supabase read-only), no unknown extras, and confirmation that fetched content is rendered as data. Disconnect anything not from today's workshop.

---

### PROMPT M6-3 · Run the review-security SKILL

Use in: Activity 4. Both tools ship the same skill (`.claude/skills/review-security` and `.agents/skills/review-security`). Run it:

- **Claude Code:** `/review-security`
- **Codex:** `$review-security`

**Fallback prompt** (use ONLY if the skill does not trigger — works in either tool):

```
Do a read-only security review of the current project. Do NOT open .env.local, reveal any value, run write-capable tools, change SQL, disable RLS, install packages, or edit files.
Scope: tracked files and the current diff, environment-file handling, Supabase client usage and protected-route identity checks, the supplied RLS policies, input validation and error messages, connected MCP servers and their permissions.
Report each finding as BLOCKER, WARNING, or PASS with evidence, impact, and one narrow recommendation. State the limits of this review (a baseline, not a full penetration test).
```

**Expected result:** mostly PASS on a prepared app. A BLOCKER means a real hole → fix with M6-FIX. A WARNING is recorded, not necessarily fixed today.

---

### PROMPT M6-FIX · Fix ONE verified blocker (conditional — only if a real BLOCKER exists)

Use in: Activity 4, only when the review or the two-account test found a genuine hole.

```
Fix only this verified security finding:
<PASTE ONE FINDING — NO SECRET VALUES>

Before editing:
1. Show the evidence.
2. Explain the security impact in one or two lines.
3. Propose the smallest safe change and list the exact files.
4. Tell me which test I will re-run to prove it (usually the two-account test).

Constraints: keep RLS enabled, do not add any secret or service-role key, do not weaken validation, authentication or authorization, do not install or upgrade packages, do not change unrelated code.

Wait for my approval, apply the minimum fix, show the diff, then stop before commit.
```

**Expected result:** one narrow fix. Re-run the exact test that failed — it now passes, and the two-account test still passes. Reject any "fix" that disables RLS or adds an elevated key.

---

### PROMPT M6-ROTATE · A secret was exposed (containment)

Use when: M6-1 found a real secret in a tracked/committed file.

```
A credential may have been exposed.
Type of value: <PUBLISHABLE / SECRET / SERVICE ROLE / DATABASE PASSWORD / OTHER>
Where it appeared: <FILE / COMMIT / LOG — DO NOT PASTE THE VALUE>

Do not repeat the credential, push more commits, or attempt destructive history rewriting.
Tell me:
1. Whether this value is meant to be public or must be treated as secret.
2. The immediate containment step.
3. Where to rotate or replace it in the real service (Supabase / GitHub / Vercel).
4. Which app environments must be updated with the new value.
5. How to confirm the old value no longer works.
Stop after the response — I will do the rotation manually.
```

**Expected result:** the value classified, containment before cleanup, and the exact place to rotate it. A publishable key needs no rotation; anything secret-shaped does. Do not proceed to Module 7 until rotation is confirmed.

---

## Module 7 — Vercel Deployment + Domain

### PROMPT M7-1 · Deployment readiness (read-only)

Use in: Activity 1, before opening Vercel. You can run the shipped skill instead — `/prepare-deployment` (Claude Code) or `$prepare-deployment` (Codex); the prompt below is the fallback and also spells out exactly what it checks.

```
Do a read-only deployment-readiness review. Do not deploy, edit files, read .env.local, change DNS, or call any write-capable tool.

Confirm:
1. The working tree is clean and my current commit is pushed to my fork.
2. The framework, package manager, build command and output settings.
3. The required environment variable NAMES from .env.example (names only, never values).
4. That no environment file or secret is tracked in Git.
5. That the required project checks and the production build pass — tell me the exact commands to run.
6. The Supabase production Site URL / redirect settings I will need to update AFTER deploying.
7. A short final production test checklist (auth, data, the two-account check).
```

**Expected result:** commit + build settings confirmed, env var names listed (no values), a production checklist. Then run `npm run build` locally and record the commit with `git log -1 --oneline`.

---

### PROMPT M7-R · Recovery — the Vercel build failed

Use when: the Vercel deployment build fails.

```
My Vercel deployment failed.
Deployed commit: <PASTE THE SHORT COMMIT ID>
First meaningful build error: <PASTE THE ERROR — no environment values or tokens>

Diagnose using the current project files and existing scripts. Do not reveal environment values, install or upgrade packages, change framework settings blindly, disable checks, or edit unrelated files.

Explain:
1. The likely cause and the log evidence.
2. Whether the same failure reproduces with a local production build (npm run build).
3. The ONE smallest safe fix.
4. Which check must pass before I commit and redeploy.
Wait for my approval.
```

**Expected result:** the error tied to one commit and log line, local reproduction considered, one narrow fix. Fix locally, confirm `npm run build` passes, commit, push, let Vercel redeploy that commit.

---

### PROMPT M7-2 · Produce the shipping report

Use in: Activity 5. This is your completion evidence AND your demo script. The `prepare-deployment` skill also produces it — `/prepare-deployment` (Claude Code) or `$prepare-deployment` (Codex), asking for a shipping report; the prompt below is the fallback.

```
Create a final shipping report for this project. Use read-only evidence from the repository and the test results I give you. Do not access account dashboards, read environment values, change DNS, deploy, or edit files.

Include:
1. Live custom URL (if verified) and the fallback vercel.app URL.
2. The deployed Git commit id.
3. The application customization I completed.
4. Authentication and CRUD check results.
5. The two-account authorization result (from Module 6).
6. Build and security-check results.
7. Domain and HTTPS status.
8. Any pending DNS or follow-up item.

Never include keys, tokens, passwords, private emails or session data.
```

Provide these results when it asks (from your own testing today):
- vercel.app URL: <yours> · custom domain: <yours or "pending">
- deployed commit: <from M7-1>
- auth: pass/fail · CRUD: pass/fail · two-account test: pass/fail
- build: pass · security review: pass / blockers fixed

**Expected result:** a clean one-page report another person could read to understand exactly what shipped and what was verified — with zero secrets in it. Read three lines of it aloud as your demo.
