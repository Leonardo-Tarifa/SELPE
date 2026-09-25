<?php

header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$banco = "selpe";
$usuario = "root";
$senha = "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$banco;charset=utf8mb4",
        $usuario,
        $senha
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );

} catch (PDOException $erro) {

    http_response_code(500);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao conectar com o banco de dados."
    ]);

    exit;
}

$acao = $_GET["acao"] ?? "";

if ($acao === "login") {

    $dados = json_decode(
        file_get_contents("php://input"),
        true
    );

    $login = trim(
        $dados["login"] ?? ""
    );

    $senhaLogin = trim(
        $dados["senha"] ?? ""
    );

    $tipo = trim(
        $dados["tipo"] ?? ""
    );

    if (
        empty($login) ||
        empty($senhaLogin) ||
        empty($tipo)
    ) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Preencha todos os campos."
        ]);

        exit;
    }

    if ($tipo === "aluno") {

        $sql = "
            SELECT
                u.id_usuario,
                u.login,
                u.tipo,
                a.id_aluno,
                a.nome_completo,
                a.email,
                a.telefone
            FROM usuarios u
            INNER JOIN alunos a
                ON a.id_usuario = u.id_usuario
            WHERE
                u.login = ?
                AND u.senha = ?
                AND u.tipo = 'aluno'
                AND u.ativo = TRUE
        ";

        $consulta = $pdo->prepare($sql);

        $consulta->execute([
            $login,
            $senhaLogin
        ]);

        $usuarioEncontrado =
            $consulta->fetch();

    } elseif ($tipo === "professor") {

        $codigo = trim(
            $dados["codigo"] ?? ""
        );

        if (empty($codigo)) {

            http_response_code(400);

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Informe o código do professor."
            ]);

            exit;
        }

        $sql = "
            SELECT
                u.id_usuario,
                u.login,
                u.tipo,
                p.id_professor,
                p.nome_completo,
                p.email,
                p.telefone,
                p.codigo_professor,
                p.especialidade
            FROM usuarios u
            INNER JOIN professores p
                ON p.id_usuario = u.id_usuario
            WHERE
                u.login = ?
                AND u.senha = ?
                AND p.codigo_professor = ?
                AND u.tipo = 'professor'
                AND u.ativo = TRUE
                AND p.ativo = TRUE
        ";

        $consulta = $pdo->prepare($sql);

        $consulta->execute([
            $login,
            $senhaLogin,
            $codigo
        ]);

        $usuarioEncontrado =
            $consulta->fetch();

    } else {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Tipo de usuário inválido."
        ]);

        exit;
    }

    if (!$usuarioEncontrado) {

        http_response_code(401);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Login ou senha incorretos."
        ]);

        exit;
    }

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Login realizado com sucesso.",
        "usuario" => $usuarioEncontrado
    ]);

    exit;
}

if ($acao === "cadastrar_aluno") {

    $dados = json_decode(
        file_get_contents("php://input"),
        true
    );

    $nome = trim(
        $dados["nome_completo"] ?? ""
    );

    $email = trim(
        $dados["email"] ?? ""
    );

    $telefone = trim(
        $dados["telefone"] ?? ""
    );

    if (empty($nome) || empty($email)) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Nome e e-mail são obrigatórios."
        ]);

        exit;
    }

    try {

        $pdo->beginTransaction();

        $loginBase =
            strtolower(
                preg_replace(
                    "/[^a-zA-Z0-9]/",
                    "",
                    explode(" ", $nome)[0]
                )
            );

        if (empty($loginBase)) {
            $loginBase = "aluno";
        }

        $login = $loginBase;

        $contador = 1;

        while (true) {

            $verificar = $pdo->prepare(
                "SELECT id_usuario
                 FROM usuarios
                 WHERE login = ?"
            );

            $verificar->execute([
                $login
            ]);

            if (!$verificar->fetch()) {
                break;
            }

            $login =
                $loginBase . $contador;

            $contador++;
        }

        $senhaGerada =
            substr(
                str_shuffle(
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
                ),
                0,
                8
            );

        $sqlUsuario = "
            INSERT INTO usuarios
            (
                login,
                senha,
                tipo
            )
            VALUES
            (
                ?,
                ?,
                'aluno'
            )
        ";

        $consulta =
            $pdo->prepare($sqlUsuario);

        $consulta->execute([
            $login,
            $senhaGerada
        ]);

        $idUsuario =
            $pdo->lastInsertId();

        $sqlAluno = "
            INSERT INTO alunos
            (
                id_usuario,
                nome_completo,
                email,
                telefone
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?
            )
        ";

        $consulta =
            $pdo->prepare($sqlAluno);

        $consulta->execute([
            $idUsuario,
            $nome,
            $email,
            $telefone
        ]);

        $pdo->commit();

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Aluno cadastrado com sucesso.",
            "login" => $login,
            "senha" => $senhaGerada
        ]);

    } catch (PDOException $erro) {

        $pdo->rollBack();

        http_response_code(500);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao cadastrar aluno."
        ]);
    }

    exit;
}

