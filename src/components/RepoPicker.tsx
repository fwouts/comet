import { observer } from "mobx-react";
import React, { useContext } from "react";
import Select from "react-select";
import styled from "styled-components";
import { RouterContext } from "../routing";
import { AppState } from "../store/app";
import Spinner from "./Spinner";

const Container = styled.div`
  padding: 8px;
`;

export const RepoPicker: React.FC<{
  state: AppState;
}> = observer(({ state }) => {
  const router = useContext(RouterContext);
  if (state.suggestedRepositories.status !== "loaded") {
    return Spinner;
  }
  const suggested = state.suggestedRepositories.loaded;
  const options = suggested.map(r => ({
    value: `${r.owner}/${r.repo}`,
    label: `${r.owner}/${r.repo}`
  }));
  const currentRepo = state.currentRepo
    ? `${state.currentRepo.owner}/${state.currentRepo.repo}`
    : undefined;
  const selectedOption = options.find(option => option.value === currentRepo);
  return (
    <Container>
      <Select
        placeholder="Select a GitHub repo"
        options={options}
        isOptionSelected={option => option.value === currentRepo}
        onChange={(option: any) => {
          if (!option || option instanceof Array) {
            return;
          }
          const [owner, repo] = option.value.split("/", 2);
          router.navigate(owner, repo);
        }}
        value={selectedOption}
      />
    </Container>
  );
});
