# ============================================================
# Stage 1 — Base & Dependencies
# ============================================================
FROM dunglas/frankenphp:1.5-php8.4-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    mysql-client \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    unzip \
    pcre-dev \
    $PHPIZE_DEPS

# Install PHP extensions
RUN install-php-extensions \
    pdo_mysql \
    gd \
    zip \
    bcmath \
    pcntl \
    redis \
    opcache

# ============================================================
# Stage 2 — Composer Vendor
# ============================================================
FROM base AS vendor

WORKDIR /app

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist \
    && composer clear-cache

# ============================================================
# Stage 3 — Production Runner
# ============================================================
FROM base AS runner

WORKDIR /app

# Copy dependencies
COPY --from=vendor /app/vendor ./vendor

# Copy application files
COPY . .

# Set up Laravel permissions
RUN mkdir -p storage/logs \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R root:root storage bootstrap/cache

# Run post-install scripts
RUN rm -rf bootstrap/cache/*.php \
    && php artisan package:discover --ansi

# Expose the FrankenPHP port (Octane default is 8000)
EXPOSE 8000

# Set environment variables for Octane/FrankenPHP
ENV OCTANE_SERVER=frankenphp
ENV FRANKENPHP_CONFIG="worker ./public/frankenphp-worker.php"

# Healthcheck for Docker Compose
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/up || exit 1

# Start Laravel Octane
CMD ["php", "artisan", "octane:start", "--server=frankenphp", "--host=0.0.0.0", "--port=8000"]