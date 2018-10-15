import React from "react";
import { connect } from "react-redux";
import Select from "react-select";
import styled from "styled-components";
import { Dispatch, navigateToRepoAction } from "../store/actions";
import { Loadable, ReposState, State } from "../store/state";
import Spinner from "./Spinner";

const Container = styled.div`
  padding: 8px;
`;

class RepoPicker extends React.Component<{
  repos: Loadable<ReposState>;
  currentRepo?: string;
  navigateToRepo(repo: string): void;
}> {
  public render() {
    if (this.props.repos.status !== "loaded") {
      return Spinner;
    }
    const options = this.props.repos.suggested.map(r => ({
      value: `${r.owner}/${r.repo}`,
      label: `${r.owner}/${r.repo}`
    }));
    const selectedOption = options.find(
      option => option.value === this.props.currentRepo
    );
    return (
      <Container>
        <Select
          placeholder="Select a GitHub repo"
          options={options}
          isOptionSelected={option => option.value === this.props.currentRepo}
          onChange={option =>
            option &&
            !(option instanceof Array) &&
            this.props.navigateToRepo(option.value)
          }
          value={selectedOption}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: State) => ({
  repos: state.repos,
  currentRepo: state.currentRepo
    ? `${state.currentRepo.owner}/${state.currentRepo.repo}`
    : undefined
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToRepo: (fullRepo: string) => {
    const [owner, repo] = fullRepo.split("/", 2);
    dispatch(navigateToRepoAction(owner, repo));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RepoPicker);
