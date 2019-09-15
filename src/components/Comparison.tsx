import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import assertNever from "assert-never";
import { observer } from "mobx-react";
import React from "react";
import ReactModal from "react-modal";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import styled from "styled-components";
import { Commit, CompareRefsResult } from "../github/loader";
import { HELPFUL_JIRA_ERROR_MESSAGE, jiraConfig } from "../jira/config";
import { JiraTicket } from "../jira/loader";
import { isJiraTicketDone, jiraTicketHasFurtherCommits } from "../jira/status";
import { JiraTicketsState } from "../store/comparison";
import { findJiraTicket } from "../store/helpers/find-ticket";
import { generateReleaseNotes } from "../store/helpers/release-notes";
import { Loadable } from "../store/loadable";
import { RepoState } from "../store/repo";
import Spinner from "./Spinner";

const Container = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
`;

const SelectedBranch = styled.h2`
  margin: 0;
  padding: 12px;
  font-size: 1.2em;
`;

const CompareToBranch = styled.div`
  padding: 6px;
  flex-grow: 1;
`;

const ToggleReleaseNotesButton = styled.button`
  border-radius: 8px;
  margin: 8px 12px;
  outline: none;
  background: #fff;
  cursor: pointer;
  font-size: 0.9em;

  &&:hover {
    background: #f8f8f8;
  }
`;

const ReleaseNotes = styled.pre``;

const Description = styled.p`
  margin: 12px;
  margin-top: 0;
  padding: 8px;
  background: #fffbf6;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #fb6;
  border-bottom-width: 2px;
`;

const CommitList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CommitItem = styled.li`
  padding: 8px;
  background: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;

  &&:nth-child(even) {
    background: #f8f8fc;
  }
`;

const CommitSha = styled.a`
  color: #aaa;
  text-decoration: none;
  font-family: "Roboto Mono", monospace;
  font-size: 0.9em;
  display: block;
  margin: 0 8px;
  user-select: none;

  &&:hover {
    color: #777;
    text-decoration: underline;
  }
`;

const CommitInfo = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CommitMessage = styled.div``;

const Ticket = styled.a`
  user-select: none;
  background: #333;
  color: #ddd;
  border-radius: 8px;
  font-size: 0.8em;
  margin: 4px 0;
  align-self: flex-start;
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  text-decoration: none;
`;

const TicketType = styled.img`
  margin-left: 8px;
`;

const TicketSummary = styled.div`
  padding: 4px 0 4px 8px;
`;

const TicketStatus = styled.div<{
  status: "failed" | "loading" | "incomplete" | "done";
}>`
  user-select: none;
  background: ${({ status }) => {
    switch (status) {
      case "failed":
        return "#c00";
      case "loading":
        return "transparent";
      case "incomplete":
        return "#ccc";
      case "done":
        return "#2b2";
      default:
        throw assertNever(status);
    }
  }}
  color: ${({ status }) => {
    switch (status) {
      case "failed":
      case "loading":
        return "#fff";
      case "incomplete":
      case "done":
        return "#333";
      default:
        throw assertNever(status);
    }
  }}
  margin-left: 8px;
  border-radius: 0 8px 8px 0;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Author = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
`;

const AuthorName = styled.span`
  color: #468;
`;

const AuthorAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-left: 8px;
`;

