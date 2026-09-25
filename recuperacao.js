E o recuperacao.js correspondente:

const API = "../api.php";


async function solicitarRecuperacao(event) {

    event.preventDefault();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const mensagem =
        document.getElementById("mensagem");

    const botao =
        document.getElementById("btnRecuperar");


    if (!email) {

        mensagem.textContent =
            "Digite seu e-mail.";

        mensagem.className =
            "mensagem erro";

        return;
    }


    mensagem.textContent =
        "Enviando...";

    mensagem.className =
        "mensagem";


    botao.disabled = true;


    try {

        const resposta = await fetch(
            `${API}?acao=solicitar_recuperacao`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email
                })
            }
        );


        const resultado =
            await resposta.json();


        mensagem.textContent =
            resultado.mensagem;

        mensagem.className =
            resultado.sucesso
                ? "mensagem sucesso"
                : "mensagem erro";


    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Não foi possível conectar com o servidor.";

        mensagem.className =
            "mensagem erro";

    } finally {

        botao.disabled = false;

    }

}