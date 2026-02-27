import api, { route } from "@forge/api";

/**
 * Workflow validator that blocks issue transitions when Start Date and/or
 * Due Date fields are not set.
 *
 * The validator is invoked automatically by Jira on every transition that
 * includes this validator in its workflow configuration.
 *
 * @param {Object} payload            - The event payload provided by Forge.
 * @param {Object} payload.issue      - Minimal issue information (key, id).
 * @returns {Object}                  - { result: boolean, errorMessage?: string }
 */
export const run = async ({ issue }) => {
  const { key: issueKey } = issue;

  // Fetch full issue details from the Jira REST API
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issueKey}?fields=duedate,startdate`);

  if (!response.ok) {
    // If we cannot retrieve the issue, block the transition to be safe
    return {
      result: false,
      errorMessage:
        "Unable to validate date fields. Please contact your Jira administrator.",
    };
  }

  const data = await response.json();
  const { fields } = data;

  const dueDate = fields.duedate ?? null;

  // "Start date" may appear as a system field (fields.startdate) or as a
  // custom field.  The most common custom-field ID is customfield_10015, but
  // this can vary between Jira Cloud instances.
  //
  // Update START_DATE_FIELD below if your instance uses a different field key.
  const START_DATE_FIELD = "startdate";
  const startDate = fields[START_DATE_FIELD] ?? null;

  // Build a user-friendly error message listing every missing field
  const missing = [];
  if (!startDate) missing.push("Start Date");
  if (!dueDate) missing.push("Due Date");

  if (missing.length > 0) {
    return {
      result: false,
      errorMessage: `${missing.join(" and ")} must be set before transitioning this issue.`,
    };
  }

  return { result: true };
};
