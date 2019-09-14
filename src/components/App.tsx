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
}> = observer(props => (
  <Container>
    <RepoPicker state={props.state} />
    {props.state.currentRepo && <CurrentRepo state={props.state.currentRepo} />}
  </Container>
));
