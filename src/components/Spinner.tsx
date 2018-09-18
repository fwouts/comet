import * as React from "react";
import { ClipLoader } from "react-spinners";
import styled from "styled-components";

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 16px;
`;

const Spinner = (
  <SpinnerContainer>
    <ClipLoader color="#6da" size={150} />
  </SpinnerContainer>
);

export default Spinner;
