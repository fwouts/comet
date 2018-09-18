import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Dispatch, fetchRefsAction } from "../store/actions";
import { CommitsState, State } from "../store/state";
import Comparison from "./Comparison";
import RefList from "./RefList";

const RootContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  height: 100vh;
  background: #fff;
`;

class CurrentRepo extends React.Component<{
  comparison?: CommitsState;
  loadRefs(): void;
}> {
  public componentDidMount() {
    this.props.loadRefs();
  }

  public render() {
    return (
      <RootContainer>
        <RefList />
        {this.props.comparison && <Comparison />}
      </RootContainer>
    );
  }
}

const mapStateToProps = (state: State) => ({
  comparison:
    state.currentRepo && state.currentRepo.refs.status === "loaded"
      ? state.currentRepo.refs.comparison
      : undefined
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadRefs: () => dispatch(fetchRefsAction())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentRepo);
