#!/usr/bin/env node

import chalk from "chalk"
import inquirer from "inquirer";
import { Spinner, createSpinner } from "nanospinner";

let authenticated: boolean = false;

const sleep = async (ms = 2000) => {
  await new Promise((r) => {
    setTimeout(r, ms);
  });
}

const askAmount = async (totalBalance: any, insufficiency: boolean = true) => {
  return inquirer.prompt([
    {
      name: "amount",
      type: "input",
      message: "Enter the amount: $",
      validate: function (value: string) {
        if (/[\D]/.test(value)) {
          return "Enter an amount";
        }

        if (insufficiency) {
          if (value > totalBalance) {
            return "Insufficient funds. Please try a smaller amount.";
          }
        }

        return true;
      }
    }
  ]);
}

const login = async () => {
  return inquirer.prompt([{
    name: "userid",
    type: "input",
    message: "Please enter your user ID: ",
    validate: function (value: string) {
      if (/[\D]/.test(value)) {
        return "Enter a valid id";
      } else {
        return true;
      }
    }
  },
  {
    name: "userpin",
    type: "password",
    message: "Please enter your PIN: ",
    validate: function (value: string) {
      if (/[\D]/.test(value) || value.length !== 4) {
        return "Enter a valid 4 digit pin";
      } else {
        return true;
      }
    }
  }]);
}

const atm = async (totalBalance: number, processingSpinner: Spinner) => {
  let amount: number;

  let result: { using: boolean, totalBalance: number } = { using: true, totalBalance: totalBalance };

  let option = await inquirer.prompt([
    {
      name: "option",
      type: "list",
      message: "Please select an option:",
      choices: ["Withdraw Cash", "Deposit Money", "Check Balance", "Exit"]
    }
  ]);

  if (option.option == "Withdraw Cash") {
    amount = (await askAmount(totalBalance)).amount;
    processingSpinner.start();
    await sleep();
    totalBalance -= amount;
    processingSpinner.success({ text: `Withdrawal successful. Your new balance is $${ totalBalance }.\n` });
    result = { using: true, totalBalance: totalBalance };
  } else if (option.option == "Deposit Money") {
    amount = parseInt((await askAmount(totalBalance, false)).amount);
    processingSpinner.start();
    await sleep();
    totalBalance += amount;
    processingSpinner.success({ text: `Deposit successful. Your new balance is $${ totalBalance }.\n` });
    result = { using: true, totalBalance: totalBalance };
  } else if (option.option == "Check Balance") {
    processingSpinner.start();
    await sleep();
    processingSpinner.success({ text: `Your current balance is $${ totalBalance }.\n` });
    result = { using: true, totalBalance: totalBalance };
  } else if (option.option == "Exit") {
    if ((await inquirer.prompt([{ name: "exit", type: "confirm", message: "Are you sure want to exit?" }])).exit == true) {
      result = { using: false, totalBalance: totalBalance };
      console.log(chalk.bold("Thank you for using the ATM."));
    }
  }

  return result;
}

const main = async () => {
  let authenticateInputs: { userid: number, userpin: number };

  let authenticationSpinner = createSpinner("Authenticating... Please wait.");
  let processingSpinner = createSpinner("Processing... Please wait.");

  let using = true;

  let atmFunc: { using: boolean, totalBalance: number };

  let totalBalance = Math.floor(Math.random() * 10000)

  console.log(chalk.bold("Welcome to the ATM.\n"));

  do {
    authenticateInputs = await login();

    authenticationSpinner.start();
    await sleep();

    if (authenticateInputs.userid == 123456 && authenticateInputs.userpin == 7890) {
      authenticationSpinner.success({ text: "Authentication successful.\n" });
      authenticated = true;
    } else {
      authenticationSpinner.error({ text: "Authentication failed. Please try again.\n" });
    }
  } while (!authenticated);

  do {
    atmFunc = await atm(totalBalance, processingSpinner);
    using = atmFunc.using;
    totalBalance = atmFunc.totalBalance;
  } while (using)
}

main();
