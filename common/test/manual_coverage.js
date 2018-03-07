
const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const comsupport = require('./mocha_common_support.js');


describe('EveryPass Specific Testing', function () {

    var driver;

    before(async function () {

        this.timeout(30000);

        console.log("------------ opening  browser -------------");

        driver = await new webdriver.Builder()
                .forBrowser('firefox')           
                .build();
    });

    after(async function () {               
       
        console.log("------------ browser closed -------------");

    });   
    
    
    it('Manual UI Tests.', async function(){
        
        //sets test timeout to 10s
        this.timeout(600000);      
          
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        var closedBrowser = false;
        
        while(!closedBrowser)
        {
            try
            {                 
                await comsupport.refreshCoverage(driver);                
                // browser is open
            }         
            catch(e) 
            {                    
                closedBrowser = true;                                             
            }
            
            await sleep(1000);
        }       
    });    
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
