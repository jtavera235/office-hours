import { Button } from "antd";
import styled from "styled-components";

const Container = styled.div`
  height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.div`
  text-align: center;
`;

export default function Login() {
  return (
    <Container>
      <ContentContainer>
        <h1>You are currently not logged in</h1>
        <p>Click the button below to login via Khoury Admin</p>
        {/* TODO: Update link with specific page in Khoury admin once it's created */}
        <Button href="https://admin.khoury.northeastern.edu/">
          Login with Khoury
        </Button>
      </ContentContainer>
    </Container>
  );
}
