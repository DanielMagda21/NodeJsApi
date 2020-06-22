const express = require('express');
const app = express();
const sql = require("mssql");
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
app.use(bodyParser.json())
const config = {
    user: 'admin',
    password: 'admin',
    server: '192.168.0.100',
    database: 'FitBase',
    instanceName: 'SQLEXPRESS',
    port: 1433
};
app.post("/Register", function (req, res) {
    sql.connect(config, function (err) {
        var salt = bcrypt.genSaltSync(10); ///Generating salt for User Password
        var hashed = bcrypt.hashSync(req.body.Password, salt) /// Hashing Password using bcrypt 
        if (err) console.log(err);
        var request = new sql.Request();
        request.input('UserName', sql.VarChar, req.body.UserName)///
        request.input('Email', sql.VarChar, req.body.Email)///
        request.input('Goal', sql.VarChar, req.body.Goal)///
        request.input('Activity', sql.VarChar, req.body.Activity)///
        request.input('Gender', sql.VarChar, req.body.Gender)/// Request input values with Data provided in Request 
        request.input('Date', sql.VarChar, req.body.Date)///
        request.input('Height', sql.VarChar, req.body.Height)///
        request.input('Weight', sql.VarChar, req.body.Weight)///
        request.input('Password', sql.VarChar, hashed)///
        let sqlquery = "Insert INTO Users ( UserName,Email,Password) Values (@UserName,@Email,@Password)";  /// Query that insert new user Data into DataBase
        let sqlquery2 = "SELECT UserName ,Email FROM Users where Email=@Email AND UserName=@UserName"; /// Query that Check if user with provided data already dont exist 
        let sqlquery3 = "Insert INTO FitData ( Goal,Activity,Gender,Height,Weight,Date) Values (@Goal,@Activity,@Gender,@Height,@Weight,@Date)"; ///Query that insert new user Data 
        request.query(sqlquery2, function (err, data) {
            if (data.recordset.length !== 0) {  /// Handling existing user respone from DataBase
                console.log("alredy exist");
                res.sendStatus(409);
            }
            else if (err) {
                res.sendStatus(500);
            }
            else {
                console.log("good")
                request.query(sqlquery, function (err, dataa) { /// Trying insert data into Users Table 

                    if (err) { console.log("error"); }
                    else if (dataa) {
                        request.query(sqlquery3, function (err, data) { /// Trying insert data into FitData Table 
                            if (err) {
                                res.sendStatus;
                            }
                            else {
                                res.sendStatus(200);
                            }
                        })
                    }
                })
            }
        });



    });
});
app.post("/Login", function (req, res) {
    sql.connect(config, function (err) {
        var UserName = req.body.UserName; /// Variable that get Request UserName Data
        if (err) console.log(err);
        var request = new sql.Request();
        request.input('UserName', sql.VarChar, UserName) /// Request input that insert Variable into sql query 
        let sqlquery = "SELECT UserName ,Password,Email FROM Users where UserName=@UserName"; /// Sql query that check if user exist 
        request.query(sqlquery, function (err, data) {

            if (data.recordset.length == 0) { /// Handling not existing User 
                res.sendStatus(404);
                console.log("no account found ");
            }
            else if (err) { /// Handling errors 
                res.sendStatus(500);
                console.log("error" + err.message);
            }
            else if (data) {
                bcrypt.compare(req.body.Password, data.recordset[0].Password, function (err, result) { /// Cpmparing user provided Password with hashed Password in DataBase
                    if (result) { 

                        res.send(result)
                        console.log("Result " + result);
                    }
                    else if (!result) { /// Handling wrong password result 

                        res.sendStatus(401);
                        console.log("wrong password " + result);
                    }
                    else {
                        res.sendStatus(500);
                        console.log("error" + err.message);
                    }
                })
            }

        });



    });
});
app.post("/BMI", function (req, res) {
    sql.connect(config, function (err) {
        var UserName = req.body.UserName; /// UserName request value  provided by User 
        if (err) console.log(err);
        var request = new sql.Request();
        request.input('UserName', sql.VarChar, UserName)  /// SQL query variable input 
        let sqlquery = "SELECT Gender,Height,Weight,Date FROM FitData INNER JOIN Users ON Users.UserID=FitData.FitId Where UserName=@UserName"; /// Query gettin user BMI data 
        request.query(sqlquery, function (err, data) {

            if (data.recordset.length == 0) { /// Handling not user found response 
                res.send(data)
                console.log("no account found " + data.recordset);
            }
            else if (err) { /// Handling errors 
                res.sendStatus(404);
                console.log("error" + err.message);

            }
            else {
                res.send(data.recordset); 
                console.log("Result " + data.recordset);
            }

        });
    });
});
app.post("/Product", function (req, res) {
    sql.connect(config, function (err) {
        var BarCode = req.body.BarCode; /// BarCode provided by User 
        var request = new sql.Request();
        request.input('BarCode', sql.VarChar, BarCode) /// Request input with BarCode variable 
        let sqlquery = "SELECT Name,Kcal,Fat,Carbs,Sugar,Weight  FROM Nutritions where BarCode=@BarCode"; /// SQL query that get Product Data from DataBase
        request.query(sqlquery, function (err, data) {
            if (data.recordset.length !== 0) { ///Handling  not existing Product 
                console.log("Product not found" + data.recordset);
                res.send(data.recordset);
                
            }
            else if (err) {
                res.sendStatus(500);
            }
            else {
                console.log("good")
                res.sendStatus(400);

            }
        })

    });
});
app.post("/ProductNew", function (req, res) {
    sql.connect(config, function (err) {
        var BarCode = req.body.BarCode;///
        var Name = req.body.Name;///
        var Kcal = req.body.Kcal;///
        var Fat = req.body.Fat;///
        var Carbs = req.body.Carbs;/// User data provided by Request Body Data 
        var Sugar = req.body.Sugar;///
        var Weight = req.body.Weight;///
        var request = new sql.Request();
        request.input('BarCode', sql.VarChar, BarCode) ///
        request.input('Name', sql.VarChar, Name) ///
        request.input('Kcal', sql.VarChar, Kcal) ///
        request.input('Fat', sql.VarChar, Fat) /// SQl query inputs with provided Data 
        request.input('Carbs', sql.VarChar, Carbs) ///
        request.input('Sugar', sql.VarChar, Sugar) ///
        request.input('Weight', sql.VarChar, Weight) ///
        let sqlquery = "Insert INTO Nutritions ( BarCode,Name,Kcal,Fat,Carbs,Sugar,Weight) Values (@BarCode,@Name,@Kcal,@Fat,@Carbs,@Sugar,@Weight)";/// Inserting new Product 
        request.query(sqlquery, function (err, data) {
            if (!data) { 
                console.log("not DataBase Response");
                res.sendStatus(409);
            }
            else if (err) {
                res.sendStatus(500);
            }
            else {
                console.log("good")
                res.sendStatus(200);
               
                   
            }
        })

    });
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server runnin');
});

