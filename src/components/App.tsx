import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Dispatch, fetchReposAction } from "../store/actions";
import { CurrentRepoState, State } from "../store/state";
import CurrentRepo from "./CurrentRepo";
import RepoPicker from "./RepoPicker";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

class App extends React.Component<{
  currentRepo?: CurrentRepoState;
  loadRepos(): void;
}> {
  public componentDidMount() {
    this.props.loadRepos();
  }

  public render = () => (
    <Container>
      <RepoPicker />
      {this.props.currentRepo && <CurrentRepo />}
    </Container>
  );
}

const mapStateToProps = (state: State) => ({
  currentRepo: state.currentRepo
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadRepos: () => dispatch(fetchReposAction())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