if ($acao === "listar_alunos") {

    $sql = "
        SELECT
            a.id_aluno,
            a.nome_completo,
            a.cpf,
            a.data_nascimento,
            a.telefone,
            a.email,
            a.endereco,
            a.numero,
            a.bairro,
            a.cidade,
            a.estado,
            a.cep,
            a.nome_responsavel,
            a.telefone_responsavel,
            a.ativo,
            u.login
        FROM alunos a
        LEFT JOIN usuarios u
            ON u.id_usuario = a.id_usuario
        ORDER BY a.nome_completo
    ";

    $consulta =
        $pdo->query($sql);

    $alunos =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "alunos" => $alunos
    ]);

    exit;
}

if ($acao === "buscar_aluno") {

    $id = intval(
        $_GET["id"] ?? 0
    );

    if ($id <= 0) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "ID do aluno inválido."
        ]);

        exit;
    }

    $sql = "
        SELECT
            a.*,
            u.login
        FROM alunos a
        LEFT JOIN usuarios u
            ON u.id_usuario = a.id_usuario
        WHERE a.id_aluno = ?
    ";

    $consulta =
        $pdo->prepare($sql);

    $consulta->execute([
        $id
    ]);

    $aluno =
        $consulta->fetch();

    if (!$aluno) {

        http_response_code(404);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Aluno não encontrado."
        ]);

        exit;
    }

    echo json_encode([
        "sucesso" => true,
        "aluno" => $aluno
    ]);

    exit;
}

if ($acao === "listar_professores") {

    $sql = "
        SELECT
            p.id_professor,
            p.nome_completo,
            p.cpf,
            p.telefone,
            p.email,
            p.codigo_professor,
            p.especialidade,
            p.ativo,
            u.login
        FROM professores p
        LEFT JOIN usuarios u
            ON u.id_usuario = p.id_usuario
        ORDER BY p.nome_completo
    ";

    $consulta =
        $pdo->query($sql);

    $professores =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "professores" => $professores
    ]);

    exit;
}

if ($acao === "listar_modalidades") {

    $sql = "
        SELECT
            id_modalidade,
            nome,
            descricao,
            faixa_etaria_minima,
            faixa_etaria_maxima,
            ativo
        FROM modalidades
        WHERE ativo = TRUE
        ORDER BY nome
    ";

    $consulta =
        $pdo->query($sql);

    $modalidades =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "modalidades" => $modalidades
    ]);

    exit;
}

if ($acao === "listar_unidades") {

    $sql = "
        SELECT
            id_unidade,
            nome,
            endereco,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            telefone,
            ativo
        FROM unidades
        WHERE ativo = TRUE
        ORDER BY nome
    ";

    $consulta =
        $pdo->query($sql);

    $unidades =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "unidades" => $unidades
    ]);

    exit;
}

if ($acao === "listar_horarios") {

    $sql = "
        SELECT
            id_horario,
            dia_semana,
            hora_inicio,
            hora_fim,
            ativo
        FROM horarios
        WHERE ativo = TRUE
        ORDER BY
            FIELD(
                dia_semana,
                'segunda',
                'terca',
                'quarta',
                'quinta',
                'sexta',
                'sabado',
                'domingo'
            ),
            hora_inicio
    ";

    $consulta =
        $pdo->query($sql);

    $horarios =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "horarios" => $horarios
    ]);

    exit;
}

