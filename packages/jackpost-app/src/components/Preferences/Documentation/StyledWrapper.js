import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 44rem;
  overflow-y: auto;
  color: ${(props) => props.theme.text};

  .docs-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .docs-nav-link {
    padding: 0.25rem 0.625rem;
    border: 1px solid ${(props) => props.theme.border.border1};
    border-radius: ${(props) => props.theme.border.radius.md};
    color: ${(props) => props.theme.textLink};
    font-size: ${(props) => props.theme.font.size.sm};

    &:hover {
      background-color: ${(props) => props.theme.background.mantle};
    }
  }

  .docs-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h3 {
      margin: 0;
      font-size: ${(props) => props.theme.font.size.base};
      font-weight: 600;
    }

    p,
    li {
      line-height: 1.5;
    }

    ul {
      margin: 0;
      padding-left: 1.25rem;
      list-style: disc;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    pre {
      margin: 0;
      padding: 0.75rem;
      overflow-x: auto;
      background-color: ${(props) => props.theme.background.mantle};
      border: 1px solid ${(props) => props.theme.border.border1};
      border-radius: ${(props) => props.theme.border.radius.md};
      font-size: ${(props) => props.theme.font.size.sm};
    }
  }
`;

export default StyledWrapper;
