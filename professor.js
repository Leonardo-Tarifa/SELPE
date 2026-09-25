    function abrirPagina(pagina, botao) {

        /* Esconde todas as páginas */

        const paginas =
            document.querySelectorAll(".pagina-sistema");

        paginas.forEach(function(p) {

            p.classList.remove("ativa");

        });


        /* Mostra a página selecionada */

        const paginaSelecionada =
            document.getElementById(pagina);

        if (paginaSelecionada) {

            paginaSelecionada.classList.add("ativa");

        }


        /* Remove ativo dos menus */

        const botoes =
            document.querySelectorAll(".menu-item");

        botoes.forEach(function(b) {

            b.classList.remove("ativo");

        });


        /* Ativa o botão clicado */

        if (botao) {

            botao.classList.add("ativo");

        }

    }


    function registrarPresenca() {

        alert(
            "Presença registrada para o aluno."
        );

    }


    function sair() {

        const confirmar =
            confirm(
                "Deseja realmente sair da Área do Professor?"
            );

        if (confirmar) {

            alert(
                "Sessão encerrada."
            );

        }

    }