if ($acao === "listar_turmas") {

    $sql = "
        SELECT
            t.id_turma,
            t.nome_turma,
            m.id_modalidade,
            m.nome AS modalidade,
            u.id_unidade,
            u.nome AS unidade,
            p.id_professor,
            p.nome_completo AS professor,
            h.id_horario,
            h.dia_semana,
            h.hora_inicio,
            h.hora_fim,
            t.limite_vagas,
            t.vagas_disponiveis,
            t.ativo
        FROM turmas t
        INNER JOIN modalidades m
            ON m.id_modalidade = t.id_modalidade
        INNER JOIN unidades u
            ON u.id_unidade = t.id_unidade
        LEFT JOIN professores p
            ON p.id_professor = t.id_professor
        INNER JOIN horarios h
            ON h.id_horario = t.id_horario
        WHERE t.ativo = TRUE
        ORDER BY
            m.nome,
            h.dia_semana,
            h.hora_inicio
    ";

    $consulta =
        $pdo->query($sql);

    $turmas =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "turmas" => $turmas
    ]);

    exit;
}

if ($acao === "buscar_turma") {

    $id = intval(
        $_GET["id"] ?? 0
    );

    if ($id <= 0) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "ID da turma inválido."
        ]);

        exit;
    }

    $sql = "
        SELECT
            t.id_turma,
            t.nome_turma,
            t.limite_vagas,
            t.vagas_disponiveis,
            m.id_modalidade,
            m.nome AS modalidade,
            u.id_unidade,
            u.nome AS unidade,
            p.id_professor,
            p.nome_completo AS professor,
            h.id_horario,
            h.dia_semana,
            h.hora_inicio,
            h.hora_fim
        FROM turmas t
        INNER JOIN modalidades m
            ON m.id_modalidade = t.id_modalidade
        INNER JOIN unidades u
            ON u.id_unidade = t.id_unidade
        LEFT JOIN professores p
            ON p.id_professor = t.id_professor
        INNER JOIN horarios h
            ON h.id_horario = t.id_horario
        WHERE t.id_turma = ?
    ";

    $consulta =
        $pdo->prepare($sql);

    $consulta->execute([
        $id
    ]);

    $turma =
        $consulta->fetch();

    if (!$turma) {

        http_response_code(404);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Turma não encontrada."
        ]);

        exit;
    }

    echo json_encode([
        "sucesso" => true,
        "turma" => $turma
    ]);

    exit;
}

if ($acao === "cadastrar_inscricao") {

    $dados = json_decode(
        file_get_contents("php://input"),
        true
    );

    $idAluno =
        intval(
            $dados["id_aluno"] ?? 0
        );

    $idTurma =
        intval(
            $dados["id_turma"] ?? 0
        );

    if (
        $idAluno <= 0 ||
        $idTurma <= 0
    ) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Aluno ou turma inválidos."
        ]);

        exit;
    }

    try {

        $pdo->beginTransaction();

        $sqlTurma = "
            SELECT
                limite_vagas,
                vagas_disponiveis
            FROM turmas
            WHERE id_turma = ?
            FOR UPDATE
        ";

        $consulta =
            $pdo->prepare($sqlTurma);

        $consulta->execute([
            $idTurma
        ]);

        $turma =
            $consulta->fetch();

        if (!$turma) {

            $pdo->rollBack();

            http_response_code(404);

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Turma não encontrada."
            ]);

            exit;
        }

        if ($acao === "cadastrar_inscricao") {

    if (!$turma) {

        $pdo->rollBack();

        http_response_code(404);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Turma não encontrada."
        ]);

        exit;
    }

    exit;
}


        if (
            $turma["vagas_disponiveis"] <= 0
        ) {

            $pdo->rollBack();

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Não há vagas disponíveis."
            ]);

            exit;
        }

        $verificar = $pdo->prepare("
            SELECT id_inscricao
            FROM inscricoes
            WHERE
                id_aluno = ?
                AND id_turma = ?
        ");

        $verificar->execute([
            $idAluno,
            $idTurma
        ]);

        if ($verificar->fetch()) {

            $pdo->rollBack();

            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Aluno já está inscrito nessa turma."
            ]);

            exit;
        }

        $sql = "
            INSERT INTO inscricoes
            (
                id_aluno,
                id_turma,
                data_inscricao,
                status
            )
            VALUES
            (
                ?,
                ?,
                CURDATE(),
                'ativa'
            )
        ";

        $consulta =
            $pdo->prepare($sql);

        $consulta->execute([
            $idAluno,
            $idTurma
        ]);

        $atualizar = $pdo->prepare("
            UPDATE turmas
            SET vagas_disponiveis =
                vagas_disponiveis - 1
            WHERE id_turma = ?
        ");

        $atualizar->execute([
            $idTurma
        ]);

        $pdo->commit();

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Inscrição realizada com sucesso."
        ]);

    } catch (PDOException $erro) {

        $pdo->rollBack();

        http_response_code(500);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao realizar inscrição."
        ]);
    }

    exit;
}

