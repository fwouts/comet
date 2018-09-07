import * as React from "react";
import { connect } from "react-redux";
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
`;

const ReleasesColumn = styled.ul`
  width: 300px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  background: #333;
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
    background: ${props => (props.selected ? "#111" : "#555")};
  }
`;

const ComparisonColumn = styled.ul`
  flex-grow: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  background: #111;
  overflow-y: scroll;
`;

const CommitItem = styled.li`
  padding: 8px;
  margin: 8px 0 8px 8px;
  color: #fff;
  border: 1px solid #555;
  border-width: 1px 0 1px 1px;
  border-radius: 8px 0 0 8px;
  background: #333;
`;

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
        </ReleasesColumn>
        <ComparisonColumn>
          {this.props.releaseBranches.status === "loaded" &&
            this.props.releaseBranches.comparison &&
            this.props.releaseBranches.comparison.status === "loaded" &&
            this.renderComparison(this.props.releaseBranches.comparison.result)}
        </ComparisonColumn>
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
        {name}
      </ReleaseItem>
    ));
  }

  private renderComparison(comparison: CompareBranchesResult) {
    return comparison.commits.map(commit => (
      <CommitItem key={commit.sha}>{commit.commit.message}</CommitItem>
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
