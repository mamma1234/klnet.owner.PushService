const winston = require('winston');
const moment = require('moment');
require('moment-timezone')
const fs = require('fs')
const directory =  process.env.LOG_PATH
moment.tz.setDefault('Asia/Seoul');
const Log = (text,gubun) => {

    if(!fs.existsSync(directory)) {
        fs.mkdirSync(directory)
    }
    console.log(text)
    const logger = winston.createLogger({
        level:'debug',
        transports:[
            new winston.transports.File({
                filename:`${process.env.LOG_PATH}/${moment().format('YYYY-MM-DD')}.log`,
                zippedArchive:false,
                format: winston.format.printf(
                    info => `${moment().format('YYYY-MM-DD HH:mm:ss')} [${info.level.toUpperCase()}] - ${info.message}`
                )
            })
        ]
    })
    if(gubun === 'info') {
        logger.info(text)
    }else if(gubun === 'error') {
        logger.error(text)
    }else {
        logger.debug(text)
    }
    

}
module.exports ={
    Log
}
