import styled from "styled-components";

const getColumnWidth = (col) => {
  switch (col) {
    case "id": return "40px";
    case "local": return "100px";
    case "produto": return "160px";
    case "quantidade": return "65px";
    case "preco": return "110px";
    case "desconto": return "110px";
    case "total": return "120px";
    case "dinheiro": return "120px";
    case "cartao": return "120px";
    case "pix": return "120px";
    case "obs": return "100%";
    default: return "auto";
  }
};

export const Container = styled.div`
  min-height: 100vh;
  background-color: #f4f6f9;
  padding: 15px;
  font-family: "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
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
  flex-direction: ${(props) => (props.isFullWidth ? "column" : "row")};
  gap: 10px;
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
  padding: 10px;
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
  margin: 0 auto;
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
  padding: 8px 12px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  width: ${(props) => getColumnWidth(props.colName)};
`;

export const Td = styled.td`
  padding: 0;
  font-size: 14px;
  color: #495057;
  height: 44px;
  border-right: 1px solid #f1f4f8;
  width: ${(props) => getColumnWidth(props.colName)};
  ${(props) => props.colName === "obs" && `min-width: 200px;`}

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
  padding: 10px 0px;
  font-size: 14px;
  color: #333;
  font-family: inherit;
  text-align: center;

  &:focus {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: inset 0 0 0 2px ${(props) => props.focusColor || "#000"};
  }
`;

export const CellSelect = styled.select`
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
  appearance: none;
  cursor: pointer;

  &:focus {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: inset 0 0 0 2px ${(props) => props.focusColor || "#000"};
  }
`;

export const ActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const LeftActions = styled.div`
  display: flex;
  gap: 20px;
`;

export const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export const AddMovementBtn = styled(ActionButton)`
  background-color: #27ae60;
`;

export const RegisterExpenseBtn = styled(ActionButton)`
  background-color: #e74c3c;
`;

export const ChangeLayoutBtn = styled(ActionButton)`
  background-color: #8e44ad;
`;

export const CloseBoxBtn = styled(ActionButton)`
  background-color: #f39c12;
  font-size: 18px;
  padding: 14px 30px;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

export const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

export const Label = styled.label`
  margin-bottom: 5px;
  font-weight: 600;
  color: #34495e;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

export const Select = styled.select`
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

export const SaveBtn = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #2980b9;
  }
`;

export const CancelBtn = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #7f8c8d;
  }
`;

export const ExpensesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
`;

export const ExpenseItem = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid gray;
  background-color: #f4f6f9;
`;

export const ExpenseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 15px;
  color: #2c3e50;
`;

export const ExpenseDesc = styled.span`
  font-weight: 500;

  span {
    padding: 4px 4px;
    border-radius: 5px;
    font-weight: 650;
    margin-right: 10px;
  }
`;

export const ExpenseValue = styled.span`
  color: #e74c3c;
  font-weight: 700;
`;

export const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: #fdeaea;
    transform: scale(1.1);
  }
`;
