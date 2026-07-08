FROM php:8.4-cli-alpine

# Install system dependencies and PHP extensions required for Laravel & MySQL
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
    && docker-php-ext-install pdo pdo_mysql gd zip bcmath pcntl

# Install Redis extension via PECL
RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

WORKDIR /var/www/html

# Copy application files
COPY . .

# Pinned: Install Composer from version 2 binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Automate dependency installation
RUN composer install --no-interaction --optimize-autoloader

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]