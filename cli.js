#!/usr/bin/env node
const axios = require('axios')
const util = require('util')
const {argv} = require('yargs')
const moment = require('moment')
const ora = require('ora')
const boxen = require('boxen')
const chalk = require('chalk')


const sheetId = '1VueNvU-ipyjDhvKsU19nNlHkz70k6i5u5Rlnyz-TmE8';
//const log = (input, type = 'log') => console[type](util.inspect(input, false, null, true))
const city = 'chuadanga'
const spinner = ora('Loading...')
const newline = "\n";
const boxenOptions = {
  padding: 1,
  margin: 1,
  borderStyle: "round"
};


function buildUrl(id, sheetNum, mode) {
  return 'https://spreadsheets.google.com/feeds/' + mode + '/' + id + '/' + sheetNum + '/public/values?alt=json';
}

function parseLabeledCols(entries) {
  return entries.map(function (entry) {
    return parseEntry(entry);
  });
}

function parseEntry(entry) {
  var res = {};
  Object.keys(entry).forEach(function (key) {
    if (key.indexOf('gsx$') === 0) {
      var label = key.substr(4);
      res[label] = entry[key].$t;
    }
  });
  return res;
}

function getRamadanTime(date, ramadanTime) {
  const ramadanDate = new Date(date).toLocaleDateString()
  return ramadanTime.find((timeObject) => {
    return new Date(timeObject.date).toLocaleDateString() === ramadanDate
  })
}

function fetchSheetData(sheetId, number){
    const url = buildUrl(sheetId, number, 'list');	
    return axios.get(url).then((response)=> {
    const data = parseLabeledCols(response.data.feed.entry);
    return {
       title: response.data.feed.title.$t,
       updated: response.data.feed.updated.$t,
       data: data
     };

  }).catch(err => {
  	return Promise.reject(err);
  })

}

async function initRamadanTime() {
  spinner.start();	
  const data = await fetchSheetData(sheetId, 1)
  const todaysRamadanTime = getRamadanTime(new Date(), data.data);
  spinner.stop();
  spinner.succeed();
  const ramadan = chalk.white.bold(`Ramdan           ${todaysRamadanTime.ramadan}`);
  const suhoor = chalk.white(`Suhoor           ${todaysRamadanTime.suhoor}`);
  const fajr = chalk.white(`Fajr             ${todaysRamadanTime.fajr}`);
  const iftar = chalk.white(`Iftar            ${todaysRamadanTime.iftar}`);
  const output = 
  ramadan +
  newline+
  newline+
  suhoor+
  newline+
  newline+
  fajr+
  newline+
  newline+
  iftar;

  console.log(chalk.green(boxen(output, boxenOptions)))
}


initRamadanTime()