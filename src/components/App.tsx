import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";
import { AppState } from "../store/app";
import { CurrentRepo } from "./CurrentRepo";
import { RepoPicker } from "./RepoPicker";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const App: React.FC<{
  state: AppState;
}> = observer(({ state }) => (
  <Container>
    <RepoPicker state={state} />
    {state.currentRepo && <CurrentRepo state={state.currentRepo} />}
  </Container>
));
