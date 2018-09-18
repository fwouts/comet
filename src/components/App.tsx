import * as React from "react";
import { connect } from "react-redux";
import { Dispatch, fetchReposAction } from "../store/actions";
import { State } from "../store/state";
import CurrentRepo from "./CurrentRepo";

class App extends React.Component<{
  loadRepos(): void;
}> {
  public componentDidMount() {
    this.props.loadRepos();
  }

  public render() {
    return <CurrentRepo />;
  }
}

const mapStateToProps = (state: State) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadRepos: () => dispatch(fetchReposAction())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