export const Comparison: React.FC<{
  state: RepoState;
}> = observer(({ state }) => {
  const options =
    state.refs.status === "loaded"
      ? state.refs.loaded.refs
          .filter(r => r.name !== state.selectedRefName)
          .map(r => ({
            value: r.name,
            label: r.name
          }))
      : [];
  if (options.length === 0 || !state.comparison) {
    return <Container />;
  }
  const comparison = state.comparison;
  return (
    <Container>
      <Header>
        <SelectedBranch>Comparing {state.selectedRefName} to </SelectedBranch>
        <CompareToBranch>
          <Select
            options={options}
            isOptionSelected={option =>
              option.value === comparison.compareToRefName
            }
            value={options.find(o => o.value === comparison.compareToRefName)}
            onChange={(option: any) => {
              if (!option || option instanceof Array) {
                return;
              }
              state.compareToAnotherRef(option.value);
            }}
          />
        </CompareToBranch>
        {comparison.result.status === "loaded" && (
          <ToggleReleaseNotesButton
            onClick={() => comparison.toggleReleaseNotes()}
          >
            {comparison.showReleaseNotes
              ? "Hide release notes"
              : "Show release notes"}
          </ToggleReleaseNotesButton>
        )}
      </Header>
      {comparison.result.status === "loaded" && (
        <>
          <ReactModal
            isOpen={comparison.showReleaseNotes}
            shouldCloseOnEsc={true}
            shouldCloseOnOverlayClick={true}
            onRequestClose={() => comparison.toggleReleaseNotes()}
            ariaHideApp={false}
          >
            <ReleaseNotes>{generateReleaseNotes(comparison)}</ReleaseNotes>
          </ReactModal>
          <Description>
            {comparison.result.loaded.aheadBy} commits added.
            <br />
            {comparison.result.loaded.behindBy} commits removed.
            {comparison.result.loaded.hadToOmitCommits && (
              <>
                <br />
                <br />
                <b>
                  Only showing a subset of commits because of limitations in
                  GitHub API.
                </b>
              </>
            )}
          </Description>
          <CommitList>
            {renderComparisonList(
              comparison.result.loaded,
              comparison.jiraTickets
            )}
          </CommitList>
        </>
      )}
      {comparison.result.status === "loading" && Spinner}
    </Container>
  );

  function renderComparisonList(
    comparison: CompareRefsResult,
    jiraTickets: Loadable<JiraTicketsState>
  ) {
    return (
      <>
        {comparison.addedCommits.map(commit => {
          const loadableJiraTicket = findJiraTicket(commit, jiraTickets);
          return (
            <CommitItem key={commit.sha}>
              <FontAwesomeIcon icon={faArrowAltCircleRight} color="green" />
              {commitSha(commit)}
              {commitInfo(commit, loadableJiraTicket, comparison.addedCommits)}
              {author(commit)}
            </CommitItem>
          );
        })}
        {comparison.removedCommits.map(commit => (
          <CommitItem key={commit.sha}>
            <FontAwesomeIcon icon={faArrowAltCircleRight} color="red" />
            {commitSha(commit)}
            {commitInfo(commit)}
            {author(commit)}
          </CommitItem>
        ))}
      </>
    );
  }
});

function commitInfo(
  commit: Commit,
  loadableJiraTicket: Loadable<JiraTicket, { key: string }> | null = null,
  allCommits: Commit[] = []
) {
  return (
    <CommitInfo>
      <CommitMessage>{commit.commit.message.split("\n", 2)[0]}</CommitMessage>
      {loadableJiraTicket !== null &&
        jiraTicketForCommit(loadableJiraTicket, allCommits)}
    </CommitInfo>
  );
}

function jiraTicketForCommit(
  loadableJiraTicket: Loadable<JiraTicket, { key: string }>,
  allCommits: Commit[]
) {
  switch (loadableJiraTicket.status) {
    case "empty":
    case "failed":
      return (
        <Ticket href={jiraLink(loadableJiraTicket.key)} target="_blank">
          <TicketSummary>{loadableJiraTicket.key}</TicketSummary>
          <TicketStatus status="failed">✖</TicketStatus>
        </Ticket>
      );
    case "loading":
      return (
        <Ticket href={jiraLink(loadableJiraTicket.key)} target="_blank">
          <TicketSummary>{loadableJiraTicket.key}</TicketSummary>
          <TicketStatus status="loading">
            <ClipLoader size={12} color={"#fff"} />
          </TicketStatus>
        </Ticket>
      );
    case "loaded":
      const jiraTicket = loadableJiraTicket.loaded;
      const jiraStatus = jiraTicket.status.name;
      const ticketIsNowDone = isJiraTicketDone(jiraTicket);
      const hasFurtherCommits = jiraTicketHasFurtherCommits(
        jiraTicket,
        allCommits
      );
      return (
        <Ticket href={jiraLink(jiraTicket.key)} target="_blank">
          <TicketType
            src={jiraTicket.issueType.iconUrl}
            title={jiraTicket.issueType.name}
          />
          <TicketSummary>
            {jiraTicket.key} - {jiraTicket.summary}
          </TicketSummary>
          <TicketStatus
            status={
              ticketIsNowDone && !hasFurtherCommits ? "done" : "incomplete"
            }
          >
            {jiraStatus}
            {ticketIsNowDone && !hasFurtherCommits && " ✓ "}{" "}
            {hasFurtherCommits && " (more commits)"}
          </TicketStatus>
        </Ticket>
      );
    default:
      throw assertNever(loadableJiraTicket);
  }
}

function commitSha(commit: Commit) {
  return (
    <>
      {" "}
      <CommitSha target="_blank" href={commit.html_url}>
        {commit.sha.substr(0, 7)}
      </CommitSha>{" "}
    </>
  );
}

function author(commit: Commit) {
  return (
    <Author>
      <AuthorName>{commit.commit.author.name}</AuthorName>
      {commit.author && <AuthorAvatar src={commit.author.avatar_url} />}
    </Author>
  );
}

function jiraLink(jiraKey: string) {
  if (!jiraConfig) {
    throw new Error(HELPFUL_JIRA_ERROR_MESSAGE);
  }
  return `${jiraConfig.JIRA_HOST}/browse/${jiraKey}`;
}
