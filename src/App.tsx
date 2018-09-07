import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
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
  height: 100vh;
`;

const ReleasesColumn = styled.ul`
  width: 300px;
  list-style: none;
  margin: 0;
  padding: 0;
  background: #333;
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
