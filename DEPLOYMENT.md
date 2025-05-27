# Deploying Magical Trivia Quest to GitHub Pages

This document provides step-by-step instructions for deploying your Magical Trivia Quest game to GitHub Pages, making it accessible online without requiring a local server.

## Option 1: Using the Setup Script (Recommended)

1. Open a terminal in the project directory
2. Run the setup script:
   ```bash
   ./setup-github.sh
   ```
3. Follow the prompts to enter your GitHub username
4. The script will initialize git, create a repository, and push your code to GitHub
5. After pushing, follow the instructions displayed by the script to enable GitHub Pages

## Option 2: Manual Deployment

If you prefer to set up GitHub Pages manually, follow these steps:

1. Create a new repository on GitHub named `magical-trivia-quest`
2. Initialize a git repository in your local project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[YOUR-USERNAME]/magical-trivia-quest.git
   git push -u origin main
   ```
3. Go to your repository on GitHub
4. Navigate to Settings → Pages
5. Under "Source", select "GitHub Actions"
6. Your site will be built and deployed automatically

## Updating Your Game

To update your game after making changes:

1. Make your changes to the code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```
3. GitHub Actions will automatically rebuild and deploy your site

## Testing Your Deployment

After deployment is complete:

1. Your game will be available at `https://[YOUR-USERNAME].github.io/magical-trivia-quest/`
2. Visit the site on different devices to verify it works correctly
3. Test the PWA functionality by installing it on a mobile device

## Using a Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Under "Custom domain", enter your domain name
4. Update the CNAME file in your repository with your domain name
5. Configure your domain's DNS settings according to GitHub's documentation

## Troubleshooting

If you encounter issues:

- Check GitHub Actions tab to see if there are any deployment errors
- Ensure all file paths in your code use relative paths (starting with `./`) rather than absolute paths
- Verify that the service worker is correctly configured for GitHub Pages
- Test locally using `python3 -m http.server 8080` before pushing changes
