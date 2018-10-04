import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { ParsedPath } from "../routing";
import {
  Dispatch,
  fetchReposAction,
  updateSelectedRepoAction
} from "../store/actions";
import { CurrentRepoState, State } from "../store/state";
import CurrentRepo from "./CurrentRepo";
import RepoPicker from "./RepoPicker";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

class App extends React.Component<{
  path: ParsedPath;
  currentRepo?: CurrentRepoState;
  loadRepos(): void;
  updateSelectedRepo(owner: string, repo: string): void;
}> {
  public componentDidMount() {
    this.updateSelectedRepo();
    this.props.loadRepos();
  }

  public componentDidUpdate() {
    this.updateSelectedRepo();
  }

  public render = () => (
    <Container>
      <RepoPicker />
      {this.props.currentRepo && <CurrentRepo />}
    </Container>
  );

  private updateSelectedRepo() {
    if (this.props.path) {
      this.props.updateSelectedRepo(
        this.props.path.owner,
        this.props.path.repo
      );
    }
  }
}

const mapStateToProps = (state: State) => ({
  currentRepo: state.currentRepo
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadRepos: () => dispatch(fetchReposAction()),
  updateSelectedRepo: (owner: string, repo: string) =>
    dispatch(updateSelectedRepoAction(owner, repo))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
