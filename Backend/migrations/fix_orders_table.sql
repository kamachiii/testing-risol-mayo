-- Migration: Fix orders table for checkout
-- Run this in Railway phpMyAdmin SQL tab

-- 1. Expand status enum to include all statuses used in code
ALTER TABLE orders MODIFY COLUMN status 
  ENUM('pending','confirmed','paid','processing','shipped','delivered','completed','cancelled') 
  DEFAULT 'pending';

-- 2. Add missing payment columns
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) DEFAULT NULL AFTER status;
ALTER TABLE orders ADD COLUMN bank_name VARCHAR(20) DEFAULT NULL AFTER payment_method;

-- 3. Add updated_at for consistency
ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
