// .claude/agents/*.md (역할 상세 SSOT) → .codex/agents/*.toml 생성기
// 실행: pnpm gen:codex — agent를 수정한 커밋에는 이 생성기 실행 결과가 같이 들어가야 한다 (shared/agent-roles.md 동기화 규칙)
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const SRC = path.join(ROOT, ".claude", "agents");
const OUT = path.join(ROOT, ".codex", "agents");

// 판단 밀도 티어 매핑 (shared/agent-roles.md)
const EFFORT = { fable: "high", opus: "high", sonnet: "medium", haiku: "low" };
// 도구만으로 판정 불가한 예외 — diff-organizer는 Bash로 git 쓰기를 한다
const SANDBOX_OVERRIDE = { "diff-organizer": "workspace-write" };

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("frontmatter 없음");
  const meta = {};
  let currentKey = null;
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      meta[currentKey] = kv[2].replace(/^['"]|['"]$/g, "");
    } else if (/^\s+-\s+/.test(line) && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(line.replace(/^\s+-\s+/, "").trim());
    }
  }
  return { meta, body: m[2].trim() };
}

function tomlString(s) {
  return `"""\n${s.replaceAll('"""', '\\"\\"\\"')}\n"""`;
}

mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const { meta, body } = parseFrontmatter(readFileSync(path.join(SRC, file), "utf8"));
  const name = meta.name ?? file.replace(/\.md$/, "");
  const tools = (typeof meta.tools === "string" ? meta.tools.split(",") : []).map((t) => t.trim());
  const canWrite = tools.includes("Edit") || tools.includes("Write");
  const sandbox = SANDBOX_OVERRIDE[name] ?? (canWrite ? "workspace-write" : "read-only");
  const effort = EFFORT[meta.model] ?? "medium";
  const skills = Array.isArray(meta.skills) ? meta.skills : [];

  const skillNote = skills.length
    ? `\n\n## 참조 스킬 (shared/skills/<이름>/SKILL.md 를 읽어라)\n${skills.map((s) => `- shared/skills/${s}/SKILL.md`).join("\n")}`
    : "";

  const toml = `# 생성 파일 — 직접 편집 금지. SSOT는 .claude/agents/${file} (pnpm gen:codex 로 재생성)
name = "${name}"
description = ${tomlString(meta.description ?? "")}
# model = "TODO(✍️): 팀이 쓰는 codex 모델 id"
model_reasoning_effort = "${effort}"
sandbox_mode = "${sandbox}"

instructions = ${tomlString(body + skillNote)}
`;
  writeFileSync(path.join(OUT, `${name}.toml`), toml);
  console.log(`✓ ${name}.toml (effort=${effort}, sandbox=${sandbox})`);
}
console.log(`총 ${files.length}개 생성 → .codex/agents/`);
