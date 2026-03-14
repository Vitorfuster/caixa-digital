// Bibliotecas
import { toast } from "react-toastify";

// dados esperados em em letter: { error: (request error), pageName: nome da página, pageId: (id da página), errorScreen: (false/true, permição para enviar para tela de erro caso erro +500), message: (invoca um toast container com a mensagem), sendMessageAdmin: (false/true, se é para notificar admin do erro), sendNotificationUser: (false/true, se é para notificar usuário sobre a resolução do erro), userId: (id do usuário (opcional)), action: (o que tentou fazer (opcional)), description: (descrição detalhada do processo e ação (opcional)), endPoint: (destino da request (opcional))}

const RequestError = (letter) => {
  console.log(letter);
  // Parametros da url
  const params = new URLSearchParams({
    pageName: letter.pageName,
    pageId: letter.pageId,
    errorScreen: letter.errorScreen,
    userId: letter.userId,
    action: letter.action,
    date: new Date(),
    status: letter.error.status ?? letter.error.code,
  });

  if (letter.message !== "") {
    toast.error(letter.message);
    // Erros do cliente
  } else if (letter.error.status >= 400 && letter.error.status < 500) {
    // Erro de token inválido
    if (
      letter.error.status === 401 &&
      letter.error.response.data.error === "Token is invalid"
    ) {
      localStorage.removeItem("sublimaxBrasil:userData");

      window.location.replace();
      console.log("ERRO DE TOKEN");
      // window.location.reload(`/login?redirect=${btoa(letter.pageUrl)}`);
      // Mensagem genérica de erro
    } else {
      toast.error("Parece que algo deu errado, tente novamente");
    }
  }

  // Erros do servidor
  if (letter.error.status >= 500 && letter.error.status < 600) {
    // Mensagem genérica de erro
    toast.error(
      "Estamos com problemas técnicos, nossa equipe irá avaliar o ocorrido!",
      {
        autoClose: 15000, // 10 segundos
      },
    );
    console.log("notificação do erro:", letter);
    // Redirecionamento para tela de erro
    window.location.replace(
      `/servererror/${letter.sendMessageAdmin}/${
        letter.sendNotificationUser
      }?${params.toString()}`,
    );
  }

  // Erros sem status
  if (letter.error.code === "ERR_NETWORK") {
    toast.error(
      "O serviço está fora do ar, nossa equipe irá avaliar o ocorrido!",
      {
        autoClose: 15000, // 10 segundos
      },
    );

    console.log("notificação do erro:", letter);
    // Tive que usar o window.location pois aqui não funciona react hooks, por ser uma função externa
    window.location.replace(
      `/servererror/${letter.sendMessageAdmin}/${
        letter.sendNotificationUser
      }?${params.toString()}`,
    );

    console.log("MUDA DE TELA");
  }

  // Erros locais
  if (
    letter.error.error.code === "ERR_BAD_REQUEST" &&
    letter.error.error.response.status === 400 &&
    letter.error.error.response.data ===
      "getaddrinfo ENOTFOUND sandbox.superfrete.com"
  ) {
    toast.error("Você esta sem conexão com a internet", {
      autoClose: 15000, // 10 segundos
    });
    // TELA DE ERRO 400
    window.location.replace(
      `/servererror/${letter.sendMessageAdmin}/${
        letter.sendNotificationUser
      }?${params.toString()}`,
    );
  }
};

export default RequestError;
