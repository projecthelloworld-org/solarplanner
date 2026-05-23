(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function a(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(o){if(o.ep)return;o.ep=!0;const s=a(o);fetch(o.href,s)}})();var fe=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Ut={exports:{}};(function(t,e){(function(a,n){n(e)})(fe,function(a){function n(){return n=Object.assign?Object.assign.bind():function(i){for(var d=1;d<arguments.length;d++){var c=arguments[d];for(var l in c)Object.prototype.hasOwnProperty.call(c,l)&&(i[l]=c[l])}return i},n.apply(this,arguments)}function o(i,d){i.prototype=Object.create(d.prototype),i.prototype.constructor=i,r(i,d)}function s(i){return s=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(d){return d.__proto__||Object.getPrototypeOf(d)},s(i)}function r(i,d){return r=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(c,l){return c.__proto__=l,c},r(i,d)}function u(i,d,c){return u=function(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}()?Reflect.construct.bind():function(l,m,g){var C=[null];C.push.apply(C,m);var f=new(Function.bind.apply(l,C));return g&&r(f,g.prototype),f},u.apply(null,arguments)}function y(i){var d=typeof Map=="function"?new Map:void 0;return y=function(c){if(c===null||Function.toString.call(c).indexOf("[native code]")===-1)return c;if(typeof c!="function")throw new TypeError("Super expression must either be null or a function");if(d!==void 0){if(d.has(c))return d.get(c);d.set(c,l)}function l(){return u(c,arguments,s(this).constructor)}return l.prototype=Object.create(c.prototype,{constructor:{value:l,enumerable:!1,writable:!0,configurable:!0}}),r(l,c)},y(i)}var h=function(){function i(c){this.cache=void 0,this.cache=c}var d=i.prototype;return d.define=function(c,l){this.cache[c]=l},d.get=function(c){return this.cache[c]},d.remove=function(c){delete this.cache[c]},d.reset=function(){this.cache={}},d.load=function(c){this.cache=n({},this.cache,c)},i}(),p=function(i){function d(c){var l;return(l=i.call(this,c)||this).name="Eta Error",l}return o(d,i),d}(y(Error)),b=function(i){function d(c){var l;return(l=i.call(this,c)||this).name="EtaParser Error",l}return o(d,i),d}(p),S=function(i){function d(c){var l;return(l=i.call(this,c)||this).name="EtaRuntime Error",l}return o(d,i),d}(p),_=function(i){function d(c){var l;return(l=i.call(this,c)||this).name="EtaNameResolution Error",l}return o(d,i),d}(p);function U(i,d,c){var l=d.slice(0,c).split(/\n/),m=l.length,g=l[m-1].length+1;throw i+=" at line "+m+" col "+g+`:

  `+d.split(/\n/)[m-1]+`
  `+Array(g).join(" ")+"^",new b(i)}function et(i,d,c,l){var m=d.split(`
`),g=Math.max(c-3,0),C=Math.min(m.length,c+3),f=l,H=m.slice(g,C).map(function(ft,st){var E=st+g+1;return(E==c?" >> ":"    ")+E+"| "+ft}).join(`
`),P=new S((f?f+":"+c+`
`:"line "+c+`
`)+H+`

`+i.message);throw P.name=i.name,P}var nt=(function(){return Promise.resolve()}).constructor;function ie(i,d){var c=this.config,l=d&&d.async?nt:Function;try{return new l(c.varName,"options",this.compileToString.call(this,i,d))}catch(m){throw m instanceof SyntaxError?new b(`Bad template syntax

`+m.message+`
`+Array(m.message.length+1).join("=")+`
`+this.compileToString.call(this,i,d)+`
`):m}}function oe(i,d){var c=this.config,l=d&&d.async,m=this.compileBody,g=this.parse.call(this,i),C=c.functionHeader+`
let include = (template, data) => this.render(template, data, options);
let includeAsync = (template, data) => this.renderAsync(template, data, options);

let __eta = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction`+(c.debug?', line: 1, templateStr: "'+i.replace(/\\|"/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n")+'"':"")+`};

function layout(path, data) {
  __eta.layout = path;
  __eta.layoutData = data;
}`+(c.debug?"try {":"")+(c.useWith?"with("+c.varName+"||{}){":"")+`

`+m.call(this,g)+`
if (__eta.layout) {
  __eta.res = `+(l?"await includeAsync":"include")+" (__eta.layout, {..."+c.varName+`, body: __eta.res, ...__eta.layoutData});
}
`+(c.useWith?"}":"")+(c.debug?"} catch (e) { this.RuntimeErr(e, __eta.templateStr, __eta.line, options.filepath) }":"")+`
return __eta.res;
`;if(c.plugins)for(var f=0;f<c.plugins.length;f++){var H=c.plugins[f];H.processFnString&&(C=H.processFnString(C,c))}return C}function se(i){for(var d=this.config,c=0,l=i.length,m="";c<l;c++){var g=i[c];if(typeof g=="string")m+="__eta.res+='"+g+`'
`;else{var C=g.t,f=g.val||"";d.debug&&(m+="__eta.line="+g.lineNo+`
`),C==="r"?(d.autoFilter&&(f="__eta.f("+f+")"),m+="__eta.res+="+f+`
`):C==="i"?(d.autoFilter&&(f="__eta.f("+f+")"),d.autoEscape&&(f="__eta.e("+f+")"),m+="__eta.res+="+f+`
`):C==="e"&&(m+=f+`
`)}}return m}var de={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function ce(i){return de[i]}var Et={autoEscape:!0,autoFilter:!1,autoTrim:[!1,"nl"],cache:!1,cacheFilepaths:!0,debug:!1,escapeFunction:function(i){var d=String(i);return/[&<>"']/.test(d)?d.replace(/[&<>"']/g,ce):d},filterFunction:function(i){return String(i)},functionHeader:"",parse:{exec:"",interpolate:"=",raw:"~"},plugins:[],rmWhitespace:!1,tags:["<%","%>"],useWith:!1,varName:"it",defaultExtension:".eta"},rt=/`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g,at=/'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g,it=/"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;function ot(i){return i.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&")}function le(i,d){return i.slice(0,d).split(`
`).length}function ue(i){var d=this.config,c=[],l=!1,m=0,g=d.parse;if(d.plugins)for(var C=0;C<d.plugins.length;C++){var f=d.plugins[C];f.processTemplate&&(i=f.processTemplate(i,d))}function H(x,Q){x&&(x=function(w,lt,St,$t){var N,I;return Array.isArray(lt.autoTrim)?(N=lt.autoTrim[1],I=lt.autoTrim[0]):N=I=lt.autoTrim,(St||St===!1)&&(N=St),($t||$t===!1)&&(I=$t),I||N?N==="slurp"&&I==="slurp"?w.trim():(N==="_"||N==="slurp"?w=w.trimStart():N!=="-"&&N!=="nl"||(w=w.replace(/^(?:\r\n|\n|\r)/,"")),I==="_"||I==="slurp"?w=w.trimEnd():I!=="-"&&I!=="nl"||(w=w.replace(/(?:\r\n|\n|\r)$/,"")),w):w}(x,d,l,Q),x&&(x=x.replace(/\\|'/g,"\\$&").replace(/\r\n|\n|\r/g,"\\n"),c.push(x)))}d.rmWhitespace&&(i=i.replace(/[\r\n]+/g,`
`).replace(/^\s+|\s+$/gm,"")),rt.lastIndex=0,at.lastIndex=0,it.lastIndex=0;for(var P,ft=[g.exec,g.interpolate,g.raw].reduce(function(x,Q){return x&&Q?x+"|"+ot(Q):Q?ot(Q):x},""),st=new RegExp(ot(d.tags[0])+"(-|_)?\\s*("+ft+")?\\s*","g"),E=new RegExp("'|\"|`|\\/\\*|(\\s*(-|_)?"+ot(d.tags[1])+")","g");P=st.exec(i);){var ge=i.slice(m,P.index);m=P[0].length+P.index;var vt=P[2]||"";H(ge,P[1]),E.lastIndex=m;for(var A=void 0,dt=!1;A=E.exec(i);){if(A[1]){var be=i.slice(m,A.index);st.lastIndex=m=E.lastIndex,l=A[2],dt={t:vt===g.exec?"e":vt===g.raw?"r":vt===g.interpolate?"i":"",val:be};break}var ct=A[0];if(ct==="/*"){var qt=i.indexOf("*/",E.lastIndex);qt===-1&&U("unclosed comment",i,A.index),E.lastIndex=qt}else ct==="'"?(at.lastIndex=A.index,at.exec(i)?E.lastIndex=at.lastIndex:U("unclosed string",i,A.index)):ct==='"'?(it.lastIndex=A.index,it.exec(i)?E.lastIndex=it.lastIndex:U("unclosed string",i,A.index)):ct==="`"&&(rt.lastIndex=A.index,rt.exec(i)?E.lastIndex=rt.lastIndex:U("unclosed string",i,A.index))}dt?(d.debug&&(dt.lineNo=le(i,P.index)),c.push(dt)):U("unclosed tag",i,P.index)}if(H(i.slice(m,i.length),!1),d.plugins)for(var Ct=0;Ct<d.plugins.length;Ct++){var Ft=d.plugins[Ct];Ft.processAST&&(c=Ft.processAST(c,d))}return c}function xt(i,d){var c=d&&d.async?this.templatesAsync:this.templatesSync;if(this.resolvePath&&this.readFile&&!i.startsWith("@")){var l=d.filepath,m=c.get(l);if(this.config.cache&&m)return m;var g=this.readFile(l),C=this.compile(g,d);return this.config.cache&&c.define(l,C),C}var f=c.get(i);if(f)return f;throw new _("Failed to get template '"+i+"'")}function wt(i,d,c){var l,m=n({},c,{async:!1});return typeof i=="string"?(this.resolvePath&&this.readFile&&!i.startsWith("@")&&(m.filepath=this.resolvePath(i,m)),l=xt.call(this,i,m)):l=i,l.call(this,d,m)}function Mt(i,d,c){var l,m=n({},c,{async:!0});typeof i=="string"?(this.resolvePath&&this.readFile&&!i.startsWith("@")&&(m.filepath=this.resolvePath(i,m)),l=xt.call(this,i,m)):l=i;var g=l.call(this,d,m);return Promise.resolve(g)}function pe(i,d){var c=this.compile(i,{async:!1});return wt.call(this,c,d)}function me(i,d){var c=this.compile(i,{async:!0});return Mt.call(this,c,d)}var he=function(){function i(c){this.config=void 0,this.RuntimeErr=et,this.compile=ie,this.compileToString=oe,this.compileBody=se,this.parse=ue,this.render=wt,this.renderAsync=Mt,this.renderString=pe,this.renderStringAsync=me,this.filepathCache={},this.templatesSync=new h({}),this.templatesAsync=new h({}),this.resolvePath=null,this.readFile=null,this.config=c?n({},Et,c):n({},Et)}var d=i.prototype;return d.configure=function(c){this.config=n({},this.config,c)},d.withConfig=function(c){return n({},this,{config:n({},this.config,c)})},d.loadTemplate=function(c,l,m){if(typeof l=="string")(m&&m.async?this.templatesAsync:this.templatesSync).define(c,this.compile(l,m));else{var g=this.templatesSync;(l.constructor.name==="AsyncFunction"||m&&m.async)&&(g=this.templatesAsync),g.define(c,l)}},i}(),ye=function(i){function d(){return i.apply(this,arguments)||this}return o(d,i),d}(he);a.Eta=ye})})(Ut,Ut.exports);var ve=Ut.exports;const Ce=.94,Se=.94,$e=.88,De=.8,Ue=1.15,We=.75,Ae=1.25,Pe=1.25,Ee=.16,xe=.1,we="Prices are editable planning assumptions and should be localized before procurement.",Me="This report is for planning estimates only, not certified electrical design. Final installation must be reviewed by a qualified solar/electrical technician and comply with local electrical, structural, grounding, and lightning protection requirements.",Rt={dcDistributionEfficiency:Ce,hybridDcEfficiency:Se,inverterEfficiency:$e,batteryDepthOfDischarge:De,batteryReserveFactor:Ue,arrayDerateFactor:We,mpptSafetyFactor:Ae,inverterHeadroomFactor:Pe,installationRate:Ee,contingencyRate:xe,currencyExchangeNotes:we,safetyDisclaimer:Me},qe=[{id:"project-hello-world",name:"Project Hello World",tagline:"Community-powered connectivity planning",primaryColor:"#1f6f68",accentColor:"#f0b429",reportFooter:"Prepared for Project Hello World community connectivity planning."},{id:"community-network",name:"Community Network Partner",tagline:"Practical power estimates for local network teams",primaryColor:"#315f8c",accentColor:"#55a06a",reportFooter:"Prepared for community network partner review and local adaptation."},{id:"field-technician",name:"Field Technician Draft",tagline:"Site-first solar planning notes",primaryColor:"#7a4f1d",accentColor:"#3f8f8a",reportFooter:"Draft estimate for technician review before installation."}],Fe=[{id:"pv-200",name:"200 W mono solar panel",unit:"panel",unitCost:130,watts:200},{id:"pv-450",name:"450 W mono solar panel",unit:"panel",unitCost:245,watts:450}],Re=[{id:"bat-1280",name:"12.8 V 100 Ah LiFePO4 battery",unit:"battery",unitCost:310,wattHours:1280},{id:"bat-2560",name:"25.6 V 100 Ah LiFePO4 battery",unit:"battery",unitCost:560,wattHours:2560}],Te=[{id:"mppt-30",name:"30 A MPPT charge controller",unit:"controller",unitCost:145,amps:30},{id:"mppt-60",name:"60 A MPPT charge controller",unit:"controller",unitCost:260,amps:60}],Ne=[{id:"hybrid-1000",name:"1 kW hybrid inverter charger",unit:"inverter",unitCost:420,watts:1e3},{id:"hybrid-2000",name:"2 kW hybrid inverter charger",unit:"inverter",unitCost:690,watts:2e3}],Ie=[{id:"dc-board",name:"DC breaker board, fuses, labels, and surge protection",unit:"set",unitCost:180}],Le=[{id:"ac-board",name:"AC breaker board, RCD, outlets, and labels",unit:"set",unitCost:220}],Ve=[{id:"cable-kit",name:"PV, battery, and load cabling with MC4/connectors",unit:"kit",unitCost:210}],Oe=[{id:"earth-kit",name:"Earthing rod, bonding, surge, and lightning protection kit",unit:"kit",unitCost:190}],_e=[{id:"monitor-kit",name:"Battery monitor and remote energy logging",unit:"kit",unitCost:155}],ke={solarPanels:Fe,batteries:Re,chargeControllers:Te,hybridInverters:Ne,dcDistribution:Ie,acDistribution:Le,cabling:Ve,earthing:Oe,monitoring:_e},Be="hello-hub-lite",He="Hello Hub Lite sample",ze="Uganda",je="USD",Qe=1,Ge=24,Ke=4.8,Je=1.5,Ye="project-hello-world",Ze="dc",Xe={panelWatts:450,batteryVoltage:24,batteryAh:100,mpptAmpStep:10,inverterWattStep:500},tn={panelUnitUsd:245,batteryUnitUsd:560,controllerUnitUsd:260,inverterUnitUsd:690,dcDistributionUnitUsd:180,acDistributionUnitUsd:220,cablingUnitUsd:210,earthingUnitUsd:190,monitoringUnitUsd:155},en="generated",nn="2026-05-19T00:00:00.000Z",rn=[{id:"load-router",name:"Core router",quantity:1,watts:18,hoursPerDay:24,currentType:"DC",voltage:24,surgeMultiplier:1.2,critical:!0},{id:"load-ap",name:"Outdoor access point",quantity:3,watts:12,hoursPerDay:24,currentType:"DC",voltage:24,surgeMultiplier:1.2,critical:!0},{id:"load-tablets",name:"Learning tablets",quantity:10,watts:8,hoursPerDay:3,currentType:"DC",voltage:5,surgeMultiplier:1,critical:!1},{id:"load-lights",name:"LED lights",quantity:6,watts:5,hoursPerDay:5,currentType:"DC",voltage:12,surgeMultiplier:1.1,critical:!0},{id:"load-usb",name:"USB charging station",quantity:1,watts:60,hoursPerDay:4,currentType:"DC",voltage:12,surgeMultiplier:1.1,critical:!1},{id:"load-monitor",name:"Monitoring gateway",quantity:1,watts:8,hoursPerDay:24,currentType:"DC",voltage:12,surgeMultiplier:1.2,critical:!0},{id:"load-laptop",name:"Technician laptop charging",quantity:1,watts:65,hoursPerDay:2,currentType:"AC",voltage:230,surgeMultiplier:1.5,critical:!1}],gt={id:Be,name:He,country:ze,currency:je,usdExchangeRate:Qe,systemVoltage:Ge,sunHours:Ke,autonomyDays:Je,brandProfileId:Ye,selectedSystem:Ze,equipmentDefaults:Xe,pricing:tn,equipmentPlanMode:en,updatedAt:nn,loads:rn},ut=(t,e)=>Math.ceil(t/e)*e,pt=(t,e=0)=>Number.isFinite(t)?t:e;function an(t){return t.loads.map(e=>{const a=Math.max(0,pt(e.quantity)),n=Math.max(0,pt(e.watts)),o=Math.max(0,pt(e.hoursPerDay)),s=Math.max(1,pt(e.surgeMultiplier,1)),r=a*n;return{load:e,runningWatts:r,dailyWh:r*o,surgeWatts:r*s}})}function Tt(t,e,a,n,o,s){const r=Math.max(.5,n.autonomyDays),u=Math.max(.5,n.sunHours),y=Math.max(12,n.systemVoltage),h=t*r*o.batteryReserveFactor/o.batteryDepthOfDischarge,p=t/u/o.arrayDerateFactor*o.batteryReserveFactor,b=p/y*o.mpptSafetyFactor,S=Math.max(e,a*.55);return{adjustedDailyWh:Math.round(t),requiredBatteryWh:ut(h,100),recommendedSolarArrayW:ut(p,10),recommendedMpptCurrentA:ut(b,5),recommendedInverterW:s?ut(S*o.inverterHeadroomFactor,100):0}}function Yt(t,e){const a=an(t),n=a.reduce((h,p)=>h+p.dailyWh,0),o=a.reduce((h,p)=>h+p.runningWatts,0),s=Math.max(0,...a.map(h=>o-h.runningWatts+h.surgeWatts)),r=a.filter(h=>h.load.critical).reduce((h,p)=>h+p.dailyWh,0),u=n/e.dcDistributionEfficiency,y=a.reduce((h,p)=>{const b=p.load.currentType==="AC"?e.inverterEfficiency:e.hybridDcEfficiency;return h+p.dailyWh/b},0);return{loadRows:a,totalDailyWh:Math.round(n),peakLoadW:Math.round(o),surgeLoadW:Math.round(s),criticalDailyWh:Math.round(r),dc:Tt(u,o,s,t,e,!1),hybrid:Tt(y,o,s,t,e,!0)}}const K=(t,e)=>Math.round(t*Math.max(0,e));function R(t,e,a,n,o){const s=a*n;return{category:t,description:e,quantity:a,unitCostUsd:n,unitCost:K(n,o),totalUsd:s,total:K(s,o)}}function Nt(t,e,a,n,o){const s=Math.max(0,t.usdExchangeRate||1),r=[R("Solar panels",`${e.shared.panelCount} panel(s) x ${e.shared.panelWatts} W`,e.shared.panelCount,a.panelUnitUsd,s),R("LiFePO4 battery storage",`${e.shared.batteryCount} battery/batteries x ${e.shared.batteryVoltage} V x ${e.shared.batteryAh} Ah`,e.shared.batteryCount,a.batteryUnitUsd,s)];o==="dc"?r.push(R("Charge controller or hybrid inverter",`${e.dc.controllerCount} controller(s) x ${e.dc.mpptAmps} A MPPT`,e.dc.controllerCount,a.controllerUnitUsd,s)):r.push(R("Charge controller or hybrid inverter",`${e.hybrid.controllerCount} controller(s) x ${e.hybrid.mpptAmps} A MPPT`,e.hybrid.controllerCount,a.controllerUnitUsd,s),R("Hybrid inverter capacity",`${e.hybrid.inverterCount} inverter(s) x ${e.hybrid.inverterWatts} W`,e.hybrid.inverterCount,a.inverterUnitUsd,s)),r.push(R("DC distribution and protection","DC breaker board, fuses, labels, and surge protection",e.balance.dcDistributionCount,a.dcDistributionUnitUsd,s)),o==="hybrid"&&r.push(R("AC distribution for hybrid systems","AC breaker board, RCD, outlets, and labels",e.balance.acDistributionCount,a.acDistributionUnitUsd,s)),r.push(R("Cabling and connectors","PV, battery, and load cabling with MC4/connectors",e.balance.cablingCount,a.cablingUnitUsd,s),R("Earthing and lightning protection","Earthing rod, bonding, surge, and lightning protection kit",e.balance.earthingCount,a.earthingUnitUsd,s),R("Monitoring","Battery monitor and remote energy logging",e.balance.monitoringCount,a.monitoringUnitUsd,s));const u=r.reduce((b,S)=>b+S.totalUsd,0),y=Math.round(u*n.installationRate),h=Math.round((u+y)*n.contingencyRate),p=u+y+h;return{systemId:o,lines:r,subtotalUsd:u,subtotal:K(u,s),installationUsd:y,installation:K(y,s),contingencyUsd:h,contingency:K(h,s),totalUsd:p,total:K(p,s),currency:t.currency,exchangeRate:s}}const It=(t,e)=>Math.ceil(t/Math.max(1,e))*Math.max(1,e),Y=(t,e)=>Number.isFinite(t)&&t>0?t:e;function Zt(t,e){const a=Y(e.panelWatts,450),n=Y(e.batteryVoltage,24),o=Y(e.batteryAh,100),s=n*o,r=Y(e.mpptAmpStep,10),u=Y(e.inverterWattStep,500),y=Math.max(t.dc.recommendedSolarArrayW,t.hybrid.recommendedSolarArrayW),h=Math.max(t.dc.requiredBatteryWh,t.hybrid.requiredBatteryWh);return{shared:{panelCount:Math.max(1,Math.ceil(y/a)),panelWatts:a,batteryCount:Math.max(1,Math.ceil(h/s)),batteryVoltage:n,batteryAh:o},dc:{controllerCount:1,mpptAmps:It(t.dc.recommendedMpptCurrentA,r)},hybrid:{controllerCount:1,mpptAmps:It(t.hybrid.recommendedMpptCurrentA,r),inverterCount:Math.max(1,Math.ceil(t.hybrid.recommendedInverterW/u)),inverterWatts:u},balance:{dcDistributionCount:1,acDistributionCount:1,cablingCount:1,earthingCount:1,monitoringCount:1}}}function Xt(t){return{solarArrayW:t.shared.panelCount*t.shared.panelWatts,batteryWh:t.shared.batteryCount*t.shared.batteryVoltage*t.shared.batteryAh,dcMpptA:t.dc.mpptAmps,hybridMpptA:t.hybrid.mpptAmps,hybridInverterW:t.hybrid.inverterCount*t.hybrid.inverterWatts}}const Lt=(t,e)=>e==="Wh"&&t>=1e3?`${(t/1e3).toFixed(2)} kWh`:`${Math.round(t).toLocaleString()} ${e}`;function mt(t,e,a,n){const o=e>=a;return{label:t,actual:e,required:a,unit:n,passed:o,warning:o?void 0:`${t} is ${Lt(e,n)}; recommendation is ${Lt(a,n)}.`}}function Vt(t,e,a){const n=Xt(e),o=a==="dc"?t.dc:t.hybrid,s=[mt("Solar array",n.solarArrayW,o.recommendedSolarArrayW,"W"),mt("Battery storage",n.batteryWh,o.requiredBatteryWh,"Wh"),mt("MPPT/controller",a==="dc"?n.dcMpptA:n.hybridMpptA,o.recommendedMpptCurrentA,"A")];a==="hybrid"&&s.push(mt("Inverter capacity",n.hybridInverterW,o.recommendedInverterW,"W"));const r=s.flatMap(u=>u.warning?[u.warning]:[]);return{systemId:a,status:r.length===0?"Pass":"Needs attention",checks:s,warnings:r}}const ht=t=>`${(t/1e3).toFixed(1)} kWh`;function on(t,e){return[{id:"dc",name:"Fully DC System",summary:t.loads.filter(o=>o.currentType==="AC").length>0?"Best when AC devices can be replaced with DC equivalents or powered through small point-of-use adapters.":"A simple direct-current architecture that avoids inverter losses and keeps the installation compact.",lines:[{category:"Energy target",recommendation:`${ht(e.dc.adjustedDailyWh)} adjusted daily demand`,rationale:"Uses DC distribution efficiency to account for wiring, conversion, and operating margin."},{category:"Battery",recommendation:`${ht(e.dc.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,rationale:`Sized for ${t.autonomyDays} autonomy day(s) at the configured depth of discharge.`},{category:"Solar array",recommendation:`${e.dc.recommendedSolarArrayW.toLocaleString()} W PV array`,rationale:`Based on ${t.sunHours} average sun hour(s) with derating for real-world conditions.`},{category:"Charge control",recommendation:`${e.dc.recommendedMpptCurrentA} A MPPT at ${t.systemVoltage} V`,rationale:"Controller current includes a safety factor above expected PV charging current."}]},{id:"hybrid",name:"Hybrid DC + AC System",summary:"Keeps efficient DC supply for network loads while adding AC capacity for devices that cannot move to DC.",lines:[{category:"Energy target",recommendation:`${ht(e.hybrid.adjustedDailyWh)} adjusted daily demand`,rationale:"Applies inverter efficiency only to AC loads while preserving a DC path for DC equipment."},{category:"Battery",recommendation:`${ht(e.hybrid.requiredBatteryWh)} LiFePO4 minimum usable-backed storage`,rationale:`Sized for ${t.autonomyDays} autonomy day(s), including reserve and depth-of-discharge limits.`},{category:"Solar array",recommendation:`${e.hybrid.recommendedSolarArrayW.toLocaleString()} W PV array`,rationale:`Based on ${t.sunHours} average sun hour(s), array derating, and storage recovery needs.`},{category:"Inverter",recommendation:`${e.hybrid.recommendedInverterW.toLocaleString()} W inverter or hybrid inverter`,rationale:"Allows headroom above the running and expected surge load."}]}]}const sn=`<article class="report-document">
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
`,Wt="hello-solar-planner-state",dn=new ve.Eta,Ot=document.querySelector("#app"),j=qe,M=ke,cn=["USD","UGX","KES","TZS","RWF","BIF","ZMW","MWK","ETB","GHS","NGN","EUR","GBP"],W=t=>JSON.parse(JSON.stringify(t)),yt=()=>{var t;return((t=crypto.randomUUID)==null?void 0:t.call(crypto))??`id-${Date.now()}-${Math.random().toString(16).slice(2)}`},D=new Intl.NumberFormat("en",{maximumFractionDigits:0}),tt=new Intl.NumberFormat("en",{maximumFractionDigits:2}),L=t=>Math.round(t*100)/100,F={panelWatts:450,batteryVoltage:24,batteryAh:100,mpptAmpStep:10,inverterWattStep:500};function bt(t){return t.selectedSystem==="dc"||t.selectedSystem==="hybrid"?t.selectedSystem:"dc"}function te(t){return t==="dc"?"Fully DC System":"Hybrid DC + AC System"}var kt,Bt,Ht,zt,jt,Qt,Gt,Kt,Jt;const V={panelUnitUsd:((kt=M.solarPanels[1])==null?void 0:kt.unitCost)??245,batteryUnitUsd:((Bt=M.batteries[1])==null?void 0:Bt.unitCost)??560,controllerUnitUsd:((Ht=M.chargeControllers[1])==null?void 0:Ht.unitCost)??260,inverterUnitUsd:((zt=M.hybridInverters[1])==null?void 0:zt.unitCost)??690,dcDistributionUnitUsd:((jt=M.dcDistribution[0])==null?void 0:jt.unitCost)??180,acDistributionUnitUsd:((Qt=M.acDistribution[0])==null?void 0:Qt.unitCost)??220,cablingUnitUsd:((Gt=M.cabling[0])==null?void 0:Gt.unitCost)??210,earthingUnitUsd:((Kt=M.earthing[0])==null?void 0:Kt.unitCost)??190,monitoringUnitUsd:((Jt=M.monitoring[0])==null?void 0:Jt.unitCost)??155};function ln(t={}){return{panelUnitUsd:L(Number(t.panelUnitUsd??Number(t.panelUsdPerW??0)*F.panelWatts)||V.panelUnitUsd),batteryUnitUsd:L(Number(t.batteryUnitUsd??Number(t.batteryUsdPerWh??0)*F.batteryVoltage*F.batteryAh)||V.batteryUnitUsd),controllerUnitUsd:L(Number(t.controllerUnitUsd??t.chargeControllerUsd)||V.controllerUnitUsd),inverterUnitUsd:L(Number(t.inverterUnitUsd??Number(t.inverterUsdPerW??0)*F.inverterWattStep)||V.inverterUnitUsd),dcDistributionUnitUsd:L(Number(t.dcDistributionUnitUsd??t.dcDistributionUsd)||V.dcDistributionUnitUsd),acDistributionUnitUsd:L(Number(t.acDistributionUnitUsd??t.acDistributionUsd)||V.acDistributionUnitUsd),cablingUnitUsd:L(Number(t.cablingUnitUsd??t.cablingUsd)||V.cablingUnitUsd),earthingUnitUsd:L(Number(t.earthingUnitUsd??t.earthingUsd)||V.earthingUnitUsd),monitoringUnitUsd:L(Number(t.monitoringUnitUsd??t.monitoringUsd)||V.monitoringUnitUsd)}}function un(t){var e,a,n,o,s,r,u,y,h,p,b,S,_,U,et,nt;if(t)return{shared:{panelCount:((e=t.shared)==null?void 0:e.panelCount)??1,panelWatts:((a=t.shared)==null?void 0:a.panelWatts)??F.panelWatts,batteryCount:((n=t.shared)==null?void 0:n.batteryCount)??1,batteryVoltage:((o=t.shared)==null?void 0:o.batteryVoltage)??F.batteryVoltage,batteryAh:((s=t.shared)==null?void 0:s.batteryAh)??F.batteryAh},dc:{controllerCount:((r=t.dc)==null?void 0:r.controllerCount)??1,mpptAmps:((u=t.dc)==null?void 0:u.mpptAmps)??F.mpptAmpStep},hybrid:{controllerCount:((y=t.hybrid)==null?void 0:y.controllerCount)??1,mpptAmps:((h=t.hybrid)==null?void 0:h.mpptAmps)??F.mpptAmpStep,inverterCount:((p=t.hybrid)==null?void 0:p.inverterCount)??1,inverterWatts:((b=t.hybrid)==null?void 0:b.inverterWatts)??F.inverterWattStep},balance:{dcDistributionCount:((S=t.balance)==null?void 0:S.dcDistributionCount)??1,acDistributionCount:((_=t.balance)==null?void 0:_.acDistributionCount)??1,cablingCount:((U=t.balance)==null?void 0:U.cablingCount)??1,earthingCount:((et=t.balance)==null?void 0:et.earthingCount)??1,monitoringCount:((nt=t.balance)==null?void 0:nt.monitoringCount)??1}}}function X(t){const e=W(gt),a={...e,...t},n=a.loads??e.loads;return{...a,currency:a.currency||"USD",usdExchangeRate:Number.isFinite(a.usdExchangeRate)&&a.usdExchangeRate>0?a.usdExchangeRate:1,selectedSystem:a.selectedSystem==="dc"||a.selectedSystem==="hybrid"?a.selectedSystem:"dc",equipmentDefaults:{...F,...a.equipmentDefaults??{}},pricing:ln(a.pricing),equipmentPlanMode:a.equipmentPlanMode??"generated",equipmentPlan:un(a.equipmentPlan),loads:n,updatedAt:a.updatedAt??new Date().toISOString()}}function pn(){const t=X(W(gt));try{const e=localStorage.getItem(Wt);if(e){const a=JSON.parse(e),n=(a.projects??[t]).map(o=>X(o));return{activeProjectId:a.activeProjectId??n[0].id,projects:n,assumptions:{...Rt,...a.assumptions??{}},products:{...M,...a.products??{}}}}}catch{localStorage.removeItem(Wt)}return{activeProjectId:t.id,projects:[t],assumptions:Rt,products:M}}let v=pn();function Z(){localStorage.setItem(Wt,JSON.stringify(v))}function q(){return v.projects.find(t=>t.id===v.activeProjectId)??v.projects[0]}function k(t){t.updatedAt=new Date().toISOString(),v.projects=v.projects.map(e=>e.id===t.id?X(t):e),Z(),J()}function ee(t,e){return t.equipmentPlanMode==="custom"&&t.equipmentPlan?t.equipmentPlan:e}function z(t,e=q()){return`${e.currency} ${D.format(t)}`}function ne(t,e=q()){return`${e.currency} ${tt.format(t)}`}function At(t){return`USD ${tt.format(t)}`}function T(t){return t>=1e3?`${tt.format(t/1e3)} kWh`:`${D.format(t)} Wh`}function mn(t){return`<span class="status-pill ${t.status==="Pass"?"pass":"warn"}">${t.status}</span>`}function re(t){const e=Yt(t,v.assumptions),a=Zt(e,t.equipmentDefaults),n=ee(t,a),o={dc:Vt(e,n,"dc"),hybrid:Vt(e,n,"hybrid")},s=[Nt(t,n,t.pricing,v.assumptions,"dc"),Nt(t,n,t.pricing,v.assumptions,"hybrid")];return{result:e,generatedPlan:a,plan:n,actuals:Xt(n),evaluations:o,costs:s,recommendations:on(t,e)}}function ae(t){const e=re(t),a=bt(t),n=a==="dc"?e.result.dc:e.result.hybrid,o=a==="dc"?e.evaluations.dc:e.evaluations.hybrid,s=e.costs.find(u=>u.systemId===a)??e.costs[0],r=e.recommendations.find(u=>u.id===a)??e.recommendations[0];return{...e,selectedSystem:a,selectedSystemName:te(a),selectedSizing:n,selectedEvaluation:o,selectedCost:s,selectedRecommendation:r}}function hn(t){const e=ae(t),a=j.find(n=>n.id===t.brandProfileId)??j[0];return dn.renderString(sn,{project:t,...e,assumptions:v.assumptions,brand:a,generatedAt:new Date().toLocaleDateString("en",{year:"numeric",month:"short",day:"numeric"}),money:n=>z(n,t),moneyDetailed:n=>ne(n,t),moneyUsd:At,formatEnergy:T,formatNumber:n=>D.format(n),formatDecimal:n=>tt.format(n),formatPercent:n=>`${Math.round(n*100)}%`})}function yn(t){const e=t===void 0?"":String(t);return/[",\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e}function gn(t){return t.map(yn).join(",")}function bn(t){const e=ae(t),a=j.find(s=>s.id===t.brandProfileId)??j[0],n=[],o=e.selectedRecommendation.lines;return n.push(["Project Summary"]),n.push(["Country",t.country]),n.push(["Currency",t.currency]),n.push(["USD exchange rate",`1 USD = ${tt.format(t.usdExchangeRate)} ${t.currency}`]),n.push(["System voltage",`${t.systemVoltage} V`]),n.push(["Sun hours",`${t.sunHours} h/day`]),n.push(["Autonomy",`${t.autonomyDays} day(s)`]),n.push(["Report option",e.selectedSystemName]),n.push(["Brand profile",a.name]),n.push([]),n.push(["Load Table"]),n.push(["Load","Qty","W each","h/day","Type","Voltage","Surge","Critical","Daily Wh"]),e.result.loadRows.forEach(s=>{n.push([s.load.name,s.load.quantity,s.load.watts,s.load.hoursPerDay,s.load.currentType,`${s.load.voltage} V`,`${s.load.surgeMultiplier}x`,s.load.critical?"Yes":"No",Math.round(s.dailyWh)])}),n.push(["Total daily energy","","","","","","","",Math.round(e.result.totalDailyWh)]),n.push([]),n.push(["Technical Sizing Summary",e.selectedSystemName]),n.push(["Adjusted daily energy",T(e.selectedSizing.adjustedDailyWh)]),n.push(["Required LiFePO4 battery",T(e.selectedSizing.requiredBatteryWh)]),n.push(["Recommended solar array",`${D.format(e.selectedSizing.recommendedSolarArrayW)} W`]),n.push(["Recommended MPPT current",`${e.selectedSizing.recommendedMpptCurrentA} A`]),n.push(["Recommended inverter size",e.selectedSystem==="hybrid"?`${D.format(e.selectedSizing.recommendedInverterW)} W`:"Not required"]),n.push([]),n.push(["Generated / Edited Equipment Plan"]),n.push(["Equipment","Current plan","Actual capacity","Notes"]),n.push(["Solar panels",`${e.plan.shared.panelCount} panel(s) x ${e.plan.shared.panelWatts} W`,`${D.format(e.actuals.solarArrayW)} W`,`${D.format(e.selectedSizing.recommendedSolarArrayW)} W`]),n.push(["LiFePO4 batteries",`${e.plan.shared.batteryCount} battery/batteries x ${e.plan.shared.batteryVoltage} V x ${e.plan.shared.batteryAh} Ah`,T(e.actuals.batteryWh),T(e.selectedSizing.requiredBatteryWh)]),e.selectedSystem==="dc"?n.push(["DC MPPT/controller",`${e.plan.dc.controllerCount} controller(s) x ${e.plan.dc.mpptAmps} A`,`${e.plan.dc.mpptAmps} A`,`${e.selectedSizing.recommendedMpptCurrentA} A`]):(n.push(["Hybrid MPPT/controller",`${e.plan.hybrid.controllerCount} controller(s) x ${e.plan.hybrid.mpptAmps} A`,`${e.plan.hybrid.mpptAmps} A`,`${e.selectedSizing.recommendedMpptCurrentA} A`]),n.push(["Hybrid inverter",`${e.plan.hybrid.inverterCount} inverter(s) x ${e.plan.hybrid.inverterWatts} W`,`${D.format(e.actuals.hybridInverterW)} W`,`${D.format(e.selectedSizing.recommendedInverterW)} W`])),n.push([]),n.push([e.selectedRecommendation.name]),n.push(["Status",e.selectedEvaluation.status]),e.selectedEvaluation.warnings.length>0&&e.selectedEvaluation.warnings.forEach(s=>n.push(["Warning",s])),n.push(["Summary",e.selectedRecommendation.summary]),n.push(["Category","Recommendation","Rationale"]),o.forEach(s=>n.push([s.category,s.recommendation,s.rationale])),n.push([]),n.push(["Financial Summary",e.selectedSystemName]),n.push([`${e.selectedSystemName} option`,z(e.selectedCost.total,t)]),n.push([]),n.push([`${e.selectedSystemName} Cost Detail`]),n.push(["Category","Description","Qty","Unit cost","Total"]),e.selectedCost.lines.forEach(s=>{n.push([s.category,s.description,s.quantity,`${ne(s.unitCost,t)} (${At(s.unitCostUsd)})`,z(s.total,t)])}),n.push(["Installation","Planning allowance based on editable assumption",1,`${Math.round(v.assumptions.installationRate*100)}%`,z(e.selectedCost.installation,t)]),n.push(["Contingency","Planning allowance for local variance and missing items",1,`${Math.round(v.assumptions.contingencyRate*100)}%`,z(e.selectedCost.contingency,t)]),n.push(["Estimated total","","","",`${z(e.selectedCost.total,t)} (${At(e.selectedCost.totalUsd)})`]),n.map(gn).join(`
`)}function fn(t){return`${t.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")||"hello-solar-report"}-report.csv`}function vn(t){return`data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${bn(t)}`)}`}function _t(t){return t.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}function G(t,e,a){return`
    <label>
      <span>${t}</span>
      <input ${e} value="${String(a)}" />
    </label>
  `}function Cn(t){return`
    <section class="panel project-panel">
      <div class="section-heading">
        <span>Project</span>
        <strong>${t.name}</strong>
      </div>
      <div class="form-grid">
        ${G("Project name",'type="text" data-project-field="name"',t.name)}
        ${G("Country",'type="text" data-project-field="country"',t.country)}
        ${G("System voltage",'type="number" min="12" step="12" data-project-field="systemVoltage"',t.systemVoltage)}
        ${G("Sun hours",'type="number" min="0.5" step="0.1" data-project-field="sunHours"',t.sunHours)}
        ${G("Autonomy days",'type="number" min="0.5" step="0.5" data-project-field="autonomyDays"',t.autonomyDays)}
        <label>
          <span>System Option</span>
          <select data-project-field="selectedSystem">
            <option value="dc" ${bt(t)==="dc"?"selected":""}>Fully DC</option>
            <option value="hybrid" ${bt(t)==="hybrid"?"selected":""}>Hybrid DC + AC</option>
          </select>
        </label>
        <label>
          <span>Brand profile</span>
          <select data-project-field="brandProfileId">
            ${j.map(e=>`<option value="${e.id}" ${e.id===t.brandProfileId?"selected":""}>${e.name}</option>`).join("")}
          </select>
          <em>Report branding only</em>
        </label>
      </div>
    </section>
  `}function B(t,e,a,n=""){return`
    <label>
      <span>${t}</span>
      <input ${e} value="${String(a)}" />
      ${n?`<em>${n}</em>`:""}
    </label>
  `}function Sn(t){return t.loads.map(e=>`
      <tr data-load-row data-load-id="${e.id}">
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
    `).join("")}function $(t,e,a,n,o=1){return G(t,`type="number" min="0" step="${o}" data-hardware-section="${e}" data-hardware-field="${a}"`,n)}function O(t,e,a){return B(t,`type="number" min="0" step="0.01" data-pricing-field="${e}"`,a,"USD unit price")}function $n(t,e,a,n){return`
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
          <summary>Currency</summary>
          <div class="accordion-body mini-grid">
            <label>
              <span>Currency</span>
              <select data-project-field="currency">
                ${cn.map(o=>`<option value="${o}" ${t.currency===o?"selected":""}>${o}</option>`).join("")}
              </select>
            </label>
            ${B("USD exchange rate",'type="number" min="0" step="0.01" data-project-field="usdExchangeRate"',t.usdExchangeRate,`1 USD in ${t.currency}`)}
          </div>
        </details>

        <details open>
          <summary>Solar Panels</summary>
          <div class="accordion-body mini-grid">
            ${$("Panels","shared","panelCount",e.shared.panelCount)}
            ${$("Watts each","shared","panelWatts",e.shared.panelWatts)}
            ${O("Price per panel","panelUnitUsd",t.pricing.panelUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${n.shared.panelCount} panel(s) x ${n.shared.panelWatts} W. Current array: ${D.format(e.shared.panelCount*e.shared.panelWatts)} W.</p>
        </details>

        <details>
          <summary>Batteries</summary>
          <div class="accordion-body mini-grid">
            ${$("Batteries","shared","batteryCount",e.shared.batteryCount)}
            ${$("Voltage","shared","batteryVoltage",e.shared.batteryVoltage)}
            ${$("Ah each","shared","batteryAh",e.shared.batteryAh)}
            ${O("Price per battery","batteryUnitUsd",t.pricing.batteryUnitUsd)}
          </div>
          <p class="comparison-note">Generated: ${n.shared.batteryCount} battery/batteries x ${n.shared.batteryVoltage} V x ${n.shared.batteryAh} Ah. Current storage: ${T(e.shared.batteryCount*e.shared.batteryVoltage*e.shared.batteryAh)}.</p>
        </details>

        <details>
          <summary>DC Controller</summary>
          <div class="accordion-body mini-grid">
            ${$("Controllers","dc","controllerCount",e.dc.controllerCount)}
            ${$("MPPT amps","dc","mpptAmps",e.dc.mpptAmps)}
            ${O("Price per controller","controllerUnitUsd",t.pricing.controllerUnitUsd)}
          </div>
          ${Pt(a.dc)}
        </details>

        <details>
          <summary>Hybrid Inverter</summary>
          <div class="accordion-body mini-grid">
            ${$("Controllers","hybrid","controllerCount",e.hybrid.controllerCount)}
            ${$("MPPT amps","hybrid","mpptAmps",e.hybrid.mpptAmps)}
            ${$("Inverters","hybrid","inverterCount",e.hybrid.inverterCount)}
            ${$("Watts each","hybrid","inverterWatts",e.hybrid.inverterWatts)}
            ${O("Price per inverter","inverterUnitUsd",t.pricing.inverterUnitUsd)}
          </div>
          ${Pt(a.hybrid)}
        </details>

        <details>
          <summary>DC Distribution</summary>
          <div class="accordion-body mini-grid">
            ${$("Quantity","balance","dcDistributionCount",e.balance.dcDistributionCount)}
            ${O("Price per set","dcDistributionUnitUsd",t.pricing.dcDistributionUnitUsd)}
          </div>
        </details>

        <details>
          <summary>AC Distribution</summary>
          <div class="accordion-body mini-grid">
            ${$("Quantity","balance","acDistributionCount",e.balance.acDistributionCount)}
            ${O("Price per set","acDistributionUnitUsd",t.pricing.acDistributionUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Cabling</summary>
          <div class="accordion-body mini-grid">
            ${$("Quantity","balance","cablingCount",e.balance.cablingCount)}
            ${O("Price per kit","cablingUnitUsd",t.pricing.cablingUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Earthing</summary>
          <div class="accordion-body mini-grid">
            ${$("Quantity","balance","earthingCount",e.balance.earthingCount)}
            ${O("Price per kit","earthingUnitUsd",t.pricing.earthingUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Monitoring</summary>
          <div class="accordion-body mini-grid">
            ${$("Quantity","balance","monitoringCount",e.balance.monitoringCount)}
            ${O("Price per kit","monitoringUnitUsd",t.pricing.monitoringUnitUsd)}
          </div>
        </details>

        <details>
          <summary>Sizing Assumptions</summary>
          <div class="accordion-body mini-grid">
            ${B("Default panel W",'type="number" min="1" step="1" data-default-field="panelWatts"',t.equipmentDefaults.panelWatts)}
            ${B("Default battery V",'type="number" min="1" step="1" data-default-field="batteryVoltage"',t.equipmentDefaults.batteryVoltage)}
            ${B("Default battery Ah",'type="number" min="1" step="1" data-default-field="batteryAh"',t.equipmentDefaults.batteryAh)}
            ${B("MPPT amp step",'type="number" min="1" step="1" data-default-field="mpptAmpStep"',t.equipmentDefaults.mpptAmpStep)}
            ${B("Inverter W step",'type="number" min="1" step="1" data-default-field="inverterWattStep"',t.equipmentDefaults.inverterWattStep)}
            ${[["dcDistributionEfficiency","DC efficiency"],["hybridDcEfficiency","Hybrid DC efficiency"],["inverterEfficiency","Inverter efficiency"],["batteryDepthOfDischarge","Battery DoD"],["batteryReserveFactor","Battery reserve"],["arrayDerateFactor","PV derate"],["mpptSafetyFactor","MPPT safety"],["inverterHeadroomFactor","Inverter headroom"],["installationRate","Installation rate"],["contingencyRate","Contingency rate"]].map(([o,s])=>B(s,`type="number" min="0" max="3" step="0.01" data-assumption-field="${o}"`,v.assumptions[o])).join("")}
          </div>
        </details>
      </div>
    </section>
  `}function Pt(t){return t.warnings.length===0?'<p class="pass-note">This option can handle the calculated load.</p>':`
    <ul class="warning-list">
      ${t.warnings.map(e=>`<li>${e}</li>`).join("")}
    </ul>
  `}function Dn(t){const{result:e,generatedPlan:a,plan:n,evaluations:o,costs:s,recommendations:r}=re(t),[u,y]=s,h=bt(t);return`
    <main class="planner-grid">
      <div class="side-column">
        ${Cn(t)}
        ${$n(t,n,o,a)}
      </div>

      <div class="main-column">
        <section class="panel metrics-panel">
          <div class="metric"><span>Total daily Wh</span><strong>${T(e.totalDailyWh)}</strong></div>
          <div class="metric"><span>Peak load</span><strong>${D.format(e.peakLoadW)} W</strong></div>
          <div class="metric"><span>Surge load</span><strong>${D.format(e.surgeLoadW)} W</strong></div>
          <div class="metric"><span>Critical load energy</span><strong>${T(e.criticalDailyWh)}</strong></div>
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
                  <th>W</th>
                  <th>h/day</th>
                  <th>Type</th>
                  <th>V</th>
                  <th>Surge</th>
                  <th>Critical</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${Sn(t)}</tbody>
            </table>
          </div>
        </section>

        <section class="panel recommendations-panel">
          <div class="section-heading">
            <span>System options</span>
            <strong>Two planning paths</strong>
          </div>
          <div class="option-grid">
            ${r.map(p=>{const b=p.id==="dc"?e.dc:e.hybrid,S=p.id==="dc"?o.dc:o.hybrid,_=p.id==="dc"?u:y,U=p.id===h;return`
                  <article class="option-card ${U?"selected-option":""}">
                    <div class="card-heading">
                      <div>
                        <h2>${p.name}</h2>
                        ${U?'<span class="report-choice">Included in report</span>':""}
                      </div>
                      ${mn(S)}
                    </div>
                    <p>${p.summary}</p>
                    <dl>
                      <div><dt>Adjusted energy</dt><dd>${T(b.adjustedDailyWh)}</dd></div>
                      <div><dt>Battery requirement</dt><dd>${T(b.requiredBatteryWh)}</dd></div>
                      <div><dt>Solar requirement</dt><dd>${D.format(b.recommendedSolarArrayW)} W</dd></div>
                      <div><dt>MPPT requirement</dt><dd>${b.recommendedMpptCurrentA} A</dd></div>
                      ${p.id==="hybrid"?`<div><dt>Inverter requirement</dt><dd>${D.format(b.recommendedInverterW)} W</dd></div>`:""}
                      <div><dt>Estimate</dt><dd>${z(_.total,t)}</dd></div>
                    </dl>
                    ${Pt(S)}
                  </article>
                `}).join("")}
          </div>
        </section>
      </div>
    </main>

    <section class="panel report-panel">
      <details class="report-details" data-report-details>
        <summary class="report-summary">
          <div class="section-heading">
            <span>Report generation</span>
            <strong>${te(h)} report</strong>
          </div>
        </summary>
        <div class="report-body">
          <div class="panel-title-row report-toolbar">
            <div class="section-heading">
              <span>Report actions</span>
              <strong>Print or export this selected option</strong>
            </div>
            <div class="report-actions">
              <button type="button" data-print>Print / Save PDF</button>
              <a class="button-link" href="${_t(vn(t))}" download="${_t(fn(t))}" target="_blank" rel="noopener" data-export-csv>Export CSV</a>
            </div>
          </div>
          <div id="report">${hn(t)}</div>
        </div>
      </details>
    </section>
  `}function J(){if(!Ot)return;const t=q(),e=j.find(a=>a.id===t.brandProfileId)??j[0];document.documentElement.style.setProperty("--brand",e.primaryColor),document.documentElement.style.setProperty("--accent",e.accentColor),Ot.innerHTML=`
    <div class="app-shell">
      <header class="topbar">
        <div>
          <p>${e.name}</p>
          <h1>Hello Solar Planner</h1>
        </div>
        <div class="top-actions">
          <select data-project-switch aria-label="Switch project">
            ${v.projects.map(a=>`<option value="${a.id}" ${a.id===t.id?"selected":""}>${a.name}</option>`).join("")}
          </select>
          <button type="button" data-new-project>New</button>
          <button type="button" data-load-sample>Sample</button>
        </div>
      </header>
      ${Dn(t)}
    </div>
  `,Un()}function Dt(t){const e=Array.from(document.querySelectorAll("[data-load-row]"));if(e.length===0)return t.loads;const a=(o,s)=>o.querySelector(`[data-load-field="${s}"]`),n=(o,s,r)=>{var y;const u=Number((y=a(o,s))==null?void 0:y.value);return Number.isFinite(u)?u:r};return e.map(o=>{var h,p;const s=o.dataset.loadId??yt(),r=t.loads.find(b=>b.id===s),u=(h=a(o,"currentType"))==null?void 0:h.value,y=a(o,"critical");return{id:s,name:((p=a(o,"name"))==null?void 0:p.value)??(r==null?void 0:r.name)??"Load",quantity:n(o,"quantity",(r==null?void 0:r.quantity)??0),watts:n(o,"watts",(r==null?void 0:r.watts)??0),hoursPerDay:n(o,"hoursPerDay",(r==null?void 0:r.hoursPerDay)??0),currentType:u==="AC"?"AC":"DC",voltage:n(o,"voltage",(r==null?void 0:r.voltage)??t.systemVoltage),surgeMultiplier:n(o,"surgeMultiplier",(r==null?void 0:r.surgeMultiplier)??1),critical:y instanceof HTMLInputElement?y.checked:(r==null?void 0:r.critical)??!1}})}function Un(){var t,e,a,n,o,s;(t=document.querySelector("[data-project-switch]"))==null||t.addEventListener("change",r=>{v.activeProjectId=r.target.value,Z(),J()}),document.querySelectorAll("[data-project-field]").forEach(r=>{const u=new Set(["systemVoltage","sunHours","autonomyDays","usdExchangeRate"]),y=h=>{const p=h.target,b=W(q()),S=p.dataset.projectField;b[S]=u.has(S)?Number(p.value):p.value,k(b)};r.addEventListener("change",y),r instanceof HTMLInputElement&&u.has(r.dataset.projectField)&&r.addEventListener("input",y)}),(e=document.querySelector("[data-calculate-loads]"))==null||e.addEventListener("click",()=>{const r=W(q());r.loads=Dt(r),k(r)}),document.querySelectorAll("[data-remove-load]").forEach(r=>{r.addEventListener("click",()=>{const u=W(q());u.loads=Dt(u).filter(y=>y.id!==r.dataset.removeLoad),k(u)})}),(a=document.querySelector("[data-add-load]"))==null||a.addEventListener("click",()=>{const r=W(q());r.loads=Dt(r),r.loads.push({id:yt(),name:"New load",quantity:1,watts:10,hoursPerDay:4,currentType:"DC",voltage:r.systemVoltage,surgeMultiplier:1.1,critical:!1}),k(r)}),document.querySelectorAll("[data-hardware-field]").forEach(r=>{const u=y=>{const h=y.target,p=W(q()),b=Zt(Yt(p,v.assumptions),p.equipmentDefaults),S=W(ee(p,b)),_=h.dataset.hardwareSection,U=h.dataset.hardwareField??"";S[_][U]=Number(h.value),p.equipmentPlan=S,p.equipmentPlanMode="custom",k(p)};r.addEventListener("input",u),r.addEventListener("change",u)}),(n=document.querySelector("[data-reset-equipment]"))==null||n.addEventListener("click",()=>{const r=W(q());r.equipmentPlan=void 0,r.equipmentPlanMode="generated",k(r)}),document.querySelectorAll("[data-default-field]").forEach(r=>{r.addEventListener("change",u=>{const y=u.target,h=W(q()),p=y.dataset.defaultField;h.equipmentDefaults[p]=Number(y.value),k(h)})}),document.querySelectorAll("[data-pricing-field]").forEach(r=>{const u=y=>{const h=y.target,p=W(q()),b=h.dataset.pricingField;p.pricing[b]=Number(h.value),k(p)};r.addEventListener("input",u),r.addEventListener("change",u)}),document.querySelectorAll("[data-assumption-field]").forEach(r=>{r.addEventListener("change",u=>{const y=u.target,h=y.dataset.assumptionField;v.assumptions[h]=Number(y.value),Z(),J()})}),(o=document.querySelector("[data-new-project]"))==null||o.addEventListener("click",()=>{const r=X(W(gt));r.id=yt(),r.name="Untitled solar project",r.updatedAt=new Date().toISOString(),v.projects=[...v.projects,r],v.activeProjectId=r.id,Z(),J()}),(s=document.querySelector("[data-load-sample]"))==null||s.addEventListener("click",()=>{const r=X(W(gt));r.id=yt(),r.updatedAt=new Date().toISOString(),v.projects=[...v.projects,r],v.activeProjectId=r.id,Z(),J()}),document.querySelectorAll("[data-print]").forEach(r=>{r.addEventListener("click",()=>{var u;(u=document.querySelector("[data-report-details]"))==null||u.setAttribute("open",""),window.print()})})}window.addEventListener("beforeprint",()=>{var t;(t=document.querySelector("[data-report-details]"))==null||t.setAttribute("open","")});J();
