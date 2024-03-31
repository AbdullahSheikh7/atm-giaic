#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import figlet from "figlet";
import gradientString from "gradient-string";
import { createSpinner } from "nanospinner";
const sleep = async (ms = 2000) => {
    await new Promise((r) => {
        setTimeout(r, ms);
    });
};
const askAmount = async (limit, balance = 0) => {
    return (await inquirer.prompt([
        {
            name: "amount",
            type: "input",
            message: "Please enter a amount: $",
            validate: function (value) {
                if (/[\D]/.test(value)) {
                    return "Enter a valid amount";
                }
                else {
                    if (limit && parseInt(value) > balance) {
                        return "Insuficient funds, try a smaller amount";
                    }
                    return true;
                }
            },
        },
    ])).amount;
};
const authenticate = async () => {
    return await inquirer.prompt([
        {
            name: "userid",
            type: "input",
            message: "Please enter your user ID: ",
            validate: function (value) {
                if (/[\D]/.test(value)) {
                    return "Enter a valid id";
                }
                else {
                    return true;
                }
            },
        },
        {
            name: "userpin",
            type: "password",
            message: "Please enter your PIN: ",
            validate: function (value) {
                if (/[\D]/.test(value) || value.length !== 4) {
                    return "Enter a valid 4 digit pin";
                }
                else {
                    return true;
                }
            },
        },
    ]);
};
const main = async () => {
    figlet("ATM", (error, data) => {
        console.log(gradientString.pastel.multiline(data));
    });
    await sleep(100);
    let developer = chalkAnimation.rainbow("Made by Abdullah");
    await sleep(1000);
    developer.stop();
    let github = chalkAnimation.neon("github.com/abdullahsheikh7/\n");
    await sleep(1000);
    github.stop();
    console.log(chalk.bold("Welcome to the ATM."));
    let balance = Math.floor(Math.random() * 10000);
    let processing = createSpinner("Processing... Please wait.");
    let authSpinner = createSpinner("Authenticating... Please wait.");
    await sleep();
    while (true) {
        let authInput = await authenticate();
        authSpinner.start();
        if (authInput.userid === "123456" && authInput.userpin === "7890") {
            authSpinner.success({
                text: "Authentication successful.\n",
            });
            break;
        }
        else {
            authSpinner.error({
                text: "Authentication failed. Please try again.\n",
            });
        }
    }
    while (true) {
        let option = await inquirer.prompt([
            {
                name: "option",
                type: "list",
                message: "Please select an option:",
                choices: ["Check Balance", "Withdraw", "Deposit", "Exit"],
            },
        ]);
        if (option.option === "Check Balance") {
            processing.start();
            await sleep();
            processing.success({
                text: `Your balance is $${balance}\n`,
            });
        }
        else if (option.option === "Withdraw") {
            let amount = await askAmount(true, balance);
            processing.start();
            parseInt(amount);
            balance -= amount;
            await sleep();
            processing.success({
                text: `Withdrawn $${amount}. Your new balance is $${balance}\n`,
            });
        }
        else if (option.option === "Deposit") {
            let amount = await askAmount(false);
            processing.start();
            balance += parseInt(amount);
            await sleep();
            processing.success({
                text: `Deposited $${amount}. Your new balance is $${balance}\n`,
            });
        }
        else if (option.option === "Exit") {
            if ((await inquirer.prompt([
                {
                    name: "exit",
                    type: "confirm",
                    message: "Are you sure you want to exit?",
                },
            ])).exit) {
                console.log(chalk.bold("Thank you for using the ATM."));
                break;
            }
            else {
                console.log("");
            }
        }
    }
};
main();
