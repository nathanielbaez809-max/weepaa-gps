#!/bin/bash

# Weepaa Truck GPS - Vercel Deployment Script
# This script will deploy your app to Vercel production

echo "🚀 Weepaa Truck GPS - Deploying to Vercel"
echo "=========================================="
echo ""

# Step 1: Build the app
echo "📦 Step 1: Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Deploy to Vercel
echo "🌐 Step 2: Deploying to Vercel..."
echo ""
echo "You'll be prompted to:"
echo "  1. Login to Vercel (if not already)"
echo "  2. Set up project (first time only)"
echo "  3. Confirm deployment"
echo ""

npx vercel --prod

echo ""
echo "=========================================="
echo "🎉 Deployment complete!"
echo ""
echo "Your app is now live at the URL shown above."
echo ""
echo "Next steps:"
echo "  1. Visit your app URL"
echo "  2. Test all features"
echo "  3. Install as PWA on your phone"
echo "  4. Share with beta testers"
echo ""
echo "Happy trucking! 🚛"
