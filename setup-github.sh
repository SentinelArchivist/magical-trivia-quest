#!/bin/bash

# GitHub Pages Setup Script for Magical Trivia Quest
# This script helps you set up and deploy your game to GitHub Pages

echo "🌟 Magical Trivia Quest - GitHub Pages Setup 🌟"
echo "----------------------------------------------"
echo ""

# Prompt for GitHub username
read -p "Enter your GitHub username: " github_username

if [ -z "$github_username" ]; then
  echo "❌ GitHub username cannot be empty. Exiting."
  exit 1
fi

repo_name="magical-trivia-quest"
repo_url="https://github.com/$github_username/$repo_name.git"

echo "This script will:"
echo "1. Initialize Git repository (if not already initialized)"
echo "2. Add all files to Git"
echo "3. Create initial commit"
echo "4. Add GitHub remote as 'origin'"
echo "5. Push to GitHub"
echo ""
echo "Your app will be available at: https://$github_username.github.io/$repo_name/"
echo ""
read -p "Do you want to continue? (y/n): " continue_setup

if [ "$continue_setup" != "y" ] && [ "$continue_setup" != "Y" ]; then
  echo "Setup cancelled."
  exit 0
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Please install Git and try again."
  exit 1
fi

# Check if the directory is already a git repository
if [ -d ".git" ]; then
  echo "✅ Git repository already initialized"
else
  echo "🔄 Initializing Git repository..."
  git init
  echo "✅ Git repository initialized"
fi

# Add all files to git
echo "🔄 Adding files to Git..."
git add .
echo "✅ Files added to Git"

# Commit changes
echo "🔄 Creating initial commit..."
git commit -m "Initial commit of Magical Trivia Quest"
echo "✅ Initial commit created"

# Check if remote origin exists
if git remote | grep -q "origin"; then
  echo "🔄 Remote 'origin' already exists. Updating to $repo_url..."
  git remote set-url origin "$repo_url"
else
  echo "🔄 Adding remote 'origin'..."
  git remote add origin "$repo_url"
fi
echo "✅ Remote 'origin' set to $repo_url"

# Create main branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/main; then
  echo "🔄 Creating 'main' branch..."
  git branch -M main
  echo "✅ 'main' branch created"
fi

# Push to GitHub
echo "🔄 Pushing to GitHub..."
echo "NOTE: You will be prompted for your GitHub credentials"
git push -u origin main
push_status=$?

if [ $push_status -eq 0 ]; then
  echo "✅ Successfully pushed to GitHub!"
  echo ""
  echo "🌟 NEXT STEPS 🌟"
  echo "1. Go to https://github.com/$github_username/$repo_name/settings/pages"
  echo "2. Under 'Source', select 'GitHub Actions'"
  echo "3. Your site will be built and deployed automatically"
  echo ""
  echo "Your site will be available at: https://$github_username.github.io/$repo_name/"
  echo "It may take a few minutes for the site to be deployed."
  echo ""
  echo "To update your site in the future, simply:"
  echo "1. Make your changes"
  echo "2. Run: git add ."
  echo "3. Run: git commit -m \"Your update message\""
  echo "4. Run: git push origin main"
else
  echo "❌ Failed to push to GitHub. Please check your credentials and try again."
  echo "You can manually push with: git push -u origin main"
fi
