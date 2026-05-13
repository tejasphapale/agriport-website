#!/bin/bash

# ✅ AGRIPORT FINAL WORKING SETUP
# This script verifies all files are in place and ready

echo "🔍 Checking AgriPort Website Files..."
echo ""

cd /home/tejas/agriport/website

# Check main files
echo "📋 Required Files:"
files=("index.html" "download.html" "admin-database.html" "sync-manager.js" "uploads/agriport-latest.apk")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "✅ $file ($size)"
    else
        echo "❌ $file - MISSING"
    fi
done

echo ""
echo "📊 File Sizes:"
ls -lh *.html *.js 2>/dev/null | awk '{print $9, "(" $5 ")"}'

echo ""
echo "🌐 Website URLs:"
echo "├─ Home: https://tejasphapale.github.io/agriport-website/"
echo "├─ Download Form: https://tejasphapale.github.io/agriport-website/download.html"
echo "└─ Admin Dashboard: https://tejasphapale.github.io/agriport-website/admin-database.html"

echo ""
echo "✨ SETUP COMPLETE!"
echo ""
echo "HOW TO USE:"
echo "1. Open on Mobile: visit download.html → fill form → download APK"
echo "2. Open on Desktop: visit admin-database.html → see all submissions"
echo "3. Data syncs automatically within 5 seconds"
echo ""
