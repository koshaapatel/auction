
module.exports = function(){
    return {
        mysqlConf: {
            connectionLimit: 20,
            host: 'localhost',
            user: 'root',
            port: '3306',
            password: '',
            database: 'auctionDb',
            multipleStatements: true
        },
        port: {
            number: 3000
        },
        host: {
            ip: 'localhost'
        }
    };
};


