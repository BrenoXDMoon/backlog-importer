// import.js
import fs from "fs";
import fetch from "node-fetch";

const GITHUB_TOKEN = "";  // defina no ambiente
const OWNER = "BrenoXDMoon";                    // ex: "brenogabriel"
const REPO = "chopper-house-games-clean-arch";  // nome do repo

if (!GITHUB_TOKEN) {
  console.error("Defina a variável de ambiente GITHUB_TOKEN");
  process.exit(1);
}

const backlog = JSON.parse(fs.readFileSync("backlog.json", "utf-8"));

async function createIssue(item) {
  const title = `[${item.entity.toUpperCase()}] ${item.id} - ${item.title}`;

  const body = `
**ID:** ${item.id}  
**Categoria:** ${item.category}  
**Entidade:** ${item.entity}  
**Grupo:** ${item.group}  

**Descrição:**
${item.description}

---

_Status inicial_: ${item.status || "todo"}
  `;

  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify({
        title,
        body,
        labels: [
          item.category,      // ex: "requisito_funcional"
          item.entity         // ex: "Jogo", "Cliente"
        ]
      })
    }
  );

  if (!response.ok) {
    const txt = await response.text();
    console.error(`Erro ao criar issue para ${item.id}:`, txt);
  } else {
    const json = await response.json();
    console.log(`Issue criada: ${item.id} -> #${json.number}`);
  }
}

async function run() {
  for (const item of backlog.backlog) {
    await createIssue(item);
  }
}

run().catch(console.error);
