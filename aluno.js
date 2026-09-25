        function mostrarPagina(pagina, botao) {

            // Esconde todas as páginas
            const paginas = document.querySelectorAll(".page");

            paginas.forEach(function(page) {
                page.classList.remove("active");
            });


            // Mostra a página escolhida
            document.getElementById(pagina).classList.add("active");


            // Remove o active de todos os botões
            const botoes = document.querySelectorAll(".menu button");

            botoes.forEach(function(btn) {
                btn.classList.remove("active");
            });


            // Ativa o botão selecionado
            botao.classList.add("active");


            // Altera o título da página
            const titulos = {
                inicio: "Início",
                perfil: "Meu Perfil",
                turma: "Minha Turma",
                frequencia: "Frequência"
            };

            document.getElementById("tituloPagina").textContent =
                titulos[pagina];
        }


        function sair() {

            alert("Você saiu da Área do Aluno.");

            // Volta para a página inicial
            mostrarPagina(
                "inicio",
                document.querySelector(".menu button")
            );
        }