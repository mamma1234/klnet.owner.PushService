
const pgsqlPool = require("./pool.js").pgsqlPool



const logger = require('./../Log.js');

const plismPlusKey = require("./../projectKey/plismplus-firebase-adminsdk-uvveh-64b9a7ce24.json");
// const plismPlusDEVKey = require("./../projectKey/plismplus-firebase-adminsdk-uvveh-eca7ed4d15.json");
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(plismPlusKey),
})

const searchPushMessage = () => {
    let sql =  "";
    sql += " select a.app_id, a.push_seq, a.service_gubun, a.push_title, a.push_body, a.push_param,a.device_id, b.fcm_token, b.push_send_time_fm, b.push_send_time_to from own_push_message a, own_push_user b, own_push_user_setting c "
    sql += " where a.user_no = b.user_no "
    sql += " and a.device_id = b.device_id"
    sql += " and b.user_no = c.user_no "
    sql += " and a.app_id = b.app_id "
    sql += " and b.app_id = c.app_id"
    sql += " and b.device_id = c.device_id "
    sql += " and c.service_gubun = a.service_gubun "
    sql += " and c.service_use_yn = 'Y' "
    sql += " and a.send_flag ='N' "
    sql += " and a.insert_date between now() - interval '12 hours' and now() + interval '1day' "
    sql += " and (case when sign( cast(b.push_send_time_to as integer) - cast(b.push_send_time_fm as integer) ) = -1 "
    sql += " then case when sign(cast(b.push_send_time_fm as integer) - cast(TO_CHAR(now(),'HH24MI') as integer)) = -1 "
    sql += " then case when sign(cast(TO_CHAR(now(),'HH24MI') as integer) - 2400) = -1 "
    sql += " then 1 "
    sql += " else "
    sql += " case when sign(cast(TO_CHAR(now(),'HH24MI') as integer) - cast(b.push_send_time_to as integer)) = -1 "
    sql += " then 1 " 
    sql += " else 0 "
    sql += " end "
    sql += " end "
    sql += " else case when sign(cast(TO_CHAR(now(),'HH24MI') as integer) - cast(b.push_send_time_to as integer)) = -1 "
    sql += " then 1 "
    sql += " else -1 "
    sql += " end "
    sql += " end "
    sql += " else case when sign(cast(b.push_send_time_fm as integer) - cast(TO_CHAR(now(),'HH24MI') as integer)) = -1 "
    sql += " then case when sign(cast(TO_CHAR(now(),'HH24MI') as integer) - cast(b.push_send_time_to as integer)) = -1 "
    sql += " then 1 "
    sql += " else 0 "
    sql += " end "
    sql += " else 0 "
    sql += " end "
    sql += " end) = 1 "
    sql += " limit 100 "
    pgsqlPool.connect(function(err,conn,done) {
        if(err){
            console.log("err" + err);
            done();
            return;
        }

        conn.query(sql, function(err,result){
           
            if(err){
                console.log(err);
                done();
                logger.Log(err,'error')
            }
            
            if(result != null) {
                
              done();
              if(result.rowCount > 0 ) {
                
                result.rows.forEach(element => {
                    if( element.app_id ==="PLISMPLUS" || element.app_id ==="PLISMPLUS_DEV") {
                      sendPush(element);
                    }
                })
              }
            } else {
              done();
              logger.Log('empty','info')
            }
        });

        // conn.release();
    })
    
}


const sendPush = (param) => {
  const msg = {
    notification: {
      title:param.push_title,
        
      body:param.push_body
    },
    token:param.fcm_token
  }


  admin.messaging().send(msg).then(
    res=>{
      logger.Log(res,'info')
      successPush(param)
    }
  ).catch(e => {
    if(e.errorInfo.code = 'messaging/registration-token-not-registered') {
      
    }
    
    failPush(param);});
}


const successPush = (param) => {
  logger.Log(param.app_id +'>>>>>>>  Success Title : ' + param.push_title + ' body : ' + param.push_body + ' Seq = ' + param.push_seq,'info');

  let sql = "";

  sql += " update own_push_message set send_flag = 'Y' "
  sql += " where push_seq = '"+ param.push_seq +"';"
  sql += " update own_push_user set last_receive_date = now()"
  sql += " where device_id = '"+ param.device_id +"'"
  sql += " and app_id = '"+param.app_id+"';"
  pgsqlPool.connect(function(err,conn,done) {
    if(err){
        console.log("err" + err);
        done();
        return;
    }

    conn.query(sql, function(err,result){
       
        if(err){
            console.log(err);
            done();
            response.status(400).send(err);
        }
        
        if(result != null) {
            
          logger.Log('sendPush query = '+sql ,'info')
          done();
        } else {
          done();
          response.status(200).json([]);
        }

    });

    // conn.release();
})

}

const failPush = (param) => {
  logger.Log('Fail Title : ' + param.push_title + 'body : ' + param.push_body + ' info' + 'Seq = ' + param.push_seq,'info');
  let sql = "";

  sql += " update own_push_message set send_flag = 'C' "
  sql += " where push_seq = '"+ param.push_seq +"';"
  pgsqlPool.connect(function(err,conn,done) {
    if(err){
        console.log("err" + err);
        done();
        return;
    }

    conn.query(sql, function(err,result){
       
        if(err){
            console.log(err);
            done();
            response.status(400).send(err);
        }
        
        if(result != null) {
            
          logger.Log('failPush query = '+sql ,'error')
          done();
        } else {
          done();
          response.status(200).json([]);
        }

    });

    // conn.release();
})

}


module.exports = {
  searchPushMessage
}