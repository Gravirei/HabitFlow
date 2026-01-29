# Agent Instructions for REIS Project

## 🎯 CRITICAL: Follow REIS Methodology

**When the user mentions "reis", "REIS", or "REIS methodology" in their request:**

### ✅ ALWAYS Use REIS Workflow & Subagents

REIS has **11 specialized subagents** for different workflow stages. Use them appropriately:

#### 1. **For Project Analysis** (New Projects)
   - Use `reis_analyst` subagent
   - Analyzes PROJECT.md and REQUIREMENTS.md
   - Researches technology choices, architecture patterns
   - Identifies risks, dependencies, integration points
   - Example: "Analyze this project using reis_analyst"

#### 2. **For Roadmap Creation**
   - Use `reis_architect` subagent
   - Creates ROADMAP.md from project analysis
   - Decomposes goals into logical phases (2-4 deliverables each)
   - Identifies dependencies between phases
   - Example: "Create roadmap using reis_architect"

#### 3. **For Phase Research** (Before Planning)
   - Use `reis_scout` subagent
   - Researches implementation approaches for specific phases
   - Investigates libraries, patterns, best practices
   - Searches existing codebase for reusable code
   - Example: "Research authentication approaches using reis_scout"

#### 4. **For Multiple Research Synthesis**
   - Use `reis_synthesizer` subagent
   - Combines outputs from parallel reis_scout runs
   - Identifies conflicts and resolves them
   - Creates unified research summary
   - Example: "Synthesize research findings using reis_synthesizer"

#### 5. **For Planning Tasks**
   - Use `reis_planner` subagent
   - Creates PLAN.md files for roadmap phases
   - Decomposes phases into parallel-optimized waves (2-3 tasks each)
   - Builds dependency graphs and assigns execution waves
   - Research-informed planning (checks for research first)
   - Example: "Plan the authentication feature using reis_planner"

#### 6. **For Plan Review** (Before Execution)
   - Use `reis_plan_reviewer` subagent
   - Validates plans against codebase before execution
   - Detects already-implemented features, path errors, missing dependencies
   - Suggests auto-fixes for common issues
   - Example: "Review this plan using reis_plan_reviewer"

#### 7. **For Execution Tasks**
   - Use `reis_executor` subagent
   - Executes PLAN.md files with wave-based execution
   - Commits each task atomically
   - Creates SUMMARY.md and updates STATE.md
   - Task-level checkpointing for crash recovery
   - Example: "Execute this plan using reis_executor"

#### 8. **For Verification Tasks**
   - Use `reis_verifier` subagent
   - Verifies execution against PLAN.md success criteria
   - Runs test suites (Jest, Vitest, Node test runner)
   - Validates code quality (syntax, linting)
   - FR4.1: Detects missing features and incomplete implementations
   - Example: "Verify this phase completion using reis_verifier"

#### 9. **For Integration Verification** (Milestone Level)
   - Use `reis_integrator` subagent
   - Cross-phase integration verification
   - Detects stub implementations across phases
   - Validates API contracts between modules
   - **NOTE**: NOT part of default cycle, invoked via `reis audit`
   - Example: "Audit milestone 1 using reis_integrator"

#### 10. **For Debugging Tasks**
   - Use `reis_debugger` subagent
   - Deep analysis after verification failures
   - 6-step protocol for root cause identification
   - Generates executable FIX_PLAN.md
   - FR2.1: Detects incomplete implementations
   - Example: "Debug this verification failure using reis_debugger"

#### 11. **For Project Mapping** (Existing Codebases)
   - Use `reis_project_mapper` subagent
   - Maps brownfield/existing codebases
   - Creates initial REIS project structure
   - Analyzes tech stack, architecture, conventions
   - Example: "Map this existing project using reis_project_mapper"

---

## 📊 Kanban Board Display

**All subagents MUST display the kanban board** to show visual progress during execution.

### Kanban Board Format

