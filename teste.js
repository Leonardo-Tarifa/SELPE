let tipoUsuario = "aluno";

const API = "api.php";

document.addEventListener("DOMContentLoaded", function () {
    selecionarTipo("aluno");
});


function selecionarTipo(tipo) {

    tipoUsuario = tipo;

    const btnAluno = document.getElementById("btnAluno");
    const btnProfessor = document.getElementById("btnProfessor");
    const titulo = document.getElementById("tituloLogin");
    const campoCodigo = document.getElementById("campoCodigo");
    const codigoProfessor = document.getElementById("codigoProfessor");
    const mensagem = document.getElementById("mensagem");

    btnAluno.classList.remove("ativo");
    btnProfessor.classList.remove("ativo");

    mensagem.textContent = "";
    mensagem.className = "mensagem";

    if (tipo === "aluno") {

        btnAluno.classList.add("ativo");

        titulo.textContent = "LOGIN DO ALUNO";

        campoCodigo.style.display = "none";

        codigoProfessor.required = false;

    }

    if (tipo === "professor") {

        btnProfessor.classList.add("ativo");

        titulo.textContent = "LOGIN DO PROFESSOR";

        campoCodigo.style.display = "block";

        codigoProfessor.required = true;

    }
}


async function realizarLogin(event) {

    event.preventDefault();

    const login = document
        .getElementById("login")
        .value
        .trim();

    const senha = document
        .getElementById("senha")
        .value
        .trim();

    const codigo = document
        .getElementById("codigoProfessor")
        .value
        .trim();

    const mensagem = document.getElementById("mensagem");

    mensagem.textContent = "Verificando...";
    mensagem.className = "mensagem";


    const dados = {
        login: login,
        senha: senha,
        tipo: tipoUsuario
    };


    if (tipoUsuario === "professor") {

        dados.codigo = codigo;

    }


    try {

        const resposta = await fetch(
            `${API}?acao=login`,
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
                resultado.mensagem;

            mensagem.className =
                "mensagem erro";

            return;
        }


        localStorage.setItem(
            "selpe_usuario",
            JSON.stringify(resultado.usuario)
        );


        localStorage.setItem(
            "selpe_tipo_usuario",
            resultado.usuario.tipo
        );


        mensagem.textContent =
            resultado.mensagem;

        mensagem.className =
            "mensagem sucesso";


        console.log(
            "Usuário conectado:",
            resultado.usuario
        );


        setTimeout(function () {

            abrirPainel(resultado.usuario);

        }, 700);


    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Não foi possível conectar com o servidor.";

        mensagem.className =
            "mensagem erro";

    }

}


function abrirPainel(usuario) {

    if (usuario.tipo === "aluno") {

        alert(
            "Login realizado!\n\n" +
            "Você será redirecionado."
        );
        window.location.href = "aluno.html"

    }


    if (usuario.tipo === "professor") {

        alert(
            "Login realizado!\n\n" +
            "Você será redirecionado."

        );
        window.location.href = "professor.html";

    }

}


function abrirCadastro() {

    const nome = prompt(
        "Digite o nome completo do aluno:"
    );

    if (!nome) {
        return;
    }


    const email = prompt(
        "Digite o e-mail:"
    );

    if (!email) {
        return;
    }


    const telefone = prompt(
        "Digite o telefone:"
    );


    cadastrarAluno({
        nome_completo: nome,
        email: email,
        telefone: telefone
    });

}


async function cadastrarAluno(dados) {

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


        const resultado =
            await resposta.json();


        if (resultado.sucesso) {

            alert(
                resultado.mensagem +
                "\n\nLogin: " +
                resultado.login +
                "\nSenha: " +
                resultado.senha
            );

        } else {

            alert(
                resultado.mensagem
            );

        }


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao realizar cadastro."
        );

    }

}


async function listarModalidades() {

    try {

        const resposta = await fetch(
            `${API}?acao=listar_modalidades`
        );

        const resultado =
            await resposta.json();


        if (!resultado.sucesso) {

            console.error(
                resultado.mensagem
            );

            return [];

        }


        return resultado.modalidades;


    } catch (erro) {

        console.error(erro);

        return [];

    }

}


async function listarUnidades() {

    try {

        const resposta = await fetch(
            `${API}?acao=listar_unidades`
        );

        const resultado =
            await resposta.json();


        if (!resultado.sucesso) {

            console.error(
                resultado.mensagem
            );

            return [];

        }


        return resultado.unidades;


    } catch (erro) {

        console.error(erro);

        return [];

    }

}


async function listarTurmas() {

    try {

        const resposta = await fetch(
            `${API}?acao=listar_turmas`
        );

        const resultado =
            await resposta.json();


        if (!resultado.sucesso) {

            console.error(
                resultado.mensagem
            );

            return [];

        }


        return resultado.turmas;


    } catch (erro) {

        console.error(erro);

        return [];

    }

}


async function listarAlunos() {

    try {

        const resposta = await fetch(
            `${API}?acao=listar_alunos`
        );

        const resultado =
            await resposta.json();


        if (!resultado.sucesso) {

            console.error(
                resultado.mensagem
            );

            return [];

        }


        return resultado.alunos;


    } catch (erro) {

        console.error(erro);

        return [];

    }

}


async function cadastrarInscricao(
    idAluno,
    idTurma
) {

    try {

        const resposta = await fetch(
            `${API}?acao=cadastrar_inscricao`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    id_aluno: idAluno,
                    id_turma: idTurma
                })
            }
        );


        const resultado =
            await resposta.json();


        return resultado;


    } catch (erro) {

        console.error(erro);

        return {
            sucesso: false,
            mensagem: "Erro de comunicação com a API."
        };

    }

}


function usuarioLogado() {

    const usuario =
        localStorage.getItem("selpe_usuario");


    if (!usuario) {

        return null;

    }


    try {

        return JSON.parse(usuario);

    } catch {

        return null;

    }

}


function sair() {

    localStorage.removeItem(
        "selpe_usuario"
    );

    localStorage.removeItem(
        "selpe_tipo_usuario"
    );


    window.location.href =
        "index.html";

}
