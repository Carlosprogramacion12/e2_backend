-- CreateTable
CREATE TABLE `avances` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `proyecto_id` BIGINT UNSIGNED NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha` DATE NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `proyecto_id`(`proyecto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calificaciones` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `proyecto_id` BIGINT UNSIGNED NOT NULL,
    `juez_user_id` BIGINT UNSIGNED NOT NULL,
    `criterio_id` BIGINT UNSIGNED NOT NULL,
    `puntuacion` DECIMAL(5, 2) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `criterio_id`(`criterio_id`),
    INDEX `juez_user_id`(`juez_user_id`),
    INDEX `proyecto_id`(`proyecto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carreras` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `clave` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `constancias` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `participante_id` BIGINT UNSIGNED NOT NULL,
    `evento_id` BIGINT UNSIGNED NOT NULL,
    `tipo` VARCHAR(255) NOT NULL,
    `archivo_path` VARCHAR(255) NULL,
    `codigo_qr` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `evento_id`(`evento_id`),
    INDEX `participante_id`(`participante_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `criterio_evaluacion` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `evento_id` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `ponderacion` DECIMAL(5, 2) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `evento_id`(`evento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dashboard_preferences` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `widget_key` VARCHAR(255) NOT NULL,
    `position` INTEGER NULL DEFAULT 0,
    `is_visible` BOOLEAN NULL DEFAULT true,
    `settings` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipo_participante` (
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `participante_id` BIGINT UNSIGNED NOT NULL,
    `perfil_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `participante_id`(`participante_id`),
    INDEX `perfil_id`(`perfil_id`),
    UNIQUE INDEX `equipo_participante_equipo_id_participante_id_unique`(`equipo_id`, `participante_id`),
    PRIMARY KEY (`equipo_id`, `participante_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `max_programadores` INTEGER NULL DEFAULT 2,
    `max_disenadores` INTEGER NULL DEFAULT 1,
    `max_testers` INTEGER NULL DEFAULT 1,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluacion_comentarios` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `proyecto_id` BIGINT UNSIGNED NOT NULL,
    `juez_user_id` BIGINT UNSIGNED NOT NULL,
    `comentario` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `juez_user_id`(`juez_user_id`),
    INDEX `proyecto_id`(`proyecto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evento_user` (
    `evento_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`evento_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_inicio` DATETIME(0) NOT NULL,
    `fecha_fin` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitaciones_equipo` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `participante_id` BIGINT UNSIGNED NOT NULL,
    `perfil_sugerido_id` BIGINT UNSIGNED NULL,
    `mensaje` TEXT NULL,
    `estado` VARCHAR(255) NULL DEFAULT 'pendiente',
    `enviada_por_participante_id` BIGINT UNSIGNED NULL,
    `respondida_en` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `enviada_por_participante_id`(`enviada_por_participante_id`),
    INDEX `equipo_id`(`equipo_id`),
    INDEX `participante_id`(`participante_id`),
    INDEX `perfil_sugerido_id`(`perfil_sugerido_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participantes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `carrera_id` BIGINT UNSIGNED NULL,
    `no_control` VARCHAR(255) NULL,
    `telefono` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `carrera_id`(`carrera_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyectos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `evento_id` BIGINT UNSIGNED NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `repositorio_url` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `equipo_id`(`equipo_id`),
    INDEX `evento_id`(`evento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitudes_equipo` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `equipo_id` BIGINT UNSIGNED NOT NULL,
    `participante_id` BIGINT UNSIGNED NOT NULL,
    `perfil_solicitado_id` BIGINT UNSIGNED NULL,
    `mensaje` TEXT NULL,
    `estado` VARCHAR(255) NULL DEFAULT 'pendiente',
    `respondida_por_participante_id` BIGINT UNSIGNED NULL,
    `respondida_en` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `equipo_id`(`equipo_id`),
    INDEX `participante_id`(`participante_id`),
    INDEX `perfil_solicitado_id`(`perfil_solicitado_id`),
    INDEX `respondida_por_participante_id`(`respondida_por_participante_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_rol` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `rol_id` BIGINT UNSIGNED NOT NULL,

    INDEX `rol_id`(`rol_id`),
    PRIMARY KEY (`user_id`, `rol_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` DATETIME(0) NULL,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `avatar` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `avances` ADD CONSTRAINT `avances_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `calificaciones_ibfk_13` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `calificaciones_ibfk_14` FOREIGN KEY (`juez_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calificaciones` ADD CONSTRAINT `calificaciones_ibfk_15` FOREIGN KEY (`criterio_id`) REFERENCES `criterio_evaluacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `constancias` ADD CONSTRAINT `constancias_ibfk_10` FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `constancias` ADD CONSTRAINT `constancias_ibfk_9` FOREIGN KEY (`participante_id`) REFERENCES `participantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `criterio_evaluacion` ADD CONSTRAINT `criterio_evaluacion_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboard_preferences` ADD CONSTRAINT `dashboard_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipo_participante` ADD CONSTRAINT `equipo_participante_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipo_participante` ADD CONSTRAINT `equipo_participante_ibfk_2` FOREIGN KEY (`participante_id`) REFERENCES `participantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `equipo_participante` ADD CONSTRAINT `equipo_participante_ibfk_3` FOREIGN KEY (`perfil_id`) REFERENCES `perfiles`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluacion_comentarios` ADD CONSTRAINT `evaluacion_comentarios_ibfk_10` FOREIGN KEY (`juez_user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluacion_comentarios` ADD CONSTRAINT `evaluacion_comentarios_ibfk_9` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evento_user` ADD CONSTRAINT `evento_user_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evento_user` ADD CONSTRAINT `evento_user_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitaciones_equipo` ADD CONSTRAINT `invitaciones_equipo_ibfk_17` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitaciones_equipo` ADD CONSTRAINT `invitaciones_equipo_ibfk_18` FOREIGN KEY (`participante_id`) REFERENCES `participantes`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitaciones_equipo` ADD CONSTRAINT `invitaciones_equipo_ibfk_19` FOREIGN KEY (`perfil_sugerido_id`) REFERENCES `perfiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitaciones_equipo` ADD CONSTRAINT `invitaciones_equipo_ibfk_20` FOREIGN KEY (`enviada_por_participante_id`) REFERENCES `participantes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participantes` ADD CONSTRAINT `participantes_ibfk_10` FOREIGN KEY (`carrera_id`) REFERENCES `carreras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participantes` ADD CONSTRAINT `participantes_ibfk_9` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_ibfk_10` FOREIGN KEY (`evento_id`) REFERENCES `eventos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyectos` ADD CONSTRAINT `proyectos_ibfk_9` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudes_equipo` ADD CONSTRAINT `solicitudes_equipo_ibfk_17` FOREIGN KEY (`equipo_id`) REFERENCES `equipos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudes_equipo` ADD CONSTRAINT `solicitudes_equipo_ibfk_18` FOREIGN KEY (`participante_id`) REFERENCES `participantes`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudes_equipo` ADD CONSTRAINT `solicitudes_equipo_ibfk_19` FOREIGN KEY (`perfil_solicitado_id`) REFERENCES `perfiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `solicitudes_equipo` ADD CONSTRAINT `solicitudes_equipo_ibfk_20` FOREIGN KEY (`respondida_por_participante_id`) REFERENCES `participantes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_rol` ADD CONSTRAINT `user_rol_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_rol` ADD CONSTRAINT `user_rol_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
