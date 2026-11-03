chrome.action.onClicked.addListener(async tab=>{
 if(!tab.id||!/^https?:/.test(tab.url||''))return;
 try{await chrome.scripting.executeScript({target:{tabId:tab.id},files:['content.js']});}
 catch(error){console.warn('Luna 无法在此页面加载：',error.message);await chrome.action.setBadgeText({tabId:tab.id,text:'!'});await chrome.action.setTitle({tabId:tab.id,title:'此页面不允许插件运行，请打开普通网页再试'});}
});
