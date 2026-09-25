const API_URL = "api.php";

function mostrarPagina(pagina, botao) {

    const paginas = document.querySelectorAll(".page");

    paginas.forEach(function(page) {
        page.classList.remove("active");
    });

    const paginaSelecionada = document.getElementById(pagina);

    if (paginaSelecionada) {
        paginaSelecionada.classList.add("active");
    }

    const botoes = document.querySelectorAll(".menu button");

    botoes.forEach(function(btn) {
        btn.classList.remove("active");
    });

    if (botao) {
        botao.classList.add("active");
    }

    const titulos = {
        inicio: "Início",
        perfil: "Meu Perfil",
        turma: "Minha Turma",
        frequencia: "Frequência"
    };

    document.getElementById("tituloPagina").textContent =
        titulos[pagina] || "Área do Aluno";
}

async function chamarAPI(dados = {}) {

    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
        throw new Error("Erro HTTP: " + resposta.status);
    }

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
        throw new Error(
            resultado.mensagem ||
            "Erro retornado pela API."
        );
    }

    return resultado;
}

async function verificarAluno() {

    try {

        const dados = await chamarAPI({
            acao: "verificar_aluno"
        });

        const aluno = dados.aluno;

        if (!aluno) {
            throw new Error(
                "A API não retornou os dados do aluno."
            );
        }

        const nomeTopo =
            document.querySelector(".aluno-top strong");

        if (nomeTopo) {
            nomeTopo.textContent = aluno.nome;
        }

        const tituloAluno =
            document.querySelector("#inicio .welcome h1");

        if (tituloAluno) {
            tituloAluno.textContent =
                "Olá, " + aluno.nome + "!";
        }

        const avatar =
            document.querySelector(".avatar");

        if (avatar) {

            const partes =
                aluno.nome.trim().split(/\s+/);

            let iniciais = "";

            if (partes.length >= 2) {
                iniciais =
                    partes[0].charAt(0) +
                    partes[partes.length - 1].charAt(0);
            } else {
                iniciais =
                    partes[0].charAt(0);
            }

            avatar.textContent =
                iniciais.toUpperCase();
        }

        preencherPerfil(aluno);

        if (dados.modalidade) {
            preencherModalidade(
                dados.modalidade
            );
        }

        if (
            Array.isArray(
                dados.modalidades_vagas
            )
        ) {
            preencherModalidadesVagas(
                dados.modalidades_vagas
            );
        }

        if (
            Array.isArray(
                dados.frequencia
            )
        ) {
            preencherFrequencia(
                dados.frequencia
            );
        }

    } catch (erro) {

        console.error(
            "Erro ao verificar aluno:",
            erro
        );

        alert(
            "Não foi possível carregar os dados do aluno.\n\n" +
            erro.message
        );
    }
}

function preencherPerfil(aluno) {

    const campos =
        document.querySelectorAll(
            "#perfil .info-item span"
        );

    if (campos[0]) {
        campos[0].textContent =
            aluno.nome || "-";
    }

    if (campos[1]) {
        campos[1].textContent =
            aluno.cpf || "-";
    }

    if (campos[2]) {
        campos[2].textContent =
            aluno.data_nascimento || "-";
    }

    if (campos[3]) {
        campos[3].textContent =
            aluno.telefone || "-";
    }

    if (campos[4]) {
        campos[4].textContent =
            aluno.email || "-";
    }

    if (campos[5]) {
        campos[5].textContent =
            aluno.cidade || "-";
    }
}

function preencherModalidade(modalidade) {

    const valores =
        document.querySelectorAll(
            "#inicio .card .value"
        );

    if (valores[0]) {
        valores[0].textContent =
            modalidade.nome || "-";
    }

    if (valores[1]) {
        valores[1].textContent =
            modalidade.turma || "-";
    }

    if (valores[2]) {
        valores[2].textContent =
            modalidade.dia || "-";
    }

    const info =
        document.querySelectorAll(
            "#inicio .grid:first-of-type .info-item span"
        );

    if (info[0]) {
        info[0].textContent =
            modalidade.nome || "-";
    }

    if (info[1]) {
        info[1].textContent =
            modalidade.turma || "-";
    }

    if (info[2]) {
        info[2].textContent =
            modalidade.dia || "-";
    }

    if (info[3]) {
        info[3].textContent =
            modalidade.horario || "-";
    }

    const tabela =
        document.querySelectorAll(
            "#turma tbody tr td:nth-child(2)"
        );

    if (tabela[0]) {
        tabela[0].textContent =
            modalidade.turma || "-";
    }

    if (tabela[1]) {
        tabela[1].textContent =
            modalidade.nome || "-";
    }

    if (tabela[2]) {
        tabela[2].textContent =
            modalidade.dia || "-";
    }

    if (tabela[3]) {
        tabela[3].textContent =
            modalidade.horario || "-";
    }

    if (tabela[4]) {
        tabela[4].textContent =
            modalidade.unidade || "-";
    }

    if (tabela[5]) {
        tabela[5].textContent =
            (
                (modalidade.bairro || "") +
                " - " +
                (modalidade.cidade || "")
            );
    }
}

function preencherModalidadesVagas(modalidades) {

    if (modalidades.length === 0) {
        return;
    }

    let mensagem =
        "Existem modalidades disponíveis:\n\n";

    modalidades.forEach(function(modalidade, index) {

        mensagem +=
            (index + 1) +
            ". " +
            modalidade.nome +
            " - " +
            modalidade.vagas +
            " vaga(s)\n";
    });

    mensagem +=
        "\nDeseja solicitar entrada em uma modalidade?";

    if (confirm(mensagem)) {
        escolherModalidade(modalidades);
    }
}

async function escolherModalidade(modalidades) {

    let mensagem =
        "Digite o número da modalidade:\n\n";

    modalidades.forEach(function(modalidade, index) {

        mensagem +=
            (index + 1) +
            " - " +
            modalidade.nome +
            " (" +
            modalidade.vagas +
            " vaga(s))\n";
    });

    const escolha =
        prompt(mensagem);

    if (escolha === null) {
        return;
    }

    const numero =
        parseInt(escolha);

    if (
        isNaN(numero) ||
        numero < 1 ||
        numero > modalidades.length
    ) {

        alert(
            "Modalidade inválida."
        );

        return;
    }

    const modalidade =
        modalidades[numero - 1];

    const confirmar =
        confirm(
            "Deseja solicitar entrada em:\n\n" +
            modalidade.nome +
            "?"
        );

    if (!confirmar) {
        return;
    }

    await solicitarModalidade(
        modalidade.id
    );
}

async function solicitarModalidade(modalidadeId) {

    try {

        const dados =
            await chamarAPI({
                acao:
                    "solicitar_modalidade",

                modalidade_id:
                    modalidadeId
            });

        alert(
            dados.mensagem ||
            "Solicitação realizada com sucesso."
        );

        await verificarAluno();

    } catch (erro) {

        console.error(
            "Erro ao solicitar modalidade:",
            erro
        );

        alert(
            "Não foi possível realizar a solicitação.\n\n" +
            erro.message
        );
    }
}

async function sair() {

    try {

        await chamarAPI({
            acao: "logout"
        });

    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

    } finally {

        window.location.href =
            "login.html";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        verificarAluno();
    }
);
