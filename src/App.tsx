import {
  faArrowAltCircleRight,
  faCodeBranch,
  faTag
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import Select from "react-select";
import { ClipLoader } from "react-spinners";
import styled from "styled-components";
import { OWNER, REPO } from "./config";
import { Commit, CompareRefsResult } from "./github/loader";
import {
  Dispatch,
  fetchComparisonAction,
  fetchRefsAction,
  selectRefAction
} from "./store/actions";
import {
  CommitsState,
  Loadable,
  LoadedState,
  Ref,
  RefsState,
  State
} from "./store/state";

const RootContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  height: 100vh;
  background: #fff;
`;

const RefsColumn = styled.ul`
  width: 300px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  border-right: 2px solid #eee;
  overflow-y: scroll;
`;

const RefItem = styled.li<{
  selected: boolean;
}>`
  font-weight: bold;
  padding: 8px;
  cursor: pointer;
  background: ${props => (props.selected ? "#111" : "transparent")};
  color: ${props => (props.selected ? "#fff" : "#000")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &&:hover {
    background: ${props => (props.selected ? "#111" : "#eee")};
  }
`;

const ComparisonColumn = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
`;

const ComparisonHeader = styled.div`
  display: flex;
  flex-direction: row;
`;

const ComparisonSelectedBranch = styled.h2`
  margin: 0;
  padding: 12px;
  font-size: 1.2em;
`;

const ComparisonCompareToBranch = styled.div`
  padding: 6px;
  flex-grow: 1;
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
  refs: Loadable<RefsState>;
  loadRefs(): void;
  selectRef(refName: string): void;
  compareToAnotherRef(selectedRefName: string, compareToRefName: string): void;
}> {
  public componentDidMount() {
    this.props.loadRefs();
  }

  public render() {
    return (
      <RootContainer>
        <RefsColumn>
          {this.props.refs.status === "loaded" &&
            this.renderRefs(this.props.refs)}
          {this.props.refs.status === "loading" && Spinner}
        </RefsColumn>
        {this.props.refs.status === "loaded" &&
          this.props.refs.selectedRefName &&
          this.props.refs.comparison &&
          this.renderComparisonColumn(
            this.props.refs.refs,
            this.props.refs.selectedRefName,
            this.props.refs.comparison
          )}
      </RootContainer>
    );
  }

  private renderRefs(refs: RefsState & LoadedState) {
    return refs.refs.map(ref => (
      <RefItem
        key={ref.name}
        selected={refs.selectedRefName === ref.name}
        onClick={() => this.props.selectRef(ref.name)}
      >
        <FontAwesomeIcon icon={ref.kind === "branch" ? faCodeBranch : faTag} />{" "}
        {ref.name}
      </RefItem>
    ));
  }

  private renderComparisonColumn(
    refs: Ref[],
    selectedRefName: string,
    comparison: CommitsState
  ) {
    return (
      <ComparisonColumn>
        <ComparisonHeader>
          <ComparisonSelectedBranch>
            Comparing {selectedRefName} to{" "}
          </ComparisonSelectedBranch>
          <ComparisonCompareToBranch>
            <Select
              options={refs.filter(r => r.name !== selectedRefName).map(r => ({
                value: r.name,
                label: r.name
              }))}
              isOptionSelected={option =>
                option.value === comparison.compareToRefName
              }
              value={{
                value: comparison.compareToRefName,
                label: comparison.compareToRefName
              }}
              onChange={option =>
                option &&
                !(option instanceof Array) &&
                this.props.compareToAnotherRef(selectedRefName, option.value)
              }
            />
          </ComparisonCompareToBranch>
        </ComparisonHeader>
        {comparison.status === "loaded" && (
          <>
            <ComparisonDescription>
              {comparison.result.ahead_by} commits added.
              <br />
              {comparison.result.behind_by} commits removed.
            </ComparisonDescription>
            <ComparisonList>
              {this.renderComparisonList(comparison.result)}
            </ComparisonList>
          </>
        )}
        {comparison.status === "loading" && Spinner}
      </ComparisonColumn>
    );
  }

  private renderComparisonList(comparison: CompareRefsResult) {
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
  refs: state.refs
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadRefs: () => dispatch(fetchRefsAction()),
  selectRef: (refName: string) => dispatch(selectRefAction(refName)),
  compareToAnotherRef: (selectedRefName: string, compareToRefName: string) =>
    dispatch(fetchComparisonAction(selectedRefName, compareToRefName))
});

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default ConnectedApp;
