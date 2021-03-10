const axios = require('axios');
const http = require('http');
var querystring = require('querystring');
var multer = require('multer');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  }
});

var upload = multer({
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

exports.bulk = async (req, res) => {
  upload(req,res, function (err) {
      if(err){
          res.json({err_desc:err});
          return;
      }
      /** Multer gives us file info in req.file object */
      if(!req.file){
          res.json({err_desc:"No file passed"});
          return;
      }
      /** Check the extension of the incoming file and 
       *  use the appropriate module
       */
      var exceltojson;
      if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
          exceltojson = xlsxtojson;
      } else {
          exceltojson = xlstojson;
      }
    //   console.log(req.file.path);
      try {
        exceltojson({
            input: req.file.path,
            output: null, //since we don't need output.json
            lowerCaseHeaders:true
        }, async (err,result) => {
            if(err) {
                return res.json({err_desc:err, data: null});
            } 
            // console.log(JSON.stringify(result));
            // res.json({data: result});

            const endpoint = 'https://sso.digitalservice.jabarprov.go.id';
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            const body = querystring.stringify({
                grant_type: 'client_credentials',
                client_id: 'bulk-import-users-cli',
                client_secret: '97bf1bd8-b581-4a3f-a123-41c4f4198d3a'
            });

            const login = await axios.post(`${endpoint}/auth/realms/master/protocol/openid-connect/token`, body, headers);

            const option = {
                headers: {
                    Authorization: `Bearer ${login.data.access_token}`,
                    'Content-type': 'application/json'
                },
            };

            result.forEach(async (element, key) => {
                let body = {
                    firstName: element.firstname.trim(),
                    lastName: element.lastname.trim(),
                    email: element.email.trim().toLowerCase(),
                    enabled: true,
                    username: element.email.trim(),
                    attributes: {
                        'city_code': '32.76',
                        'province_code': '32',
                        'position_title': 'Relawan Puspa'
                    }
                };

                const createUser = await axios.post(`${endpoint}/auth/admin/realms/jabarprov/users`, body, option);
                let bodyCredentials = {
                    type: 'password',
                    temporary: 'true',
                    value: 'puspajabarjuara2021'
                };
                await axios.put(createUser.headers.location + '/reset-password', bodyCredentials, option);
                await axios.put(createUser.headers.location + '/groups/7eccdad3-1d79-4eac-88da-9c4c1f73cd09', null, option);
            });
            
            // const storeUser = await result.map(async (element) => {
            //     let body = {
            //         firstName: element.firstname,
            //         lastName: element.lastname,
            //         email: element.email,
            //         enabled: element.usernabled,
            //         username: element.email
            //     };

            //     const createUser = await axios.post(`${endpoint}/auth/admin/realms/jabarprov/users`, body, option);
            //     console.log(createUser.headers.location + '/reset-password');
            //     // return true;

            //     // let bodyCredentials = {
            //     //     type: 'password',
            //     //     temporary: 'true',
            //     //     value: 'jabarjuara'
            //     // };
            //     // await axios.post(createUser.headers.location + '/reset-password', bodyCredentials, option);
            // });
            // await Promise.all(storeUser);

            res.json({ message: 'Success bulking data'});
          });
      } catch (e){
          res.json({err_desc:"Excel file was damaged!"});
      }
  })
};