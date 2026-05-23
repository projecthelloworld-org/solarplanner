(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function r(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(i){if(i.ep)return;i.ep=!0;const o=r(i);fetch(i.href,o)}})();var Se=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Pt={exports:{}};(function(t,e){(function(r,n){n(e)})(Se,function(r){function n(){return n=Object.assign?Object.assign.bind():function(a){for(var s=1;s<arguments.length;s++){var d=arguments[s];for(var u in d)Object.prototype.hasOwnProperty.call(d,u)&&(a[u]=d[u])}return a},n.apply(this,arguments)}function i(a,s){a.prototype=Object.create(s.prototype),a.prototype.constructor=a,l(a,s)}function o(a){return o=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(s){return s.__proto__||Object.getPrototypeOf(s)},o(a)}function l(a,s){return l=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(d,u){return d.__proto__=u,d},l(a,s)}function c(a,s,d){return c=function(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}()?Reflect.construct.bind():function(u,m,b){var C=[null];C.push.apply(C,m);var f=new(Function.bind.apply(u,C));return b&&l(f,b.prototype),f},c.apply(null,arguments)}function y(a){var s=typeof Map=="function"?new Map:void 0;return y=function(d){if(d===null||Function.toString.call(d).indexOf("[native code]")===-1)return d;if(typeof d!="function")throw new TypeError("Super expression must either be null or a function");if(s!==void 0){if(s.has(d))return s.get(d);s.set(d,u)}function u(){return c(d,arguments,o(this).constructor)}return u.prototype=Object.create(d.prototype,{constructor:{value:u,enumerable:!1,writable:!0,configurable:!0}}),l(u,d)},y(a)}var p=function(){function a(d){this.cache=void 0,this.cache=d}var s=a.prototype;return s.define=function(d,u){this.cache[d]=u},s.get=function(d){return this.cache[d]},s.remove=function(d){delete this.cache[d]},s.reset=function(){this.cache={}},s.load=function(d){this.cache=n({},this.cache,d)},a}(),h=function(a){function s(d){var u;return(u=a.call(this,d)||this).name="Eta Error",u}return i(s,a),s}(y(Error)),g=function(a){function s(d){var u;return(u=a.call(this,d)||this).name="EtaParser Error",u}return i(s,a),s}(h),$=function(a){function s(d){var u;return(u=a.call(this,d)||this).name="EtaRuntime Error",u}return i(s,a),s}(h),A=function(a){function s(d){var u;return(u=a.call(this,d)||this).name="EtaNameResolution Error",u}return i(s,a),s}(h);function D(a,s,d){var u=s.slice(0,d).split(/\n/),m=u.length,b=u[m-1].length+1;throw a+=" at line "+m+" col "+b+`:

  `+s.split(/\n/)[m-1]+`
  `+Array(b).join(" ")+"^",new g(a)}function K(a,s,d,u){var m=s.split(`
`),b=Math.max(d-3,0),C=Math.min(m.length,d+3),f=u,j=m.slice(b,C).map(function($t,lt){var w=lt+b+1;return(w==d?" >> ":"    ")+w+"| "+$t}).join(`
`),x=new $((f?f+":"+d+`
`:"line "+d+`
`)+j+`

`+a.message);throw x.name=a.name,x}var it=(function(){return Promise.resolve()}).constructor;function ce(a,s){var d=this.config,u=s&&s.async?it:Function;try{return new u(d.varName,"options",this.compileToString.call(this,a,s))}catch(m){throw m instanceof SyntaxError?new g(`Bad template syntax

`+m.message+`
`+Array(m.message.length+1).join("=")+`
`+this.compileToString.call(this,a,s)+`
`):m}}function le(a,s){var d=this.config,u=s&&s.async,m=this.compileBody,b=this.parse.call(this,a),C=d.functionHeader+`
let include = (template, data) => this.render(template, data, options);
let includeAsync = (template, data) => this.renderAsync(template, data, options);

let __eta = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction`+(d.debug?', line: 1, templateStr: "'+a.replace(/\\|"/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n")+'"':"")+`};

function layout(path, data) {
  __eta.layout = path;
  __eta.layoutData = data;
}`+(d.debug?"try {":"")+(d.useWith?"with("+d.varName+"||{}){":"")+`

`+m.call(this,b)+`
if (__eta.layout) {
  __eta.res = `+(u?"await includeAsync":"include")+" (__eta.layout, {..."+d.varName+`, body: __eta.res, ...__eta.layoutData});
}
`+(d.useWith?"}":"")+(d.debug?"} catch (e) { this.RuntimeErr(e, __eta.templateStr, __eta.line, options.filepath) }":"")+`
return __eta.res;
`;if(d.plugins)for(var f=0;f<d.plugins.length;f++){var j=d.plugins[f];j.processFnString&&(C=j.processFnString(C,d))}return C}function ue(a){for(var s=this.config,d=0,u=a.length,m="";d<u;d++){var b=a[d];if(typeof b=="string")m+="__eta.res+='"+b+`'
`;else{var C=b.t,f=b.val||"";s.debug&&(m+="__eta.line="+b.lineNo+`
`),C==="r"?(s.autoFilter&&(f="__eta.f("+f+")"),m+="__eta.res+="+f+`
`):C==="i"?(s.autoFilter&&(f="__eta.f("+f+")"),s.autoEscape&&(f="__eta.e("+f+")"),m+="__eta.res+="+f+`
`):C==="e"&&(m+=f+`
`)}}return m}var pe={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function me(a){return pe[a]}var qt={autoEscape:!0,autoFilter:!1,autoTrim:[!1,"nl"],cache:!1,cacheFilepaths:!0,debug:!1,escapeFunction:function(a){var s=String(a);return/[&<>"']/.test(s)?s.replace(/[&<>"']/g,me):s},filterFunction:function(a){return String(a)},functionHeader:"",parse:{exec:"",interpolate:"=",raw:"~"},plugins:[],rmWhitespace:!1,tags:["<%","%>"],useWith:!1,varName:"it",defaultExtension:".eta"},ot=/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g,st=/'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g,dt=/"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;function ct(a){return a.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&")}function he(a,s){return a.slice(0,s).split(`
`).length}function ye(a){var s=this.config,d=[],u=!1,m=0,b=s.parse;if(s.plugins)for(var C=0;C<s.plugins.length;C++){var f=s.plugins[C];f.processTemplate&&(a=f.processTemplate(a,s))}function j(E,Z){E&&(E=function(q,mt,Dt,Wt){var V,k;return Array.isArray(mt.autoTrim)?(V=mt.autoTrim[1],k=mt.autoTrim[0]):V=k=mt.autoTrim,(Dt||Dt===!1)&&(V=Dt),(Wt||Wt===!1)&&(k=Wt),k||V?V==="slurp"&&k==="slurp"?q.trim():(V==="_"||V==="slurp"?q=q.trimStart():V!=="-"&&V!=="nl"||(q=q.replace(/^(?:\r\n|\n|\r)/,"")),k==="_"||k==="slurp"?q=q.trimEnd():k!=="-"&&k!=="nl"||(q=q.replace(/(?:\r\n|\n|\r)$/,"")),q):q}(E,s,u,Z),E&&(E=E.replace(/\\|'/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n"),d.push(E)))}s.rmWhitespace&&(a=a.replace(/[\r\n]+/g,`
`).replace(/^\s+|\s+$/gm,"")),ot.lastIndex=0,st.lastIndex=0,dt.lastIndex=0;for(var x,$t=[b.exec,b.interpolate,b.raw].reduce(function(E,Z){return E&&Z?E+"|"+ct(Z):Z?ct(Z):E},""),lt=new RegExp(ct(s.tags[0])+"(-|_)?\\s*("+$t+")?\\s*","g"),w=new RegExp("'|\"|`|\\/\\*|(\\s*(-|_)?"+ct(s.tags[1])+")","g");x=lt.exec(a);){var Ce=a.slice(m,x.index);m=x[0].length+x.index;var St=x[2]||"";j(Ce,x[1]),w.lastIndex=m;for(var P=void 0,ut=!1;P=w.exec(a);){if(P[1]){var $e=a.slice(m,P.index);lt.lastIndex=m=w.lastIndex,u=P[2],ut={t:St===b.exec?"e":St===b.raw?"r":St===b.interpolate?"i":"",val:$e};break}var pt=P[0];if(pt==="/*"){var Nt=a.indexOf("*/",w.lastIndex);Nt===-1&&D("unclosed comment",a,P.index),w.lastIndex=Nt}else pt==="'"?(st.lastIndex=P.index,st.exec(a)?w.lastIndex=st.lastIndex:D("unclosed string",a,P.index)):pt==='"'?(dt.lastIndex=P.index,dt.exec(a)?w.lastIndex=dt.lastIndex:D("unclosed string",a,P.index)):pt==="`"&&(ot.lastIndex=P.index,ot.exec(a)?w.lastIndex=ot.lastIndex:D("unclosed string",a,P.index))}ut?(s.debug&&(ut.lineNo=he(a,x.index)),d.push(ut)):D("unclosed tag",a,x.index)}if(j(a.slice(m,a.length),!1),s.plugins)for(var Ut=0;Ut<s.plugins.length;Ut++){var It=s.plugins[Ut];It.processAST&&(d=It.processAST(d,s))}return d}function Ft(a,s){var d=s&&s.async?this.templatesAsync:this.templatesSync;if(this.resolvePath&&this.readFile&&!a.startsWith("@")){var u=s.filepath,m=d.get(u);if(this.config.cache&&m)return m;var b=this.readFile(u),C=this.compile(b,s);return this.config.cache&&d.define(u,C),C}var f=d.get(a);if(f)return f;throw new A("Failed to get template '"+a+"'")}function Rt(a,s,d){var u,m=n({},d,{async:!1});return typeof a=="string"?(this.resolvePath&&this.readFile&&!a.startsWith("@")&&(m.filepath=this.resolvePath(a,m)),u=Ft.call(this,a,m)):u=a,u.call(this,s,m)}function Tt(a,s,d){var u,m=n({},d,{async:!0});typeof a=="string"?(this.resolvePath&&this.readFile&&!a.startsWith("@")&&(m.filepath=this.resolvePath(a,m)),u=Ft.call(this,a,m)):u=a;var b=u.call(this,s,m);return Promise.resolve(b)}function ge(a,s){var d=this.compile(a,{async:!1});return Rt.call(this,d,s)}function be(a,s){var d=this.compile(a,{async:!0});return Tt.call(this,d,s)}var fe=function(){function a(d){this.config=void 0,this.RuntimeErr=K,this.compile=ce,this.compileToString=le,this.compileBody=ue,this.parse=ye,this.render=Rt,this.renderAsync=Tt,this.renderString=ge,this.renderStringAsync=be,this.filepathCache={},this.templatesSync=new p({}),this.templatesAsync=new p({}),this.resolvePath=null,this.readFile=null,this.config=d?n({},qt,d):n({},qt)}var s=a.prototype;return s.configure=function(d){this.config=n({},this.config,d)},s.withConfig=function(d){return n({},this,{config:n({},this.config,d)})},s.loadTemplate=function(d,u,m){if(typeof u=="string")(m&&m.async?this.templatesAsync:this.templatesSync).define(d,this.compile(u,m));else{var b=this.templatesSync;(u.constructor.name==="AsyncFunction"||m&&m.async)&&(b=this.templatesAsync),b.define(d,u)}},a}(),ve=function(a){function s(){return a.apply(this,arguments)||this}return i(s,a),s}(fe);r.Eta=ve})})(Pt,Pt.exports);var Ue=Pt.exports;const De="/assets/solar_planner_logo-BH1XdSqi.svg",We=.94,Ae=.94,Pe=.88,Me=.8,xe=1.15,we=.75,Ee=1.25,qe=1.25,Fe=.16,Re=.1,Te="Prices are editable planning assumptions and should be localized before procurement.",Ne="This report is for planning estimates only, not certified electrical design. Final installation must be reviewed by a qualified solar/electrical technician and comply with local electrical, structural, grounding, and lightning protection requirements.",Lt={dcDistributionEfficiency:We,hybridDcEfficiency:Ae,inverterEfficiency:Pe,batteryDepthOfDischarge:Me,batteryReserveFactor:xe,arrayDerateFactor:we,mpptSafetyFactor:Ee,inverterHeadroomFactor:qe,installationRate:Fe,contingencyRate:Re,currencyExchangeNotes:Te,safetyDisclaimer:Ne},Ie=[{id:"project-hello-world",name:"Project Hello World",tagline:"Community-powered connectivity planning",primaryColor:"#1f6f68",accentColor:"#f0b429",reportFooter:"Prepared for Project Hello World community connectivity planning."},{id:"community-network",name:"Community Network Partner",tagline:"Practical power estimates for local network teams",primaryColor:"#315f8c",accentColor:"#55a06a",reportFooter:"Prepared for community network partner review and local adaptation."},{id:"field-technician",name:"Field Technician Draft",tagline:"Site-first solar planning notes",primaryColor:"#7a4f1d",accentColor:"#3f8f8a",reportFooter:"Draft estimate for technician review before installation."}],Le=[{id:"pv-200",name:"200 W mono solar panel",unit:"panel",unitCost:130,watts:200},{id:"pv-450",name:"450 W mono solar panel",unit:"panel",unitCost:245,watts:450}],Ve=[{id:"bat-1280",name:"12.8 V 100 Ah LiFePO4 battery",unit:"battery",unitCost:310,wattHours:1280},{id:"bat-2560",name:"25.6 V 100 Ah LiFePO4 battery",unit:"battery",unitCost:560,wattHours:2560}],ke=[{id:"mppt-30",name:"30 A MPPT charge controller",unit:"controller",unitCost:145,amps:30},{id:"mppt-60",name:"60 A MPPT charge controller",unit:"controller",unitCost:260,amps:60}],_e=[{id:"hybrid-1000",name:"1 kW hybrid inverter charger",unit:"inverter",unitCost:420,watts:1e3},{id:"hybrid-2000",name:"2 kW hybrid inverter charger",unit:"inverter",unitCost:690,watts:2e3}],Oe=[{id:"dc-board",name:"DC breaker board, fuses, labels, and surge protection",unit:"set",unitCost:180}],He=[{id:"ac-board",name:"AC breaker board, RCD, outlets, and labels",unit:"set",unitCost:220}],Be=[{id:"cable-kit",name:"PV, battery, and load cabling with MC4/connectors",unit:"kit",unitCost:210}],ze=[{id:"earth-kit",name:"Earthing rod, bonding, surge, and lightning protection kit",unit:"kit",unitCost:190}],je=[{id:"monitor-kit",name:"Battery monitor and remote energy logging",unit:"kit",unitCost:155}],Ge={solarPanels:Le,batteries:Ve,chargeControllers:ke,hybridInverters:_e,dcDistribution:Oe,acDistribution:He,cabling:Be,earthing:ze,monitoring:je},Qe="hello-hub-lite",Ke="Hello Hub Lite sample",Ze="Uganda",Je="USD",Ye=1,Xe=24,tn=4.8,en=1.5,nn="project-hello-world",rn="dc",an={panelWatts:450,batteryVoltage:24,batteryAh:100,mpptAmpStep:10,inverterWattStep:500},on={panelUnitUsd:245,batteryUnitUsd:560,controllerUnitUsd:260,inverterUnitUsd:690,dcDistributionUnitUsd:180,acDistributionUnitUsd:220,cablingUnitUsd:210,earthingUnitUsd:190,monitoringUnitUsd:155},sn="generated",dn="2026-05-19T00:00:00.000Z",cn=[{id:"load-router",name:"Core router",quantity:1,watts:18,hoursPerDay:24,currentType:"DC",voltage:24,surgeMultiplier:1.2,critical:!0},{id:"load-ap",name:"Outdoor access point",quantity:3,watts:12,hoursPerDay:24,currentType:"DC",voltage:24,surgeMultiplier:1.2,critical:!0},{id:"load-tablets",name:"Learning tablets",quantity:10,watts:8,hoursPerDay:3,currentType:"DC",voltage:5,surgeMultiplier:1,critical:!1},{id:"load-lights",name:"LED lights",quantity:6,watts:5,hoursPerDay:5,currentType:"DC",voltage:12,surgeMultiplier:1.1,critical:!0},{id:"load-usb",name:"USB charging station",quantity:1,watts:60,hoursPerDay:4,currentType:"DC",voltage:12,surgeMultiplier:1.1,critical:!1},{id:"load-monitor",name:"Monitoring gateway",quantity:1,watts:8,hoursPerDay:24,currentType:"DC",voltage:12,surgeMultiplier:1.2,critical:!0},{id:"load-laptop",name:"Technician laptop charging",quantity:1,watts:65,hoursPerDay:2,currentType:"AC",voltage:230,surgeMultiplier:1.5,critical:!1}],vt={id:Qe,name:Ke,country:Ze,currency:Je,usdExchangeRate:Ye,systemVoltage:Xe,sunHours:tn,autonomyDays:en,brandProfileId:nn,selectedSystem:rn,equipmentDefaults:an,pricing:on,equipmentPlanMode:sn,updatedAt:dn,loads:cn},ht=(t,e)=>Math.ceil(t/e)*e,yt=(t,e=0)=>Number.isFinite(t)?t:e;function ln(t){return t.loads.map(e=>{const r=Math.max(0,yt(e.quantity)),n=Math.max(0,yt(e.watts)),i=Math.max(0,yt(e.hoursPerDay)),o=Math.max(1,yt(e.surgeMultiplier,1)),l=r*n;return{load:e,runningWatts:l,dailyWh:l*i,surgeWatts:l*o}})}function Vt(t,e,r,n,i,o){const l=Math.max(.5,n.autonomyDays),c=Math.max(.5,n.sunHours),y=Math.max(12,n.systemVoltage),p=t*l*i.batteryReserveFactor/i.batteryDepthOfDischarge,h=t/c/i.arrayDerateFactor*i.batteryReserveFactor,g=h/y*i.mpptSafetyFactor,$=Math.max(e,r*.55);return{adjustedDailyWh:Math.round(t),requiredBatteryWh:ht(p,100),recommendedSolarArrayW:ht(h,10),recommendedMpptCurrentA:ht(g,5),recommendedInverterW:o?ht($*i.inverterHeadroomFactor,100):0}}function ne(t,e){const r=ln(t),n=r.reduce((p,h)=>p+h.dailyWh,0),i=r.reduce((p,h)=>p+h.runningWatts,0),o=Math.max(0,...r.map(p=>i-p.runningWatts+p.surgeWatts)),l=r.filter(p=>p.load.critical).reduce((p,h)=>p+h.dailyWh,0),c=n/e.dcDistributionEfficiency,y=r.reduce((p,h)=>{const g=h.load.currentType==="AC"?e.inverterEfficiency:e.hybridDcEfficiency;return p+h.dailyWh/g},0);return{loadRows:r,totalDailyWh:Math.round(n),peakLoadW:Math.round(i),surgeLoadW:Math.round(o),criticalDailyWh:Math.round(l),dc:Vt(c,i,o,t,e,!1),hybrid:Vt(y,i,o,t,e,!0)}}const Y=(t,e)=>Math.round(t*Math.max(0,e));function I(t,e,r,n,i){const o=r*n;return{category:t,description:e,quantity:r,unitCostUsd:n,unitCost:Y(n,i),totalUsd:o,total:Y(o,i)}}function kt(t,e,r,n,i){const o=Math.max(0,t.usdExchangeRate||1),l=[I("Solar panels",`${e.shared.panelCount} panel(s) x ${e.shared.panelWatts} W`,e.shared.panelCount,r.panelUnitUsd,o),I("LiFePO4 battery storage",`${e.shared.batteryCount} battery/batteries x ${e.shared.batteryVoltage} V x ${e.shared.batteryAh} Ah`,e.shared.batteryCount,r.batteryUnitUsd,o)];i==="dc"?l.push(I("Charge controller or hybrid inverter",`${e.dc.controllerCount} controller(s) x ${e.dc.mpptAmps} A MPPT`,e.dc.controllerCount,r.controllerUnitUsd,o)):l.push(I("Charge controller or hybrid inverter",`${e.hybrid.controllerCount} controller(s) x ${e.hybrid.mpptAmps} A MPPT`,e.hybrid.controllerCount,r.controllerUnitUsd,o),I("Hybrid inverter capacity",`${e.hybrid.inverterCount} inverter(s) x ${e.hybrid.inverterWatts} W`,e.hybrid.inverterCount,r.inverterUnitUsd,o)),l.push(I("DC distribution and protection","DC breaker board, fuses, labels, and surge protection",e.balance.dcDistributionCount,r.dcDistributionUnitUsd,o)),i==="hybrid"&&l.push(I("AC distribution for hybrid systems","AC breaker board, RCD, outlets, and labels",e.balance.acDistributionCount,r.acDistributionUnitUsd,o)),l.push(I("Cabling and connectors","PV, battery, and load cabling with MC4/connectors",e.balance.cablingCount,r.cablingUnitUsd,o),I("Earthing and lightning protection","Earthing rod, bonding, surge, and lightning protection kit",e.balance.earthingCount,r.earthingUnitUsd,o),I("Monitoring","Battery monitor and remote energy logging",e.balance.monitoringCount,r.monitoringUnitUsd,o));const c=l.reduce((g,$)=>g+$.totalUsd,0),y=Math.round(c*n.installationRate),p=Math.round((c+y)*n.contingencyRate),h=c+y+p;return{systemId:i,lines:l,subtotalUsd:c,subtotal:Y(c,o),installationUsd:y,installation:Y(y,o),contingencyUsd:p,contingency:Y(p,o),totalUsd:h,total:Y(h,o),currency:t.currency,exchangeRate:o}}const _t=(t,e)=>Math.ceil(t/Math.max(1,e))*Math.max(1,e),tt=(t,e)=>Number.isFinite(t)&&t>0?t:e;function re(t,e){const r=tt(e.panelWatts,450),n=tt(e.batteryVoltage,24),i=tt(e.batteryAh,100),o=n*i,l=tt(e.mpptAmpStep,10),c=tt(e.inverterWattStep,500),y=Math.max(t.dc.recommendedSolarArrayW,t.hybrid.recommendedSolarArrayW),p=Math.max(t.dc.requiredBatteryWh,t.hybrid.requiredBatteryWh);return{shared:{panelCount:Math.max(1,Math.ceil(y/r)),panelWatts:r,batteryCount:Math.max(1,Math.ceil(p/o)),batteryVoltage:n,batteryAh:i},dc:{controllerCount:1,mpptAmps:_t(t.dc.recommendedMpptCurrentA,l)},hybrid:{controllerCount:1,mpptAmps:_t(t.hybrid.recommendedMpptCurrentA,l),inverterCount:Math.max(1,Math.ceil(t.hybrid.recommendedInverterW/c)),inverterWatts:c},balance:{dcDistributionCount:1,acDistributionCount:1,cablingCount:1,earthingCount:1,monitoringCount:1}}}function ae(t){return{solarArrayW:t.shared.panelCount*t.shared.panelWatts,batteryWh:t.shared.batteryCount*t.shared.batteryVoltage*t.shared.batteryAh,dcMpptA:t.dc.mpptAmps,hybridMpptA:t.hybrid.mpptAmps,hybridInverterW:t.hybrid.inverterCount*t.hybrid.inverterWatts}}const Ot=(t,e)=>e==="Wh"&&t>=1e3?`${(t/1e3).toFixed(2)} kWh`:`${Math.round(t).toLocaleString()} ${e}`;function gt(t,e,r,n){const i=e>=r;return{label:t,actual:e,required:r,unit:n,passed:i,warning:i?void 0:`${t} is ${Ot(e,n)}; recommendation is ${Ot(r,n)}.`}}function Ht(t,e,r){const n=ae(e),i=r==="dc"?t.dc:t.hybrid,o=[gt("Solar array",n.solarArrayW,i.recommendedSolarArrayW,"W"),gt("Battery storage",n.batteryWh,i.requiredBatteryWh,"Wh"),gt("MPPT/controller",r==="dc"?n.dcMpptA:n.hybridMpptA,i.recommendedMpptCurrentA,"A")];r==="hybrid"&&o.push(gt("Inverter capacity",n.hybridInverterW,i.recommendedInverterW,"W"));const l=o.flatMap(c=>c.warning?[c.warning]:[]);return{systemId:r,status:l.length===0?"Pass":"Needs attention",checks:o,warnings:l}}const bt=t=>`${(t/1e3).toFixed(1)} kWh`;function un(t,e){return[{id:"dc",name:"Fully DC System",summary:t.loads.filter(i=>i.currentType==="AC").length>0?"Best when AC devices can be replaced with DC equivalents or powered through small point-of-use adapters.":"A simple direct-current architecture that avoids inverter losses and keeps the installation compact.",lines:[{category:"Energy target",recommendation:`${bt(e.dc.adjustedDailyWh)} adjusted daily demand`,rationale:"Uses DC distribution efficiency to account for wiring, conversion, and operating margin."},{category:"Battery",recommendation:`${bt(e.dc.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,rationale:`Sized for ${t.autonomyDays} autonomy day(s) at the configured depth of discharge.`},{category:"Solar array",recommendation:`${e.dc.recommendedSolarArrayW.toLocaleString()} W PV array`,rationale:`Based on ${t.sunHours} average sun hour(s) with derating for real-world conditions.`},{category:"Charge control",recommendation:`${e.dc.recommendedMpptCurrentA} A MPPT at ${t.systemVoltage} V`,rationale:"Controller current includes a safety factor above expected PV charging current."}]},{id:"hybrid",name:"Hybrid DC + AC System",summary:"Keeps efficient DC supply for network loads while adding AC capacity for devices that cannot move to DC.",lines:[{category:"Energy target",recommendation:`${bt(e.hybrid.adjustedDailyWh)} adjusted daily demand`,rationale:"Applies inverter efficiency only to AC loads while preserving a DC path for DC equipment."},{category:"Battery",recommendation:`${bt(e.hybrid.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,rationale:`Sized for ${t.autonomyDays} autonomy day(s), including reserve and depth-of-discharge limits.`},{category:"Solar array",recommendation:`${e.hybrid.recommendedSolarArrayW.toLocaleString()} W PV array`,rationale:`Based on ${t.sunHours} average sun hour(s), array derating, and storage recovery needs.`},{category:"Inverter",recommendation:`${e.hybrid.recommendedInverterW.toLocaleString()} W inverter or hybrid inverter`,rationale:"Allows headroom above the running and expected surge load."}]}]}const pn=`<article class="report-document">
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
      This estimate is prepared for the selected <%= it.selectedSystemName %> planning path. Other planner options remain available in the app for comparison.
    </p>
  </section>

  <section class="report-section">
    <h2>Project Summary</h2>
    <div class="report-grid">
      <p><strong>Country</strong><span><%= it.project.country %></span></p>
      <p><strong>Currency</strong><span><%= it.project.currency %></span></p>
      <p><strong>USD exchange rate</strong><span>1 USD = <%= it.formatDecimal(it.project.usdExchangeRate) %> <%= it.project.currency %></span></p>
      <p><strong>System voltage</strong><span><%= it.project.systemVoltage %> V</span></p>
      <p><strong>Sun hours</strong><span><%= it.project.sunHours %> h/day</span></p>
      <p><strong>Autonomy</strong><span><%= it.project.autonomyDays %> day(s)</span></p>
      <p><strong>Report option</strong><span><%= it.selectedSystemName %></span></p>
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
          <th><%= it.selectedSystemName %></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Adjusted daily energy</td>
          <td><%= it.formatEnergy(it.selectedSizing.adjustedDailyWh) %></td>
        </tr>
        <tr>
          <td>Required LiFePO4 battery</td>
          <td><%= it.formatEnergy(it.selectedSizing.requiredBatteryWh) %></td>
        </tr>
        <tr>
          <td>Recommended solar array</td>
          <td><%= it.formatNumber(it.selectedSizing.recommendedSolarArrayW) %> W</td>
        </tr>
        <tr>
          <td>Recommended MPPT current</td>
          <td><%= it.selectedSizing.recommendedMpptCurrentA %> A</td>
        </tr>
        <tr>
          <td>Recommended inverter size</td>
          <td><%= it.selectedSystem === "hybrid" ? \`\${it.formatNumber(it.selectedSizing.recommendedInverterW)} W\` : "Not required" %></td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="report-section">
    <h2>Generated / Edited Equipment Plan</h2>
    <table class="report-table">
      <thead>
        <tr>
          <th>Equipment</th>
          <th>Current plan</th>
          <th>Actual capacity</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Solar panels</td>
          <td><%= it.plan.shared.panelCount %> panel(s) x <%= it.plan.shared.panelWatts %> W</td>
          <td><%= it.formatNumber(it.actuals.solarArrayW) %> W</td>
          <td>Requirement: <%= it.formatNumber(it.selectedSizing.recommendedSolarArrayW) %> W</td>
        </tr>
        <tr>
          <td>LiFePO4 batteries</td>
          <td><%= it.plan.shared.batteryCount %> battery/batteries x <%= it.plan.shared.batteryVoltage %> V x <%= it.plan.shared.batteryAh %> Ah</td>
          <td><%= it.formatEnergy(it.actuals.batteryWh) %></td>
          <td>Requirement: <%= it.formatEnergy(it.selectedSizing.requiredBatteryWh) %></td>
        </tr>
        <% if (it.selectedSystem === "dc") { %>
        <tr>
          <td>Fully DC MPPT/controller</td>
          <td><%= it.plan.dc.controllerCount %> controller(s) x <%= it.plan.dc.mpptAmps %> A</td>
          <td><%= it.plan.dc.mpptAmps %> A</td>
          <td>Requirement: <%= it.selectedSizing.recommendedMpptCurrentA %> A</td>
        </tr>
        <% } else { %>
        <tr>
          <td>Hybrid MPPT/controller</td>
          <td><%= it.plan.hybrid.controllerCount %> controller(s) x <%= it.plan.hybrid.mpptAmps %> A</td>
          <td><%= it.plan.hybrid.mpptAmps %> A</td>
          <td>Requirement: <%= it.selectedSizing.recommendedMpptCurrentA %> A</td>
        </tr>
        <tr>
          <td>Hybrid inverter</td>
          <td><%= it.plan.hybrid.inverterCount %> inverter(s) x <%= it.plan.hybrid.inverterWatts %> W</td>
          <td><%= it.formatNumber(it.actuals.hybridInverterW) %> W</td>
          <td>Requirement: <%= it.formatNumber(it.selectedSizing.recommendedInverterW) %> W</td>
        </tr>
        <% } %>
      </tbody>
    </table>
  </section>

    <section class="report-section option-section">
      <h2><%= it.selectedRecommendation.name %></h2>
      <p class="status-line <%= it.selectedEvaluation.status === "Pass" ? "pass" : "warn" %>">
        <strong>Status:</strong> <%= it.selectedEvaluation.status %>
      </p>
      <% if (it.selectedEvaluation.warnings.length > 0) { %>
        <ul class="report-warning-list">
          <% it.selectedEvaluation.warnings.forEach((warning) => { %>
            <li><%= warning %></li>
          <% }) %>
        </ul>
      <% } %>
      <p class="section-intro"><%= it.selectedRecommendation.summary %></p>
      <table class="report-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Recommendation</th>
            <th>Rationale</th>
          </tr>
        </thead>
        <tbody>
          <% it.selectedRecommendation.lines.forEach((line) => { %>
            <tr>
              <td><%= line.category %></td>
              <td><%= line.recommendation %></td>
              <td><%= line.rationale %></td>
            </tr>
          <% }) %>
        </tbody>
      </table>
    </section>

  <section class="report-section financial-section">
    <h2>Financial Summary</h2>
    <div class="total-strip">
        <p>
          <strong><%= it.selectedSystemName %> option</strong>
          <span><%= it.money(it.selectedCost.total) %></span>
        </p>
    </div>

      <div class="cost-block">
        <h3><%= it.selectedSystemName %> Cost Detail</h3>
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
            <% it.selectedCost.lines.forEach((line) => { %>
              <tr>
                <td><%= line.category %></td>
                <td><%= line.description %></td>
                <td><%= line.quantity %></td>
                <td><%= it.moneyDetailed(line.unitCost) %> (<%= it.moneyUsd(line.unitCostUsd) %>)</td>
                <td><%= it.money(line.total) %></td>
              </tr>
            <% }) %>
            <tr>
              <td>Installation</td>
              <td>Planning allowance based on editable assumption</td>
              <td>1</td>
              <td><%= it.formatPercent(it.assumptions.installationRate) %></td>
              <td><%= it.money(it.selectedCost.installation) %></td>
            </tr>
            <tr>
              <td>Contingency</td>
              <td>Planning allowance for local variance and missing items</td>
              <td>1</td>
              <td><%= it.formatPercent(it.assumptions.contingencyRate) %></td>
              <td><%= it.money(it.selectedCost.contingency) %></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Estimated total</td>
              <td><%= it.money(it.selectedCost.total) %> (<%= it.moneyUsd(it.selectedCost.totalUsd) %>)</td>
            </tr>
          </tfoot>
        </table>
      </div>
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
      <p><strong>Panel price</strong><span><%= it.moneyUsd(it.project.pricing.panelUnitUsd) %> / panel</span></p>
      <p><strong>Battery price</strong><span><%= it.moneyUsd(it.project.pricing.batteryUnitUsd) %> / battery</span></p>
      <p><strong>Inverter price</strong><span><%= it.moneyUsd(it.project.pricing.inverterUnitUsd) %> / inverter</span></p>
    </div>
    <p class="report-note"><%= it.assumptions.currencyExchangeNotes %></p>
  </section>

  <section class="report-section disclaimer">
    <h2>Safety Disclaimer</h2>
    <p><%= it.assumptions.safetyDisclaimer %></p>
  </section>

  <footer><%= it.brand.reportFooter %></footer>
</article>
`,Mt="hello-solar-planner-state",mn=new Ue.Eta,Bt=document.querySelector("#app"),X=Ie,R=Ge,hn=["USD","UGX","KES","TZS","RWF","BIF","ZMW","MWK","ETB","GHS","NGN","EUR","GBP"],W=t=>JSON.parse(JSON.stringify(t)),ft=()=>{var t;return((t=crypto.randomUUID)==null?void 0:t.call(crypto))??`id-${Date.now()}-${Math.random().toString(16).slice(2)}`},U=new Intl.NumberFormat("en",{maximumFractionDigits:0}),at=new Intl.NumberFormat("en",{maximumFractionDigits:2}),_=t=>Math.round(t*100)/100,N={panelWatts:450,batteryVoltage:24,batteryAh:100,mpptAmpStep:10,inverterWattStep:500};function Ct(t){return t.selectedSystem==="dc"||t.selectedSystem==="hybrid"?t.selectedSystem:"dc"}function xt(t){return t==="dc"?"Fully DC System":"Hybrid DC + AC System"}var Gt,Qt,Kt,Zt,Jt,Yt,Xt,te,ee;const O={panelUnitUsd:((Gt=R.solarPanels[1])==null?void 0:Gt.unitCost)??245,batteryUnitUsd:((Qt=R.batteries[1])==null?void 0:Qt.unitCost)??560,controllerUnitUsd:((Kt=R.chargeControllers[1])==null?void 0:Kt.unitCost)??260,inverterUnitUsd:((Zt=R.hybridInverters[1])==null?void 0:Zt.unitCost)??690,dcDistributionUnitUsd:((Jt=R.dcDistribution[0])==null?void 0:Jt.unitCost)??180,acDistributionUnitUsd:((Yt=R.acDistribution[0])==null?void 0:Yt.unitCost)??220,cablingUnitUsd:((Xt=R.cabling[0])==null?void 0:Xt.unitCost)??210,earthingUnitUsd:((te=R.earthing[0])==null?void 0:te.unitCost)??190,monitoringUnitUsd:((ee=R.monitoring[0])==null?void 0:ee.unitCost)??155};function yn(t={}){return{panelUnitUsd:_(Number(t.panelUnitUsd??Number(t.panelUsdPerW??0)*N.panelWatts)||O.panelUnitUsd),batteryUnitUsd:_(Number(t.batteryUnitUsd??Number(t.batteryUsdPerWh??0)*N.batteryVoltage*N.batteryAh)||O.batteryUnitUsd),controllerUnitUsd:_(Number(t.controllerUnitUsd??t.chargeControllerUsd)||O.controllerUnitUsd),inverterUnitUsd:_(Number(t.inverterUnitUsd??Number(t.inverterUsdPerW??0)*N.inverterWattStep)||O.inverterUnitUsd),dcDistributionUnitUsd:_(Number(t.dcDistributionUnitUsd??t.dcDistributionUsd)||O.dcDistributionUnitUsd),acDistributionUnitUsd:_(Number(t.acDistributionUnitUsd??t.acDistributionUsd)||O.acDistributionUnitUsd),cablingUnitUsd:_(Number(t.cablingUnitUsd??t.cablingUsd)||O.cablingUnitUsd),earthingUnitUsd:_(Number(t.earthingUnitUsd??t.earthingUsd)||O.earthingUnitUsd),monitoringUnitUsd:_(Number(t.monitoringUnitUsd??t.monitoringUsd)||O.monitoringUnitUsd)}}function gn(t){var e,r,n,i,o,l,c,y,p,h,g,$,A,D,K,it;if(t)return{shared:{panelCount:((e=t.shared)==null?void 0:e.panelCount)??1,panelWatts:((r=t.shared)==null?void 0:r.panelWatts)??N.panelWatts,batteryCount:((n=t.shared)==null?void 0:n.batteryCount)??1,batteryVoltage:((i=t.shared)==null?void 0:i.batteryVoltage)??N.batteryVoltage,batteryAh:((o=t.shared)==null?void 0:o.batteryAh)??N.batteryAh},dc:{controllerCount:((l=t.dc)==null?void 0:l.controllerCount)??1,mpptAmps:((c=t.dc)==null?void 0:c.mpptAmps)??N.mpptAmpStep},hybrid:{controllerCount:((y=t.hybrid)==null?void 0:y.controllerCount)??1,mpptAmps:((p=t.hybrid)==null?void 0:p.mpptAmps)??N.mpptAmpStep,inverterCount:((h=t.hybrid)==null?void 0:h.inverterCount)??1,inverterWatts:((g=t.hybrid)==null?void 0:g.inverterWatts)??N.inverterWattStep},balance:{dcDistributionCount:(($=t.balance)==null?void 0:$.dcDistributionCount)??1,acDistributionCount:((A=t.balance)==null?void 0:A.acDistributionCount)??1,cablingCount:((D=t.balance)==null?void 0:D.cablingCount)??1,earthingCount:((K=t.balance)==null?void 0:K.earthingCount)??1,monitoringCount:((it=t.balance)==null?void 0:it.monitoringCount)??1}}}function rt(t){const e=W(vt),r={...e,...t},n=r.loads??e.loads;return{...r,currency:r.currency||"USD",usdExchangeRate:Number.isFinite(r.usdExchangeRate)&&r.usdExchangeRate>0?r.usdExchangeRate:1,selectedSystem:r.selectedSystem==="dc"||r.selectedSystem==="hybrid"?r.selectedSystem:"dc",equipmentDefaults:{...N,...r.equipmentDefaults??{}},pricing:yn(r.pricing),equipmentPlanMode:r.equipmentPlanMode??"generated",equipmentPlan:gn(r.equipmentPlan),loads:n,updatedAt:r.updatedAt??new Date().toISOString()}}function bn(){const t=rt(W(vt));try{const e=localStorage.getItem(Mt);if(e){const r=JSON.parse(e),n=(r.projects??[t]).map(i=>rt(i));return{activeProjectId:r.activeProjectId??n[0].id,projects:n,assumptions:{...Lt,...r.assumptions??{}},products:{...R,...r.products??{}}}}}catch{localStorage.removeItem(Mt)}return{activeProjectId:t.id,projects:[t],assumptions:Lt,products:R}}let v=bn(),wt=!1;function et(){localStorage.setItem(Mt,JSON.stringify(v))}function T(){return v.projects.find(t=>t.id===v.activeProjectId)??v.projects[0]}function B(t){t.updatedAt=new Date().toISOString(),v.projects=v.projects.map(e=>e.id===t.id?rt(t):e),et(),Q()}function ie(t,e){return t.equipmentPlanMode==="custom"&&t.equipmentPlan?t.equipmentPlan:e}function G(t,e=T()){return`${e.currency} ${U.format(t)}`}function oe(t,e=T()){return`${e.currency} ${at.format(t)}`}function M(t){return`USD ${at.format(t)}`}function L(t){return t>=1e3?`${at.format(t/1e3)} kWh`:`${U.format(t)} Wh`}function fn(t){return`<span class="status-pill ${t.status==="Pass"?"pass":"warn"}">${t.status}</span>`}const zt={energy:'<path d="M13 2 5 14h7l-1 8 8-12h-7l1-8Z" />',peak:'<path d="M4 18h16" /><path d="M6 16l4-7 4 4 4-7" />',surge:'<path d="M13 2 4 14h7l-1 8 10-14h-7l1-6Z" />',critical:'<rect x="7" y="4" width="10" height="16" rx="2" /><path d="M10 8h4" /><path d="M12 17h.01" />',currency:'<circle cx="12" cy="12" r="8" /><path d="M12 8v8" /><path d="M9.5 10.25c.5-1.2 4.4-1.3 4.9.2.5 1.6-4.5 1.4-4.2 3.1.3 1.7 4.2 1.5 4.8.2" />',solar:'<path d="M3 16h18" /><path d="M6 16l3-7h6l3 7" /><path d="M8 12h8" /><path d="M12 9v7" /><path d="M12 2v3" /><path d="M4.9 5.9l2.1 2.1" /><path d="M19.1 5.9 17 8" />',battery:'<rect x="4" y="7" width="15" height="10" rx="2" /><path d="M19 10h1.5v4H19" /><path d="M8 11v2" /><path d="M11 11v2" /><path d="M14 11v2" />',controller:'<rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 8h6" /><path d="M9 12h.01" /><path d="M12 12h.01" /><path d="M15 12h.01" /><path d="M9 16h6" />',inverter:'<rect x="4" y="5" width="16" height="14" rx="2" /><path d="M8 10h8" /><path d="M8 14h2" /><path d="M14 14h2" /><path d="M12 5v14" />',dcDist:'<path d="M12 3v18" /><path d="M5 8h14" /><path d="M5 16h14" /><circle cx="5" cy="8" r="2" /><circle cx="19" cy="8" r="2" /><circle cx="5" cy="16" r="2" /><circle cx="19" cy="16" r="2" />',acDist:'<path d="M4 12h5l3-7 3 14 3-7h2" />',cabling:'<path d="M7 7c-3 3-3 7 0 10s7 3 10 0" /><path d="M17 7c3 3 3 7 0 10s-7 3-10 0" /><path d="M9 9l6 6" />',earthing:'<path d="M12 3v11" /><path d="M8 14h8" /><path d="M9 17h6" /><path d="M10 20h4" />',monitoring:'<rect x="4" y="5" width="16" height="12" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M8 12l2 2 3-5 3 3" />',settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="M4 12h2" /><path d="M18 12h2" /><path d="M12 4v2" /><path d="M12 18v2" /><path d="m6.3 6.3 1.4 1.4" /><path d="m16.3 16.3 1.4 1.4" /><path d="m17.7 6.3-1.4 1.4" /><path d="m7.7 16.3-1.4 1.4" />'};function nt(t){return`<span class="ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24" role="img">${zt[t]??zt.settings}</svg></span>`}function se(t){const e=ne(t,v.assumptions),r=re(e,t.equipmentDefaults),n=ie(t,r),i={dc:Ht(e,n,"dc"),hybrid:Ht(e,n,"hybrid")},o=[kt(t,n,t.pricing,v.assumptions,"dc"),kt(t,n,t.pricing,v.assumptions,"hybrid")];return{result:e,generatedPlan:r,plan:n,actuals:ae(n),evaluations:i,costs:o,recommendations:un(t,e)}}function de(t){const e=se(t),r=Ct(t),n=r==="dc"?e.result.dc:e.result.hybrid,i=r==="dc"?e.evaluations.dc:e.evaluations.hybrid,o=e.costs.find(c=>c.systemId===r)??e.costs[0],l=e.recommendations.find(c=>c.id===r)??e.recommendations[0];return{...e,selectedSystem:r,selectedSystemName:xt(r),selectedSizing:n,selectedEvaluation:i,selectedCost:o,selectedRecommendation:l}}function vn(t){const e=de(t),r=X.find(n=>n.id===t.brandProfileId)??X[0];return mn.renderString(pn,{project:t,...e,assumptions:v.assumptions,brand:r,generatedAt:new Date().toLocaleDateString("en",{year:"numeric",month:"short",day:"numeric"}),money:n=>G(n,t),moneyDetailed:n=>oe(n,t),moneyUsd:M,formatEnergy:L,formatNumber:n=>U.format(n),formatDecimal:n=>at.format(n),formatPercent:n=>`${Math.round(n*100)}%`})}function Cn(t){const e=t===void 0?"":String(t);return/[",\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function $n(t){return t.map(Cn).join(",")}function Sn(t){const e=de(t),r=X.find(o=>o.id===t.brandProfileId)??X[0],n=[],i=e.selectedRecommendation.lines;return n.push(["Project Summary"]),n.push(["Country",t.country]),n.push(["Currency",t.currency]),n.push(["USD exchange rate",`1 USD = ${at.format(t.usdExchangeRate)} ${t.currency}`]),n.push(["System voltage",`${t.systemVoltage} V`]),n.push(["Sun hours",`${t.sunHours} h/day`]),n.push(["Autonomy",`${t.autonomyDays} day(s)`]),n.push(["Report option",e.selectedSystemName]),n.push(["Brand profile",r.name]),n.push([]),n.push(["Load Table"]),n.push(["Load","Qty","W each","h/day","Type","Voltage","Surge","Critical","Daily Wh"]),e.result.loadRows.forEach(o=>{n.push([o.load.name,o.load.quantity,o.load.watts,o.load.hoursPerDay,o.load.currentType,`${o.load.voltage} V`,`${o.load.surgeMultiplier}x`,o.load.critical?"Yes":"No",Math.round(o.dailyWh)])}),n.push(["Total daily energy","","","","","","","",Math.round(e.result.totalDailyWh)]),n.push([]),n.push(["Technical Sizing Summary",e.selectedSystemName]),n.push(["Adjusted daily energy",L(e.selectedSizing.adjustedDailyWh)]),n.push(["Required LiFePO4 battery",L(e.selectedSizing.requiredBatteryWh)]),n.push(["Recommended solar array",`${U.format(e.selectedSizing.recommendedSolarArrayW)} W`]),n.push(["Recommended MPPT current",`${e.selectedSizing.recommendedMpptCurrentA} A`]),n.push(["Recommended inverter size",e.selectedSystem==="hybrid"?`${U.format(e.selectedSizing.recommendedInverterW)} W`:"Not required"]),n.push([]),n.push(["Generated / Edited Equipment Plan"]),n.push(["Equipment","Current plan","Actual capacity","Notes"]),n.push(["Solar panels",`${e.plan.shared.panelCount} panel(s) x ${e.plan.shared.panelWatts} W`,`${U.format(e.actuals.solarArrayW)} W`,`${U.format(e.selectedSizing.recommendedSolarArrayW)} W`]),n.push(["LiFePO4 batteries",`${e.plan.shared.batteryCount} battery/batteries x ${e.plan.shared.batteryVoltage} V x ${e.plan.shared.batteryAh} Ah`,L(e.actuals.batteryWh),L(e.selectedSizing.requiredBatteryWh)]),e.selectedSystem==="dc"?n.push(["DC MPPT/controller",`${e.plan.dc.controllerCount} controller(s) x ${e.plan.dc.mpptAmps} A`,`${e.plan.dc.mpptAmps} A`,`${e.selectedSizing.recommendedMpptCurrentA} A`]):(n.push(["Hybrid MPPT/controller",`${e.plan.hybrid.controllerCount} controller(s) x ${e.plan.hybrid.mpptAmps} A`,`${e.plan.hybrid.mpptAmps} A`,`${e.selectedSizing.recommendedMpptCurrentA} A`]),n.push(["Hybrid inverter",`${e.plan.hybrid.inverterCount} inverter(s) x ${e.plan.hybrid.inverterWatts} W`,`${U.format(e.actuals.hybridInverterW)} W`,`${U.format(e.selectedSizing.recommendedInverterW)} W`])),n.push([]),n.push([e.selectedRecommendation.name]),n.push(["Status",e.selectedEvaluation.status]),e.selectedEvaluation.warnings.length>0&&e.selectedEvaluation.warnings.forEach(o=>n.push(["Warning",o])),n.push(["Summary",e.selectedRecommendation.summary]),n.push(["Category","Recommendation","Rationale"]),i.forEach(o=>n.push([o.category,o.recommendation,o.rationale])),n.push([]),n.push(["Financial Summary",e.selectedSystemName]),n.push([`${e.selectedSystemName} option`,G(e.selectedCost.total,t)]),n.push([]),n.push([`${e.selectedSystemName} Cost Detail`]),n.push(["Category","Description","Qty","Unit cost","Total"]),e.selectedCost.lines.forEach(o=>{n.push([o.category,o.description,o.quantity,`${oe(o.unitCost,t)} (${M(o.unitCostUsd)})`,G(o.total,t)])}),n.push(["Installation","Planning allowance based on editable assumption",1,`${Math.round(v.assumptions.installationRate*100)}%`,G(e.selectedCost.installation,t)]),n.push(["Contingency","Planning allowance for local variance and missing items",1,`${Math.round(v.assumptions.contingencyRate*100)}%`,G(e.selectedCost.contingency,t)]),n.push(["Estimated total","","","",`${G(e.selectedCost.total,t)} (${M(e.selectedCost.totalUsd)})`]),n.map($n).join(`
`)}function Un(t){return`${t.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"hello-solar-report"}-report.csv`}function Dn(t){return`data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${Sn(t)}`)}`}function jt(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function J(t,e,r){return`
    <label>
      <span>${t}</span>
      <input ${e} value="${String(r)}" />
    </label>
  `}function Wn(t){return`
    <section class="panel project-panel">
      <div class="section-heading">
        <span>Project</span>
        <strong>${t.name}</strong>
      </div>
      <div class="form-grid">
        ${J("Project name",'type="text" data-project-field="name"',t.name)}
        ${J("Country",'type="text" data-project-field="country"',t.country)}
        ${J("System voltage",'type="number" min="12" step="12" data-project-field="systemVoltage"',t.systemVoltage)}
        ${J("Sun hours",'type="number" min="0.5" step="0.1" data-project-field="sunHours"',t.sunHours)}
        ${J("Autonomy days",'type="number" min="0.5" step="0.5" data-project-field="autonomyDays"',t.autonomyDays)}
        <label>
          <span>System Option</span>
          <select data-project-field="selectedSystem">
            <option value="dc" ${Ct(t)==="dc"?"selected":""}>Fully DC</option>
            <option value="hybrid" ${Ct(t)==="hybrid"?"selected":""}>Hybrid DC + AC</option>
          </select>
        </label>
      </div>
    </section>
  `}function z(t,e,r,n=""){return`
    <label>
      <span>${t}</span>
      <input ${e} value="${String(r)}" />
      ${n?`<em>${n}</em>`:""}
    </label>
  `}function An(t){return t.loads.map(e=>`
      <tr data-load-row data-load-id="${e.id}">
        <td>
          <div class="load-name-cell">
            <input aria-label="Load name" data-load-id="${e.id}" data-load-field="name" value="${e.name}" />
          </div>
        </td>
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
          </label>
        </td>
        <td><button class="icon-button delete-button" type="button" data-remove-load="${e.id}" aria-label="Remove ${e.name}">×</button></td>
      </tr>
    `).join("")}function S(t,e,r,n,i=1){return J(t,`type="number" min="0" step="${i}" data-hardware-section="${e}" data-hardware-field="${r}"`,n)}function H(t,e,r){return z(t,`type="number" min="0" step="0.01" data-pricing-field="${e}"`,r,"USD unit price")}function F(t,e,r="",n="settings"){return`
    <summary>
      <span class="accordion-title">
        ${nt(n)}
        <span>
          <strong>${t}</strong>
          <em>${e}</em>
        </span>
      </span>
      ${r?`<span class="accordion-amount">${r}</span>`:""}
    </summary>
  `}function Pn(t,e,r,n){return`
    <section class="panel equipment-panel">
      <div class="panel-title-row">
        <div class="section-heading">
          <span>Equipment & pricing</span>
          <strong>${t.equipmentPlanMode==="custom"?"Edited plan":"Load-generated plan"}</strong>
        </div>
        <button type="button" data-reset-equipment>Use generated values</button>
      </div>

      <div class="accordion-list">
        <details>
          ${F("Currency",`1 USD in ${t.currency}`,`${t.currency}`,"currency")}
          <div class="accordion-body mini-grid">
            <label>
              <span>Currency</span>
              <select data-project-field="currency">
                ${hn.map(i=>`<option value="${i}" ${t.currency===i?"selected":""}>${i}</option>`).join("")}
              </select>
            </label>
            ${z("USD exchange rate",'type="number" min="0" step="0.01" data-project-field="usdExchangeRate"',t.usdExchangeRate,`1 USD in ${t.currency}`)}
          </div>
        </details>

        <details open>
          ${F("Solar Panels",`${e.shared.panelCount} panels x ${e.shared.panelWatts} W`,M(t.pricing.panelUnitUsd),"solar")}
          <div class="accordion-body mini-grid">
            ${S("Panels","shared","panelCount",e.shared.panelCount)}
            ${S("Watts each","shared","panelWatts",e.shared.panelWatts)}
            ${H("Price per panel","panelUnitUsd",t.pricing.panelUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${n.shared.panelCount} panel(s) x ${n.shared.panelWatts} W. Current array: ${U.format(e.shared.panelCount*e.shared.panelWatts)} W.</p>
        </details>

        <details>
          ${F("Batteries",`${e.shared.batteryCount} batteries x ${e.shared.batteryVoltage} V ${e.shared.batteryAh} Ah`,M(t.pricing.batteryUnitUsd),"battery")}
          <div class="accordion-body mini-grid">
            ${S("Batteries","shared","batteryCount",e.shared.batteryCount)}
            ${S("Voltage","shared","batteryVoltage",e.shared.batteryVoltage)}
            ${S("Ah each","shared","batteryAh",e.shared.batteryAh)}
            ${H("Price per battery","batteryUnitUsd",t.pricing.batteryUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${n.shared.batteryCount} battery/batteries x ${n.shared.batteryVoltage} V x ${n.shared.batteryAh} Ah. Current storage: ${L(e.shared.batteryCount*e.shared.batteryVoltage*e.shared.batteryAh)}.</p>
        </details>

        <details>
          ${F("DC Controller",`${e.dc.controllerCount} controller, ${e.dc.mpptAmps} A`,M(t.pricing.controllerUnitUsd),"controller")}
          <div class="accordion-body mini-grid">
            ${S("Controllers","dc","controllerCount",e.dc.controllerCount)}
            ${S("MPPT amps","dc","mpptAmps",e.dc.mpptAmps)}
            ${H("Price per controller","controllerUnitUsd",t.pricing.controllerUnitUsd)}
          </div>
          ${Et(r.dc)}
        </details>

        <details>
          ${F("Hybrid Inverter",`${e.hybrid.inverterCount} inverter, ${e.hybrid.inverterWatts} W`,M(t.pricing.inverterUnitUsd),"inverter")}
          <div class="accordion-body mini-grid">
            ${S("Controllers","hybrid","controllerCount",e.hybrid.controllerCount)}
            ${S("MPPT amps","hybrid","mpptAmps",e.hybrid.mpptAmps)}
            ${S("Inverters","hybrid","inverterCount",e.hybrid.inverterCount)}
            ${S("Watts each","hybrid","inverterWatts",e.hybrid.inverterWatts)}
            ${H("Price per inverter","inverterUnitUsd",t.pricing.inverterUnitUsd)}
          </div>
          ${Et(r.hybrid)}
        </details>

        <details>
          ${F("DC Distribution",`${e.balance.dcDistributionCount} set`,M(t.pricing.dcDistributionUnitUsd),"dcDist")}
          <div class="accordion-body mini-grid">
            ${S("Quantity","balance","dcDistributionCount",e.balance.dcDistributionCount)}
            ${H("Price per set","dcDistributionUnitUsd",t.pricing.dcDistributionUnitUsd)}
          </div>
        </details>

        <details>
          ${F("AC Distribution",`${e.balance.acDistributionCount} set`,M(t.pricing.acDistributionUnitUsd),"acDist")}
          <div class="accordion-body mini-grid">
            ${S("Quantity","balance","acDistributionCount",e.balance.acDistributionCount)}
            ${H("Price per set","acDistributionUnitUsd",t.pricing.acDistributionUnitUsd)}
          </div>
        </details>

        <details>
          ${F("Cabling",`${e.balance.cablingCount} kit`,M(t.pricing.cablingUnitUsd),"cabling")}
          <div class="accordion-body mini-grid">
            ${S("Quantity","balance","cablingCount",e.balance.cablingCount)}
            ${H("Price per kit","cablingUnitUsd",t.pricing.cablingUnitUsd)}
          </div>
        </details>

        <details>
          ${F("Earthing",`${e.balance.earthingCount} kit`,M(t.pricing.earthingUnitUsd),"earthing")}
          <div class="accordion-body mini-grid">
            ${S("Quantity","balance","earthingCount",e.balance.earthingCount)}
            ${H("Price per kit","earthingUnitUsd",t.pricing.earthingUnitUsd)}
          </div>
        </details>

        <details>
          ${F("Monitoring",`${e.balance.monitoringCount} kit`,M(t.pricing.monitoringUnitUsd),"monitoring")}
          <div class="accordion-body mini-grid">
            ${S("Quantity","balance","monitoringCount",e.balance.monitoringCount)}
            ${H("Price per kit","monitoringUnitUsd",t.pricing.monitoringUnitUsd)}
          </div>
        </details>

        <details>
          ${F("Sizing Assumptions","View all assumptions","","settings")}
          <div class="accordion-body mini-grid">
            ${z("Default panel W",'type="number" min="1" step="1" data-default-field="panelWatts"',t.equipmentDefaults.panelWatts)}
            ${z("Default battery V",'type="number" min="1" step="1" data-default-field="batteryVoltage"',t.equipmentDefaults.batteryVoltage)}
            ${z("Default battery Ah",'type="number" min="1" step="1" data-default-field="batteryAh"',t.equipmentDefaults.batteryAh)}
            ${z("MPPT amp step",'type="number" min="1" step="1" data-default-field="mpptAmpStep"',t.equipmentDefaults.mpptAmpStep)}
            ${z("Inverter W step",'type="number" min="1" step="1" data-default-field="inverterWattStep"',t.equipmentDefaults.inverterWattStep)}
            ${[["dcDistributionEfficiency","DC efficiency"],["hybridDcEfficiency","Hybrid DC efficiency"],["inverterEfficiency","Inverter efficiency"],["batteryDepthOfDischarge","Battery DoD"],["batteryReserveFactor","Battery reserve"],["arrayDerateFactor","PV derate"],["mpptSafetyFactor","MPPT safety"],["inverterHeadroomFactor","Inverter headroom"],["installationRate","Installation rate"],["contingencyRate","Contingency rate"]].map(([i,o])=>z(o,`type="number" min="0" max="3" step="0.01" data-assumption-field="${i}"`,v.assumptions[i])).join("")}
          </div>
        </details>
      </div>
    </section>
  `}function Et(t){return t.warnings.length===0?'<p class="pass-note">This option can handle the calculated load.</p>':`
    <ul class="warning-list">
      ${t.warnings.map(e=>`<li>${e}</li>`).join("")}
    </ul>
  `}function Mn(t){const{result:e,generatedPlan:r,plan:n,evaluations:i,costs:o,recommendations:l}=se(t),[c,y]=o,p=Ct(t);return`
    <main class="planner-grid">
      <div class="side-column">
        ${Wn(t)}
        ${Pn(t,n,i,r)}
      </div>

      <div class="main-column">
        <section class="panel metrics-panel">
          <div class="metric">${nt("energy")}<span>Total daily energy</span><strong>${L(e.totalDailyWh)}</strong><em>${U.format(e.totalDailyWh)} Wh</em></div>
          <div class="metric">${nt("peak")}<span>Peak load</span><strong>${U.format(e.peakLoadW)} W</strong></div>
          <div class="metric">${nt("surge")}<span>Surge load</span><strong>${U.format(e.surgeLoadW)} W</strong></div>
          <div class="metric">${nt("critical")}<span>Critical load energy</span><strong>${L(e.criticalDailyWh)}</strong><em>${U.format(e.criticalDailyWh)} Wh</em></div>
        </section>

        <section class="panel loads-panel">
          <div class="panel-title-row">
            <div class="section-heading">
              <span>Loads</span>
              <strong>${t.loads.length} device groups</strong>
            </div>
            <div class="load-actions">
              <button type="button" data-calculate-loads>Calculate</button>
              <button type="button" data-add-load>Add load</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="editable-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Watts (W)</th>
                  <th>Hours / Day</th>
                  <th>Type</th>
                  <th>Voltage (V)</th>
                  <th>Surge (x)</th>
                  <th>Critical</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${An(t)}</tbody>
            </table>
          </div>
        </section>

        <section class="panel recommendations-panel">
          <div class="section-heading">
            <span>System options</span>
            <strong>Two planning paths</strong>
          </div>
          <div class="option-grid">
            ${l.map(h=>{const g=h.id==="dc"?e.dc:e.hybrid,$=h.id==="dc"?i.dc:i.hybrid,A=h.id==="dc"?c:y,D=h.id===p;return`
                  <article class="option-card ${D?"selected-option":""}">
                    <div class="card-heading">
                      <div>
                        <h2>${h.name}</h2>
                        ${D?'<span class="report-choice">Included in report</span>':""}
                      </div>
                      ${fn($)}
                    </div>
                    <p>${h.summary}</p>
                    <dl>
                      <div><dt>Adjusted energy</dt><dd>${L(g.adjustedDailyWh)}</dd></div>
                      <div><dt>Battery requirement</dt><dd>${L(g.requiredBatteryWh)}</dd></div>
                      <div><dt>Solar requirement</dt><dd>${U.format(g.recommendedSolarArrayW)} W</dd></div>
                      <div><dt>MPPT requirement</dt><dd>${g.recommendedMpptCurrentA} A</dd></div>
                      ${h.id==="hybrid"?`<div><dt>Inverter requirement</dt><dd>${U.format(g.recommendedInverterW)} W</dd></div>`:""}
                      <div><dt>Estimate</dt><dd>${G(A.total,t)}</dd></div>
                    </dl>
                    ${Et($)}
                  </article>
                `}).join("")}
          </div>
        </section>
      </div>
    </main>

    <section class="panel report-panel ${wt?"report-panel-ready":"report-panel-gate"}">
      ${wt?`
        <div class="report-body">
          <div class="panel-title-row report-toolbar">
            <div class="section-heading">
              <span>Report generation</span>
              <strong>${xt(p)} report</strong>
            </div>
            <div class="report-actions">
              <button type="button" data-print>Print / Save PDF</button>
              <a class="button-link" href="${jt(Dn(t))}" download="${jt(Un(t))}" target="_blank" rel="noopener" data-export-csv>Export CSV</a>
            </div>
          </div>
          <div id="report">${vn(t)}</div>
        </div>
      `:`
        <div class="report-gate-content">
          <div class="section-heading">
            <span>Report generation</span>
            <strong>Generate the selected system report</strong>
            <em>Creates the ${xt(p)} report section below the planner when you are ready to review, print, or export.</em>
          </div>
          <button type="button" data-generate-report>Generate Report</button>
        </div>
      `}
    </section>
  `}function Q(){if(!Bt)return;const t=T();X.find(e=>e.id===t.brandProfileId)??X[0],Bt.innerHTML=`
    <div class="app-shell">
      <header class="topbar">
        <div class="brand-lockup">
          <div class="brand-mark" aria-hidden="true">
            <img src="${De}" alt="" />
          </div>
          <div>
          <h1>Hello Solar Planner</h1>
          </div>
        </div>
        <div class="top-actions">
          <select data-project-switch aria-label="Switch project">
            ${v.projects.map(e=>`<option value="${e.id}" ${e.id===t.id?"selected":""}>${e.name}</option>`).join("")}
          </select>
          <button type="button" data-new-project>New Project</button>
          <button type="button" data-load-sample>Sample</button>
        </div>
      </header>
      ${Mn(t)}
    </div>
  `,xn()}function At(t){const e=Array.from(document.querySelectorAll("[data-load-row]"));if(e.length===0)return t.loads;const r=(i,o)=>i.querySelector(`[data-load-field="${o}"]`),n=(i,o,l)=>{var y;const c=Number((y=r(i,o))==null?void 0:y.value);return Number.isFinite(c)?c:l};return e.map(i=>{var p,h;const o=i.dataset.loadId??ft(),l=t.loads.find(g=>g.id===o),c=(p=r(i,"currentType"))==null?void 0:p.value,y=r(i,"critical");return{id:o,name:((h=r(i,"name"))==null?void 0:h.value)??(l==null?void 0:l.name)??"Load",quantity:n(i,"quantity",(l==null?void 0:l.quantity)??0),watts:n(i,"watts",(l==null?void 0:l.watts)??0),hoursPerDay:n(i,"hoursPerDay",(l==null?void 0:l.hoursPerDay)??0),currentType:c==="AC"?"AC":"DC",voltage:n(i,"voltage",(l==null?void 0:l.voltage)??t.systemVoltage),surgeMultiplier:n(i,"surgeMultiplier",(l==null?void 0:l.surgeMultiplier)??1),critical:y instanceof HTMLInputElement?y.checked:(l==null?void 0:l.critical)??!1}})}function xn(){var t,e,r,n,i,o,l;(t=document.querySelector("[data-project-switch]"))==null||t.addEventListener("change",c=>{v.activeProjectId=c.target.value,et(),Q()}),document.querySelectorAll("[data-project-field]").forEach(c=>{const y=new Set(["systemVoltage","sunHours","autonomyDays","usdExchangeRate"]),p=h=>{const g=h.target,$=W(T()),A=g.dataset.projectField;$[A]=y.has(A)?Number(g.value):g.value,B($)};c.addEventListener("change",p),c instanceof HTMLInputElement&&y.has(c.dataset.projectField)&&c.addEventListener("input",p)}),(e=document.querySelector("[data-calculate-loads]"))==null||e.addEventListener("click",()=>{const c=W(T());c.loads=At(c),B(c)}),document.querySelectorAll("[data-remove-load]").forEach(c=>{c.addEventListener("click",()=>{const y=W(T());y.loads=At(y).filter(p=>p.id!==c.dataset.removeLoad),B(y)})}),(r=document.querySelector("[data-add-load]"))==null||r.addEventListener("click",()=>{const c=W(T());c.loads=At(c),c.loads.push({id:ft(),name:"New load",quantity:1,watts:10,hoursPerDay:4,currentType:"DC",voltage:c.systemVoltage,surgeMultiplier:1.1,critical:!1}),B(c)}),document.querySelectorAll("[data-hardware-field]").forEach(c=>{const y=p=>{const h=p.target,g=W(T()),$=re(ne(g,v.assumptions),g.equipmentDefaults),A=W(ie(g,$)),D=h.dataset.hardwareSection,K=h.dataset.hardwareField??"";A[D][K]=Number(h.value),g.equipmentPlan=A,g.equipmentPlanMode="custom",B(g)};c.addEventListener("input",y),c.addEventListener("change",y)}),(n=document.querySelector("[data-reset-equipment]"))==null||n.addEventListener("click",()=>{const c=W(T());c.equipmentPlan=void 0,c.equipmentPlanMode="generated",B(c)}),document.querySelectorAll("[data-default-field]").forEach(c=>{c.addEventListener("change",y=>{const p=y.target,h=W(T()),g=p.dataset.defaultField;h.equipmentDefaults[g]=Number(p.value),B(h)})}),document.querySelectorAll("[data-pricing-field]").forEach(c=>{const y=p=>{const h=p.target,g=W(T()),$=h.dataset.pricingField;g.pricing[$]=Number(h.value),B(g)};c.addEventListener("input",y),c.addEventListener("change",y)}),document.querySelectorAll("[data-assumption-field]").forEach(c=>{c.addEventListener("change",y=>{const p=y.target,h=p.dataset.assumptionField;v.assumptions[h]=Number(p.value),et(),Q()})}),(i=document.querySelector("[data-new-project]"))==null||i.addEventListener("click",()=>{const c=rt(W(vt));c.id=ft(),c.name="Untitled solar project",c.updatedAt=new Date().toISOString(),v.projects=[...v.projects,c],v.activeProjectId=c.id,et(),Q()}),(o=document.querySelector("[data-load-sample]"))==null||o.addEventListener("click",()=>{const c=rt(W(vt));c.id=ft(),c.updatedAt=new Date().toISOString(),v.projects=[...v.projects,c],v.activeProjectId=c.id,et(),Q()}),(l=document.querySelector("[data-generate-report]"))==null||l.addEventListener("click",()=>{var c;wt=!0,Q(),(c=document.querySelector(".report-panel-ready"))==null||c.scrollIntoView({behavior:"smooth",block:"start"})}),document.querySelectorAll("[data-print]").forEach(c=>{c.addEventListener("click",()=>{window.print()})})}Q();