if ($acao === "listar_inscricoes") {

    $sql = "
        SELECT
            i.id_inscricao,
            i.data_inscricao,
            i.status,
            i.observacao,
            a.id_aluno,
            a.nome_completo AS aluno,
            t.id_turma,
            t.nome_turma,
            m.id_modalidade,
            m.nome AS modalidade,
            u.id_unidade,
            u.nome AS unidade,
            h.dia_semana,
            h.hora_inicio,
            h.hora_fim
        FROM inscricoes i
        INNER JOIN alunos a
            ON a.id_aluno = i.id_aluno
        INNER JOIN turmas t
            ON t.id_turma = i.id_turma
        INNER JOIN modalidades m
            ON m.id_modalidade = t.id_modalidade
        INNER JOIN unidades u
            ON u.id_unidade = t.id_unidade
        INNER JOIN horarios h
            ON h.id_horario = t.id_horario
        ORDER BY
            i.data_inscricao DESC
    ";

    $consulta =
        $pdo->query($sql);

    $inscricoes =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "inscricoes" => $inscricoes
    ]);

    exit;
}

if ($acao === "listar_frequencias") {

    $idInscricao =
        intval(
            $_GET["id_inscricao"] ?? 0
        );

    if ($idInscricao <= 0) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Inscrição inválida."
        ]);

        exit;
    }

    $sql = "
        SELECT
            id_frequencia,
            id_inscricao,
            data_aula,
            presente,
            observacao
        FROM frequencias
        WHERE id_inscricao = ?
        ORDER BY data_aula DESC
    ";

    $consulta =
        $pdo->prepare($sql);

    $consulta->execute([
        $idInscricao
    ]);

    $frequencias =
        $consulta->fetchAll();

    echo json_encode([
        "sucesso" => true,
        "frequencias" => $frequencias
    ]);

    exit;
}

if ($acao === "registrar_frequencia") {

    $dados = json_decode(
        file_get_contents("php://input"),
        true
    );

    $idInscricao =
        intval(
            $dados["id_inscricao"] ?? 0
        );

    $dataAula =
        trim(
            $dados["data_aula"] ?? ""
        );

    $presente =
        isset($dados["presente"])
            ? (bool)$dados["presente"]
            : false;

    $observacao =
        trim(
            $dados["observacao"] ?? ""
        );

    if (
        $idInscricao <= 0 ||
        empty($dataAula)
    ) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Dados da frequência inválidos."
        ]);

        exit;
    }

    try {

        $sql = "
            INSERT INTO frequencias
            (
                id_inscricao,
                data_aula,
                presente,
                observacao
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?
            )
            ON DUPLICATE KEY UPDATE
                presente = VALUES(presente),
                observacao = VALUES(observacao)
        ";

        $consulta =
            $pdo->prepare($sql);

        $consulta->execute([
            $idInscricao,
            $dataAula,
            $presente ? 1 : 0,
            $observacao
        ]);

        echo json_encode([
            "sucesso" => true,
            "mensagem" => "Frequência registrada com sucesso."
        ]);

    } catch (PDOException $erro) {

        http_response_code(500);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao registrar frequência."
        ]);
    }

    exit;
}

if ($acao === "teste") {

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "API SELPE funcionando.",
        "servidor" => "PHP",
        "banco" => "MySQL"
    ]);

    exit;
}

http_response_code(404);

echo json_encode([
    "sucesso" => false,
    "mensagem" => "Ação da API não encontrada."
]);

