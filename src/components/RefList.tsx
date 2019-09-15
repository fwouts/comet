import { faCodeBranch, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react";
import React, { useContext } from "react";
import styled from "styled-components";
import { RouterContext } from "../routing";
import { LoadedState } from "../store/loadable";
import { RefsState, RepoState } from "../store/repo";
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

export const RefList: React.FC<{
  state: RepoState;
}> = observer(({ state }) => {
  const router = useContext(RouterContext);

  return (
    <Container>
      {state.refs.status === "loaded" && renderRefs(state.refs)}
      {state.refs.status === "loading" && Spinner}
    </Container>
  );

  function renderRefs(refs: LoadedState<RefsState>) {
    return refs.loaded.refs.map(ref => (
      <RefItem
        key={ref.name}
        selected={state.selectedRefName === ref.name}
        onClick={() => selectRef(ref.name)}
      >
        <FontAwesomeIcon icon={ref.kind === "branch" ? faCodeBranch : faTag} />{" "}
        {ref.name}
      </RefItem>
    ));
  }

  function selectRef(refName: string) {
    if (state.refs.status !== "loaded") {
      return;
    }
    const refs = state.refs.loaded.refs;
    const refIndex = refs.findIndex(r => r.name === refName);
    const compareToRefName =
      refIndex === refs.length - 1
        ? refs[refIndex - 1].name
        : refs[refIndex + 1].name;
    return router.navigate(state.owner, state.repo, refName, compareToRefName);
  }
});
