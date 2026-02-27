# Forge Date Validator

An Atlassian Forge workflow validator that **blocks issue transitions** when the **Start Date** and/or **Due Date** fields are not set.

When a user tries to move an issue through a workflow transition (e.g. "In Progress" → "Done"), this validator checks that both date fields have values. If either is missing, the transition is blocked and a clear error message is shown.

## How it works

The app registers a `jira:workflowValidator` module. On every transition where the validator is configured, it:

1. Fetches the issue's date fields via the Jira REST API.
2. Checks that both `duedate` and `startdate` are populated.
3. Returns a descriptive error listing any missing fields, or allows the transition if both are present.

Two implementations are included:

| File | Approach | Pros |
|------|----------|------|
| `manifest.yml` + `src/index.js` | **Function-based** (default) | Works on any instance; provides per-field error messages; easy to extend |
| `manifest.expression-based.yml` | **Expression-based** (alternative) | No runtime code needed; simpler; slightly faster |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Atlassian Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/) installed globally:
  ```bash
  npm install -g @forge/cli@latest
  ```
- An [Atlassian Cloud developer site](http://go.atlassian.com/cloud-dev)
- A **company-managed** Jira project (workflow validators are not available in team-managed projects)

## Quick start

### 1. Clone and install

```bash
git clone <repo-url>
cd forge-date-validator
npm install
```

### 2. Register the app

```bash
forge register
```

This replaces the placeholder `<your-app-id>` in `manifest.yml` with your real app ID.

### 3. Configure the Start Date field key (if needed)

The default implementation uses `startdate` as the field key.

If your Jira instance stores Start Date as a **custom field** (common), open `src/index.js` and update the `START_DATE_FIELD` constant:

```js
const START_DATE_FIELD = "customfield_10015"; // adjust to your instance
```

> **Tip:** To find the correct field key, go to **Jira Admin → Issues → Custom fields → Start date** and note the ID in the URL, or call `GET /rest/api/3/field` and search for `"Start date"`.

### 4. Deploy

```bash
forge deploy
```

### 5. Install on your site

```bash
forge install
```

Select your Jira site when prompted.

### 6. Add the validator to a workflow

1. Open **Jira Settings → Issues → Workflows**.
2. Edit the workflow of your target project.
3. Select a transition (e.g. "In Progress").
4. Go to the **Validators** tab and click **Add validator**.
5. Choose **"Start Date and Due Date required"** from the list.
6. Publish the workflow changes.

Now any issue missing Start Date or Due Date will be blocked from that transition with a message like:

> _Start Date and Due Date must be set before transitioning this issue._

## Using the expression-based alternative

If you prefer a zero-code approach:

1. Copy `manifest.expression-based.yml` over `manifest.yml`:
   ```bash
   cp manifest.expression-based.yml manifest.yml
   ```
2. Update `customfield_10015` in the expression to match your Start Date field key.
3. Deploy and install as above.

The expression-based approach does **not** use `src/index.js` at all — the validation logic lives entirely in the manifest as a Jira expression.

## Updating

After making changes to the code or manifest:

```bash
forge deploy
```

To view logs from the deployed function:

```bash
forge logs
```

## Permissions

The app requires the `read:jira-work` scope to read issue field data via the REST API.

## Resources

- [Forge workflow validator docs](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-workflow-validator/)
- [Forge tutorial: Check issues are assigned](https://developer.atlassian.com/platform/forge/check-jira-issues-assigned-using-workflow-validator/)
- [Jira expressions type reference](https://developer.atlassian.com/cloud/jira/platform/jira-expressions-type-reference/)

## License

MIT
