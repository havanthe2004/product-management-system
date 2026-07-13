-- =======================================================
-- SQL Script: Create all 11 tables for the new schema
-- =======================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(100) UNIQUE NOT NULL,
    `description` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `role_id` BIGINT NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `avatar` VARCHAR(500),
    `status` ENUM('ACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL,
    CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `token` VARCHAR(500) UNIQUE NOT NULL,
    `user_id` BIGINT NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `is_revoked` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create password_reset_otps table
CREATE TABLE IF NOT EXISTS `password_reset_otps` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `otp_code` VARCHAR(6) NOT NULL,
    `attempts` INT DEFAULT 0,
    `status` ENUM('PENDING', 'USED', 'DISABLED') DEFAULT 'PENDING',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME NOT NULL,
    CONSTRAINT `fk_password_reset_otps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create commodity_groups table
CREATE TABLE IF NOT EXISTS `commodity_groups` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `group_code` VARCHAR(20) UNIQUE NOT NULL,
    `group_name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create commodity_types table
CREATE TABLE IF NOT EXISTS `commodity_types` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `group_id` BIGINT NOT NULL,
    `type_code` VARCHAR(20) UNIQUE NOT NULL,
    `type_name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL,
    CONSTRAINT `fk_commodity_types_group` FOREIGN KEY (`group_id`) REFERENCES `commodity_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create units table
CREATE TABLE IF NOT EXISTS `units` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `unit_code` VARCHAR(20),
    `unit_name` VARCHAR(100) NOT NULL,
    `symbol` VARCHAR(20) NOT NULL,
    `description` TEXT,
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create countries table
CREATE TABLE IF NOT EXISTS `countries` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `iso_code` VARCHAR(10),
    `country_name` VARCHAR(255) NOT NULL,
    `region` VARCHAR(100),
    `description` TEXT,
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Create quality_standards table
CREATE TABLE IF NOT EXISTS `quality_standards` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `standard_code` VARCHAR(30),
    `standard_name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Create commodities table
CREATE TABLE IF NOT EXISTS `commodities` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `commodity_code` VARCHAR(30) UNIQUE NOT NULL,
    `commodity_name` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(500),
    `group_id` BIGINT NOT NULL,
    `type_id` BIGINT NOT NULL,
    `unit_id` BIGINT NOT NULL,
    `description` TEXT,
    `approval_status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `approved_by` BIGINT NULL,
    `approved_at` DATETIME NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` DATETIME NULL,
    CONSTRAINT `fk_commodities_group` FOREIGN KEY (`group_id`) REFERENCES `commodity_groups` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_commodities_type` FOREIGN KEY (`type_id`) REFERENCES `commodity_types` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_commodities_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_commodities_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_commodities_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_commodities_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Create commodity_countries table (Junction table)
CREATE TABLE IF NOT EXISTS `commodity_countries` (
    `commodity_id` BIGINT NOT NULL,
    `country_id` BIGINT NOT NULL,
    PRIMARY KEY (`commodity_id`, `country_id`),
    CONSTRAINT `fk_commodity_countries_commodity` FOREIGN KEY (`commodity_id`) REFERENCES `commodities` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_commodity_countries_country` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Create commodity_quality_standards table (Junction table)
CREATE TABLE IF NOT EXISTS `commodity_quality_standards` (
    `commodity_id` BIGINT NOT NULL,
    `quality_standard_id` BIGINT NOT NULL,
    PRIMARY KEY (`commodity_id`, `quality_standard_id`),
    CONSTRAINT `fk_commodity_standards_commodity` FOREIGN KEY (`commodity_id`) REFERENCES `commodities` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_commodity_standards_standard` FOREIGN KEY (`quality_standard_id`) REFERENCES `quality_standards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Create audit_logs table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT,
    `module` VARCHAR(100) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_name` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT,
    `old_data` JSON,
    `new_data` JSON,
    `ip_address` VARCHAR(100),
    `user_agent` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
