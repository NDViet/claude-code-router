const baseConfig = require("../electron-builder.json");

// electron-builder.json pins the publish target to the upstream repository. That is correct for
// upstream releases but wrong everywhere else: a fork running .github/workflows/release.yml would
// look up v<version> in musistudio/claude-code-router, find the upstream release, and skip
// publishing entirely ("existing release published more than 2 hours ago") while still exiting 0.
//
// The macOS half of the release workflow already publishes through `gh`, which targets whichever
// repository the workflow runs in. Resolve the same target here so the electron-builder half of the
// pipeline stays consistent with it. Outside GitHub Actions GITHUB_REPOSITORY is unset and the
// upstream values in electron-builder.json are used unchanged.
function resolvePublishTarget() {
  const slug = (process.env.GITHUB_REPOSITORY || "").trim();
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) {
    return undefined;
  }
  return { owner, repo };
}

const publishTarget = resolvePublishTarget();
const basePublish = Array.isArray(baseConfig.publish) ? baseConfig.publish : [baseConfig.publish];

const config = {
  ...baseConfig,
  publish: basePublish.map((entry) =>
    entry && entry.provider === "github" && publishTarget ? { ...entry, ...publishTarget } : entry
  )
};

module.exports = config;
