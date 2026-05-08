-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `login` VARCHAR(50) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo` ENUM('A', 'P', 'U') NOT NULL,
    `status` ENUM('A', 'B') NOT NULL DEFAULT 'A',
    `matricula` VARCHAR(50) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_email_key`(`email`),
    UNIQUE INDEX `Usuario_login_key`(`login`),
    UNIQUE INDEX `Usuario_matricula_key`(`matricula`),
    INDEX `Usuario_tipo_status_idx`(`tipo`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turma` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `periodo` VARCHAR(50) NOT NULL,
    `disciplina` VARCHAR(100) NOT NULL,
    `professorId` INTEGER NOT NULL,

    INDEX `Turma_professorId_idx`(`professorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matricula` (
    `alunoId` INTEGER NOT NULL,
    `turmaId` INTEGER NOT NULL,

    PRIMARY KEY (`alunoId`, `turmaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessaoChamada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `turmaId` INTEGER NOT NULL,
    `professorId` INTEGER NOT NULL,
    `dataAbertura` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataEncerramento` DATETIME(3) NULL,
    `janelaMin` INTEGER NOT NULL DEFAULT 10,
    `status` ENUM('ABERTA', 'ENCERRADA', 'PAUSADA') NOT NULL DEFAULT 'ABERTA',
    `codigo` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `SessaoChamada_codigo_key`(`codigo`),
    INDEX `SessaoChamada_turmaId_status_idx`(`turmaId`, `status`),
    INDEX `SessaoChamada_codigo_idx`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Presenca` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessaoId` INTEGER NOT NULL,
    `alunoId` INTEGER NOT NULL,
    `marcadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validacao` ENUM('OK', 'FALHA', 'PENDENTE') NOT NULL DEFAULT 'PENDENTE',
    `atrasoMin` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('CONFIRMADO', 'PENDENTE', 'INVALIDO') NOT NULL DEFAULT 'PENDENTE',
    `ip` VARCHAR(50) NULL,
    `dispositivo` VARCHAR(100) NULL,

    INDEX `Presenca_alunoId_idx`(`alunoId`),
    UNIQUE INDEX `Presenca_sessaoId_alunoId_key`(`sessaoId`, `alunoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pergunta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessaoId` INTEGER NOT NULL,
    `tipo` ENUM('MULTIPLA', 'VF', 'ENQUETE', 'TEXTO') NOT NULL,
    `enunciado` VARCHAR(255) NOT NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `criadaEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Pergunta_sessaoId_ativa_idx`(`sessaoId`, `ativa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OpcaoPergunta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `perguntaId` INTEGER NOT NULL,
    `descricao` VARCHAR(255) NOT NULL,
    `correta` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resposta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `perguntaId` INTEGER NOT NULL,
    `alunoId` INTEGER NOT NULL,
    `opcaoId` INTEGER NULL,
    `textoLivre` VARCHAR(500) NULL,
    `respondidoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `correta` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Resposta_perguntaId_alunoId_key`(`perguntaId`, `alunoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parametro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(100) NOT NULL,
    `valor` VARCHAR(50) NOT NULL,
    `tipo` VARCHAR(30) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Parametro_chave_key`(`chave`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditoriaLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NULL,
    `acao` VARCHAR(100) NOT NULL,
    `entidade` VARCHAR(50) NOT NULL,
    `dataEvento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `detalhes` TEXT NULL,
    `ip` VARCHAR(50) NULL,

    INDEX `AuditoriaLog_usuarioId_idx`(`usuarioId`),
    INDEX `AuditoriaLog_acao_idx`(`acao`),
    INDEX `AuditoriaLog_dataEvento_idx`(`dataEvento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Turma` ADD CONSTRAINT `Turma_professorId_fkey` FOREIGN KEY (`professorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matricula` ADD CONSTRAINT `Matricula_turmaId_fkey` FOREIGN KEY (`turmaId`) REFERENCES `Turma`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessaoChamada` ADD CONSTRAINT `SessaoChamada_turmaId_fkey` FOREIGN KEY (`turmaId`) REFERENCES `Turma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessaoChamada` ADD CONSTRAINT `SessaoChamada_professorId_fkey` FOREIGN KEY (`professorId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presenca` ADD CONSTRAINT `Presenca_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `SessaoChamada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presenca` ADD CONSTRAINT `Presenca_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pergunta` ADD CONSTRAINT `Pergunta_sessaoId_fkey` FOREIGN KEY (`sessaoId`) REFERENCES `SessaoChamada`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OpcaoPergunta` ADD CONSTRAINT `OpcaoPergunta_perguntaId_fkey` FOREIGN KEY (`perguntaId`) REFERENCES `Pergunta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resposta` ADD CONSTRAINT `Resposta_perguntaId_fkey` FOREIGN KEY (`perguntaId`) REFERENCES `Pergunta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resposta` ADD CONSTRAINT `Resposta_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resposta` ADD CONSTRAINT `Resposta_opcaoId_fkey` FOREIGN KEY (`opcaoId`) REFERENCES `OpcaoPergunta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditoriaLog` ADD CONSTRAINT `AuditoriaLog_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
