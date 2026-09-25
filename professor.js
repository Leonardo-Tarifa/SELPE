const API_URL = "api.php";

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

function abrirPagina(pagina, botao) {

    const paginas =
        document.querySelectorAll(".pagina-sistema");

    paginas.forEach(function(p) {
        p.classList.remove("ativa");
    });

    const paginaSelecionada =
        document.getElementById(pagina);

    if (paginaSelecionada) {
        paginaSelecionada.classList.add("ativa");
    }

    const botoes =
        document.querySelectorAll(".menu-item");

    botoes.forEach(function(b) {
        b.classList.remove("ativo");
    });

    if (botao) {
        botao.classList.add("ativo");
    }
}

async function verificarProfessor() {

    try {

        const dados = await chamarAPI({
            acao: "verificar_professor"
        });

        const professor = dados.professor;

        if (!professor) {
            throw new Error(
                "A API não retornou os dados do professor."
            );
        }

        const nomeTopo =
            document.querySelector(".usuario-barra span");

        if (nomeTopo) {
            nomeTopo.textContent = professor.nome;
        }

        atualizarAvatar(professor.nome);

        preencherPerfil(professor);

        if (dados.resumo) {
            preencherResumo(dados.resumo);
        }

        if (dados.proxima_aula) {
            preencherProximaAula(dados.proxima_aula);
        }

        if (Array.isArray(dados.aulas)) {
            preencherQuadroAulas(dados.aulas);
        }

        if (Array.isArray(dados.turmas)) {
            preencherTurmas(dados.turmas);
        }

        if (Array.isArray(dados.alunos)) {
            preencherAlunos(dados.alunos);
        }

        if (Array.isArray(dados.frequencia)) {
            preencherFrequencia(dados.frequencia);
        }

    } catch (erro) {

        console.error(
            "Erro ao verificar professor:",
            erro
        );

        alert(
            "Não foi possível carregar os dados do professor.\n\n" +
            erro.message
        );
    }
}

