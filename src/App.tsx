import { faArrowAltCircleRight, faCodeBranch, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import { ClipLoader } from "react-spinners";
import styled from "styled-components";
import { OWNER, REPO } from "./config";
import { Commit, CompareBranchesResult } from "./github/loader";
import { Dispatch, fetchReleasesAction, selectBranchAction } from "./store/actions";
import { Loadable, LoadedState, ReleaseBranchesState, State } from "./store/state";

const RootContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  height: 100vh;
  background: #fff;
`;

const ReleasesColumn = styled.ul`
  width: 300px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  border-right: 2px solid #eee;
  overflow-y: scroll;
`;

const ReleaseItem = styled.li<{
  selected: boolean;
}>`
  font-weight: bold;
  padding: 8px;
  cursor: pointer;
  background: ${props => (props.selected ? "#111" : "transparent")};
  color: ${props => (props.selected ? "#fff" : "#000")};

  &&:hover {
    background: ${props => (props.selected ? "#111" : "#eee")};
  }
`;

const ComparisonColumn = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
`;

const ComparisonTitle = styled.h2`
  margin: 0;
  padding: 12px;
  font-size: 1.2em;
`;

const ComparisonDescription = styled.p`
  margin: 12px;
  margin-top: 0;
  padding: 8px;
  background: #fffbf6;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #fb6;
  border-bottom-width: 2px;
`;

const ComparisonList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CommitItem = styled.li`
  padding: 8px;
  background: #fff;

  &&:nth-child(even) {
    background: #f8f8fc;
  }
`;

const CommitSha = styled.a`
  color: #aaa;
  text-decoration: none;
  font-family: "Roboto Mono", monospace;
  font-size: 0.9em;

  &&:hover {
    color: #777;
    text-decoration: underline;
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 16px;
`;

const Spinner = (
  <SpinnerContainer>
    <ClipLoader color="#6da" size={150} />
  </SpinnerContainer>
);

class App extends React.Component<{
  releaseBranches: Loadable<ReleaseBranchesState>;
  loadReleases(): void;
  selectBranch(branchName: string): void;
}> {
  public componentDidMount() {
    this.props.loadReleases();
  }

  public render() {
    return (
      <RootContainer>
        <ReleasesColumn>
          {this.props.releaseBranches.status === "loaded" &&
            this.renderBranches(this.props.releaseBranches)}
          {this.props.releaseBranches.status === "loading" && Spinner}
        </ReleasesColumn>
        {this.props.releaseBranches.status === "loaded" &&
          this.props.releaseBranches.comparison && (
            <ComparisonColumn>
              <ComparisonTitle>
                Comparing {this.props.releaseBranches.selectedBranchName} to{" "}
                {this.props.releaseBranches.comparison.olderBranchName}
              </ComparisonTitle>
              {this.props.releaseBranches.comparison.status === "loaded" && (
                <>
                  <ComparisonDescription>
                    {this.props.releaseBranches.comparison.result.ahead_by}{" "}
                    commits added.
                    <br />
                    {
                      this.props.releaseBranches.comparison.result.behind_by
                    }{" "}
                    commits removed.
                  </ComparisonDescription>
                  <ComparisonList>
                    {this.renderComparison(
                      this.props.releaseBranches.comparison.result
                    )}
                  </ComparisonList>
                </>
              )}
              {this.props.releaseBranches.comparison.status === "loading" &&
                Spinner}
            </ComparisonColumn>
          )}
      </RootContainer>
    );
  }

  private renderBranches(releaseBranches: ReleaseBranchesState & LoadedState) {
    return releaseBranches.refs.map(ref => (
      <ReleaseItem
        key={ref.name}
        selected={releaseBranches.selectedBranchName === ref.name}
        onClick={() => this.props.selectBranch(ref.name)}
      >
        <FontAwesomeIcon icon={ref.kind === 'branch' ? faCodeBranch : faTag} /> {ref.name}
      </ReleaseItem>
    ));
  }

  private renderComparison(comparison: CompareBranchesResult) {
    return (
      <>
        {comparison.added_commits.map(commit => (
          <CommitItem key={commit.sha}>
            <FontAwesomeIcon icon={faArrowAltCircleRight} color="green" />
            {commitSha(commit)}
            {firstLine(commit.commit.message)}
          </CommitItem>
        ))}
        {comparison.removed_commits.map(commit => (
          <CommitItem key={commit.sha}>
            <FontAwesomeIcon icon={faArrowAltCircleRight} color="red" />
            {commitSha(commit)}
            {firstLine(commit.commit.message)}
          </CommitItem>
        ))}
      </>
    );
  }
}

function firstLine(commitMessage: string): string {
  return commitMessage.split("\n", 2)[0];
}

function commitSha(commit: Commit) {
  return (
    <>
      {" "}
      <CommitSha
        target="_blank"
        href={`https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`}
      >
        {commit.sha.substr(0, 7)}
      </CommitSha>{" "}
    </>
  );
}

const mapStateToProps = (state: State) => ({
  releaseBranches: state.releaseBranches
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadReleases: () => dispatch(fetchReleasesAction()),
  selectBranch: (branchName: string) => dispatch(selectBranchAction(branchName))
});

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default ConnectedApp;
