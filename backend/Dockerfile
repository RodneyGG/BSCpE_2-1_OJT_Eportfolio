# ============================================================
# Stage 1 — Install PHP extensions & system deps
# ============================================================
FROM php:8.4-cli-alpine AS base

# Install system dependencies and PHP extensions in a single layer
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
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql gd zip bcmath pcntl

# Install Redis extension via PECL, then clean up build deps
RUN apk add --no-cache --virtual .build-deps pcre-dev $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear

# ============================================================
# Stage 2 — Install Composer dependencies
# ============================================================
FROM base AS vendor

WORKDIR /var/www/html

# Get Composer from the official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy only the manifests first for better layer caching
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist \
    && composer clear-cache

# ============================================================
# Stage 3 — Production runner
# ============================================================
FROM base AS runner

WORKDIR /var/www/html

# Copy Composer binary for artisan commands
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy vendor from the vendor stage
COPY --from=vendor /var/www/html/vendor ./vendor

# Copy application source
COPY . .

# Ensure Laravel storage dirs exist with correct permissions
RUN mkdir -p storage/logs \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Run post-install scripts (package discovery, etc.)
RUN composer dump-autoload --optimize --no-dev

EXPOSE 8000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/up || exit 1

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]