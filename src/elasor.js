#! /usr/bin/node --harmony

"use strict";
const os = require('os');
const moment = require('moment');
const _ = require('underscore');
const chalk = require('chalk');
const exec = require('child_process').exec;
const program   = require('commander');
const Table = require('cli-table-redemption');

const clog = console.log;
const cdir = console.dir;

let table = new Table({         // table column titles
    head: ['Item', 'API', 'Elapsed time (ms)', 'Date'],
    colWidths: [6, 70, 20, 24]
});


/**
 * 1. get filename from cmd arg
 * 2. use tail / cat to get file content
 * 3. analyse file content (API name, execution time, result etc)
 * 4. show result
 *
 *
 * */
const currentVersion = '0.0.2';

program
    .version(currentVersion)
    .usage('elasor LOG_FILE_NAME [-n] [--all] [--sort] [--max-time]')
    .description('  parse and analyse private format(exec-time-YYYY-MM-DD.log) logs ')
    .option('-n [number_of_lines]', 'number of lines to analyse')
    .option('--all', 'analyse the whole file`s content ')
    .option('--sort', 'sort by field [ api/ elapsedTime ]')
    .option('--max-time [maxTime]', 'max exec time to be filtered')
    .parse(process.argv);

let param = {
    n : program.N,
    filename : program.args[0],
    all : program.all,
    maxTime : program.maxTime,
    sort : program.sort
};

// clog("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
// clog('┏---- INFO: ----- start [param @ ] -----');cdir(param);clog('┗---- INFO: -----  end  [param @ ] -----');

let action = program.all?'cat':'tail';
let maxTime = (program.maxTime || program.maxTime == 0)?program.maxTime:2000;

let contentArr = new Array();
let filterd = new Array();



let command = action + ' ' + param.filename;
if(!param.all && param.n){
    command = command + ' -n ' + param.n;
}
exec(command, function (error, stdout, stderr) {
    if(error != null){
        clog(chalk.bgRed('ERROR'));
        cdir(stderr);
    } else {
        clog(chalk.bgGreen.black('Success'));
    }
    let lines = stdout.split(os.EOL);
    for(let idx in lines){
        let arr = lines[idx].split(' ')
        if(arr.length < 3) continue;
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
    }

    let cnt = 0;

    if(param.sort && param.sort != 'elapsedTime'){
        contentArr = _.sortBy(contentArr, param.sort);
    }

    if(param.maxTime){          //  如果参数    要求按时间筛选，则按时间筛选
        contentArr = _.sortBy(contentArr, 'elapsedTime');
        clog(' ==== filter by execution time ====  ' + maxTime + 'ms');
        for(let ydx in contentArr){
            if(parseInt(contentArr[ydx].elapsedTime) > parseInt(maxTime)){
                filterd.push(contentArr[ydx]);
            }
        }
        contentArr = filterd;
    } else {                    //  如果参数    不要求按时间筛选，则返回时间最长的100条
        contentArr = contentArr.splice(-100);
    }
    for(let ydx in contentArr){
        table.push([cnt++, contentArr[ydx].api, contentArr[ydx].elapsedTime, contentArr[ydx].date + ' ' + contentArr[ydx].time]);
        if(cnt % 50 == 0 ) table.push(['', 'API', 'Elapsed time (ms)', 'Date']);
    }

    table.push(['', 'API', 'Elapsed time (ms)', 'Date'])

    clog(table.toString());

    clog("\r\n"+moment().format('Y/MM/DD HH:mm:ss\t\t\t\t')+__filename);
    clog('┏---- INFO: ----- start [param @ ] -----');cdir(param);clog('┗---- INFO: -----  end  [param @ ] -----');
    clog('Command :         ' + command);


});





