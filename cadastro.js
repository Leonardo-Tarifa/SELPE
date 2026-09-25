const API = "api.php";


async function realizarCadastro(event) {

    event.preventDefault();


    const nome = document
        .getElementById("nome")
        .value
        .trim();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const telefone = document
        .getElementById("telefone")
        .value
        .trim();

    const mensagem = document
        .getElementById("mensagemCadastro");


    mensagem.textContent = "Realizando cadastro...";
    mensagem.className = "mensagem";


    const dados = {
        nome_completo: nome,
        email: email,
        telefone: telefone
    };


    try {

        const resposta = await fetch(
            `${API}?acao=cadastrar_aluno`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dados)
            }
        );


        const resultado = await resposta.json();


        if (!resultado.sucesso) {

            mensagem.textContent =
                resultado.mensagem || "Não foi possível realizar o cadastro.";

            mensagem.className =
                "mensagem erro";

            return;
        }


        mensagem.textContent =
            resultado.mensagem;

        mensagem.className =
            "mensagem sucesso";


        alert(
            "Cadastro realizado com sucesso!\n\n" +
            "Seu login: " + resultado.login + "\n" +
            "Sua senha: " + resultado.senha
        );


        document
            .getElementById("formCadastro")
            .reset();


        setTimeout(function () {

            window.location.href = "selpe.html";

        }, 500);


    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Não foi possível conectar com o servidor.";

        mensagem.className =
            "mensagem erro";

    }

}


function voltarLogin() {

    window.location.href = "selpe.html";

}
