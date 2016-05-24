"use strict";
const http = require('http');
const server = http.createServer();
const fs = require('fs');
const path = require('path');
const url = require('url');
const qstring = require('querystring');
const _ = require('underscore');

// 定义一组数据
let musicList = [
  {
    id: '1',
    title: '演员',
    singer: '薛之谦',
    isHightRate: true
  },
  {
    id: '2',
    title: '丑八怪',
    singer: '薛之谦',
    isHightRate: false
  },
  {
    id: '3',
    title: 'Fade',
    singer: 'Alan Walker',
    isHightRate: true
  },
  {
    id: '4',
    title: '想着你的感觉',
    singer: '容祖儿',
    isHightRate: true
  },
  {
    id: '5',
    title: '叽咕叽咕',
    singer: '徐佳莹',
    isHightRate: false
  }
]

// 匹配删除链接的url
const reg_remove = /^\/remove\/(\d{1,6})$/;
const reg_edit = /^\/edit\/(\d{1,6})$/;

// 创建服务器
server.on('request',(req,res) => {
  let method = req.method;
  let urlObj = url.parse(req.url);
  let pathname = urlObj.pathname;

  if (pathname === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data)=> {
      if (err) {
        return console.log(res.end(err.message));
      }
      let complieFunc = _.template(data);
      let htmlStr = complieFunc({
        musicList
      });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(htmlStr);
    });
  } else if (method == 'GET' && pathname == '/add') {
    // 客户端请求add页面
    fs.readFile(path.join(__dirname, 'add.html'), 'utf8', (err, data)=> {
      if (err) {
        return res.end(err.message);
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(data);
    })
  } else if (method === 'POST' && pathname === '/add') {
    // 客户端传输数据 ,需要解析事件
    handlePostData(req, (queryObj) => {
      // 处理数据
      let id = queryObj.id;
      let title = queryObj.title;
      let singer = queryObj.singer;
      let isHightRate = queryObj.isHeightRate;

      // 当然这里需要判断数据格式 ， 省略 ...

      // 先判断这条音乐是否在列表中
      let musicInfo = musicList.find(m=> m.id === id);

      // 如果存在，那么返回客户端 存在信息
      if (musicInfo) {
        return res.end('music is exsits');
      }

      isHightRate = isHightRate == '1' ? true : false;

      musicList.push({
        id, title, singer, isHightRate
      });

      // 然后临时重定向到列表
      res.writeHead(302, {
        'Location': 'http://localhost:3000/'
      });
      res.end();

    });
  } else if (method === 'GET' && reg_remove.test(pathname)) {
    let m_id = pathname.match(reg_remove)[1];
    let index = musicList.findIndex(m => m.id === m_id);
    try {
      musicList.splice(index, 1);
      res.end(JSON.stringify({
        code: 1,
        msg: 'ok'
      }));
    } catch (e) {
      res.end(JSON.stringify({
        code: '0',
        msg: e.message
      }))
    }
  }else if(method === 'GET' && reg_edit.test(pathname)){
    let m_id = pathname.match(reg_edit)[1];
    let musicInfo = musicList.find(m => m_id === m.id);
    fs.readFile(path.join(__dirname,'edit.html'),'utf8',(err,data) => {
      if(err){
        return res.end(err.message);
      }
      // 渲染页面
      let complieFunc = _.template(data);
      let htmlStr = complieFunc({
        musicInfo
      })
      res.writeHead(200,{
        'Content-Type':'text/html; charset=utf-8'
      });
      res.end(htmlStr);
    })

  }else if(method === 'POST' && reg_edit.test(pathname)){
    handlePostData(req,(queryObj)=>{
      let m_id = pathname.match(reg_edit)[1];
      let title = queryObj.title;
      let singer = queryObj.singer;
      let isHightRate = queryObj.isHightRate;

      let index = musicList.findIndex(m => m.id === m_id);
      musicList[index].title = title;
      musicList[index].singer = singer;
      musicList[index].isHightRate = isHightRate == 1? true:false;

      res.writeHead(302,{
        location:'/'
      });
      res.end();

    })
  } else if(pathname === '/node_modules/jquery/dist/jquery.js'){
    fs.readFile(path.join(__dirname,'node_modules/jquery/dist/jquery.js'),(err,data)=>{
      if(err){
        return res.end(err.message);
      }
      res.writeHead(200,{
        'Content-Type':'application/x-javascript; charset=utf8'
      });
      res.end(data);
    })
  }

});

server.listen(3000,()=>{
  console.log('server is on');
})

function handlePostData(req,callback){
  let data = '';
  req.on('data',(chunk)=>{
    data += chunk;
  });
  req.on('end',()=>{
    let queryObj = qstring.parse(data);
    callback(queryObj);
  })
}

/* 总结： */
/*
在 nodejs 中搭建服务器，原生
需要的模块有
http
url 用于解析url  url.parse(req.url) 用于把url处理成一个对象，去访问。
qstring 用于处理解析post的请求
fs 用于读取页面
path 用于解析当前路径
underscore 渲染页面，绑定数据

在返回数据的时候，需要设置响应头。注意 Content-Type 和 location


es6 数组.findIndex(m => m.id === m_id);
eg :  let index = musicList.findIndex(m => m.id === m_id);

在数组中查找一条记录 find
eg : let musicInfo = musicList.find(m=> m.id === id);










*/