function atualizarAvatar(nomeCompleto) {

    const avatar =
        document.querySelector(".avatar");

    if (!avatar || !nomeCompleto) {
        return;
    }

    const partes =
        nomeCompleto.trim().split(/\s+/);

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

function preencherPerfil(professor) {

    const campos =
        document.querySelectorAll(
            "#perfil .informacoes .informacao"
        );

    if (campos[0]) {
        campos[0].innerHTML =
            "<strong>NOME</strong>" + (professor.nome || "-");
    }

    if (campos[1]) {
        campos[1].innerHTML =
            "<strong>USUÁRIO</strong>" + (professor.usuario || "-");
    }

    if (campos[2]) {
        campos[2].innerHTML =
            "<strong>TIPO DE ACESSO</strong>" + (professor.tipo_acesso || "Professor");
    }

    if (campos[3]) {
        const ativo =
            (professor.status || "").toLowerCase() !== "inativo";

        campos[3].innerHTML =
            "<strong>STATUS</strong>" +
            "<span class=\"tag " + (ativo ? "tag-verde" : "tag-vermelha") + "\">" +
            (professor.status || (ativo ? "ATIVO" : "INATIVO")) +
            "</span>";
    }
}

function preencherResumo(resumo) {

    const numeros =
        document.querySelectorAll("#inicio .cards .numero");

    if (numeros[0]) {
        numeros[0].textContent = resumo.aulas ?? 0;
    }

    if (numeros[1]) {
        numeros[1].textContent = resumo.turmas ?? 0;
    }

    if (numeros[2]) {
        numeros[2].textContent = resumo.modalidades ?? 0;
    }

    if (numeros[3]) {
        numeros[3].textContent = resumo.vagas ?? 0;
    }
}

function preencherProximaAula(aula) {

    const painel =
        document.querySelector("#inicio .aula-destaque");

    if (!painel) {
        return;
    }

    const titulo =
        painel.querySelector("h3");

    if (titulo) {
        titulo.textContent = aula.modalidade || "-";
    }

    const paragrafos =
        painel.querySelectorAll("p");

    if (paragrafos[0]) {
        paragrafos[0].innerHTML =
            "<strong>Turma:</strong> " + (aula.turma || "-");
    }

    if (paragrafos[1]) {
        paragrafos[1].innerHTML =
            "<strong>Dia:</strong> " + (aula.dia || "-");
    }

    if (paragrafos[2]) {
        paragrafos[2].innerHTML =
            "<strong>Horário:</strong> " + (aula.horario || "-");
    }

    if (paragrafos[3]) {
        paragrafos[3].innerHTML =
            "<strong>Local:</strong> " + (aula.local || "-");
    }

    const tags =
        painel.querySelectorAll(".aula-info .tag");

    if (tags[0]) {
        tags[0].textContent = aula.modalidade || "-";
    }

    if (tags[1]) {
        tags[1].textContent = (aula.vagas ?? "-") + " vagas";
    }
}

function preencherQuadroAulas(aulas) {

    const container =
        document.querySelector("#aulas .quadro-aulas");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    aulas.forEach(function(aula) {

        const card =
            document.createElement("div");

        card.className = "aula-card";

        card.innerHTML =
            "<div>" +
                "<div class=\"dia-aula\">" + (aula.dia || "-").toUpperCase() + "</div>" +
                "<div class=\"horario-aula\">" + (aula.horario || "-") + "</div>" +
            "</div>" +
            "<div>" +
                "<h3>" + (aula.turma || "-") + "</h3>" +
                "<p>" + (aula.unidade || "-") + "</p>" +
                "<p>" + (aula.bairro || "") + " - " + (aula.cidade || "") + "</p>" +
            "</div>" +
            "<div>" +
                "<span class=\"tag " + (aula.status === "inativa" ? "tag-vermelha" : "tag-verde") + "\">" +
                    (aula.status || "ATIVA").toUpperCase() +
                "</span>" +
            "</div>";

        container.appendChild(card);
    });
}

function preencherTurmas(turmas) {

    const corpo =
        document.querySelector("#turmas tbody");

    if (!corpo) {
        return;
    }

    corpo.innerHTML = "";

    turmas.forEach(function(turma) {

        const linha =
            document.createElement("tr");

        linha.innerHTML =
            "<td>" + (turma.modalidade || "-") + "</td>" +
            "<td>" + (turma.turma || "-") + "</td>" +
            "<td>" + (turma.dia || "-") + "</td>" +
            "<td>" + (turma.horario || "-") + "</td>" +
            "<td>" + (turma.unidade || "-") + "</td>" +
            "<td><span class=\"tag " + (turma.status === "inativa" ? "tag-vermelha" : "tag-verde") + "\">" +
                (turma.status || "ATIVA").toUpperCase() +
            "</span></td>";

        corpo.appendChild(linha);
    });
}

function preencherAlunos(alunos) {

    const corpo =
        document.querySelector("#alunos tbody");

    if (!corpo) {
        return;
    }

    corpo.innerHTML = "";

    alunos.forEach(function(aluno) {

        const linha =
            document.createElement("tr");

        linha.innerHTML =
            "<td>" + (aluno.nome || "-") + "</td>" +
            "<td>" + (aluno.email || "-") + "</td>" +
            "<td>" + (aluno.telefone || "-") + "</td>" +
            "<td>" + (aluno.turma || "-") + "</td>" +
            "<td><span class=\"tag " + (aluno.status === "inativo" ? "tag-vermelha" : "tag-verde") + "\">" +
                (aluno.status || "ATIVA").toUpperCase() +
            "</span></td>";

        corpo.appendChild(linha);
    });
}

function preencherFrequencia(frequencia) {

    const corpo =
        document.querySelector("#frequencia tbody");

    if (!corpo) {
        return;
    }

    corpo.innerHTML = "";

    frequencia.forEach(function(registro) {

        const linha =
            document.createElement("tr");

        linha.dataset.alunoId = registro.aluno_id;

        const registrada =
            Boolean(registro.registrada);

        linha.innerHTML =
            "<td>" + (registro.aluno || "-") + "</td>" +
            "<td>" + (registro.data || "—") + "</td>" +
            "<td>" + (registrada ? "Presença registrada" : "Não registrada") + "</td>" +
            "<td>" +
                (registrada
                    ? ""
                    : "<button class=\"btn btn-verde\" onclick=\"registrarPresenca(this)\">Registrar presença</button>"
                ) +
            "</td>";

        corpo.appendChild(linha);
    });
}

async function registrarPresenca(botao) {

    const linha =
        botao ? botao.closest("tr") : null;

    const alunoId =
        linha ? linha.dataset.alunoId : null;

    try {

        const dados =
            await chamarAPI({
                acao: "registrar_presenca",
                aluno_id: alunoId
            });

        alert(
            dados.mensagem ||
            "Presença registrada para o aluno."
        );

        await verificarProfessor();

    } catch (erro) {

        console.error(
            "Erro ao registrar presença:",
            erro
        );

        alert(
            "Não foi possível registrar a presença.\n\n" +
            erro.message
        );
    }
}

async function sair() {

    const confirmar =
        confirm(
            "Deseja realmente sair da Área do Professor?"
        );

    if (!confirmar) {
        return;
    }

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
            "selpe.html";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        verificarProfessor();
    }
);
