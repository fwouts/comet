import {
  faArrowAltCircleRight,
  faCodeBranch
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import { ClipLoader } from "react-spinners";
import styled from "styled-components";
import { CompareBranchesResult } from "./github/loader";
import {
  Dispatch,
  fetchReleasesAction,
  selectBranchAction
} from "./store/actions";
import {
  LoadedReleaseBranchesState,
  ReleaseBranchesState,
  State
} from "./store/state";

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
  releaseBranches: ReleaseBranchesState;
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

  private renderBranches(releaseBranches: LoadedReleaseBranchesState) {
    return releaseBranches.names.map(name => (
      <ReleaseItem
        key={name}
        selected={releaseBranches.selectedBranchName === name}
        onClick={() => this.props.selectBranch(name)}
      >
        <FontAwesomeIcon icon={faCodeBranch} /> {name}
      </ReleaseItem>
    ));
  }

  private renderComparison(comparison: CompareBranchesResult) {
    return comparison.commits.map(commit => (
      <CommitItem key={commit.sha}>
        <FontAwesomeIcon icon={faArrowAltCircleRight} color="green" />{" "}
        {commit.commit.message}
      </CommitItem>
    ));
  }
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
