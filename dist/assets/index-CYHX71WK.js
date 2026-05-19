(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))d(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&d(o)}).observe(document,{childList:!0,subtree:!0});function u(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function d(i){if(i.ep)return;i.ep=!0;const s=u(i);fetch(i.href,s)}})();var Ot=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},st={exports:{}};(function(a,e){(function(u,d){d(e)})(Ot,function(u){function d(){return d=Object.assign?Object.assign.bind():function(t){for(var n=1;n<arguments.length;n++){var r=arguments[n];for(var c in r)Object.prototype.hasOwnProperty.call(r,c)&&(t[c]=r[c])}return t},d.apply(this,arguments)}function i(t,n){t.prototype=Object.create(n.prototype),t.prototype.constructor=t,o(t,n)}function s(t){return s=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(n){return n.__proto__||Object.getPrototypeOf(n)},s(t)}function o(t,n){return o=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(r,c){return r.__proto__=c,r},o(t,n)}function p(t,n,r){return p=function(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}()?Reflect.construct.bind():function(c,l,h){var b=[null];b.push.apply(b,l);var g=new(Function.bind.apply(c,b));return h&&o(g,h.prototype),g},p.apply(null,arguments)}function f(t){var n=typeof Map=="function"?new Map:void 0;return f=function(r){if(r===null||Function.toString.call(r).indexOf("[native code]")===-1)return r;if(typeof r!="function")throw new TypeError("Super expression must either be null or a function");if(n!==void 0){if(n.has(r))return n.get(r);n.set(r,c)}function c(){return p(r,arguments,s(this).constructor)}return c.prototype=Object.create(r.prototype,{constructor:{value:c,enumerable:!1,writable:!0,configurable:!0}}),o(c,r)},f(t)}var m=function(){function t(r){this.cache=void 0,this.cache=r}var n=t.prototype;return n.define=function(r,c){this.cache[r]=c},n.get=function(r){return this.cache[r]},n.remove=function(r){delete this.cache[r]},n.reset=function(){this.cache={}},n.load=function(r){this.cache=d({},this.cache,r)},t}(),v=function(t){function n(r){var c;return(c=t.call(this,r)||this).name="Eta Error",c}return i(n,t),n}(f(Error)),E=function(t){function n(r){var c;return(c=t.call(this,r)||this).name="EtaParser Error",c}return i(n,t),n}(v),tt=function(t){function n(r){var c;return(c=t.call(this,r)||this).name="EtaRuntime Error",c}return i(n,t),n}(v),Dt=function(t){function n(r){var c;return(c=t.call(this,r)||this).name="EtaNameResolution Error",c}return i(n,t),n}(v);function L(t,n,r){var c=n.slice(0,r).split(/\n/),l=c.length,h=c[l-1].length+1;throw t+=" at line "+l+" col "+h+`:

  `+n.split(/\n/)[l-1]+`
  `+Array(h).join(" ")+"^",new E(t)}function wt(t,n,r,c){var l=n.split(`
`),h=Math.max(r-3,0),b=Math.min(l.length,r+3),g=c,A=l.slice(h,b).map(function(et,V){var w=V+h+1;return(w==r?" >> ":"    ")+w+"| "+et}).join(`
`),D=new tt((g?g+":"+r+`
`:"line "+r+`
`)+A+`

`+t.message);throw D.name=t.name,D}var Pt=(function(){return Promise.resolve()}).constructor;function St(t,n){var r=this.config,c=n&&n.async?Pt:Function;try{return new c(r.varName,"options",this.compileToString.call(this,t,n))}catch(l){throw l instanceof SyntaxError?new E(`Bad template syntax

`+l.message+`
`+Array(l.message.length+1).join("=")+`
`+this.compileToString.call(this,t,n)+`
`):l}}function $t(t,n){var r=this.config,c=n&&n.async,l=this.compileBody,h=this.parse.call(this,t),b=r.functionHeader+`
let include = (template, data) => this.render(template, data, options);
let includeAsync = (template, data) => this.renderAsync(template, data, options);

let __eta = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction`+(r.debug?', line: 1, templateStr: "'+t.replace(/\\|"/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n")+'"':"")+`};

function layout(path, data) {
  __eta.layout = path;
  __eta.layoutData = data;
}`+(r.debug?"try {":"")+(r.useWith?"with("+r.varName+"||{}){":"")+`

`+l.call(this,h)+`
if (__eta.layout) {
  __eta.res = `+(c?"await includeAsync":"include")+" (__eta.layout, {..."+r.varName+`, body: __eta.res, ...__eta.layoutData});
}
`+(r.useWith?"}":"")+(r.debug?"} catch (e) { this.RuntimeErr(e, __eta.templateStr, __eta.line, options.filepath) }":"")+`
return __eta.res;
`;if(r.plugins)for(var g=0;g<r.plugins.length;g++){var A=r.plugins[g];A.processFnString&&(b=A.processFnString(b,r))}return b}function Wt(t){for(var n=this.config,r=0,c=t.length,l="";r<c;r++){var h=t[r];if(typeof h=="string")l+="__eta.res+='"+h+`'
`;else{var b=h.t,g=h.val||"";n.debug&&(l+="__eta.line="+h.lineNo+`
`),b==="r"?(n.autoFilter&&(g="__eta.f("+g+")"),l+="__eta.res+="+g+`
`):b==="i"?(n.autoFilter&&(g="__eta.f("+g+")"),n.autoEscape&&(g="__eta.e("+g+")"),l+="__eta.res+="+g+`
`):b==="e"&&(l+=g+`
`)}}return l}var Et={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function At(t){return Et[t]}var lt={autoEscape:!0,autoFilter:!1,autoTrim:[!1,"nl"],cache:!1,cacheFilepaths:!0,debug:!1,escapeFunction:function(t){var n=String(t);return/[&<>"']/.test(n)?n.replace(/[&<>"']/g,At):n},filterFunction:function(t){return String(t)},functionHeader:"",parse:{exec:"",interpolate:"=",raw:"~"},plugins:[],rmWhitespace:!1,tags:["<%","%>"],useWith:!1,varName:"it",defaultExtension:".eta"},N=/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g,H=/'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g,k=/"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;function B(t){return t.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&")}function xt(t,n){return t.slice(0,n).split(`
`).length}function Ft(t){var n=this.config,r=[],c=!1,l=0,h=n.parse;if(n.plugins)for(var b=0;b<n.plugins.length;b++){var g=n.plugins[b];g.processTemplate&&(t=g.processTemplate(t,n))}function A(P,M){P&&(P=function(S,J,at,it){var $,W;return Array.isArray(J.autoTrim)?($=J.autoTrim[1],W=J.autoTrim[0]):$=W=J.autoTrim,(at||at===!1)&&($=at),(it||it===!1)&&(W=it),W||$?$==="slurp"&&W==="slurp"?S.trim():($==="_"||$==="slurp"?S=S.trimStart():$!=="-"&&$!=="nl"||(S=S.replace(/^(?:\r\n|\n|\r)/,"")),W==="_"||W==="slurp"?S=S.trimEnd():W!=="-"&&W!=="nl"||(S=S.replace(/(?:\r\n|\n|\r)$/,"")),S):S}(P,n,c,M),P&&(P=P.replace(/\\|'/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n"),r.push(P)))}n.rmWhitespace&&(t=t.replace(/[\r\n]+/g,`
`).replace(/^\s+|\s+$/gm,"")),N.lastIndex=0,H.lastIndex=0,k.lastIndex=0;for(var D,et=[h.exec,h.interpolate,h.raw].reduce(function(P,M){return P&&M?P+"|"+B(M):M?B(M):P},""),V=new RegExp(B(n.tags[0])+"(-|_)?\\s*("+et+")?\\s*","g"),w=new RegExp("'|\"|`|\\/\\*|(\\s*(-|_)?"+B(n.tags[1])+")","g");D=V.exec(t);){var _t=t.slice(l,D.index);l=D[0].length+D.index;var nt=D[2]||"";A(_t,D[1]),w.lastIndex=l;for(var C=void 0,U=!1;C=w.exec(t);){if(C[1]){var Lt=t.slice(l,C.index);V.lastIndex=l=w.lastIndex,c=C[2],U={t:nt===h.exec?"e":nt===h.raw?"r":nt===h.interpolate?"i":"",val:Lt};break}var z=C[0];if(z==="/*"){var ht=t.indexOf("*/",w.lastIndex);ht===-1&&L("unclosed comment",t,C.index),w.lastIndex=ht}else z==="'"?(H.lastIndex=C.index,H.exec(t)?w.lastIndex=H.lastIndex:L("unclosed string",t,C.index)):z==='"'?(k.lastIndex=C.index,k.exec(t)?w.lastIndex=k.lastIndex:L("unclosed string",t,C.index)):z==="`"&&(N.lastIndex=C.index,N.exec(t)?w.lastIndex=N.lastIndex:L("unclosed string",t,C.index))}U?(n.debug&&(U.lineNo=xt(t,D.index)),r.push(U)):L("unclosed tag",t,D.index)}if(A(t.slice(l,t.length),!1),n.plugins)for(var rt=0;rt<n.plugins.length;rt++){var yt=n.plugins[rt];yt.processAST&&(r=yt.processAST(r,n))}return r}function ut(t,n){var r=n&&n.async?this.templatesAsync:this.templatesSync;if(this.resolvePath&&this.readFile&&!t.startsWith("@")){var c=n.filepath,l=r.get(c);if(this.config.cache&&l)return l;var h=this.readFile(c),b=this.compile(h,n);return this.config.cache&&r.define(c,b),b}var g=r.get(t);if(g)return g;throw new Dt("Failed to get template '"+t+"'")}function pt(t,n,r){var c,l=d({},r,{async:!1});return typeof t=="string"?(this.resolvePath&&this.readFile&&!t.startsWith("@")&&(l.filepath=this.resolvePath(t,l)),c=ut.call(this,t,l)):c=t,c.call(this,n,l)}function mt(t,n,r){var c,l=d({},r,{async:!0});typeof t=="string"?(this.resolvePath&&this.readFile&&!t.startsWith("@")&&(l.filepath=this.resolvePath(t,l)),c=ut.call(this,t,l)):c=t;var h=c.call(this,n,l);return Promise.resolve(h)}function jt(t,n){var r=this.compile(t,{async:!1});return pt.call(this,r,n)}function Mt(t,n){var r=this.compile(t,{async:!0});return mt.call(this,r,n)}var Tt=function(){function t(r){this.config=void 0,this.RuntimeErr=wt,this.compile=St,this.compileToString=$t,this.compileBody=Wt,this.parse=Ft,this.render=pt,this.renderAsync=mt,this.renderString=jt,this.renderStringAsync=Mt,this.filepathCache={},this.templatesSync=new m({}),this.templatesAsync=new m({}),this.resolvePath=null,this.readFile=null,this.config=r?d({},lt,r):d({},lt)}var n=t.prototype;return n.configure=function(r){this.config=d({},this.config,r)},n.withConfig=function(r){return d({},this,{config:d({},this.config,r)})},n.loadTemplate=function(r,c,l){if(typeof c=="string")(l&&l.async?this.templatesAsync:this.templatesSync).define(r,this.compile(c,l));else{var h=this.templatesSync;(c.constructor.name==="AsyncFunction"||l&&l.async)&&(h=this.templatesAsync),h.define(r,c)}},t}(),It=function(t){function n(){return t.apply(this,arguments)||this}return i(n,t),n}(Tt);u.Eta=It})})(st,st.exports);var Rt=st.exports;const qt=.94,Nt=.94,Ht=.88,kt=.8,Bt=1.15,Vt=.75,Ut=1.25,zt=1.25,Jt=.16,Kt=.1,Qt="Prices are editable planning assumptions and should be localized before procurement.",Gt="This report is for planning estimates only, not certified electrical design. Final installation must be reviewed by a qualified solar/electrical technician and comply with local electrical, structural, grounding, and lightning protection requirements.",Yt={dcDistributionEfficiency:qt,hybridDcEfficiency:Nt,inverterEfficiency:Ht,batteryDepthOfDischarge:kt,batteryReserveFactor:Bt,arrayDerateFactor:Vt,mpptSafetyFactor:Ut,inverterHeadroomFactor:zt,installationRate:Jt,contingencyRate:Kt,currencyExchangeNotes:Qt,safetyDisclaimer:Gt},Zt=[{id:"project-hello-world",name:"Project Hello World",tagline:"Community-powered connectivity planning",primaryColor:"#1f6f68",accentColor:"#f0b429",reportFooter:"Prepared for Project Hello World community connectivity planning."},{id:"community-network",name:"Community Network Partner",tagline:"Practical power estimates for local network teams",primaryColor:"#315f8c",accentColor:"#55a06a",reportFooter:"Prepared for community network partner review and local adaptation."},{id:"field-technician",name:"Field Technician Draft",tagline:"Site-first solar planning notes",primaryColor:"#7a4f1d",accentColor:"#3f8f8a",reportFooter:"Draft estimate for technician review before installation."}],Xt=[{id:"pv-200",name:"200 W mono solar panel",unit:"panel",unitCost:130,watts:200},{id:"pv-450",name:"450 W mono solar panel",unit:"panel",unitCost:245,watts:450}],te=[{id:"bat-1280",name:"12.8 V 100 Ah LiFePO4 battery",unit:"battery",unitCost:310,wattHours:1280},{id:"bat-2560",name:"25.6 V 100 Ah LiFePO4 battery",unit:"battery",unitCost:560,wattHours:2560}],ee=[{id:"mppt-30",name:"30 A MPPT charge controller",unit:"controller",unitCost:145,amps:30},{id:"mppt-60",name:"60 A MPPT charge controller",unit:"controller",unitCost:260,amps:60}],ne=[{id:"hybrid-1000",name:"1 kW hybrid inverter charger",unit:"inverter",unitCost:420,watts:1e3},{id:"hybrid-2000",name:"2 kW hybrid inverter charger",unit:"inverter",unitCost:690,watts:2e3}],re=[{id:"dc-board",name:"DC breaker board, fuses, labels, and surge protection",unit:"set",unitCost:180}],ae=[{id:"ac-board",name:"AC breaker board, RCD, outlets, and labels",unit:"set",unitCost:220}],ie=[{id:"cable-kit",name:"PV, battery, and load cabling with MC4/connectors",unit:"kit",unitCost:210}],oe=[{id:"earth-kit",name:"Earthing rod, bonding, surge, and lightning protection kit",unit:"kit",unitCost:190}],se=[{id:"monitor-kit",name:"Battery monitor and remote energy logging",unit:"kit",unitCost:155}],ce={solarPanels:Xt,batteries:te,chargeControllers:ee,hybridInverters:ne,dcDistribution:re,acDistribution:ae,cabling:ie,earthing:oe,monitoring:se},de="hello-hub-lite",le="Hello Hub Lite sample",ue="Uganda",pe="USD",me=24,he=4.8,ye=1.5,fe="project-hello-world",ge="2026-05-19T00:00:00.000Z",be=[{id:"load-router",name:"Core router",quantity:1,watts:18,hoursPerDay:24,currentType:"DC",voltage:24,surgeMultiplier:1.2,critical:!0},{id:"load-ap",name:"Outdoor access point",quantity:3,watts:12,hoursPerDay:24,currentType:"DC",voltage:24,surgeMultiplier:1.2,critical:!0},{id:"load-tablets",name:"Learning tablets",quantity:10,watts:8,hoursPerDay:3,currentType:"DC",voltage:5,surgeMultiplier:1,critical:!1},{id:"load-lights",name:"LED lights",quantity:6,watts:5,hoursPerDay:5,currentType:"DC",voltage:12,surgeMultiplier:1.1,critical:!0},{id:"load-usb",name:"USB charging station",quantity:1,watts:60,hoursPerDay:4,currentType:"DC",voltage:12,surgeMultiplier:1.1,critical:!1},{id:"load-monitor",name:"Monitoring gateway",quantity:1,watts:8,hoursPerDay:24,currentType:"DC",voltage:12,surgeMultiplier:1.2,critical:!0},{id:"load-laptop",name:"Technician laptop charging",quantity:1,watts:65,hoursPerDay:2,currentType:"AC",voltage:230,surgeMultiplier:1.5,critical:!1}],ct={id:de,name:le,country:ue,currency:pe,systemVoltage:me,sunHours:he,autonomyDays:ye,brandProfileId:fe,updatedAt:ge,loads:be},K=(a,e)=>Math.ceil(a/e)*e,Q=(a,e=0)=>Number.isFinite(a)?a:e;function ve(a){return a.loads.map(e=>{const u=Math.max(0,Q(e.quantity)),d=Math.max(0,Q(e.watts)),i=Math.max(0,Q(e.hoursPerDay)),s=Math.max(1,Q(e.surgeMultiplier,1)),o=u*d;return{load:e,runningWatts:o,dailyWh:o*i,surgeWatts:o*s}})}function ft(a,e,u,d,i,s){const o=Math.max(.5,d.autonomyDays),p=Math.max(.5,d.sunHours),f=Math.max(12,d.systemVoltage),m=a*o*i.batteryReserveFactor/i.batteryDepthOfDischarge,v=a/p/i.arrayDerateFactor*i.batteryReserveFactor,E=v/f*i.mpptSafetyFactor,tt=Math.max(e,u*.55);return{adjustedDailyWh:Math.round(a),requiredBatteryWh:K(m,100),recommendedSolarArrayW:K(v,10),recommendedMpptCurrentA:K(E,5),recommendedInverterW:s?K(tt*i.inverterHeadroomFactor,100):0}}function bt(a,e){const u=ve(a),d=u.reduce((m,v)=>m+v.dailyWh,0),i=u.reduce((m,v)=>m+v.runningWatts,0),s=Math.max(0,...u.map(m=>i-m.runningWatts+m.surgeWatts)),o=u.filter(m=>m.load.critical).reduce((m,v)=>m+v.dailyWh,0),p=d/e.dcDistributionEfficiency,f=u.reduce((m,v)=>{const E=v.load.currentType==="AC"?e.inverterEfficiency:e.hybridDcEfficiency;return m+v.dailyWh/E},0);return{loadRows:u,totalDailyWh:Math.round(d),peakLoadW:Math.round(i),surgeLoadW:Math.round(s),criticalDailyWh:Math.round(o),dc:ft(p,i,s,a,e,!1),hybrid:ft(f,i,s,a,e,!0)}}const Ce=(a,e)=>Math.max(1,Math.ceil(a/e)),De=(a,e,u)=>{const d=[...a].sort((s,o)=>{const p=s[e]??1,f=o[e]??1;return s.unitCost/p-o.unitCost/f});return d.find(s=>(s[e]??0)>=u)??d[0]},O=(a,e,u)=>{const d=a[0];return{category:e,description:u??d.name,quantity:1,unitCost:d.unitCost,total:d.unitCost}};function G(a,e,u,d,i=""){const s=De(e,u,d),o=s[u]??d,p=Ce(d,o);return{category:a,description:`${s.name}${i}`,quantity:p,unitCost:s.unitCost,total:p*s.unitCost}}function X(a,e,u,d,i){const s=i==="dc"?e.dc:e.hybrid,o=[G("Solar panels",u.solarPanels,"watts",s.recommendedSolarArrayW),G("LiFePO4 battery storage",u.batteries,"wattHours",s.requiredBatteryWh)];i==="dc"?o.push(G("Charge controller or hybrid inverter",u.chargeControllers,"amps",s.recommendedMpptCurrentA)):o.push(G("Charge controller or hybrid inverter",u.hybridInverters,"watts",Math.max(s.recommendedInverterW,s.recommendedSolarArrayW)," with AC output")),o.push(O(u.dcDistribution,"DC distribution and protection")),i==="hybrid"&&o.push(O(u.acDistribution,"AC distribution for hybrid systems")),o.push(O(u.cabling,"Cabling and connectors"),O(u.earthing,"Earthing and lightning protection"),O(u.monitoring,"Monitoring"));const p=o.reduce((v,E)=>v+E.total,0),f=Math.round(p*d.installationRate),m=Math.round((p+f)*d.contingencyRate);return{systemId:i,lines:o,subtotal:p,installation:f,contingency:m,total:p+f+m}}const Y=a=>`${(a/1e3).toFixed(1)} kWh`;function vt(a,e){return[{id:"dc",name:"Fully DC System",summary:a.loads.filter(i=>i.currentType==="AC").length>0?"Best when AC devices can be replaced with DC equivalents or powered through small point-of-use adapters.":"A simple direct-current architecture that avoids inverter losses and keeps the installation compact.",lines:[{category:"Energy target",recommendation:`${Y(e.dc.adjustedDailyWh)} adjusted daily demand`,rationale:"Uses DC distribution efficiency to account for wiring, conversion, and operating margin."},{category:"Battery",recommendation:`${Y(e.dc.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,rationale:`Sized for ${a.autonomyDays} autonomy day(s) at the configured depth of discharge.`},{category:"Solar array",recommendation:`${e.dc.recommendedSolarArrayW.toLocaleString()} W PV array`,rationale:`Based on ${a.sunHours} average sun hour(s) with derating for real-world conditions.`},{category:"Charge control",recommendation:`${e.dc.recommendedMpptCurrentA} A MPPT at ${a.systemVoltage} V`,rationale:"Controller current includes a safety factor above expected PV charging current."}]},{id:"hybrid",name:"Hybrid DC + AC System",summary:"Keeps efficient DC supply for network loads while adding AC capacity for devices that cannot move to DC.",lines:[{category:"Energy target",recommendation:`${Y(e.hybrid.adjustedDailyWh)} adjusted daily demand`,rationale:"Applies inverter efficiency only to AC loads while preserving a DC path for DC equipment."},{category:"Battery",recommendation:`${Y(e.hybrid.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,rationale:`Sized for ${a.autonomyDays} autonomy day(s), including reserve and depth-of-discharge limits.`},{category:"Solar array",recommendation:`${e.hybrid.recommendedSolarArrayW.toLocaleString()} W PV array`,rationale:`Based on ${a.sunHours} average sun hour(s), array derating, and storage recovery needs.`},{category:"Inverter",recommendation:`${e.hybrid.recommendedInverterW.toLocaleString()} W inverter or hybrid inverter`,rationale:"Allows headroom above the running and expected surge load."}]}]}const we=`<article class="report-document">
  <header class="report-header" style="--brand: <%= it.brand.primaryColor %>; --accent: <%= it.brand.accentColor %>">
    <div>
      <p><%= it.brand.name %></p>
      <h1><%= it.project.name %></h1>
      <span><%= it.brand.tagline %></span>
    </div>
    <div class="report-meta">
      <strong>Hello Solar Planner</strong>
      <span>Planning estimate</span>
      <span><%= it.generatedAt %></span>
    </div>
  </header>

  <section class="report-section report-brief">
    <h2>Executive Summary</h2>
    <div class="summary-band">
      <p><strong>Total daily energy</strong><span><%= it.formatEnergy(it.result.totalDailyWh) %></span></p>
      <p><strong>Peak load</strong><span><%= it.formatNumber(it.result.peakLoadW) %> W</span></p>
      <p><strong>Surge load</strong><span><%= it.formatNumber(it.result.surgeLoadW) %> W</span></p>
      <p><strong>Critical energy</strong><span><%= it.formatEnergy(it.result.criticalDailyWh) %></span></p>
    </div>
    <p class="report-note">
      This estimate compares a fully DC system with a hybrid DC + AC system for community connectivity loads.
    </p>
  </section>

  <section class="report-section">
    <h2>Project Summary</h2>
    <div class="report-grid">
      <p><strong>Country</strong><span><%= it.project.country %></span></p>
      <p><strong>Currency</strong><span><%= it.project.currency %></span></p>
      <p><strong>System voltage</strong><span><%= it.project.systemVoltage %> V</span></p>
      <p><strong>Sun hours</strong><span><%= it.project.sunHours %> h/day</span></p>
      <p><strong>Autonomy</strong><span><%= it.project.autonomyDays %> day(s)</span></p>
      <p><strong>Brand profile</strong><span><%= it.brand.name %></span></p>
    </div>
  </section>

  <section class="report-section">
    <h2>Load Table</h2>
    <table class="report-table compact-table">
      <thead>
        <tr>
          <th>Load</th>
          <th>Qty</th>
          <th>W each</th>
          <th>h/day</th>
          <th>Type</th>
          <th>Voltage</th>
          <th>Surge</th>
          <th>Critical</th>
          <th>Daily Wh</th>
        </tr>
      </thead>
      <tbody>
        <% it.result.loadRows.forEach((row) => { %>
          <tr>
            <td><%= row.load.name %></td>
            <td><%= row.load.quantity %></td>
            <td><%= it.formatNumber(row.load.watts) %></td>
            <td><%= row.load.hoursPerDay %></td>
            <td><%= row.load.currentType %></td>
            <td><%= row.load.voltage %> V</td>
            <td><%= row.load.surgeMultiplier %>x</td>
            <td><%= row.load.critical ? "Yes" : "No" %></td>
            <td><%= it.formatNumber(row.dailyWh) %></td>
          </tr>
        <% }) %>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="8">Total daily energy</td>
          <td><%= it.formatNumber(it.result.totalDailyWh) %> Wh</td>
        </tr>
      </tfoot>
    </table>
  </section>

  <section class="report-section">
    <h2>Technical Sizing Summary</h2>
    <table class="report-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Fully DC system</th>
          <th>Hybrid DC + AC system</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Adjusted daily energy</td>
          <td><%= it.formatEnergy(it.result.dc.adjustedDailyWh) %></td>
          <td><%= it.formatEnergy(it.result.hybrid.adjustedDailyWh) %></td>
        </tr>
        <tr>
          <td>Required LiFePO4 battery</td>
          <td><%= it.formatEnergy(it.result.dc.requiredBatteryWh) %></td>
          <td><%= it.formatEnergy(it.result.hybrid.requiredBatteryWh) %></td>
        </tr>
        <tr>
          <td>Recommended solar array</td>
          <td><%= it.formatNumber(it.result.dc.recommendedSolarArrayW) %> W</td>
          <td><%= it.formatNumber(it.result.hybrid.recommendedSolarArrayW) %> W</td>
        </tr>
        <tr>
          <td>Recommended MPPT current</td>
          <td><%= it.result.dc.recommendedMpptCurrentA %> A</td>
          <td><%= it.result.hybrid.recommendedMpptCurrentA %> A</td>
        </tr>
        <tr>
          <td>Recommended inverter size</td>
          <td>Not required</td>
          <td><%= it.formatNumber(it.result.hybrid.recommendedInverterW) %> W</td>
        </tr>
      </tbody>
    </table>
  </section>

  <% it.recommendations.forEach((option) => { %>
    <section class="report-section option-section">
      <h2><%= option.name %></h2>
      <p class="section-intro"><%= option.summary %></p>
      <table class="report-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Recommendation</th>
            <th>Rationale</th>
          </tr>
        </thead>
        <tbody>
          <% option.lines.forEach((line) => { %>
            <tr>
              <td><%= line.category %></td>
              <td><%= line.recommendation %></td>
              <td><%= line.rationale %></td>
            </tr>
          <% }) %>
        </tbody>
      </table>
    </section>
  <% }) %>

  <section class="report-section financial-section">
    <h2>Financial Summary</h2>
    <div class="total-strip">
      <% it.costs.forEach((estimate) => { %>
        <p>
          <strong><%= estimate.systemId === "dc" ? "Fully DC option" : "Hybrid DC + AC option" %></strong>
          <span><%= it.money(estimate.total) %></span>
        </p>
      <% }) %>
    </div>

    <% it.costs.forEach((estimate) => { %>
      <div class="cost-block">
        <h3><%= estimate.systemId === "dc" ? "Fully DC Cost Detail" : "Hybrid DC + AC Cost Detail" %></h3>
        <table class="report-table compact-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <% estimate.lines.forEach((line) => { %>
              <tr>
                <td><%= line.category %></td>
                <td><%= line.description %></td>
                <td><%= line.quantity %></td>
                <td><%= it.money(line.unitCost) %></td>
                <td><%= it.money(line.total) %></td>
              </tr>
            <% }) %>
            <tr>
              <td>Installation</td>
              <td>Planning allowance based on editable assumption</td>
              <td>1</td>
              <td><%= it.formatPercent(it.assumptions.installationRate) %></td>
              <td><%= it.money(estimate.installation) %></td>
            </tr>
            <tr>
              <td>Contingency</td>
              <td>Planning allowance for local variance and missing items</td>
              <td>1</td>
              <td><%= it.formatPercent(it.assumptions.contingencyRate) %></td>
              <td><%= it.money(estimate.contingency) %></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Estimated total</td>
              <td><%= it.money(estimate.total) %></td>
            </tr>
          </tfoot>
        </table>
      </div>
    <% }) %>
  </section>

  <section class="report-section">
    <h2>Assumptions</h2>
    <div class="assumption-list">
      <p><strong>DC distribution efficiency</strong><span><%= it.formatPercent(it.assumptions.dcDistributionEfficiency) %></span></p>
      <p><strong>Hybrid DC efficiency</strong><span><%= it.formatPercent(it.assumptions.hybridDcEfficiency) %></span></p>
      <p><strong>Inverter efficiency</strong><span><%= it.formatPercent(it.assumptions.inverterEfficiency) %></span></p>
      <p><strong>Battery depth of discharge</strong><span><%= it.formatPercent(it.assumptions.batteryDepthOfDischarge) %></span></p>
      <p><strong>Battery reserve factor</strong><span><%= it.formatPercent(it.assumptions.batteryReserveFactor) %></span></p>
      <p><strong>PV derate factor</strong><span><%= it.formatPercent(it.assumptions.arrayDerateFactor) %></span></p>
      <p><strong>MPPT safety factor</strong><span><%= it.formatPercent(it.assumptions.mpptSafetyFactor) %></span></p>
      <p><strong>Inverter headroom factor</strong><span><%= it.formatPercent(it.assumptions.inverterHeadroomFactor) %></span></p>
    </div>
    <p class="report-note"><%= it.assumptions.currencyExchangeNotes %></p>
  </section>

  <section class="report-section disclaimer">
    <h2>Safety Disclaimer</h2>
    <p><%= it.assumptions.safetyDisclaimer %></p>
  </section>

  <footer><%= it.brand.reportFooter %></footer>
</article>
`,dt="hello-solar-planner-state",Pe=new Rt.Eta,gt=document.querySelector("#app"),q=Zt,x=a=>JSON.parse(JSON.stringify(a)),ot=()=>{var a;return((a=crypto.randomUUID)==null?void 0:a.call(crypto))??`id-${Date.now()}-${Math.random().toString(16).slice(2)}`},j=new Intl.NumberFormat("en",{maximumFractionDigits:0}),Se=new Intl.NumberFormat("en",{maximumFractionDigits:2});function $e(){const a=x(ct);try{const e=localStorage.getItem(dt);if(e)return JSON.parse(e)}catch{localStorage.removeItem(dt)}return{activeProjectId:a.id,projects:[a],assumptions:Yt,products:ce}}let y=$e();function I(){localStorage.setItem(dt,JSON.stringify(y))}function _(){return y.projects.find(a=>a.id===y.activeProjectId)??y.projects[0]}function Z(a){a.updatedAt=new Date().toISOString(),y.projects=y.projects.map(e=>e.id===a.id?a:e),I(),F()}function Ct(a,e=_()){return`${e.currency} ${j.format(a)}`}function R(a){return a>=1e3?`${Se.format(a/1e3)} kWh`:`${j.format(a)} Wh`}function We(a){const e=bt(a,y.assumptions),u=vt(a,e),d=[X(a,e,y.products,y.assumptions,"dc"),X(a,e,y.products,y.assumptions,"hybrid")],i=q.find(s=>s.id===a.brandProfileId)??q[0];return Pe.renderString(we,{project:a,result:e,recommendations:u,costs:d,assumptions:y.assumptions,brand:i,generatedAt:new Date().toLocaleDateString("en",{year:"numeric",month:"short",day:"numeric"}),money:s=>Ct(s,a),formatEnergy:R,formatNumber:s=>j.format(s),formatPercent:s=>`${Math.round(s*100)}%`})}function T(a,e,u,d="text"){const i=a[e];return`
    <label>
      <span>${u}</span>
      <input type="${d}" data-project-field="${String(e)}" value="${String(i)}" />
    </label>
  `}function Ee(a){return a.loads.map(e=>`
      <tr>
        <td><input aria-label="Load name" data-load-id="${e.id}" data-load-field="name" value="${e.name}" /></td>
        <td><input aria-label="Quantity" type="number" min="0" step="1" data-load-id="${e.id}" data-load-field="quantity" value="${e.quantity}" /></td>
        <td><input aria-label="Watts" type="number" min="0" step="1" data-load-id="${e.id}" data-load-field="watts" value="${e.watts}" /></td>
        <td><input aria-label="Hours per day" type="number" min="0" step="0.25" data-load-id="${e.id}" data-load-field="hoursPerDay" value="${e.hoursPerDay}" /></td>
        <td>
          <select aria-label="Current type" data-load-id="${e.id}" data-load-field="currentType">
            <option value="DC" ${e.currentType==="DC"?"selected":""}>DC</option>
            <option value="AC" ${e.currentType==="AC"?"selected":""}>AC</option>
          </select>
        </td>
        <td><input aria-label="Voltage" type="number" min="0" step="1" data-load-id="${e.id}" data-load-field="voltage" value="${e.voltage}" /></td>
        <td><input aria-label="Surge multiplier" type="number" min="1" step="0.1" data-load-id="${e.id}" data-load-field="surgeMultiplier" value="${e.surgeMultiplier}" /></td>
        <td>
          <label class="check-cell">
            <input type="checkbox" data-load-id="${e.id}" data-load-field="critical" ${e.critical?"checked":""} />
            <span>Critical</span>
          </label>
        </td>
        <td><button class="icon-button" type="button" data-remove-load="${e.id}" aria-label="Remove ${e.name}">x</button></td>
      </tr>
    `).join("")}function Ae(){return Object.entries(y.products).map(([e,u])=>`
        <details>
          <summary>${String(e).replace(/([A-Z])/g," $1")}</summary>
          <div class="price-list">
            ${u.map(d=>`
                  <label>
                    <span>${d.name}</span>
                    <input type="number" min="0" step="1" data-product-section="${e}" data-product-id="${d.id}" value="${d.unitCost}" />
                  </label>
                `).join("")}
          </div>
        </details>
      `).join("")}function F(){if(!gt)return;const a=_(),e=bt(a,y.assumptions),u=vt(a,e),d=X(a,e,y.products,y.assumptions,"dc"),i=X(a,e,y.products,y.assumptions,"hybrid"),s=q.find(o=>o.id===a.brandProfileId)??q[0];document.documentElement.style.setProperty("--brand",s.primaryColor),document.documentElement.style.setProperty("--accent",s.accentColor),gt.innerHTML=`
    <div class="app-shell">
      <header class="topbar">
        <div>
          <p>${s.name}</p>
          <h1>Hello Solar Planner</h1>
        </div>
        <div class="top-actions">
          <select data-project-switch aria-label="Switch project">
            ${y.projects.map(o=>`<option value="${o.id}" ${o.id===a.id?"selected":""}>${o.name}</option>`).join("")}
          </select>
          <button type="button" data-new-project>New</button>
          <button type="button" data-load-sample>Sample</button>
          <button type="button" data-print>Print report</button>
        </div>
      </header>

      <main class="planner-grid">
        <section class="panel project-panel">
          <div class="section-heading">
            <span>Project</span>
            <strong>${a.name}</strong>
          </div>
          <div class="form-grid">
            ${T(a,"name","Project name")}
            ${T(a,"country","Country")}
            ${T(a,"currency","Currency")}
            ${T(a,"systemVoltage","System voltage","number")}
            ${T(a,"sunHours","Sun hours","number")}
            ${T(a,"autonomyDays","Autonomy days","number")}
            <label>
              <span>Brand profile</span>
              <select data-project-field="brandProfileId">
                ${q.map(o=>`<option value="${o.id}" ${o.id===a.brandProfileId?"selected":""}>${o.name}</option>`).join("")}
              </select>
            </label>
          </div>
        </section>

        <section class="panel metrics-panel">
          <div class="metric"><span>Total daily Wh</span><strong>${R(e.totalDailyWh)}</strong></div>
          <div class="metric"><span>Peak load</span><strong>${j.format(e.peakLoadW)} W</strong></div>
          <div class="metric"><span>Surge load</span><strong>${j.format(e.surgeLoadW)} W</strong></div>
          <div class="metric"><span>Critical load energy</span><strong>${R(e.criticalDailyWh)}</strong></div>
        </section>

        <section class="panel loads-panel">
          <div class="panel-title-row">
            <div class="section-heading">
              <span>Loads</span>
              <strong>${a.loads.length} device groups</strong>
            </div>
            <button type="button" data-add-load>Add load</button>
          </div>
          <div class="table-wrap">
            <table class="editable-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>W</th>
                  <th>h/day</th>
                  <th>Type</th>
                  <th>V</th>
                  <th>Surge</th>
                  <th>Critical</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${Ee(a)}</tbody>
            </table>
          </div>
        </section>

        <section class="panel recommendations-panel">
          <div class="section-heading">
            <span>System options</span>
            <strong>Two planning paths</strong>
          </div>
          <div class="option-grid">
            ${u.map(o=>{const p=o.id==="dc"?e.dc:e.hybrid,f=o.id==="dc"?d:i;return`
                  <article class="option-card">
                    <h2>${o.name}</h2>
                    <p>${o.summary}</p>
                    <dl>
                      <div><dt>Adjusted energy</dt><dd>${R(p.adjustedDailyWh)}</dd></div>
                      <div><dt>Battery</dt><dd>${R(p.requiredBatteryWh)}</dd></div>
                      <div><dt>Solar array</dt><dd>${j.format(p.recommendedSolarArrayW)} W</dd></div>
                      <div><dt>MPPT current</dt><dd>${p.recommendedMpptCurrentA} A</dd></div>
                      ${o.id==="hybrid"?`<div><dt>Inverter</dt><dd>${j.format(p.recommendedInverterW)} W</dd></div>`:""}
                      <div><dt>Estimate</dt><dd>${Ct(f.total,a)}</dd></div>
                    </dl>
                  </article>
                `}).join("")}
          </div>
        </section>

        <section class="panel assumptions-panel">
          <div class="section-heading">
            <span>Editable assumptions</span>
            <strong>Efficiencies and prices</strong>
          </div>
          <div class="assumption-grid">
            ${[["dcDistributionEfficiency","DC efficiency"],["hybridDcEfficiency","Hybrid DC efficiency"],["inverterEfficiency","Inverter efficiency"],["batteryDepthOfDischarge","Battery DoD"],["arrayDerateFactor","PV derate"],["installationRate","Installation rate"],["contingencyRate","Contingency rate"]].map(([o,p])=>`
                  <label>
                    <span>${p}</span>
                    <input type="number" min="0" max="2" step="0.01" data-assumption-field="${o}" value="${y.assumptions[o]}" />
                  </label>
                `).join("")}
          </div>
          <div class="product-editor">${Ae()}</div>
        </section>

        <section class="panel report-panel">
          <div class="panel-title-row">
            <div class="section-heading">
              <span>Printable report</span>
              <strong>Ready for review</strong>
            </div>
            <button type="button" data-print>Print</button>
          </div>
          <div id="report">${We(a)}</div>
        </section>
      </main>
    </div>
  `,xe()}function xe(){var a,e,u,d;(a=document.querySelector("[data-project-switch]"))==null||a.addEventListener("change",i=>{y.activeProjectId=i.target.value,I(),F()}),document.querySelectorAll("[data-project-field]").forEach(i=>{i.addEventListener("change",s=>{const o=s.target,p=x(_()),f=o.dataset.projectField,m=new Set(["systemVoltage","sunHours","autonomyDays"]);p[f]=m.has(f)?Number(o.value):o.value,Z(p)})}),document.querySelectorAll("[data-load-field]").forEach(i=>{i.addEventListener("change",s=>{const o=s.target,p=x(_()),f=p.loads.find(v=>v.id===o.dataset.loadId);if(!f)return;const m=o.dataset.loadField??"";m==="critical"?f.critical=o.checked:m==="name"||m==="currentType"?f[m]=o.value:f[m]=Number(o.value),Z(p)})}),document.querySelectorAll("[data-remove-load]").forEach(i=>{i.addEventListener("click",()=>{const s=x(_());s.loads=s.loads.filter(o=>o.id!==i.dataset.removeLoad),Z(s)})}),(e=document.querySelector("[data-add-load]"))==null||e.addEventListener("click",()=>{const i=x(_());i.loads.push({id:ot(),name:"New load",quantity:1,watts:10,hoursPerDay:4,currentType:"DC",voltage:i.systemVoltage,surgeMultiplier:1.1,critical:!1}),Z(i)}),(u=document.querySelector("[data-new-project]"))==null||u.addEventListener("click",()=>{const i=x(ct);i.id=ot(),i.name="Untitled solar project",i.updatedAt=new Date().toISOString(),y.projects=[...y.projects,i],y.activeProjectId=i.id,I(),F()}),(d=document.querySelector("[data-load-sample]"))==null||d.addEventListener("click",()=>{const i=x(ct);i.id=ot(),i.updatedAt=new Date().toISOString(),y.projects=[...y.projects,i],y.activeProjectId=i.id,I(),F()}),document.querySelectorAll("[data-assumption-field]").forEach(i=>{i.addEventListener("change",s=>{const o=s.target,p=o.dataset.assumptionField;y.assumptions[p]=Number(o.value),I(),F()})}),document.querySelectorAll("[data-product-id]").forEach(i=>{i.addEventListener("change",s=>{const o=s.target,p=o.dataset.productSection,f=y.products[p].find(m=>m.id===o.dataset.productId);f&&(f.unitCost=Number(o.value),I(),F())})}),document.querySelectorAll("[data-print]").forEach(i=>{i.addEventListener("click",()=>window.print())})}F();
