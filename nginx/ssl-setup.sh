#!/bin/bash

# SSL/HTTPS Setup Script with Let's Encrypt
# This script helps you set up HTTPS for your news website

set -e

echo "========================================="
echo "SSL/HTTPS Setup for News Backend"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Please run as root (sudo)"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN
read -p "Enter your email for Let's Encrypt notifications: " EMAIL

echo ""
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "📦 Installing Certbot..."

# Install certbot
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot
fi

echo ""
echo "🔒 Obtaining SSL certificate..."

# Stop nginx if running
docker-compose stop nginx || true

# Obtain certificate (standalone mode)
certbot certonly --standalone \
    --preferred-challenges http \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "www.$DOMAIN"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate obtained successfully!"
    echo ""
    echo "Certificates are stored in:"
    echo "  /etc/letsencrypt/live/$DOMAIN/"
    echo ""

    # Update nginx configuration
    echo "📝 Updating Nginx configuration..."

    # Backup original config
    cp nginx/nginx.conf nginx/nginx.conf.backup

    # Update nginx.conf with domain and SSL paths
    sed -i "s/server_name localhost;/server_name $DOMAIN www.$DOMAIN;/g" nginx/nginx.conf
    sed -i "s|#     ssl_certificate /etc/letsencrypt|    ssl_certificate /etc/letsencrypt|g" nginx/nginx.conf
    sed -i "s|#     ssl_certificate_key /etc/letsencrypt|    ssl_certificate_key /etc/letsencrypt|g" nginx/nginx.conf
    sed -i "s|# server {|server {|g" nginx/nginx.conf

    echo ""
    echo "✅ Nginx configuration updated!"
    echo ""
    echo "🔄 Starting services..."

    # Start nginx with SSL
    docker-compose up -d

    echo ""
    echo "========================================="
    echo "✅ SSL/HTTPS Setup Complete!"
    echo "========================================="
    echo ""
    echo "Your website is now accessible at:"
    echo "  🔒 https://$DOMAIN"
    echo "  🔒 https://www.$DOMAIN"
    echo ""
    echo "Certificate auto-renewal is configured."
    echo "Certificates will renew automatically before expiration."
    echo ""
    echo "To manually renew:"
    echo "  certbot renew"
    echo ""
else
    echo ""
    echo "❌ Failed to obtain SSL certificate"
    echo "Please check your domain DNS settings and try again"
    exit 1
fi

# Setup auto-renewal cron job
echo ""
echo "📅 Setting up auto-renewal..."

# Add cron job for auto-renewal (runs twice daily)
CRON_CMD="0 0,12 * * * certbot renew --quiet --post-hook 'docker-compose restart nginx'"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -

echo "✅ Auto-renewal cron job added"
echo ""
echo "All done! Your site is now secured with HTTPS 🎉"
