#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Function to replace placeholders in files
function replacePlaceholder(filePath, appName) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<APP_NAME>/g, appName);
    fs.writeFileSync(filePath, content, 'utf8');
}

// Function to create the app from the template
async function createApp() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'appName',
            message: 'What would you like to name your app?',
            default: 'my-web-app'
        },
        {
            type: 'confirm',
            name: 'useEJS',
            message: 'Do you want to use EJS as your template engine?',
            default: true
        }
    ]);

    const { appName } = answers;
    const appDir = path.join(process.cwd(), appName);

    if (fs.existsSync(appDir)) {
        console.log(chalk.red(`Directory "${appName}" already exists. Please choose a different name.`));
        return;
    }

    console.log(chalk.green(`Creating app: ${appName}...`));

    // Create the app directory
    fs.mkdirSync(appDir);

    // Copy template folder to the new app directory
    await fs.copy(path.join(__dirname, 'template'), appDir);

    // Replace placeholders in the copied files
    const files = [
        path.join(appDir, 'package.json'),
        path.join(appDir, 'app.js'),
        path.join(appDir, 'views', 'index.ejs'),
    ];

    files.forEach(file => replacePlaceholder(file, appName));

    console.log(chalk.green(`App structure for "${appName}" created successfully!`));

    // Install dependencies
    console.log(chalk.yellow('Installing dependencies...'));
    const exec = require('child_process').exec;
    exec(`cd ${appDir} && npm install`, (err, stdout, stderr) => {
        if (err) {
            console.log(chalk.red('Error installing dependencies.'));
            console.error(stderr);
            return;
        }
        console.log(chalk.green('Dependencies installed.'));
        console.log(chalk.green(`Your app "${appName}" has been created!`));
        console.log(chalk.green(`Run "cd ${appName} && npm start" to start the app.`));
    });
}

// Run the app creation process
createApp();