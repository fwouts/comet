import cors from "cors";
import express from "express";
import request from "request";
import { HELPFUL_JIRA_ERROR_MESSAGE, jiraConfig } from "./config";

// Jira Cloud API is not accessible from a web client directly because of
// https://jira.atlassian.com/browse/JRACLOUD-30371.
//
// If you think having to use a proxy is stupid, you're not alone.

if (!jiraConfig) {
  console.error(HELPFUL_JIRA_ERROR_MESSAGE);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

app.use((req, res) => {
  console.log(req.url);
  req.pipe(request(jiraConfig!.JIRA_HOST + req.url)).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
});
