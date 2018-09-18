import { faCodeBranch, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Dispatch, selectRefAction } from "../store/actions";
import {
  EMPTY_STATE,
  Loadable,
  LoadedState,
  RefsState,
  State
} from "../store/state";
import Spinner from "./Spinner";

const Container = styled.ul`
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

class RefList extends React.Component<{
  refs: Loadable<RefsState>;
  selectRef(refName: string): void;
}> {
  public render = () => (
    <Container>
      {this.props.refs.status === "loaded" && this.renderRefs(this.props.refs)}
      {this.props.refs.status === "loading" && Spinner}
    </Container>
  );

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
}

const mapStateToProps = (state: State) => ({
  refs: state.currentRepo ? state.currentRepo.refs : EMPTY_STATE
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  selectRef: (refName: string) => dispatch(selectRefAction(refName))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RefList);
