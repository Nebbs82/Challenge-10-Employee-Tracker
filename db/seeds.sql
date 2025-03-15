INSERT INTO department (name)
VALUES ('Lawyer'),
       ('Finance'),
       ('Developer'),
       ('Human Resources');
       
       
INSERT INTO role (id, title, salary, department_id)
VALUES (1,'Lawyer', 210000.00, 1),
       (2,'Finance', 500000.00, 2),
       (3,'Developer', 110000.00, 3),
       (4,'Human Resources', 50000.00, 4 );

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1,'Tim', 'Velasquez', 1, NULL),
       (2,'Matt', 'Unrein', 2, NULL),
       (3,'Nathan', 'Ebbesen', 3, NULL),
       (4,'Beelzebub', 'Satanos', 4, NULL);