if ($acao === "solicitar_recuperacao") {

    $dados = json_decode(
        file_get_contents("php://input"),
        true
    );

    $email = trim(
        $dados["email"] ?? ""
    );

    if (
        empty($email) ||
        !filter_var($email, FILTER_VALIDATE_EMAIL)
    ) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Informe um e-mail válido."
        ]);

        exit;
    }

    $consulta = $pdo->prepare("
        SELECT
            u.id_usuario,
            u.tipo,
            a.nome_completo,
            a.email
        FROM usuarios u
        INNER JOIN alunos a
            ON a.id_usuario = u.id_usuario
        WHERE
            a.email = ?
            AND u.tipo = 'aluno'
            AND u.ativo = TRUE
            AND a.ativo = TRUE
        LIMIT 1
    ");

    $consulta->execute([
        $email
    ]);

    $usuario = $consulta->fetch();

    if (!$usuario) {

        $consulta = $pdo->prepare("
            SELECT
                u.id_usuario,
                u.tipo,
                p.nome_completo,
                p.email
            FROM usuarios u
            INNER JOIN professores p
                ON p.id_usuario = u.id_usuario
            WHERE
                p.email = ?
                AND u.tipo = 'professor'
                AND u.ativo = TRUE
                AND p.ativo = TRUE
            LIMIT 1
        ");

        $consulta->execute([
            $email
        ]);

        $usuario = $consulta->fetch();
    }

    if (!$usuario) {

        echo json_encode([
            "sucesso" => true,
            "mensagem" =>
                "Se houver uma conta associada a este e-mail, " .
                "você receberá um link para redefinir sua senha."
        ]);

        exit;
    }


    try {

        $limpar = $pdo->prepare("
            DELETE FROM recuperacao_senha
            WHERE id_usuario = ?
        ");

        $limpar->execute([
            $usuario["id_usuario"]
        ]);

        $token = bin2hex(
            random_bytes(32)
        );

        $tokenHash = hash(
            "sha256",
            $token
        );

        $expiraEm = date(
            "Y-m-d H:i:s",
            time() + (20 * 60)
        );


        $inserir = $pdo->prepare("
            INSERT INTO recuperacao_senha
            (
                id_usuario,
                token_hash,
                expira_em
            )
            VALUES
            (
                ?,
                ?,
                ?
            )
        ");

        $inserir->execute([
            $usuario["id_usuario"],
            $tokenHash,
            $expiraEm
        ]);

        $linkRecuperacao =
            "http://localhost/SELPE/redefinir_senha.html?token=" .
            urlencode($token);

        require_once __DIR__ . "/vendor/autoload.php";

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        $mail->isSMTP();

        $mail->Host =
            "smtp.gmail.com";

        $mail->SMTPAuth =
            true;

        $mail->Username =
            "SEU_EMAIL@gmail.com";

        $mail->Password =
            "SUA_SENHA_DE_APP";

        $mail->SMTPSecure =
            PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;

        $mail->Port =
            587;

        $mail->setFrom(
            "SEU_EMAIL@gmail.com",
            "SELPE - Secretaria de Esportes e Lazer"
        );

        $mail->addAddress(
            $usuario["email"],
            $usuario["nome_completo"]
        );

        $mail->Subject =
            "Recuperação de senha - SELPE";

        $mail->isHTML(true);

        $mail->Body = "

            <div style=\"
                font-family: Arial, Helvetica, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                color: #111111;
            \">

                <div style=\"
                    border-top: 8px solid #13852b;
                    padding: 30px;
                    background-color: #ffffff;
                \">

                    <h1 style=\"
                        color: #1477d4;
                        margin-bottom: 10px;
                    \">
                        SELPE
                    </h1>

                    <p>
                        Olá,
                        <strong>
                            " .
                            htmlspecialchars(
                                $usuario["nome_completo"],
                                ENT_QUOTES,
                                "UTF-8"
                            ) .
                        "
                        </strong>.
                    </p>

                    <p>
                        Recebemos uma solicitação para
                        redefinir a senha da sua conta.
                    </p>

                    <p>
                        Clique no botão abaixo para
                        criar uma nova senha:
                    </p>

                    <p style=\"
                        text-align: center;
                        margin: 30px 0;
                    \">

                        <a
                            href=\"" .
                            htmlspecialchars(
                                $linkRecuperacao,
                                ENT_QUOTES,
                                "UTF-8"
                            ) .
                            "\"
                            style=\"
                                display: inline-block;
                                padding: 14px 25px;
                                background-color: #1477d4;
                                color: #ffffff;
                                text-decoration: none;
                                font-weight: bold;
                            \"
                        >
                            REDEFINIR MINHA SENHA
                        </a>

                    </p>

                    <p style=\"
                        color: #666666;
                        font-size: 14px;
                    \">

                        Este link ficará disponível por
                        <strong>20 minutos</strong>
                        e poderá ser utilizado apenas uma vez.

                    </p>

                    <p style=\"
                        color: #666666;
                        font-size: 14px;
                    \">

                        Se você não solicitou a recuperação
                        da senha, simplesmente ignore este e-mail.

                    </p>

                    <hr>

                    <p style=\"
                        color: #999999;
                        font-size: 12px;
                    \">

                        SELPE - Secretaria de Esportes e Lazer de Peruíbe

                    </p>

                </div>

            </div>

        ";

        $mail->AltBody =
            "Olá, " .
            $usuario["nome_completo"] .
            ".\n\n" .
            "Recebemos uma solicitação para redefinir " .
            "a senha da sua conta.\n\n" .
            "Acesse o seguinte endereço:\n\n" .
            $linkRecuperacao .
            "\n\n" .
            "O link expira em 20 minutos.\n\n" .
            "Se você não solicitou a recuperação, " .
            "ignore este e-mail.";

        $mail->send();


        echo json_encode([
            "sucesso" => true,
            "mensagem" =>
                "Se houver uma conta associada a este e-mail, " .
                "você receberá um link para redefinir sua senha."
        ]);

    } catch (Throwable $erro) {

        error_log(
            "Erro na recuperação de senha: " .
            $erro->getMessage()
        );

        http_response_code(500);

        echo json_encode([
            "sucesso" => false,
            "mensagem" =>
                "Não foi possível enviar o e-mail de recuperação."
        ]);
    }

    exit;
}

if ($acao === "redefinir_senha") {

    $dados = json_decode(
        file_get_contents("php://input"),
        true
    );

    $token = trim(
        $dados["token"] ?? ""
    );

    $novaSenha =
        $dados["senha"] ?? "";


    if (
        empty($token) ||
        empty($novaSenha)
    ) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" =>
                "Token e nova senha são obrigatórios."
        ]);

        exit;
    }

    if (strlen($novaSenha) < 8) {

        http_response_code(400);

        echo json_encode([
            "sucesso" => false,
            "mensagem" =>
                "A senha deve possuir pelo menos 8 caracteres."
        ]);

        exit;
    }

    $tokenHash = hash(
        "sha256",
        $token
    );


    try {

        $consulta = $pdo->prepare("
            SELECT
                id_recuperacao,
                id_usuario,
                expira_em
            FROM recuperacao_senha
            WHERE
                token_hash = ?
                AND usado_em IS NULL
                AND expira_em > NOW()
            LIMIT 1
        ");

        $consulta->execute([
            $tokenHash
        ]);

        $recuperacao =
            $consulta->fetch();


        if (!$recuperacao) {

            http_response_code(400);

            echo json_encode([
                "sucesso" => false,
                "mensagem" =>
                    "O link de recuperação é inválido ou expirou."
            ]);

            exit;
        }


        /*
         * Hash seguro da nova senha.
         */

        $senhaHash = password_hash(
            $novaSenha,
            PASSWORD_DEFAULT
        );

        $pdo->beginTransaction();


        $atualizar = $pdo->prepare("
            UPDATE usuarios
            SET senha = ?
            WHERE id_usuario = ?
        ");

        $atualizar->execute([
            $senhaHash,
            $recuperacao["id_usuario"]
        ]);


        /*
         * Marca o token como utilizado.
         */

        $marcarUsado = $pdo->prepare("
            UPDATE recuperacao_senha
            SET usado_em = NOW()
            WHERE id_recuperacao = ?
        ");

        $marcarUsado->execute([
            $recuperacao["id_recuperacao"]
        ]);


        $pdo->commit();


        echo json_encode([
            "sucesso" => true,
            "mensagem" =>
                "Senha alterada com sucesso."
        ]);

    } catch (Throwable $erro) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        error_log(
            "Erro ao redefinir senha: " .
            $erro->getMessage()
        );

        http_response_code(500);

        echo json_encode([
            "sucesso" => false,
            "mensagem" =>
                "Não foi possível alterar a senha."
        ]);
    }

    exit;
}
