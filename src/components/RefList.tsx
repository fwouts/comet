import { faCodeBranch, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { Dispatch, navigateToRefAction } from "../store/actions";
import {
  CurrentRepoState,
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
  currentRepo?: CurrentRepoState;
  refs: Loadable<RefsState>;
  selectedRefName?: string;
  selectRef(currentRepo: CurrentRepoState, refName: string): void;
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
        selected={this.props.selectedRefName === ref.name}
        onClick={() => this.props.selectRef(this.props.currentRepo!, ref.name)}
      >
        <FontAwesomeIcon icon={ref.kind === "branch" ? faCodeBranch : faTag} />{" "}
        {ref.name}
      </RefItem>
    ));
  }
}

const mapStateToProps = (state: State) => ({
  currentRepo: state.currentRepo,
  refs: state.currentRepo ? state.currentRepo.refs : EMPTY_STATE,
  selectedRefName: state.currentRepo
    ? state.currentRepo.selectedRefName
    : undefined
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  selectRef: (currentRepo: CurrentRepoState, refName: string) => {
    if (currentRepo.refs.status !== "loaded") {
      return;
    }
    const refIndex = currentRepo.refs.refs.findIndex(r => r.name === refName);
    const compareToRefName =
      refIndex === currentRepo.refs.refs.length - 1
        ? currentRepo.refs.refs[refIndex - 1].name
        : currentRepo.refs.refs[refIndex + 1].name;
    return dispatch(
      navigateToRefAction(
        currentRepo.owner,
        currentRepo.repo,
        refName,
        compareToRefName
      )
    );
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RefList);
