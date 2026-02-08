// Brief Writer 2026 - Frontend

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("brief-form");
  const submitBtn = document.getElementById("submit-btn");
  const formSection = document.getElementById("form-section");
  const pipelineSection = document.getElementById("pipeline-section");
  const resultsSection = document.getElementById("results-section");
  const errorBanner = document.getElementById("error-banner");

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
    });
  });

  // Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorBanner.style.display = "none";

    const brand = document.getElementById("brand").value.trim();
    const goal = document.getElementById("goal").value.trim();
    const industry = document.getElementById("industry").value.trim();
    const context = document.getElementById("context").value.trim();

    if (!brand || !goal) return;

    // Disable form
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitBtn.querySelector(".btn-text").textContent = "Generating Brief...";

    // Show pipeline
    pipelineSection.style.display = "block";
    resultsSection.style.display = "none";
    pipelineSection.scrollIntoView({ behavior: "smooth", block: "start" });

    // Reset agent cards
    document.querySelectorAll(".agent-card").forEach((card) => {
      card.classList.remove("running", "done");
    });

    // Start SSE
    const body = JSON.stringify({ brand, goal, industry, context });

    fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
    }).then((response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      function processChunk() {
        reader.read().then(({ done, value }) => {
          if (done) return;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line

          let eventType = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7);
            } else if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              handleEvent(eventType, data);
            }
          }

          processChunk();
        });
      }

      processChunk();
    }).catch((err) => {
      showError("Connection error: " + err.message);
      resetForm();
    });
  });

  function handleEvent(event, data) {
    switch (event) {
      case "status":
        updateAgentStatus(data.agent, data.status, data.message);
        break;
      case "result":
        showResult(data.agent, data.content);
        break;
      case "complete":
        onComplete(data.filename);
        break;
      case "error":
        showError(data.message);
        resetForm();
        break;
    }
  }

  function updateAgentStatus(agent, status, message) {
    const card = document.getElementById("agent-" + agent);
    if (!card) return;

    card.classList.remove("running", "done");
    if (status === "running") {
      card.classList.add("running");
      card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (status === "done") {
      card.classList.add("done");
    }

    const desc = card.querySelector(".agent-desc");
    if (desc && message) {
      desc.textContent = message;
    }
  }

  function showResult(agent, content) {
    const panel = document.getElementById("panel-" + agent);
    if (!panel) return;

    const body = panel.querySelector(".markdown-body");
    if (body) {
      body.innerHTML = formatMarkdown(content);
    }

    resultsSection.style.display = "block";
  }

  function onComplete(filename) {
    // Switch to final brief tab
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    document.querySelector('[data-tab="review"]').classList.add("active");
    document.getElementById("panel-review").classList.add("active");

    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

    resetForm();
    submitBtn.querySelector(".btn-text").textContent = "Generate Another Brief";
  }

  function showError(message) {
    errorBanner.textContent = message;
    errorBanner.style.display = "block";
  }

  function resetForm() {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
  }

  // Basic markdown to HTML
  function formatMarkdown(text) {
    if (!text) return "";
    let html = text
      // Headers
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Lists
      .replace(/^\- (.+)$/gm, "<li>$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      // Tables (basic)
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split("|").filter(Boolean).map((c) => c.trim());
        return "<tr>" + cells.map((c) => "<td>" + c + "</td>").join("") + "</tr>";
      })
      // Line breaks
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    // Wrap consecutive li's in ul
    html = html.replace(/(<li>.*?<\/li>(\s*<br>)?)+/g, (match) => {
      return "<ul>" + match.replace(/<br>/g, "") + "</ul>";
    });

    // Wrap in paragraph
    html = "<p>" + html + "</p>";

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, "");
    html = html.replace(/<p>(<h[123]>)/g, "$1");
    html = html.replace(/(<\/h[123]>)<\/p>/g, "$1");
    html = html.replace(/<p>(<ul>)/g, "$1");
    html = html.replace(/(<\/ul>)<\/p>/g, "$1");

    return html;
  }
});
