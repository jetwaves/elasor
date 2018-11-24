"use strict";
const path = require('path');
const os = require('os');
const fs = require('fs');
const async = require('async');
const moment = require('moment');
const Promise = require('promise');
const _ = require('underscore');
const mkdirp = require('mkdirp');
const simpleGit = require('simple-git')();
const chalk = require('chalk');

const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const program   = require('commander');
const Table = require('cli-table-redemption');


//let config = require('./config.js');
const clog = console.log;
const cdir = console.dir;


/**
 * 1. get filename from cmd arg
 * 2. use tail / cat to get file content
 * 3. analyse file content (API name, execution time, result etc)
 * 4. show result
 *
 *
 * */
const currentVersion = '0.0.1';

program
    .version(currentVersion)
    // .usage('elasor LOG_FILE_NAME')
    .description('  parse and analyse private format logs ')
    .arguments('<filename> [filename]')
    .option('-n [number_of_lines]', 'number of lines to analyse')
    .option('--all ', 'analyse the whole file`s content ')
    .option('--sort ', 'sort by field')
    .option('--max-time ', 'max exec time to be filtered')
    .parse(process.argv);


let param = {
    n : program.N,
    filename : program.args[0],
    all : program.all
};


let max_time = '1200';
let table = new Table({
    head: ['API', 'Elapsed time', 'Date'],
    colWidths: [80, 20, 24]
});



clog("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
clog('┏---- INFO: ----- start [param @ ] -----');cdir(param);clog('┗---- INFO: -----  end  [param @ ] -----');

let contentArr = new Array();
let filterd = new Array();


(async function(){
    // let command = 'tail ' + param.filename + ' -n 100';
    let command = 'tail exec-time-2018-04-18.log -n 10000';
    exec(command, function (error, stdout, stderr) {
        if(error){
            clog(chalk.bgRed('ERROR'));
            cdir(stderr);
        } else {
            clog(chalk.bgGreen('Success'));
        }
        let lines = stdout.split(os.EOL);
        for(let idx in lines){
            let arr = lines[idx].split(' ')
            if(arr.length < 3) continue;
            // clog(lines[idx]);
            // cdir('line ' + idx + '  : ' + lines[idx]);
            // cdir(arr);
            let apiArr = arr[3].split('@');
            let lineContent = {
                lineNumber : idx,
                date : arr[0].substr(1),
                time : arr[1].substr(0, arr[1].length -1),
                level: arr[2],
                api: apiArr[0],
                elapsedTime: parseFloat(apiArr[1])
            };
            contentArr.push(lineContent);
            // cdir(lineContent);
        }
        contentArr = _.sortBy(contentArr, 'elapsedTime');
        // cdir(contentArr);
        for(let ydx in contentArr){
            if(parseInt(contentArr[ydx].elapsedTime) > parseInt(max_time)){
                filterd.push(contentArr[ydx]);
                table.push([contentArr[ydx].api, contentArr[ydx].elapsedTime, contentArr[ydx].date + ' ' + contentArr[ydx].time]);
            }
        }

        // cdir(filterd);
        clog(table.toString());





        // clog("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
        // clog('┏---- INFO: ----- start [command @ ] -----');cdir(command);clog('┗---- INFO: -----  end  [command @ ] -----');
    });








})();




