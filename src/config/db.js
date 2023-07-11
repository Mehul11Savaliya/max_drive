const {Sequelize} = require("sequelize");

const sequelize = new Sequelize(process.env['DB'], process.env['DB_ID'], process.env['DB_PASS'],{
    host:process.env['DB_HOST'],
    dialect:'postgres',
    hooks:true
});

const testDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log(`Connection has been established with DATABASE :  ${process.env.DB}  successfully.`);
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};

module.exports = {sq: sequelize, testDbConnection};