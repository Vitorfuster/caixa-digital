import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2rem 1rem;
  background-color: #f7f9fc;
  min-height: 100vh;
`;

export const Header = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ff6a00; /* Laranja tema */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
  max-width: 900px;
  background-color: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
`;

export const TableSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h2 {
    font-size: 1.5rem;
    color: #1e3a8a; /* Azul tema */
    font-weight: 600;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
`;

export const Thead = styled.thead`
  background-color: #1e3a8a; /* Azul escuro */
  color: #ffffff;
  
  tr {
    th {
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-size: 0.85rem;
      padding: 1rem;
      text-align: left;
    }
  }
`;

export const Tbody = styled.tbody`
  tr {
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f1f5f9;
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

export const Th = styled.th``;

export const Td = styled.td`
  padding: 1rem;
  color: #334155;
  font-size: 0.95rem;

  &:first-child {
    font-weight: 600;
    color: #0f172a;
  }
`;
