var dataUrl = "https://query.yahooapis.com/v1/public/yql?q=select+%2A+from+csv+where+%0D%0Aurl%3D%27http%3A%2F%2Fdownload.finance.yahoo.com%2Fd%2Fquotes.csv%3Fs%3DAAPL%2BGOOG%2BABB%2BCYBR%2BGFN%2BACAD%26f%3Dsl1d1t1c1ohgv%26e%3D.csv%27+%0D%0Aand+columns%3D%27symbol%2Cprice%2Cdate%2Ctime%2Cchange%2Ccol1%2Chigh%2Clow%2Ccol2%27&format=json&env=store://datatables.org/alltableswithkeys";

var stockPrices;

var portfolio = {
    AAPL : {
        currentShares : 50,
        desiredPercentage: 22,
        currentPrice : 0,
        bought: 0,
        sold: 0
    },
    GOOG : {
        currentShares : 200,
        desiredPercentage: 38,
        currentPrice : 0,
        bought: 0,
        sold: 0
    },
    CYBR : {
        currentShares : 150,
        desiredPercentage: 0,
        currentPrice : 0,
        bought: 0,
        sold: 0
    },
    ABB : {
        currentShares : 900,
        desiredPercentage: 0,
        currentPrice : 0,
        bought: 0,
        sold: 0
    },
    GFN : {
        currentShares : 0,
        desiredPercentage: 25,
        currentPrice : 0,
        bought: 0,
        sold: 0
    },
    ACAD : {
        currentShares : 0,
        desiredPercentage: 15,
        currentPrice : 0,
        bought: 0,
        sold: 0
    }
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function myCallback(data){
    stockPrices = JSON.parse(data);
    for(let i = 0; i < stockPrices.query.results.row.length; i++){
        getPrices(stockPrices.query.results.row[i].symbol);
    }

    balancePortfolio();
}

function getPrices(name){
    for(let i = 0; i < stockPrices.query.results.row.length; i++){
        if(stockPrices.query.results.row[i].symbol === name){
            portfolio[name].currentPrice = stockPrices.query.results.row[i].price;
        }
    }
}

function balancePortfolio(){
    let highestShare = {
        amount : 0,
        target : 0,
        multi : 0,
        sold: 0,
        bought: 0,
        balance : 0,
        total: 0
    };

    for(let i = 0; i < Object.keys(portfolio).length; i++){
        highestShare.total += portfolio[Object.keys(portfolio)[i]].currentShares;
        if(portfolio[Object.keys(portfolio)[i]].currentShares > highestShare.amount && portfolio[Object.keys(portfolio)[i]].desiredPercentage > 0){
            highestShare.amount = portfolio[Object.keys(portfolio)[i]].currentShares;
            highestShare.target = portfolio[Object.keys(portfolio)[i]].desiredPercentage;
        }
    }

    if(highestShare.amount % highestShare.target !== 0){
        var n = Math.abs(highestShare.amount / highestShare.target);
        var decimal = n - Math.floor(n);
        
        if(decimal > 0.5){
            highestShare.multi = parseInt(highestShare.amount / highestShare.target) + 1;
        }
        else{
            highestShare.multi = parseInt(highestShare.amount / highestShare.target);
        }
    }
    else{
        highestShare.multi = parseInt(highestShare.amount / highestShare.target);
    }

    for(let i = 0; i < Object.keys(portfolio).length; i++){
        let targetAmount = portfolio[Object.keys(portfolio)[i]].desiredPercentage * highestShare.multi;

        if(portfolio[Object.keys(portfolio)[i]].currentShares > targetAmount){
            highestShare.balance -= (portfolio[Object.keys(portfolio)[i]].currentShares - targetAmount) * portfolio[Object.keys(portfolio)[i]].currentPrice;
            highestShare.sold += (portfolio[Object.keys(portfolio)[i]].currentShares - targetAmount) * portfolio[Object.keys(portfolio)[i]].currentPrice;
            portfolio[Object.keys(portfolio)[i]].sold = portfolio[Object.keys(portfolio)[i]].currentShares - targetAmount;
            portfolio[Object.keys(portfolio)[i]].currentShares = targetAmount;
            highestShare.total -= portfolio[Object.keys(portfolio)[i]].sold;
            document.getElementById(Object.keys(portfolio)[i] + "-Sold").innerHTML = portfolio[Object.keys(portfolio)[i]].sold;
        }
        else{
            highestShare.balance += (targetAmount - portfolio[Object.keys(portfolio)[i]].currentShares) * portfolio[Object.keys(portfolio)[i]].currentPrice;
            highestShare.bought += (targetAmount - portfolio[Object.keys(portfolio)[i]].currentShares) * portfolio[Object.keys(portfolio)[i]].currentPrice;
            portfolio[Object.keys(portfolio)[i]].bought = targetAmount - portfolio[Object.keys(portfolio)[i]].currentShares;
            portfolio[Object.keys(portfolio)[i]].currentShares = targetAmount;
            highestShare.total += portfolio[Object.keys(portfolio)[i]].bought;
            document.getElementById(Object.keys(portfolio)[i] + "-Bought").innerHTML = portfolio[Object.keys(portfolio)[i]].bought;
        }

        document.getElementById(Object.keys(portfolio)[i] + "-StockFinal").innerHTML = portfolio[Object.keys(portfolio)[i]].currentShares;
        document.getElementById(Object.keys(portfolio)[i] + "-Price").innerHTML = portfolio[Object.keys(portfolio)[i]].currentPrice;

        if(portfolio[Object.keys(portfolio)[i]].bought === 0){
            document.getElementById(Object.keys(portfolio)[i] + "-Total").innerHTML = portfolio[Object.keys(portfolio)[i]].sold * portfolio[Object.keys(portfolio)[i]].currentPrice;
        }
        else{
            document.getElementById(Object.keys(portfolio)[i] + "-Total").innerHTML = portfolio[Object.keys(portfolio)[i]].bought * portfolio[Object.keys(portfolio)[i]].currentPrice;
        }
    }

    for(let i = 0; i < Object.keys(portfolio).length; i++){
        document.getElementById(Object.keys(portfolio)[i] + "-Percent").innerHTML = (portfolio[Object.keys(portfolio)[i]].currentShares/highestShare.total) * 100;
    }

    document.getElementById("soldEquitySpan").innerHTML = highestShare.sold;
    document.getElementById("neededEquitySpan").innerHTML = highestShare.bought;
    document.getElementById("outOfPocketEquitySpan").innerHTML = highestShare.balance;
}

httpGetAsync(dataUrl, myCallback);