import * as React from "react";
import { connect } from "react-redux";
import "./App.css";
import { Dispatch, fetchReleasesAction } from "./store/actions";
import { ReleaseBranchesState, State } from "./store/state";

class App extends React.Component<{
  releaseBranches: ReleaseBranchesState;
  loadReleases: () => void;
}> {
  public componentDidMount() {
    this.props.loadReleases();
  }

  public render() {
    return (
      <div className="App">
        <p>{this.props.releaseBranches.status}</p>
        <ul>
          {this.props.releaseBranches.names.map(name => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  releaseBranches: state.releaseBranches
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadReleases: () => dispatch(fetchReleasesAction())
});

const ConnectedApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default ConnectedApp;
