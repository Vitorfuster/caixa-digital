// Bibliotecas
import React, { useEffect, useState } from "react";
import { replace, useSearchParams, useNavigate } from "react-router-dom";
import SHA256 from "crypto-js/sha256";

// API
import api from "../../services/api";

import {
  Container,
  Header,
  Title,
  Content,
  Sheets,
  SheetGas,
  SheetWater,
  SectionTitle,
  TableWrapper,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  CellInput,
  ActionContainer,
  AddMovementBtn,
  RegisterExpenseBtn,
  ModalOverlay,
  ModalContent,
  ModalTitle,
  InputGroup,
  Label,
  Input,
  Select,
  ButtonContainer,
  SaveBtn,
  CancelBtn,
  ExpensesList,
  ExpenseItem,
  ExpenseInfo,
  ExpenseDesc,
  ExpenseValue,
  DeleteButton,
} from "./style";
import { formatDate } from "../../utils/FomatData";

export function Daily() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const columsNumber = 30;

  // Váriaveis de urls opcionais
  const day = searchParams.get("day");
  if (!day) {
    const data = new Date();
    const dataFormatada = formatDate(data).replaceAll("/", "-");
    window.location.replace(`daily?day=${dataFormatada}`);
  }

  const columns = [
    "id",
    "local",
    "produto",
    "quantidade",
    "preco",
    "desconto",
    "dinheiro",
    "cartao",
    "pix",
    "obs",
  ];

  const buildInitialState = () => {
    return Array.from({ length: columsNumber }, (_, index) => ({
      id: index + 1,
      id_db: "",
      local: "",
      produto: "",
      quantidade: "",
      preco: "",
      desconto: "",
      dinheiro: "",
      cartao: "",
      pix: "",
      obs: "",
      save_id: "",
      date: "",
    }));
  };

  const [itens, setItens] = useState();

  // Itens das planilhas
  const [gas, setGas] = useState(buildInitialState());
  const [water, setWater] = useState(buildInitialState());

  const [change, setChange] = useState(0); // Marca se tem alguma mudança feita
  const [timer, setTimer] = useState(0);

  // Novos estados para o modal e despesas
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseValue, setExpenseValue] = useState("");

  // Novos estados para o modal de movimentações
  const [isMovModalOpen, setIsMovModalOpen] = useState(false);
  const [movItem, setMovItem] = useState("");
  const [movType, setMovType] = useState("in");
  const [movQuantity, setMovQuantity] = useState("");
  const [movements, setMovements] = useState([]);

  // Busca dados no back_end
  useEffect(() => {
    const getItens = async () => {
      try {
        const { data: item } = await api.get("/item");

        setItens(item);
      } catch (error) {
        console.log("Erro ao buscar itens: ", error);
      }
    };

    const getDaily = async () => {
      // Busca a diária no banco de dados como array
      const { data: daily } = await api.get(`/daily/${criarData(day)}`);

      if (daily.length > 0) {
        // Formata a diária para o mmodelo usado no front_end
        const daily_formated = daily.map((item) => {
          const newItem = {
            id: Number(item.id.split("-")[1]),
            id_db: item.id,
            local:
              item.location === null || item.location === undefined
                ? ""
                : item.location,
            produto:
              item.item_id === null || item.item_id === undefined
                ? ""
                : item.item_id,
            quantidade:
              item.quantity === null || item.quantity === undefined
                ? ""
                : item.quantity,
            preco:
              item.price === null || item.price === undefined ? "" : item.price,
            desconto:
              item.discount === null || item.discount === undefined
                ? ""
                : item.discount,
            dinheiro:
              item.money === null || item.money === undefined ? "" : item.money,
            cartao:
              item.card === null || item.card === undefined ? "" : item.card,
            pix: item.pix === null || item.pix === undefined ? "" : item.pix,
            obs:
              item.observation === null || item.observation === undefined
                ? ""
                : item.observation,
            save_id:
              item.save_id === null || item.save_id === undefined
                ? ""
                : item.save_id,
            date:
              item.date === null || item.date === undefined ? "" : item.date,
          };

          return newItem;
        });

        // Filtra as linhas para adicionar os itens nos lugares certos
        const newGas = gas.map((item) => {
          const newDaily = daily_formated.filter(
            (dailyItem) => dailyItem.id === item.id,
          );

          if (newDaily.length > 0) {
            let elementReturn;

            newDaily.forEach((element) => {
              if (element.id_db.split("-")[2] === "GAS") {
                elementReturn = element;
              } else {
                return item;
              }
            });

            return elementReturn;
          } else {
            return item;
          }
        });

        const newWater = water.map((item) => {
          const newDaily = daily_formated.filter(
            (dailyItem) => dailyItem.id === item.id,
          );

          if (newDaily.length > 0) {
            let elementReturn;

            newDaily.forEach((element) => {
              if (element.id_db.split("-")[2] === "WATER") {
                elementReturn = element;
              } else {
                return item;
              }
            });

            return elementReturn;
          } else {
            return item;
          }
        });

        setGas(newGas);
        setWater(newWater);
      }
    };

    const getExpenses = async () => {
      try {
        const { data: expensesResponse } = await api.get(
          `expense/${criarData(day)}`,
        );

        if (expensesResponse.length > 0) {
          setExpenses(expensesResponse);
        }
      } catch (error) {}
    };

    const getMovement = async () => {
      try {
        const { data: movementsResponse } = await api.get(
          `movement/${criarData(day)}`,
        );

        if (movementsResponse.length > 0) {
          setMovements(movementsResponse);
        }
      } catch (error) {}
    };

    getItens();
    getMovement();
    getExpenses();
    getDaily();
  }, []);
  // Temporizador
  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (change === 1) {
      setChange(0);
      verification();
    }
  }, [timer]);

  // Função de verificação e envio
  const verification = async () => {
    let sendPost = [];
    let sendPut = [];

    // Verifica item por item, adiciona save_id nos novos itens marcados, confere se algum item foi atualizado, após isso integra arrays com os itens novos e os atualizados.

    const sendGas = gas.map((item) => {
      if (item.save_id !== "") {
        const saveHash = SHA256(
          `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
        ).toString();

        if (item.save_id !== saveHash) {
          const newItem = {
            ...item,
            id_db: `LINE-${item.id}-GAS-${day}`,
            date: criarData(day),
            save_id: saveHash,
          };

          sendPut.push(newItem);
          return newItem;
        } else {
          return item;
        }
      } else if (
        item.save_id === "" &&
        (item.local !== "" ||
          item.produto !== "" ||
          item.quantidade !== "" ||
          item.preco !== "" ||
          item.desconto !== "" ||
          item.dinheiro !== "" ||
          item.cartao !== "" ||
          item.pix !== "" ||
          item.obs !== "")
      ) {
        const newItem = {
          ...item,
          id_db: `LINE-${item.id}-GAS-${day}`,
          date: criarData(day),
          save_id: SHA256(
            `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
          ).toString(),
        };

        sendPost.push(newItem);
        return newItem;
      } else {
        return item;
      }
    });

    const sendWater = water.map((item) => {
      if (item.save_id !== "") {
        const saveHash = SHA256(
          `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
        ).toString();

        if (item.save_id !== saveHash) {
          const newItem = {
            ...item,
            id_db: `LINE-${item.id}-WATER-${day}`,
            date: criarData(day),
            save_id: saveHash,
          };

          sendPut.push(newItem);
          return newItem;
        } else {
          return item;
        }
      } else if (
        item.save_id === "" &&
        (item.local !== "" ||
          item.produto !== "" ||
          item.quantidade !== "" ||
          item.preco !== "" ||
          item.desconto !== "" ||
          item.dinheiro !== "" ||
          item.cartao !== "" ||
          item.pix !== "" ||
          item.obs !== "")
      ) {
        const newItem = {
          ...item,
          id_db: `LINE-${item.id}-WATER-${day}`,
          date: criarData(day),
          save_id: SHA256(
            `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
          ).toString(),
        };

        sendPost.push(newItem);
        return newItem;
      } else {
        return item;
      }
    });

    setGas(sendGas);
    setWater(sendWater);

    // Verifica se o item está salvo

    if (sendPost.length > 0) {
      console.log("itens para enviar: ", sendPost);

      try {
        const response = await api.post("/daily", { daily: sendPost });

        console.log("response back_end", response);
      } catch (error) {
        console.log("deu errado");
        console.log(error);
      }
    }

    if (sendPut.length > 0) {
      console.log("itens para atualizar: ", sendPut);

      try {
        const response = await api.put("/daily", { daily: sendPut });

        console.log("response back_end", response);
      } catch (error) {
        console.log("deu errado");
        console.log(error);
      }
    }

    //
  };

  // Função de registro gás
  const handleGasChange = (index, field, value) => {
    const newGas = [...gas];
    newGas[index] = { ...newGas[index], [field]: value };
    setGas(newGas);

    setChange(1); //
    if (timer === 0) {
      setTimer(5);
    }
  };

  // Função de registro água
  const handleWaterChange = (index, field, value) => {
    const newWater = [...water];
    newWater[index] = { ...newWater[index], [field]: value };
    setWater(newWater);

    setChange(1);
    if (timer === 0) {
      setTimer(5);
    }
  };

  function criarData(dataString) {
    const partes = dataString.split("-");

    if (partes.length !== 3) return null;

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);

    const data = new Date(ano, mes - 1, dia);

    // valida se a data realmente existe
    if (
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      return null;
    }

    return data;
  }

  const handleDeleteExpense = async (idToRemove) => {
    try {
      await api.delete(`/expense/${idToRemove}`);
      setExpenses(expenses.filter((expense) => expense.id !== idToRemove));
    } catch (error) {
      console.log("Erro ao apagar despesa: ", error);
    }
  };

  const handleSaveExpense = async () => {
    if (!expenseDescription || !expenseValue) return;

    const newExpense = {
      id: `LINE-${expenses.length + 1}-EXPENSE-${day}`,
      description: expenseDescription,
      value: parseFloat(expenseValue.replace(",", ".")),
      date: criarData(day),
    };

    try {
      await api.post("/expense", newExpense);

      setExpenses([...expenses, newExpense]);

      setExpenseDescription("");
      setExpenseValue("");
      setIsModalOpen(false);
    } catch (error) {
      console.log("Erro ao salvar despesas: ", error);
      setIsModalOpen(false);
    }
  };

  const handleDeleteMovement = async (idToRemove) => {
    try {
      await api.delete(`/movement/${idToRemove}`);
    } catch (error) {
      console.log("Erro ao apagar movimentação: ", error);
    }
    setMovements(movements.filter((movement) => movement.id !== idToRemove));
  };

  const handleSaveMovement = async () => {
    if (!movItem || !movType || !movQuantity) return;

    const newMovement = {
      id: `LINE-${movements.length + 1}-MOVEMENT-${day}`,
      item_id: Number(movItem),
      type: movType,
      quantity: Number(movQuantity),
      date: criarData(day),
    };

    try {
      await api.post("/movement", newMovement);

      setMovements([...movements, newMovement]);

      setMovItem("");
      setMovType("in");
      setMovQuantity("");
      setIsMovModalOpen(false);
    } catch (error) {
      console.log("Erro ao salvar movimentações: ", error);
      setIsMovModalOpen(false);
    }
  };

  console.log(movements);

  // PRECISO AGORA FAZER O BOTÃO ADICIONAR MOVIMENTAÇÃO FUNCIONAR, AO SER CLICADO ELE DEVE ADICIONAR AS MOVIMENTAÇÕES E BAIXAR DO ESTOQUE, ELE TERA O CAMPO ITEM COMO SELECT PARA SER O ITEM DO ESTOQUE QUE ESTÁ SENDO MOVIMENTADO

  // APOS ISSO, DEVO FORMATAR OS CAMPOS DA PLANILHA, ALGUNS VÃO SER SELECT, OUTROS VÃO ACEITAR SOMENTE UM TIPO DE DADOS

  // APOS ISSO, DEVO CONSTRUIR A PÁGINA DE FECHAMENTO DE CAIXA

  return (
    <Container>
      <Header>
        <Title>Ferreira Gás e Água - Controle Diário</Title>
      </Header>
      <Content>
        <ActionContainer>
          <AddMovementBtn onClick={() => setIsMovModalOpen(true)}>
            Adicionar Movimentação
          </AddMovementBtn>
          <RegisterExpenseBtn onClick={() => setIsModalOpen(true)}>
            Registrar Despesas
          </RegisterExpenseBtn>
        </ActionContainer>

        {movements.length > 0 && (
          <ExpensesList>
            {movements.map((movement) => {
              const itemInfo = itens?.find((i) => i.id === movement.item_id);
              const itemName = itemInfo ? itemInfo.name : "Item Desconhecido";

              return (
                <ExpenseItem key={movement.id}>
                  <ExpenseInfo>
                    <ExpenseDesc>
                      <span
                        style={{
                          backgroundColor:
                            movement.type === "in" ? "#d4edda" : "#f8d7da",
                          color: movement.type === "in" ? "#155724" : "#721c24",
                        }}
                      >
                        {movement.type === "in" ? "ENTRADA" : "SAÍDA"}
                      </span>{" "}
                      {itemName}
                    </ExpenseDesc>
                    <ExpenseValue
                      style={{
                        color: movement.type === "in" ? "#27ae60" : "#e74c3c",
                      }}
                    >
                      {movement.type === "in" ? "+ " : "- "}
                      {movement.quantity}
                    </ExpenseValue>
                  </ExpenseInfo>
                  <DeleteButton
                    onClick={() => handleDeleteMovement(movement.id)}
                    title="Excluir movimentação"
                  >
                    X
                  </DeleteButton>
                </ExpenseItem>
              );
            })}
          </ExpensesList>
        )}

        {expenses.length > 0 && (
          <ExpensesList>
            {expenses.map((expense) => (
              <ExpenseItem key={expense.id}>
                <ExpenseInfo>
                  <ExpenseDesc>
                    <span
                      style={{
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                      }}
                    >
                      DESPESA
                    </span>{" "}
                    {expense.description}
                  </ExpenseDesc>
                  <ExpenseValue>
                    R$ {Number(expense.value).toFixed(2).replace(".", ",")}
                  </ExpenseValue>
                </ExpenseInfo>
                <DeleteButton
                  onClick={() => handleDeleteExpense(expense.id)}
                  title="Excluir despesa"
                >
                  X
                </DeleteButton>
              </ExpenseItem>
            ))}
          </ExpensesList>
        )}

        <Sheets>
          <SheetGas>
            <SectionTitle themeColor="#e67e22">Gás</SectionTitle>
            <TableWrapper>
              <Table>
                <THead themeColor="#e67e22">
                  <Tr>
                    {columns.map((col) => (
                      <Th key={col}>{col}</Th>
                    ))}
                  </Tr>
                </THead>

                <TBody>
                  {gas.map((row, i) => (
                    <Tr key={`gas-${i}`}>
                      {columns.map((col) => (
                        <Td key={`gas-${i}-${col}`}>
                          {col === "ID" ? (
                            <div
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                              }}
                            >
                              {row.id}
                            </div>
                          ) : (
                            <CellInput
                              type="text"
                              focusColor="#e67e22"
                              value={row[col]}
                              onChange={(e) =>
                                handleGasChange(i, col, e.target.value)
                              }
                            />
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableWrapper>
          </SheetGas>

          <SheetWater>
            <SectionTitle themeColor="#2980b9">Água</SectionTitle>
            <TableWrapper>
              <Table>
                <THead themeColor="#2980b9">
                  <Tr>
                    {columns.map((col) => (
                      <Th key={col}>{col}</Th>
                    ))}
                  </Tr>
                </THead>
                <TBody>
                  {water.map((row, i) => (
                    <Tr key={`water-${i}`}>
                      {columns.map((col) => (
                        <Td key={`water-${i}-${col}`}>
                          {col === "ID" ? (
                            <div
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                              }}
                            >
                              {row.id}
                            </div>
                          ) : (
                            <CellInput
                              type="text"
                              focusColor="#2980b9"
                              value={row[col]}
                              onChange={(e) =>
                                handleWaterChange(i, col, e.target.value)
                              }
                            />
                          )}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableWrapper>
          </SheetWater>
        </Sheets>
      </Content>
      <button
        onClick={() => {
          console.log(2);
        }}
      >
        console.log
      </button>

      {isModalOpen && (
        <ModalOverlay
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <ModalContent>
            <ModalTitle>Nova Despesa</ModalTitle>
            <InputGroup>
              <Label>Descrição</Label>
              <Input
                type="text"
                placeholder="Ex: Pagamento de fornecedor"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <Label>Valor</Label>
              <Input
                type="number"
                placeholder="Ex: 50.00"
                value={expenseValue}
                onChange={(e) => setExpenseValue(e.target.value)}
              />
            </InputGroup>
            <ButtonContainer>
              <CancelBtn onClick={() => setIsModalOpen(false)}>
                Cancelar
              </CancelBtn>
              <SaveBtn onClick={handleSaveExpense}>Salvar</SaveBtn>
            </ButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}

      {isMovModalOpen && (
        <ModalOverlay
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMovModalOpen(false);
          }}
        >
          <ModalContent>
            <ModalTitle>Nova Movimentação</ModalTitle>
            <InputGroup>
              <Label>Item</Label>
              <Select
                value={movItem}
                onChange={(e) => setMovItem(e.target.value)}
              >
                <option value="" disabled>
                  Selecione um item
                </option>
                {itens &&
                  itens.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>Tipo</Label>
              <Select
                value={movType}
                onChange={(e) => setMovType(e.target.value)}
              >
                <option value="in">Entrada</option>
                <option value="out">Saída</option>
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>Quantidade</Label>
              <Input
                type="number"
                placeholder="Ex: 10"
                value={movQuantity}
                onChange={(e) => setMovQuantity(e.target.value)}
              />
            </InputGroup>
            <ButtonContainer>
              <CancelBtn onClick={() => setIsMovModalOpen(false)}>
                Cancelar
              </CancelBtn>
              <SaveBtn onClick={handleSaveMovement}>Salvar</SaveBtn>
            </ButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
