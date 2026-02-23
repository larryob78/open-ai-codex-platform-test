# Shortcut for claude --worktree with optional name (defaults to timestamp)
cw() {
  claude --worktree "${1:-$(date +%Y%m%d-%H%M)}"
}
