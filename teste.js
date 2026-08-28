let tipoUsuario = "aluno";

const usuarios = [

    {
        login: "aluno",
        senha: "1234",
        tipo: "aluno"
    },

    {
        login: "professor",
        senha: "1234",
        codigo: "PROF001",
        tipo: "professor"
    }

];

function selecionarTipo(tipo) {

    tipoUsuario = tipo;


    const btnAluno =
        document.getElementById("btnAluno");

    const btnProfessor =
        document.getElementById("btnProfessor");

    const titulo =
        document.getElementById("tituloLogin");

    const campoCodigo =
        document.getElementById("campoCodigo");


    btnAluno.classList.remove("ativo");

    btnProfessor.classList.remove("ativo");


    if (tipo === "aluno") {

        btnAluno.classList.add("ativo");

        titulo.textContent =
            "LOGIN DO ALUNO";

        campoCodigo.style.display =
            "none";

    }


    if (tipo === "professor") {

        btnProfessor.classList.add("ativo");

        titulo.textContent =
            "LOGIN DO PROFESSOR";

        campoCodigo.style.display =
            "block";

    }

}

function realizarLogin(event) {

    event.preventDefault();


    const login =
        document.getElementById("login").value.trim();

    const senha =
        document.getElementById("senha").value.trim();


    const codigo =
        document
            .getElementById("codigoProfessor")
            .value
            .trim();


    const mensagem =
        document.getElementById("mensagem");


    if (tipoUsuario === "aluno") {

        const aluno =
            usuarios.find(function(usuario) {

                return (
                    usuario.tipo === "aluno" &&
                    usuario.login === login &&
                    usuario.senha === senha
                );

            });


        if (!aluno) {

            mensagem.textContent =
                "Login ou senha incorretos.";

            mensagem.className =
                "mensagem erro";

            return;

        }


        localStorage.setItem(
            "selpe_usuario",
            JSON.stringify(aluno)
        );


        mensagem.textContent =
            "Login realizado com sucesso!";


        mensagem.className =
            "mensagem sucesso";


        return;

    }


    if (tipoUsuario === "professor") {

        const professor =
            usuarios.find(function(usuario) {

                return (
                    usuario.tipo === "professor" &&
                    usuario.login === login &&
                    usuario.senha === senha &&
                    usuario.codigo === codigo
                );

            });


        if (!professor) {

            mensagem.textContent =
                "Dados do professor incorretos.";

            mensagem.className =
                "mensagem erro";

            return;

        }


        localStorage.setItem(
            "selpe_usuario",
            JSON.stringify(professor)
        );


        mensagem.textContent =
            "Login do professor realizado com sucesso!";


        mensagem.className =
            "mensagem sucesso";

    }

}

function abrirCadastro() {

    alert(
        "Área de cadastro será criada na próxima etapa."
    );

}

selecionarTipo("aluno");