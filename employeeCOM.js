// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const idQuery = require("./lib/idQuery");
let employees = [];
let jobs = [];
let departments = [];
let managers = [];

// Create a connection to the database
const connection = mysql.createConnection({
  host: "localhost",

  //Your port; if not 3306
  port: 3306,

  // Your username
  user: "homework",

  // Your password
  password: "Hello123",
  database: "employee_db",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log(`
  ,----------------------------------------------------------.
  |      ______                 _                            |
  |     |   __/ _ __ ___  _ __ | | ___  _   _  ___  ___      |
  |     |   _| |  _ '  _ \\  _ \\| |/ _ \\| | | |/ _ \\/ _ \\     |
  |     |  |___  | | | | | |_) | | (_) | |_| |  __/  __/     |
  |     |______|_| |_| |_|  __/|_|\\___/\\___, |\\___|\\___|     |
  |                      |__|           |___/                |
  |                                                          |
  |         __  __                                           |
  |        |  \\/  | __ _ _ __   __ _  __ _  ___ _ __         |
  |        | |\\/| |/ _' | '_ \\ / _' |/ _' |/ _ \\ '__|        |
  |        | |  | | (_| | | | | (_| | (_| |  __/ |           |
  |        |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|           |
  |                                  |___/                   |
  '----------------------------------------------------------'
    `);
  start();
  // removeEmployee();
});

async function start() {
  // Get a list of the emploees and managers
  getEmployee();
  getManager();
  getDepartment();
  getJob();

  // Get the user action
  let answers = await inquirer.prompt(introQuestion);
  switch (answers.action) {
    case "View All Employees":
      viewAll();
      break;
    case "View All Employees By Department":
      viewDepartment();
      break;
    case "View All Employees By Manager":
      getEmployee();
      break;
    case "Add Employee":
      addNewEmployee();
      break;
    case "Remove Employee":
      removeEmployee();
      break;
    case "Update Employee Role":
      break;
    case "Update Employee Manager":
      break;
    case "Add Department":
      break;
    case "Remove Department":
      break;
    case "Update Department":
      break;
    case "Add Role":
      break;
    case "Remove Role":
      break;

    default:
      connection.end();
  }
}

// Questions
const introQuestion = [
  {
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "View All Employees By Department",
      "View All Employees By Manager",
      "Add Employee",
      "Remove Employee",
      "Update Employee Role",
      "Update Employee Manager",
      "Add Department",
      "Remove Department",
      "Update Department",
      "Add Role",
      "Remove Role",
      "Exit",
    ],
  },
];

function viewAll() {
  let newQuery = new idQuery();

  connection.query(newQuery.viewAll_Q(), function (err, result) {
    if (err) throw err;
    console.table(result);
    start();
  });
}

async function viewDepartment() {
  let selectDept = await inquirer.prompt([
    {
      type: "list",
      message: "What department would you like to see?",
      name: "departmentChoice",
      choices: function () {
        let choiceArr = [];
        for (let i = 0; i < departments.length; i++) {
          let tempChoice = {
            name: departments[i].name,
            value: departments[i].value,
          };
          choiceArr.push(tempChoice);
        }
        return choiceArr;
      },
    },
  ]);

  let newQuery = new idQuery(parseInt(selectDept.departmentChoice));

  connection.query(newQuery.viewDepartment_Q(), function (err, result) {
    if (err) throw err;
    console.table(result);
    start();
  });
}

// Create function to add an employee
async function addNewEmployee() {
  // Questions about the new employee info
  let newEmployee = await inquirer.prompt(addEmployee);

  // Add new employee to the database
  connection.query(
    "INSERT INTO employee SET ?",
    {
      first_name: newEmployee.employeeFirstName,
      last_name: newEmployee.employeeLastName,
      job_id: newEmployee.employeeRole,
      manager_id: newEmployee.employeeManager,
    },
    function (err) {
      if (err) throw err;
      console.log("You succesfully added an new employee!");
      // re-prompt the user
      start();
    }
  );
}

// Create function to remove an employee
function removeEmployee() {
  inquirer
    .prompt([
      {
        name: "removeEmployee",
        type: "list",
        message: "Which employee doe you want to remove?",
        choices: function () {
          let choiceArr = [];
          for (let i = 0; i < employees.length; i++) {
            let tempChoice = {
              name: employees[i].name,
              value: employees[i].value,
            };
            choiceArr.push(tempChoice);
          }
          return choiceArr;
        },
      },
    ])
    .then(function (response) {
      let name = response.removeEmployee;

      connection.query(
        "DELETE FROM employee WHERE ?",
        {
          id: name,
        },
        function (err, res) {
          if (err) throw err;
          console.log("You have removed an employee.");
          // Call readProducts AFTER the DELETE completes
          start();
        }
      );
    });
}

function getEmployee() {
  employees = [];
  connection.query("SELECT id, first_name, last_name FROM employee", function (
    err,
    results
  ) {
    for (let i = 0; i < results.length; i++) {
      let tempEmployee = {
        name: results[i].first_name + " " + results[i].last_name,
        value: results[i].id,
      };
      employees.push(tempEmployee);
    }
  });
}

function getJob() {
  jobs = [];
  connection.query("SELECT id, title FROM job", function (err, results) {
    for (let i = 0; i < results.length; i++) {
      let tempJob = {
        title: results[i].title,
        value: results[i].id,
      };
      jobs.push(tempJob);
    }
  });
}

function getDepartment() {
  departments = [];
  connection.query("SELECT id, branch FROM department", function (
    err,
    results
  ) {
    for (let i = 0; i < results.length; i++) {
      let tempDept = {
        name: results[i].branch,
        value: results[i].id,
      };
      departments.push(tempDept);
    }
  });
}

function getManager() {
  managers = [];
  connection.query(
    "SELECT id, first_name, last_name, manager_id FROM employee",
    function (err, results) {
      for (let i = 0; i < results.length; i++) {
        if (results[i].manager_id != null) {
          let tempManager = {
            name: results[i].first_name + " " + results[i].last_name,
            value: results[i].id,
          };
          managers.push(tempManager);
        }
      }
    }
  );
}

// Validation functions
function verifyName(name) {
  if (name === "") {
    return "Please enter a name";
  } else if (!isNaN(name)) {
    return "Please don't enter a number";
  } else if (name.length > 26) {
    return "Please enter a shorter name";
  }

  return true;
}

const addEmployee = [
  {
    type: "input",
    message: "What is the employee's first name?",
    name: "employeeFirstName",
    validate: verifyName,
  },
  {
    type: "input",
    message: "What is the employee's last name?",
    name: "employeeLastName",
    validate: verifyName,
  },
  {
    type: "list",
    message: "What is the employee's role?",
    name: "employeeRole",
    choices: function () {
      let choiceArr = [];
      for (let i = 0; i < jobs.length; i++) {
        let tempChoice = {
          name: jobs[i].title,
          value: jobs[i].value,
        };
        choiceArr.push(tempChoice);
      }
      return choiceArr;
    },
  },

  {
    type: "list",
    message: "What is the employee's manager?",
    name: "employeeManager",
    choices: function () {
      let choiceArr = [
        {
          name: "None",
          value: null,
        },
      ];
      for (let i = 0; i < employees.length; i++) {
        let tempChoice = {
          name: employees[i].name,
          value: employees[i].value,
        };
        choiceArr.push(tempChoice);
      }
      return choiceArr;
    },
  },
];
