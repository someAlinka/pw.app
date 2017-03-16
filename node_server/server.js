var http = require('http'),
	mysql = require('mysql'),
	connection = mysql.createConnection({
	  host     : '127.0.0.1',
	  user     : 'parrot',
	  password : '123456',
	  database : 'parrot.wings'
	});

	connection.connect();

http.createServer(function(req, res) {
	console.log(req.url);
    res.writeHead(200, {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Method" : "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": req.headers["access-control-request-headers"]
    });

    switch (req.url) {
    	case "/login":
    		login(req, res);
    		break;
    	case "/registration":
    		registration(req, res);
    		break;
    	case "/transaction":
    		transaction(req, res);
    		break;
    	case "/history":
    		history(req, res);
    		break;
    	default:
    		console.log('smth wrong');
    }

}).listen(8080);

console.log('Server running on port 8080');





function login(request, response){
	var data = '';
    request.on('data', function(chunk) {
        data += chunk.toString();
    });
    request.on('end', function() {
    	var params = data.split(",");
        var queryLogin = "SELECT * FROM `users` WHERE email = '" + params[0] + "'";
        connection.query(queryLogin,  "", function(err, rows, fields){
        	if (!err && rows.length){
            	if(rows[0].password === params[1]){
            		response.end(JSON.stringify({ 
					    success: true,
					    userId:  rows[0].id,
					    userName:  rows[0].username,
					    idToken: rows[0].id_token,
					    balance: rows[0].balance
					}));
            	}else{
            		response.end(JSON.stringify({ 
					    success: false,
					    passMess: "Wrong password."
					}));
            	}
            }else{
            	response.end(JSON.stringify({ 
				    success: false,
				    mailMess: "Email does not exist."
				}));
            }
        });
    });
}

function registration(request, response){
    var data = '';
    request.on('data', function(chunk) {
        data += chunk.toString();
    });
    request.on('end', function() {
    	var queryParams = data.split(",");
        var queryissetUser = "SELECT `email` FROM `users` WHERE email = '" + queryParams[1] + "'";
        connection.query(queryissetUser,  "", function(err, rows, fields){
        	if(!err && !rows.length){
        		var token = Math.random().toString(18).substr(2);
        		var queryRegister = "INSERT INTO `users` (`username`,`password`,`email`,`balance`, `id_token`) VALUES ('"+queryParams[0]+"','"+queryParams[2]+"','"+queryParams[1]+"',500,'"+token+"');";
        		connection.query(queryRegister,  "", function(err, rows, fields){
        			if(!err){
        				response.end(JSON.stringify({ 
						    success: true,
						    userName:  queryParams[0],
						    idToken: token
						}));
					}
        		});

        	}else{
        		response.end(JSON.stringify({ 
				    success: false,
				    mailMess: "Email already exists."
				}));
        	}
        });
    });
}

function transaction(request, response){
	var data = '';
    request.on('data', function(chunk) {
        data += chunk.toString();
    });
    request.on('end', function() {
    	var queryParams = data.split(",");
        var queryBalance = "SELECT `id`,`balance` FROM `users` WHERE email = '" + queryParams[0] + "'";
        connection.query(queryBalance,  "", function(err, rows, fields){
        	if(!err && rows.length){
        		balance = rows[0].balance;
        		userId = rows[0].id;
	            var queryRegister = "SELECT `balance` FROM `users` WHERE email = '" + queryParams[1] + "'";
	    		connection.query(queryRegister,  "", function(err, rows, fields){
	    			if(!err && rows.length){
	    				if(balance && balance >= queryParams[2]){
	    					var balanceRes = balance-queryParams[2];
	    					var balanceRecipientRes = parseInt(rows[0].balance)+parseInt(queryParams[2]);
	    					var queryInsert = "INSERT INTO `transactions` (`userId`,`email_recipient`, `email_sender`,`transaction_balance`,`result_sender`,`result_recipient`) "+
												"VALUES ("+userId+",'"+queryParams[1]+"', '"+ queryParams[0] +"',"+queryParams[2]+","+balanceRes+","+balanceRecipientRes+");";
							connection.query(queryInsert,  "", function(err, rows, fields){console.log(err);});

							var queryUpdate = "UPDATE `users` SET balance="+balanceRes+" WHERE email='"+queryParams[0]+"';";
							connection.query(queryUpdate,  "", function(err, rows, fields){console.log(err);});
							queryUpdate = "UPDATE `users` SET balance="+balanceRecipientRes+" WHERE email='"+queryParams[1]+"';";
							connection.query(queryUpdate,  "", function(err, rows, fields){console.log(err);});
							response.end(JSON.stringify({ 
							    success: true
							}));
			        	} else{
			        		response.end(JSON.stringify({ 
							    success: false,
							    balanceMess: "Not enough money in your account."
							}));
							return false;
			        	}
					}else{
						response.end(JSON.stringify({ 
						    success: false,
						    mailMess: "User not exists."
						}));
					}
	    		});
        	}else{
        		response.end(JSON.stringify({ 
				    success: false,
				    mailMess: "Your email not found."
				}));
				return false;
        	}
        });
    });
}

function history(request, response){
	var data = '';
    request.on('data', function(chunk) {
        data += chunk.toString();
    });
    request.on('end', function() {
    	var params = data.split(",");
        var queryGetHistory = "SELECT * FROM `transactions` WHERE userId = '" + params[0] + "' OR email_recipient = '" + params[1] + "'";
        connection.query(queryGetHistory,  "", function(err, rows, fields){
        	if(!err && rows.length){
        		response.end(JSON.stringify({ 
				    success: true,
				    history: rows
				}));
        	}else{
        		response.end(JSON.stringify({ 
				    success: false
				}));
        	}
        });
    });
}