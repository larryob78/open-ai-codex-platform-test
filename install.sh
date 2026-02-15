#!/bin/sh
# install.sh — AI Comply platform installer
# Usage: curl -fsSL https://raw.githubusercontent.com/larryob78/open-ai-codex-platform-test/main/install.sh | sh
set -e

REPO="https://github.com/larryob78/open-ai-codex-platform-test.git"
INSTALL_DIR="ai-comply"

# --- helpers ----------------------------------------------------------------

info()  { printf '\033[1;34m%s\033[0m\n' "$*"; }
ok()    { printf '\033[1;32m%s\033[0m\n' "$*"; }
warn()  { printf '\033[1;33m%s\033[0m\n' "$*"; }
err()   { printf '\033[1;31mError: %s\033[0m\n' "$*" >&2; exit 1; }

# --- preflight checks -------------------------------------------------------

command -v git >/dev/null 2>&1 || err "git is required but not installed. Please install git first."

if [ -d "$INSTALL_DIR" ]; then
    warn "Directory '$INSTALL_DIR' already exists."
    printf "Overwrite? [y/N] "
    read -r answer
    case "$answer" in
        [yY]*) rm -rf "$INSTALL_DIR" ;;
        *)     err "Aborted." ;;
    esac
fi

# --- clone -------------------------------------------------------------------

info "Cloning AI Comply platform..."
git clone --depth 1 "$REPO" "$INSTALL_DIR" 2>&1
ok "Cloned into ./$INSTALL_DIR"

# --- detect a local server ---------------------------------------------------

serve() {
    port="${1:-8080}"
    cd "$INSTALL_DIR"

    if command -v python3 >/dev/null 2>&1; then
        info "Starting local server at http://localhost:$port ..."
        python3 -m http.server "$port"
    elif command -v python >/dev/null 2>&1; then
        info "Starting local server at http://localhost:$port ..."
        python -m SimpleHTTPServer "$port" 2>/dev/null \
            || python -m http.server "$port"
    elif command -v npx >/dev/null 2>&1; then
        info "Starting local server at http://localhost:$port ..."
        npx -y serve -l "$port"
    elif command -v php >/dev/null 2>&1; then
        info "Starting local server at http://localhost:$port ..."
        php -S "localhost:$port"
    else
        return 1
    fi
}

# --- done --------------------------------------------------------------------

echo ""
ok "AI Comply installed successfully!"
echo ""
info "To get started:"
echo ""
echo "  cd $INSTALL_DIR"
echo "  # Open index.html directly in your browser, or start a local server:"
echo "  python3 -m http.server 8080"
echo ""
info "Then visit http://localhost:8080"
echo ""

# If running interactively, offer to start a server now
if [ -t 0 ]; then
    printf "Start a local server now? [Y/n] "
    read -r answer
    case "$answer" in
        [nN]*) ok "Done. Open $INSTALL_DIR/index.html in your browser to get started." ;;
        *)     serve 8080 ;;
    esac
fi