```
┌─────────────┬─────────────┬───────────────────────────────────────────┬─────────────────┐
│ ALL PHASES  │ IN PROGRESS │              CYCLE                        │   COMPLETED     │
├─────────────┼─────────────┼─────────────┬─────────────────────────────┼─────────────────┤
│ P1 P2 P3 P4 │ ▶ P1 Setup  │ Planning    │ [■■■■ 100% ■■■■] ✓ planner  │ Cycle-0 (P0) ✓  │
│ P5 P6 P7 P8 │             │ Execute     │ [■■░░ 45%  ░░░░] ◉ executor │                 │
│             │ Wave 2/3 ◉  │ Verify      │ [░░░░  -   ░░░░] verifier   │                 │
│             │  ├ 2.1 ✓    │ Debug       │ [░░░░  -   ░░░░] debugger   │                 │
│             │  ├ 2.2 ◉    │             │                             │                 │
│             │  └ 2.3 ○    │             │                             │                 │
└─────────────┴─────────────┴─────────────┴─────────────────────────────┴─────────────────┘
```

### Status Icons
- `✓` = Complete
- `◉` = Running (current task)
- `○` = Waiting/Pending
- `✗` = Failed
- `▶` = Current phase
- `⫴n/m` = n parallel tasks of m total

### When to Display
- **reis_planner:** At start and end of planning
- **reis_plan_reviewer:** At start and end of plan review
- **reis_executor:** At start and after each task completes
- **reis_verifier:** At start and end of verification
- **reis_debugger:** At start and end of debug analysis

---

## 📋 REIS Workflow Cycle

When user says "use reis" or "follow reis methodology":

### For New Projects:
```
1. ANALYZE (project level)
   → reis_analyst
   → Analyzes PROJECT.md, REQUIREMENTS.md
   → Researches tech choices, patterns, risks

2. ARCHITECT (create roadmap)
   → reis_architect
   → Creates ROADMAP.md with phases
   → Identifies phase dependencies

3. RESEARCH (phase level, optional but recommended)
   → reis_scout (can run multiple in parallel)
   → Researches implementation approaches
   → reis_synthesizer (if multiple scouts)
   → Combines research findings

4. PLAN
   → reis_planner
   → Creates detailed PLAN.md files
   → Wave-based task breakdown
   → Shows kanban: Planning ◉

5. REVIEW
   → reis_plan_reviewer
   → Validates plan against codebase
   → Detects issues before execution
   → Auto-fixes simple problems
   → Shows kanban: Review ◉

6. EXECUTE
   → reis_executor
   → Implements features from PLAN.md
   → Wave-based execution with checkpoints
   → Atomic commits per task
   → Shows kanban: Execute ◉, with wave/task progress

7. VERIFY
   → reis_verifier
   → FR4.1: Check ALL features implemented
   → Run tests, validate success criteria
   → Code quality checks
   → Shows kanban: Verify ◉

8. GATE (quality checks)
   → Quality Gates (Security, Quality, Performance, Accessibility)
   → Configurable thresholds
   → Shows kanban: Gating ◉

9. DEBUG (if verification or gates fail)
   → reis_debugger
   → FR2.1: Detect incomplete implementations
   → 6-step analysis protocol
   → Generate targeted FIX_PLAN.md
   → Shows kanban: Debug ◉

10. FIX & RE-VERIFY
    → reis_executor (execute fix plan)
    → reis_verifier (re-verify)
    → reis gate (re-run gates)
    → Loop until passing

11. AUDIT (milestone level, not in default cycle)
    → reis_integrator
    → Cross-phase integration checks
    → Stub implementation detection
    → API contract validation
```

### For Existing Projects:
```
1. MAP (existing codebase)
   → reis_project_mapper
   → Analyzes tech stack, architecture
   → Creates initial REIS structure

2. Continue from step 2 above (ARCHITECT)
   → Same workflow as new projects
```

### Quick Cycle (Automated):
```bash
reis cycle <phase>  # Runs: PLAN → REVIEW → EXECUTE → VERIFY → GATE → DEBUG (if needed)
```

---

## 🚫 DON'T Do This:

