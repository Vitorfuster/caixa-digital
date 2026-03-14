import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background-color: #f4f6f9;
  padding: 30px;
  font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

export const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Sheets = styled.div`
  display: flex;
  flex-direction: row;
  gap: 30px;
  width: 100%;
  
  @media (max-width: 1400px) {
    flex-direction: column;
  }
`;

export const SheetCard = styled.div`
  flex: 1;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 25px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const SheetGas = styled(SheetCard)`
  border-top: 6px solid #e67e22;
`;

export const SheetWater = styled(SheetCard)`
  border-top: 6px solid #2980b9;
`;

export const SectionTitle = styled.h2`
  color: ${(props) => props.themeColor || "#333"};
  margin-top: 0;
  margin-bottom: 25px;
  text-align: center;
  font-size: 26px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  font-weight: 700;
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #eaedf1;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
`;

export const THead = styled.thead`
  background-color: ${(props) => props.themeColor || "#eee"};
  color: #ffffff;
`;

export const TBody = styled.tbody``;

export const Tr = styled.tr`
  border-bottom: 1px solid #eaedf1;
  
  &:nth-child(even) {
    background-color: #fcfcfd;
  }
`;

export const Th = styled.th`
  padding: 14px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

export const Td = styled.td`
  padding: 0;
  font-size: 14px;
  color: #495057;
  height: 44px;
  border-right: 1px solid #f1f4f8;
  
  &:last-child {
    border-right: none;
  }
`;

export const CellInput = styled.input`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: none;
  background: transparent;
  outline: none;
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  font-family: inherit;
  
  &:focus {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: inset 0 0 0 2px ${(props) => props.focusColor || '#000'};
  }
`;
