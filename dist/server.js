import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';
await connectToDb();
const questions = [
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all Departments',
            'View all Roles',
            'View all Employees',
            'Add Department',
            'Add Role',
            'Add Employee',
            'Update Employee Role',
            'Exit'
        ],
    }
];
function askQuestions() {
    inquirer.prompt(questions).then((answers) => {
        handleAction(answers.action);
    });
}
function handleAction(action) {
    switch (action) {
        case 'View all Employees':
            pool.query(`
        SELECT 
          employee.id,
          employee.first_name,
          employee.last_name,
          role.title AS role,
          department.name AS department
        FROM 
          employee
        JOIN 
          role ON employee.role_id = role.id
        JOIN 
          department ON role.department_id = department.id
      `, (err, result) => {
                if (err) {
                    console.error('Error fetching employees:', err);
                }
                else {
                    console.log('\n All Employees: \n');
                    console.table(result.rows);
                    askQuestions();
                }
            });
            break;
        case 'View all Departments':
            pool.query('SELECT * FROM department', (err, result) => {
                if (err) {
                    console.error('Error fetching departments:', err);
                }
                else {
                    console.log('\n All Departments: \n');
                    console.table(result.rows);
                    askQuestions();
                }
            });
            break;
        case 'View all Roles':
            pool.query('SELECT * FROM role', (err, result) => {
                if (err) {
                    console.error('Error fetching roles:', err);
                }
                else {
                    console.log('\n All Roles: \n');
                    console.table(result.rows);
                    askQuestions();
                }
            });
            break;
        case 'Add Department':
            pool.query('SELECT * FROM department', (err, result) => {
                if (err) {
                    console.error('Error fetching departments:', err);
                }
                else {
                    console.log('\n Current Departments: \n');
                    console.table(result.rows);
                }
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'New_Department',
                        message: 'What is the name of the department?',
                    },
                ]).then((answers) => {
                    const { New_Department } = answers;
                    console.log('New_Department:', New_Department);
                    pool.query('INSERT INTO department (name) VALUES ($1) RETURNING *', [New_Department], (err) => {
                        if (err) {
                            console.error('Error inserting into department:', err);
                        }
                        else {
                            console.log(`Department: '${New_Department}' added successfully`);
                            pool.query('SELECT * FROM department', (err, result) => {
                                if (err) {
                                    console.error('Error fetching departments:', err);
                                }
                                else {
                                    console.table(result.rows);
                                }
                                CurrentDatabase();
                            });
                        }
                    });
                });
            });
            break;
        case 'Add Role':
            pool.query('SELECT id, name FROM department', (err, result) => {
                if (err) {
                    console.error('Error fetching departments:', err);
                    return;
                }
                const departments = result.rows.map((row) => ({
                    name: row.name,
                    value: row.id
                }));
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'title',
                        message: 'What is the name of the role?',
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary of the role?',
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department does the role belong to?',
                        choices: departments,
                    },
                ]).then((answers) => {
                    const { title, salary, department } = answers;
                    pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *', [title, salary, department], (err, result) => {
                        if (err) {
                            console.error('Error inserting into role:', err);
                        }
                        else {
                            console.log(`Role: '${title}' added successfully`);
                            console.log(result.rows[0]);
                            pool.query('SELECT * FROM role', (err, result) => {
                                if (err) {
                                    console.error('Error fetching roles:', err);
                                }
                                else {
                                    console.table(result.rows);
                                }
                                askQuestions();
                            });
                        }
                    });
                });
            });
            break;
        case 'Add Employee':
            pool.query('SELECT * FROM employee', (err, result) => {
                if (err) {
                    console.error('Error fetching departments:', err);
                }
                else {
                    console.table(result.rows);
                }
                pool.query('SELECT id, title FROM role', (err, result) => {
                    if (err) {
                        console.error('Error fetching roles:', err);
                        return;
                    }
                    const roles = result.rows.map((row) => ({
                        name: row.title,
                        value: row.id
                    }));
                    pool.query('SELECT id, first_name, last_name FROM employee', (err, result) => {
                        if (err) {
                            console.error('Error fetching employees:', err);
                            return;
                        }
                        const employees = result.rows.map((row) => ({
                            name: `${row.first_name} ${row.last_name}`,
                            value: row.id,
                        }));
                        const managerChoices = employees.map(employee => ({ name: `${employee.name}`, value: employee.value }));
                        managerChoices.push({ name: 'None', value: null });
                        inquirer.prompt([
                            {
                                type: 'input',
                                name: 'newEmp_FirstName',
                                message: 'What is the employees first name?',
                            },
                            {
                                type: 'input',
                                name: 'newEmp_LastName',
                                message: 'What is the employees last name?',
                            },
                            {
                                type: 'list',
                                name: 'newEmp_Role',
                                message: 'What is the employees role?',
                                choices: roles,
                            },
                            {
                                type: 'list',
                                name: 'newEmp_Manager',
                                message: 'Who is the employee\'s manager?',
                                choices: managerChoices,
                            },
                        ]).then((answers) => {
                            const { newEmp_FirstName, newEmp_LastName, newEmp_Role, newEmp_Manager } = answers;
                            pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [newEmp_FirstName, newEmp_LastName, newEmp_Role, newEmp_Manager], (err) => {
                                if (err) {
                                    console.error('Error inserting into role:', err);
                                }
                                else {
                                    console.log(`Employee: ${newEmp_FirstName} ${newEmp_LastName} added successfully`);
                                    pool.query('SELECT * FROM employee', (err, result) => {
                                        if (err) {
                                            console.error('Error fetching departments:', err);
                                        }
                                        else {
                                            console.table(result.rows);
                                        }
                                        CurrentDatabase();
                                    });
                                }
                            });
                        });
                    });
                });
            });
            break;
        case 'Update Employee Role':
            pool.query('SELECT id, first_name, last_name FROM employee', (err, result) => {
                if (err) {
                    console.error('Error fetching employees:', err);
                    return;
                }
                const employees = result.rows.map((row) => ({
                    name: `${row.first_name} ${row.last_name}`,
                    value: row.id
                }));
                pool.query('SELECT id, title FROM role', (err, result) => {
                    if (err) {
                        console.error('Error fetching roles:', err);
                        return;
                    }
                    const roles = result.rows.map((row) => ({
                        name: row.title,
                        value: row.id
                    }));
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'employee',
                            message: 'Which employee role do you want to update?',
                            choices: employees,
                        },
                        {
                            type: 'list',
                            name: 'newRoleId',
                            message: 'Select the new role:',
                            choices: roles,
                        },
                    ]).then((answers) => {
                        const { employee, newRoleId } = answers;
                        pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRoleId, employee], (err) => {
                            if (err) {
                                console.error('Error updating employee role:', err);
                            }
                            else {
                                console.log('Employee role updated successfully');
                            }
                            CurrentDatabase();
                        });
                    });
                });
            });
            break;
        case 'Exit':
            console.log('Goodbye!');
            process.exit();
        default:
            console.log('Invalid action');
            askQuestions();
    }
}
;
function CurrentDatabase() {
    console.log('Current Database State:');
    pool.query('SELECT * FROM department', (err, result) => {
        if (err) {
            console.error('Error fetching departments:', err);
        }
        else {
            console.log('\n Departments:');
            console.table(result.rows);
        }
    });
    pool.query('SELECT * FROM role', (err, result) => {
        if (err) {
            console.error('Error fetching roles:', err);
        }
        else {
            console.log('\n Roles:');
            console.table(result.rows);
        }
    });
    pool.query('SELECT * FROM employee', (err, result) => {
        if (err) {
            console.error('Error fetching employees:', err);
        }
        else {
            console.log('\n Employees:');
            console.table(result.rows);
            askQuestions();
        }
    });
}
askQuestions();
