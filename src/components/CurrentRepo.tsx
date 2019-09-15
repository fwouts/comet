import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";
import { RepoState } from "../store/repo";
import { Comparison } from "./Comparison";
import { RefList } from "./RefList";

const RootContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  height: 100vh;
  background: #fff;
`;

export const CurrentRepo: React.FC<{
  state: RepoState;
}> = observer(({ state }) => (
  <RootContainer>
    <RefList state={state} />
    <Comparison state={state} />
  </RootContainer>
));
