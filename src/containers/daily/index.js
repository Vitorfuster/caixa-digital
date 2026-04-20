// Bibliotecas
import React, { useEffect, useState } from "react";
import { replace, useSearchParams, useNavigate } from "react-router-dom";
import SHA256 from "crypto-js/sha256";

import { ToastContainer, toast } from "react-toastify";

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
  CellSelect,
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
  LeftActions,
  ChangeLayoutBtn,
  CloseBoxBtn,
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

  const formatMoney = (val) => {
    if (!val && val !== 0) return "";
    let num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const columns = [
    "id",
    "local",
    "produto",
    "quantidade",
    "preco",
    "desconto",
    "total",
    "dinheiro",
    "cartao",
    "pix",
    "vale",
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
      total: "",
      dinheiro: "",
      cartao: "",
      pix: "",
      obs: "",
      vale: "",
      save_id: "",
      date: "",
    }));
  };

  const getTooltipDate = (createdAt, updatedAt) => {
    if (!createdAt && !updatedAt) return undefined;

    const creatStr = createdAt
      ? new Date(createdAt).toLocaleString("pt-BR")
      : "";
    const updtStr = updatedAt
      ? new Date(updatedAt).toLocaleString("pt-BR")
      : "";

    if (!createdAt) return `Atualização: ${updtStr}`;
    if (!updatedAt) return `Criação: ${creatStr}`;

    if (creatStr === updtStr) {
      return `Atualização: ${updtStr}`;
    }

    return `Criação: ${creatStr}\nAtualização: ${updtStr}`;
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
  const [block, setBlock] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado que controla o layout das planilhas: false = lado a lado / true = 100% largura (empilhada)
  const [isFullWidth, setIsFullWidth] = useState(false);

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
            vale:
              item.vale === null || item.vale === undefined ? "" : item.vale,
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

            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };

          return newItem;
        });

        console.log("dailyCompleta: ", daily_formated);

        // Filtra as linhas para adicionar os itens nos lugares certos
        const newGas = gas.map((item) => {
          const newDaily = daily_formated.filter(
            (dailyItem) => dailyItem.id === item.id,
          );

          if (newDaily.length > 0) {
            let elementReturn;
            let skip = false;

            newDaily.forEach((element) => {
              if (element.id_db.split("-")[2] === "GAS") {
                elementReturn = element;
                skip = true;
              } else {
                if (skip === false) {
                  elementReturn = item;
                }
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
            let skip = false;

            newDaily.forEach((element) => {
              if (element.id_db.split("-")[2] === "WATER") {
                elementReturn = element;
                skip = true;
              } else {
                if (skip === false) {
                  elementReturn = item;
                }
              }
            });

            return elementReturn;
          } else {
            return item;
          }
        });

        console.log("newGas: ", newGas);
        console.log("newWater: ", newWater);

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

        console.log(movementsResponse);

        if (movementsResponse.length > 0) {
          setMovements(movementsResponse);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getItens();
    getMovement();
    getExpenses();
    getDaily();
  }, []);

  // Temporizador
  useEffect(() => {
    if (timer > 0) {
      if (loading === false) {
        const toastId = toast.loading("Atualizando...");
        setLoading(toastId);
      }
      setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (change === 1) {
      if (block === true) {
        setBlock(false);
        setTimer(timer + 3);
      } else {
        setChange(0);
        toast.update(loading, {
          render: "Finalizado!",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        setLoading(false);
        verification();
      }
    }
  }, [timer]);

  console.log(timer);
  console.log("Gás: ", gas);

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
            total:
              item.quantidade && item.preco && item.desconto === ""
                ? item.quantidade * item.preco
                : item.quantidade && item.preco && item.desconto !== ""
                  ? item.quantidade * item.preco - item.desconto
                  : null,
            id_db: `LINE-${item.id}-GAS-${day}`,
            date: criarData(day),
            save_id: saveHash,
            reset: item.reset === 1 ? true : false,

            updatedAt: new Date().toISOString(),
          };

          sendPut.push(newItem);

          // Verifica se a linha foi completamente limpa, caso sim, remove o save_id da linha
          if (
            item.local !== "" ||
            item.produto !== "" ||
            item.quantidade !== "" ||
            item.preco !== "" ||
            item.desconto !== "" ||
            item.dinheiro !== "" ||
            item.cartao !== "" ||
            item.pix !== "" ||
            item.vale !== "" ||
            item.obs !== ""
          ) {
            return newItem;
          } else {
            const resetLine = {
              ...item,
              save_id: "",
              updatedAt: undefined,
              createdAt: undefined,
            };

            return resetLine;
          }
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
          item.vale !== "" ||
          item.obs !== "")
      ) {
        const newItem = {
          ...item,
          total:
            item.quantidade && item.preco && item.desconto === ""
              ? item.quantidade * item.preco
              : item.quantidade && item.preco && item.desconto !== ""
                ? item.quantidade * item.preco - item.desconto
                : null,
          id_db: `LINE-${item.id}-GAS-${day}`,
          date: criarData(day),
          save_id: SHA256(
            `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.obs}`,
          ).toString(),

          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.vale}-${item.obs}`,
        ).toString();

        if (item.save_id !== saveHash) {
          const newItem = {
            ...item,
            total:
              item.quantidade && item.preco && item.desconto === ""
                ? item.quantidade * item.preco
                : item.quantidade && item.preco && item.desconto !== ""
                  ? item.quantidade * item.preco - item.desconto
                  : null,
            id_db: `LINE-${item.id}-WATER-${day}`,
            date: criarData(day),
            save_id: saveHash,
            reset: item.reset === 1 ? true : false,
            updatedAt: new Date().toISOString(),
          };

          sendPut.push(newItem);

          // Verifica se a linha foi completamente limpa, caso sim, remove o save_id da linha
          if (
            item.local !== "" ||
            item.produto !== "" ||
            item.quantidade !== "" ||
            item.preco !== "" ||
            item.desconto !== "" ||
            item.dinheiro !== "" ||
            item.cartao !== "" ||
            item.pix !== "" ||
            item.vale !== "" ||
            item.obs !== ""
          ) {
            return newItem;
          } else {
            const resetLine = {
              ...item,
              save_id: "",
              updatedAt: undefined,
              createdAt: undefined,
            };

            return resetLine;
          }
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
          item.vale !== "" ||
          item.obs !== "")
      ) {
        const newItem = {
          ...item,
          total:
            item.quantidade && item.preco && item.desconto === ""
              ? item.quantidade * item.preco
              : item.quantidade && item.preco && item.desconto !== ""
                ? item.quantidade * item.preco - item.desconto
                : null,
          id_db: `LINE-${item.id}-WATER-${day}`,
          date: criarData(day),
          save_id: SHA256(
            `${item.local}-${item.produto}-${item.quantidade}-${item.preco}-${item.desconto}-${item.dinheiro}-${item.cartao}-${item.pix}-${item.vale}-${item.obs}`,
          ).toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
        await api.post("/daily", { daily: sendPost });
      } catch (error) {
        toast.error("Erro na atualização");
        console.error(error);
      }
    }

    if (sendPut.length > 0) {
      console.log("itens para atualizar: ", sendPut);

      try {
        await api.put("/daily", { daily: sendPut });
      } catch (error) {
        toast.error("Erro na atualização");
        console.error(error);
      }
    }

    //
  };

  // Função de registro gás
  const handleGasChange = (index, field, value) => {
    const newGas = [...gas];
    newGas[index] = {
      ...newGas[index],
      [field]: value,
      reset:
        gas[index].reset === 1 || field === "produto" || field === "quantidade"
          ? 1
          : false,
    };

    if (field === "produto" && value !== "") {
      const selectedItem = itens?.find((item) => item.id === Number(value));
      if (selectedItem && selectedItem.sale_price !== undefined) {
        newGas[index].preco = selectedItem.sale_price;
      }
    }

    setGas(newGas);

    setChange(1); //
    if (timer === 0) {
      setTimer(3);
    }

    setBlock(true);
  };

  // Função de registro água
  const handleWaterChange = (index, field, value) => {
    const newWater = [...water];
    newWater[index] = {
      ...newWater[index],
      [field]: value,
      reset:
        water[index].reset === 1 ||
        field === "produto" ||
        field === "quantidade"
          ? 1
          : false,
    };

    if (field === "produto" && value !== "") {
      const selectedItem = itens?.find((item) => item.id === Number(value));
      if (selectedItem && selectedItem.sale_price !== undefined) {
        newWater[index].preco = selectedItem.sale_price;
      }
    }

    setWater(newWater);

    setChange(1); //
    if (timer === 0) {
      setTimer(3);
    }

    setBlock(true);
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
      await toast.promise(api.delete(`/expense/${idToRemove}`), {
        pending: "Apagando despesa",
        success: "Despesa apagada com sucesso!",
        error: "Erro ao apagar despesa!",
      });

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
      await toast.promise(api.post("/expense", newExpense), {
        pending: "Enviando despesa",
        success: "Despesa enviada com sucesso!",
        error: "Falha ao enviar despesa!",
      });

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
      await toast.promise(api.delete(`/movement/${idToRemove}`), {
        pending: "Apagando Movimentação",
        success: "Movimentação apagada com sucesso!",
        error: "Falha ao apagar enviar Movimentação!",
      });
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
      await toast.promise(api.post("/movement", newMovement), {
        pending: "Enviando Movimentação",
        success: "Movimentação enviada com sucesso!",
        error: "Falha ao enviar enviar Movimentação!",
      });

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

  console.log(gas);

  return (
    <Container>
      <Header>
        <Title>Ferreira Gás e Água - Controle Diário</Title>
        <CloseBoxBtn
          onClick={() => {
            navigate(`/closebox?day=${day}`);
          }}
        >
          Fechar Caixa
        </CloseBoxBtn>
      </Header>
      <Content>
        <ActionContainer>
          <LeftActions>
            <AddMovementBtn onClick={() => setIsMovModalOpen(true)}>
              Adicionar Movimentação
            </AddMovementBtn>
            <RegisterExpenseBtn onClick={() => setIsModalOpen(true)}>
              Registrar Despesas
            </RegisterExpenseBtn>
          </LeftActions>
          <ChangeLayoutBtn onClick={() => setIsFullWidth(!isFullWidth)}>
            Alterar Layout
          </ChangeLayoutBtn>
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

        <Sheets isFullWidth={isFullWidth}>
          <SheetGas>
            <SectionTitle themeColor="#e67e22">Gás</SectionTitle>
            <TableWrapper>
              <Table>
                <THead themeColor="#e67e22">
                  <Tr>
                    {columns.map((col) => (
                      <Th key={col} colName={col}>
                        {col === "quantidade"
                          ? "QTD"
                          : col === "pix"
                            ? "__pix__"
                            : col}
                      </Th>
                    ))}
                  </Tr>
                </THead>

                <TBody>
                  {gas.map((row, i) => (
                    <Tr key={`gas-${i}`}>
                      {columns.map((col) => (
                        <Td key={`gas-${i}-${col}`} colName={col}>
                          {col === "ID" || col === "id" ? (
                            <div
                              title={getTooltipDate(
                                row.createdAt,
                                row.updatedAt,
                              )}
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                                cursor: "default",
                              }}
                            >
                              {row.id}
                            </div>
                          ) : col === "total" ? (
                            <div
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                              }}
                            >
                              {(() => {
                                const qtd = Number(row.quantidade) || 0;
                                const preco = Number(row.preco) || 0;
                                const desc = Number(row.desconto) || 0;
                                const calc = qtd * preco - desc;

                                let textColor = "#333";
                                if (calc > 0) {
                                  let sum = 0;
                                  if (row.dinheiro && Number(row.dinheiro) > 0)
                                    sum += Number(row.dinheiro);
                                  if (row.cartao && Number(row.cartao) > 0)
                                    sum += Number(row.cartao);
                                  if (row.pix && Number(row.pix) > 0)
                                    sum += Number(row.pix);
                                  if (row.vale && Number(row.vale) > 0)
                                    sum += Number(row.vale);

                                  if (Math.abs(calc - sum) < 0.01) {
                                    textColor = "#27ae60"; // verde
                                  } else if (sum > 0) {
                                    textColor = "#e74c3c"; // vermelho
                                  }
                                }

                                return calc > 0 ? (
                                  <span style={{ color: textColor }}>
                                    {formatMoney(calc)}
                                  </span>
                                ) : (
                                  ""
                                );
                              })()}
                            </div>
                          ) : col === "local" ? (
                            <CellSelect
                              focusColor="#e67e22"
                              value={row[col]}
                              onChange={(e) =>
                                handleGasChange(i, col, e.target.value)
                              }
                            >
                              <option value=""></option>
                              <option value="Portaria">Portaria</option>
                              <option value="Entrega">Entrega</option>
                            </CellSelect>
                          ) : col === "produto" ? (
                            <CellSelect
                              focusColor="#e67e22"
                              value={row[col]}
                              onChange={(e) =>
                                handleGasChange(i, col, e.target.value)
                              }
                            >
                              <option value=""></option>
                              {itens &&
                                itens
                                  .filter((item) => item.category === 1)
                                  .map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                            </CellSelect>
                          ) : (
                            <CellInput
                              type="text"
                              focusColor="#e67e22"
                              value={
                                [
                                  "preco",
                                  "desconto",
                                  "dinheiro",
                                  "cartao",
                                  "pix",
                                  "vale",
                                ].includes(col)
                                  ? formatMoney(row[col])
                                  : row[col]
                              }
                              onChange={(e) => {
                                let val = e.target.value;

                                if (col === "quantidade") {
                                  val = val.replace(/\D/g, "");
                                }

                                if (
                                  [
                                    "preco",
                                    "desconto",
                                    "dinheiro",
                                    "cartao",
                                    "pix",
                                    "vale",
                                  ].includes(col)
                                ) {
                                  val = val.replace(/\D/g, "");
                                  if (val !== "") {
                                    if (Number(val) === 0) {
                                      val = "";
                                    } else {
                                      val = (Number(val) / 100).toFixed(2);
                                    }
                                  }
                                }
                                handleGasChange(i, col, val);
                              }}
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
                      <Th key={col} colName={col}>
                        {col === "quantidade"
                          ? "QTD"
                          : col === "pix"
                            ? "__pix__"
                            : col}
                      </Th>
                    ))}
                  </Tr>
                </THead>
                <TBody>
                  {water.map((row, i) => (
                    <Tr key={`water-${i}`}>
                      {columns.map((col) => (
                        <Td key={`water-${i}-${col}`} colName={col}>
                          {col === "ID" || col === "id" ? (
                            <div
                              title={getTooltipDate(
                                row.createdAt,
                                row.updatedAt,
                              )}
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                                cursor: "default",
                              }}
                            >
                              {row.id}
                            </div>
                          ) : col === "total" ? (
                            <div
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                padding: "10px 12px",
                              }}
                            >
                              {(() => {
                                const qtd = Number(row.quantidade) || 0;
                                const preco = Number(row.preco) || 0;
                                const desc = Number(row.desconto) || 0;
                                const calc = qtd * preco - desc;

                                let textColor = "#333";
                                if (calc > 0) {
                                  let sum = 0;
                                  if (row.dinheiro && Number(row.dinheiro) > 0)
                                    sum += Number(row.dinheiro);
                                  if (row.cartao && Number(row.cartao) > 0)
                                    sum += Number(row.cartao);
                                  if (row.pix && Number(row.pix) > 0)
                                    sum += Number(row.pix);
                                  if (row.vale && Number(row.vale) > 0)
                                    sum += Number(row.vale);

                                  if (Math.abs(calc - sum) < 0.01) {
                                    textColor = "#27ae60"; // verde
                                  } else if (sum > 0) {
                                    textColor = "#e74c3c"; // vermelho
                                  }
                                }

                                return calc > 0 ? (
                                  <span style={{ color: textColor }}>
                                    {formatMoney(calc)}
                                  </span>
                                ) : (
                                  ""
                                );
                              })()}
                            </div>
                          ) : col === "local" ? (
                            <CellSelect
                              focusColor="#2980b9"
                              value={row[col]}
                              onChange={(e) =>
                                handleWaterChange(i, col, e.target.value)
                              }
                            >
                              <option value=""></option>
                              <option value="Portaria">Portaria</option>
                              <option value="Entrega">Entrega</option>
                            </CellSelect>
                          ) : col === "produto" ? (
                            <CellSelect
                              focusColor="#2980b9"
                              value={row[col]}
                              onChange={(e) =>
                                handleWaterChange(i, col, e.target.value)
                              }
                            >
                              <option value=""></option>
                              {itens &&
                                itens
                                  .filter((item) => item.category === 2)
                                  .map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.name}
                                    </option>
                                  ))}
                            </CellSelect>
                          ) : (
                            <CellInput
                              type="text"
                              focusColor="#2980b9"
                              value={
                                [
                                  "preco",
                                  "desconto",
                                  "dinheiro",
                                  "cartao",
                                  "pix",
                                  "vale",
                                ].includes(col)
                                  ? formatMoney(row[col])
                                  : row[col]
                              }
                              onChange={(e) => {
                                let val = e.target.value;

                                if (col === "quantidade") {
                                  val = val.replace(/\D/g, "");
                                }

                                if (
                                  [
                                    "preco",
                                    "desconto",
                                    "dinheiro",
                                    "cartao",
                                    "pix",
                                    "vale",
                                  ].includes(col)
                                ) {
                                  val = val.replace(/\D/g, "");
                                  if (val !== "") {
                                    if (Number(val) === 0) {
                                      val = "";
                                    } else {
                                      val = (Number(val) / 100).toFixed(2);
                                    }
                                  }
                                }
                                handleWaterChange(i, col, val);
                              }}
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