❌ Manually create plans when user mentions reis  
❌ Execute without using reis_executor subagent  
❌ Skip verification step  
❌ Write plans from scratch instead of using reis_planner  
❌ Skip displaying the kanban board during subagent execution  
❌ Use wrong subagent for the task (e.g., reis_planner for project analysis)  
❌ Skip research phase for complex features  
❌ Skip plan review before execution  
❌ Forget about quality gates after verification  
❌ Use reis_integrator in default cycle (it's for `reis audit` only)  

---

## ✅ DO This:

✅ Always invoke appropriate REIS subagent for each task  
✅ Use parallel execution when possible (up to 4 parallel subagents)  
✅ Follow the complete cycle: ANALYZE → ARCHITECT → RESEARCH → PLAN → REVIEW → EXECUTE → VERIFY → GATE → DEBUG  
✅ Display kanban board at start and during progress updates  
✅ Practice what we preach (dogfooding!)  
✅ Check for existing research before planning  
✅ Run plan review before execution to catch issues early  
✅ Include quality gates in verification cycle  
✅ Use task-level resume after interruptions  
✅ Leverage parallel wave execution for faster development  

---

## 💡 Examples:

### Example 1: Complete New Project
**User says:** "Build a todo app using reis"  
**Agent does:**
1. Use `reis_analyst` to analyze requirements
2. Use `reis_architect` to create roadmap
3. For each phase:
   - Use `reis_scout` to research approaches
   - Use `reis_planner` to create plan
   - Use `reis_plan_reviewer` to validate plan
   - Use `reis_executor` to implement
   - Use `reis_verifier` to verify completion
   - Run quality gates
   - Use `reis_debugger` if issues found

### Example 2: Single Feature Development
**User says:** "Plan and build authentication using reis"  
**Agent does:**
1. Use `reis_scout` to research auth approaches
2. Use `reis_planner` to create plan
3. Use `reis_plan_reviewer` to validate plan
4. Use `reis_executor` to implement
5. Use `reis_verifier` to verify completion

### Example 3: Map Existing Codebase
**User says:** "Map this existing project with reis"  
**Agent does:**
1. Use `reis_project_mapper` to analyze codebase
2. Use `reis_architect` to create roadmap
3. Continue with normal workflow

### Example 4: Parallel Research
**User says:** "Research authentication and database options using reis"  
**Agent does:**
1. Invoke 2 parallel `reis_scout` subagents (one for auth, one for DB)
2. Use `reis_synthesizer` to combine findings
3. Present unified research summary

### Example 5: Milestone Integration Check
**User says:** "Audit milestone 1 using reis"  
**Agent does:**
1. Use `reis_integrator` to check cross-phase integration
2. Validate API contracts between modules
3. Detect stub implementations
4. Generate audit report

### Example 6: Debug Verification Failure
**User says:** "Debug the verification failures using reis"  
**Agent does:**
1. Use `reis_debugger` to analyze failures
2. Generate FIX_PLAN.md with targeted fixes
3. Use `reis_executor` to apply fixes
4. Use `reis_verifier` to re-verify
5. Loop until passing

---

## 🖥️ CLI Commands (for direct use)

REIS provides **40 commands** covering the entire development lifecycle:

### 🚀 Getting Started (5 commands)
```bash
reis new [idea]                    # Initialize new REIS project
reis map                           # Map existing codebase (invokes reis_project_mapper)
reis requirements                  # Generate/update requirements
reis roadmap                       # Generate/update roadmap (invokes reis_architect)
reis config [subcommand]           # Manage configuration (show, edit, validate, reset)
```

### 📝 Planning & Research (6 commands)
```bash
reis research [phase]              # Research phase (invokes reis_scout)
reis plan [phase]                  # Create detailed plan (invokes reis_planner)
reis review [target]               # Review plan before execution (invokes reis_plan_reviewer)
reis assumptions [phase]           # Document assumptions
reis discuss [phase]               # Discuss implementation approach
reis plan-gaps [milestone]         # Identify missing plans for milestone
```

### ⚡ Execution (4 commands)
```bash
reis execute [phase]               # Execute phase (invokes reis_executor)
  --parallel                       # Enable parallel wave execution
  --max-concurrent <n>             # Limit concurrent waves (default: 4)
  --resume                         # Resume from checkpoint
  --from-wave <n>                  # Resume from specific wave
  --from-task <n>                  # Resume from specific task
  --auto-stash                     # Auto-stash changes on resume
  --rollback soft|mixed|hard       # Git rollback options

reis execute-plan <path>           # Execute specific plan file
reis quick <task>                  # Quick one-off task execution
reis cycle [phase-or-plan]         # Full automated cycle
  --resume                         # Resume interrupted cycle
  --resume-execution               # Resume from execution state
  --skip-research                  # Skip research phase
  --skip-review                    # Skip plan review
  --skip-gates                     # Skip quality gates
  --gate-only <category>           # Run specific gate category
  --auto-fix                       # Auto-fix plan issues
```

### ✅ Verification & Quality (5 commands)
```bash
reis verify <target>               # Verify completion (invokes reis_verifier)
  --verbose, -v                    # Detailed output
  --strict                         # Fail on warnings
  --with-gates                     # Include quality gates

reis gate [subcommand]             # Run quality gates
  check                            # Run all gates (default)
  security                         # Security gates only
  quality                          # Quality gates only
  performance                      # Performance gates only
  accessibility                    # Accessibility gates only
  status                           # Show gate configuration
  report                           # Generate detailed report

reis debug [target]                # Debug failures (invokes reis_debugger)
  --verbose, -v                    # Detailed output
  --input <report>                 # Debug specific report

reis audit [milestone]             # Milestone integration audit (invokes reis_integrator)
reis checkpoint [subcommand] [name] # Manage checkpoints
  list                             # List checkpoints
  create <name>                    # Create checkpoint
  restore <name>                   # Restore checkpoint
  compare <c1> <c2>                # Compare checkpoints
```

### 📊 Progress & State (5 commands)
```bash
reis progress                      # Show project progress with kanban
reis pause                         # Pause current work
reis resume                        # Resume paused work
reis milestone                     # Manage milestones
reis complete-milestone <milestone> # Mark milestone complete
```

### 🎯 Roadmap Management (3 commands)
```bash
reis add <feature>                 # Add feature to roadmap
reis insert <phase> <feature>      # Insert feature at specific phase
reis remove <phase>                # Remove phase from roadmap
```

### 📋 Task Management (2 commands)
```bash
reis todo <description>            # Add TODO item
reis todos [area]                  # List TODO items
```

### 🌳 Decision Trees (1 command)
```bash
reis tree [subcommand]             # Manage decision trees
  list                             # List available trees
  show <name>                      # Display specific tree
  select <name>                    # Interactive selection
  export <name> <format>           # Export tree (html, svg, mermaid)
  diff <tree1> <tree2>             # Compare trees
  lint <name>                      # Validate tree structure
```

### 🎨 Visualization & Tracking (2 commands)
```bash
reis visualize                     # Visualize roadmap, metrics, dependencies
  --dependencies                   # Show wave dependency graph
  --timeline                       # Show execution timeline
  --metrics                        # Show progress metrics

reis kanban [subcommand] [value]   # Manage kanban board
  (no args)                        # Show current settings
  enable                           # Enable kanban display
  disable                          # Disable kanban display
  toggle                           # Toggle on/off
  style <style>                    # Set style: full | compact | minimal
```

### 📝 Decision Tracking (1 command)
```bash
reis decisions [subcommand] [id]   # Track architectural decisions
  add                              # Add new decision
  list                             # List all decisions
  view <id>                        # View specific decision
  export                           # Export decisions to file
```

### 📚 Documentation & Help (3 commands)
```bash
reis docs                          # Open documentation
reis help                          # Show help
reis whats-new                     # Show recent changes (changelog)
```

### 🔧 System (3 commands)
```bash
reis version                       # Show version
reis update                        # Update REIS to latest version
reis uninstall                     # Uninstall REIS
```

---

## 📌 Remember:

- REIS is our own methodology - we must use it ourselves!
- Subagents are designed specifically for these tasks
- Using subagents ensures quality and consistency
- Parallel execution speeds up development (max 4 subagents)
- Always complete the full cycle
- **Always display kanban board for visual progress**

---

## 🎯 Trigger Words:

When user mentions any of these, use REIS workflow:
- "reis"
- "REIS"
- "reis methodology"
- "use reis"
- "follow reis"
- "with reis"
- "reis cycle"
- "systematic development"

---

## 📊 REIS System Overview

### Key Statistics
- **40 CLI Commands** covering entire development lifecycle
- **11 Specialized Subagents** for different workflow stages
- **4 Quality Gates** (Security, Quality, Performance, Accessibility)
- **33+ Utility Modules** providing core functionality
- **Wave-based Execution** with parallel support (up to 4 concurrent)
- **Full Crash Recovery** with task-level checkpointing
- **State Machine** with 9 states for cycle management

### Advanced Features
- ✅ **FR2.1**: Incomplete implementation detection (debugger)
- ✅ **FR3.1**: Pre-execution plan validation (plan reviewer)
- ✅ **FR4.1**: Feature completeness detection (verifier)
- ✅ **Parallel Wave Execution**: Dependency-aware concurrent execution
- ✅ **Quality Gates**: 4-gate system with configurable thresholds
- ✅ **Decision Trees**: Interactive selection with export capabilities
- ✅ **Task-level Resume**: Recovery from crashes/interruptions
- ✅ **Git Integration**: Auto-commit, stash, rollback support
- ✅ **Kanban Board**: Visual progress tracking (full/compact/minimal)
- ✅ **Metrics & Visualization**: Charts, graphs, dependency maps

### File Structure
```
.planning/                    # REIS project files
  PROJECT.md                  # Project description
  REQUIREMENTS.md             # Requirements
  ROADMAP.md                  # Phase breakdown
  STATE.md                    # Current state
  phases/                     # Phase-specific files
    phase-N/
      PLAN.md                 # Execution plan
      SUMMARY.md              # Execution summary
      DEBUG_REPORT.md         # Debug analysis
      FIX_PLAN.md            # Fix instructions
      REVIEW_REPORT.md       # Plan review results

.reis/                        # State and execution data
  execution-state.json        # Task-level state
  execution.lock              # Execution lock
  parallel-state.json         # Parallel execution state
  decisions.json              # Decision tracking
```

### Configuration
```javascript
// reis.config.js - Customize REIS behavior
module.exports = {
  waves: {
    defaultSize: 'medium',      // small | medium | large
    autoCheckpoint: true,
    continueOnError: false
  },
  git: {
    autoCommit: true,
    commitMessagePrefix: '[REIS v2.0]',
    requireCleanTree: true
  },
  gates: {
    enabled: true,
    categories: ['security', 'quality', 'performance', 'accessibility']
  },
  parallel: {
    enabled: true,
    maxConcurrent: 4
  },
  kanban: {
    enabled: true,
    style: 'full'               // full | compact | minimal
  }
};
```

### Quick Reference

#### New Project Workflow
```bash
reis new "todo app"           # Initialize
reis research 1               # Research (optional)
reis cycle 1                  # Full cycle (PLAN→REVIEW→EXECUTE→VERIFY→GATE)
reis progress                 # Check progress
```

#### Existing Project Workflow
```bash
reis map                      # Map codebase
reis roadmap                  # Generate roadmap
reis cycle 1                  # Execute first phase
```

#### Resume After Interruption
```bash
reis cycle --resume           # Resume full cycle
reis execute --resume         # Resume execution from checkpoint
```

#### Parallel Development
```bash
reis execute --parallel --max-concurrent 4
```

#### Quality & Debugging
```bash
reis gate                     # Run all gates
reis gate security            # Security only
reis debug                    # Debug failures
reis audit milestone-1        # Integration check
```

---

**Last Updated:** 2026-01-28  
**Version:** 2.7.1  
**REIS Version:** v2.7.1 (Task-level Resume & Crash Recovery)  
**Purpose:** Ensure consistent use of REIS methodology with all 11 subagents, 40 commands, and advanced features
