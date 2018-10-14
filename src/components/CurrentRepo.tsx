import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Dispatch } from "../store/actions";
import { ComparisonState, State } from "../store/state";
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
  comparison?: ComparisonState;
}> {
  public render = () => (
    <RootContainer>
      <RefList />
      {this.props.comparison && <Comparison />}
    </RootContainer>
  );
}

const mapStateToProps = (state: State) => ({
  comparison: state.currentRepo ? state.currentRepo.comparison : undefined
});

const mapDispatchToProps = (dispatch: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentRepo);
