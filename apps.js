/* Apps by Talha — shared app catalog (index.html + download.html dono use karte hain) */
var APPS = [
  {id:"postmaker", name:"Post Maker", ver:"v2.0", size:"8.0 MB", file:"postmaker.apk", icon:"icons/postmaker.png",
   desc:"Facebook page ke liye rozana posts — real photo, Urdu text aur apna watermark. (Paid membership app)"},
  {id:"urducard", name:"Urdu Card Maker", ver:"v1.12", size:"37.5 MB", file:"urducard.apk", icon:"icons/urducard.png",
   desc:"Urdu shayari ke khubsurat cards banayein — ashaar, designs, save aur share."},
  {id:"khata", name:"Khata App", ver:"v1.6", size:"0.3 MB", file:"khata.apk", icon:"icons/khata.png",
   desc:"Dukaan ka digital khata — udhaar (lene/dene), hisab aur backup."},
  {id:"apnamedia", name:"Apna Media", ver:"v2.7", size:"0.6 MB", file:"apnamedia.apk", icon:"icons/apnamedia.png",
   desc:"Video aur audio player — background play, speed control aur gestures."},
  {id:"redhulk", name:"Red Hulk Downloader", ver:"v2.2", size:"35.2 MB", file:"redhulk.apk", icon:"icons/redhulk.png",
   desc:"Video download karein — 2K / 1080p / 720p aur MP3 qualities."},
  {id:"dolafixpro", name:"DolaFix Pro", ver:"v1.9", size:"8.8 MB", file:"dolafixpro.apk", icon:"icons/dolafixpro.png",
   desc:"Video se watermark hatayein aur quality enhance karein (4K tak)."},
  {id:"hisabkitab", name:"HisabKitab", ver:"v1.4", size:"0.7 MB", file:"hisabkitab.apk", icon:"icons/hisabkitab.png",
   desc:"All-in-one calculator — har tarah ka hisab, aik hi app me."},
  {id:"yaddahani", name:"Yad Dahani", ver:"v1.4", size:"0.5 MB", file:"yaddahani.apk", icon:"icons/yaddahani.png",
   desc:"Rangin notes, checklist aur waqt par reminders — kuch na bhoolein."},
  {id:"streak90", name:"Streak90", ver:"v1.5", size:"1.1 MB", file:"streak90.apk", icon:"icons/streak90.png",
   desc:"90 din ka habit tracker — buri aadat chhodein, nayi zindagi banayein."},
  {id:"scootyrange", name:"Scooty Range", ver:"v2.1", size:"0.2 MB", file:"scootyrange.apk", icon:"icons/scootyrange.png",
   desc:"Electric scooty ki range ka durust hisab — full charge par kitne km?"},
  {id:"speedo", name:"Speedo", ver:"v2.3", size:"0.2 MB", file:"speedo.apk", icon:"icons/speedo.png",
   desc:"Bina internet ke GPS speedometer — speed, distance aur trip time."}
];
function appById(id){ for(var i=0;i<APPS.length;i++){ if(APPS[i].id===id) return APPS[i]; } return null; }
