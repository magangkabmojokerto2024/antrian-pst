#!/bin/bash
echo "Running migrations and seeding database ..."
php artisan migrate --force
echo "Seeding services ..."
php artisan db:seed --force
echo "Optimizing ..."
php artisan optimize:clear
php artisan optimize
echo "Starting Laravel server ..."
php -r "file_exists('.env') || copy('.env.example', '.env');"
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
