#!/bin/bash
echo "=== Running Migrations ==="
php artisan migrate --force --seed
echo "=== Caching Config ==="
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "=== Starting Server ==="
php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
