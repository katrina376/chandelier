DB_ID = '__SPREADSHEET_ID__';

ACA_API_USER = '__USERNAME__';
ACA_API_PASSWORD = '__PASSWORD__';

VERS = '1.00';

function doPost(e) {
  var queryString = e.postData.contents;
  var resultString = getStuinfo_(queryString);
  
  return ContentService.createTextOutput(resultString).setMimeType(ContentService.MimeType.XML)
}

function getStuinfo_(queryString) {
  var stuinfo = XmlService.createElement('STUINFO');
  var ok = true;
  var errorString = '';
  var result;
  
  try {
    var xml = XmlService.parse(queryString);
    var stureq = xml.getRootElement();
    
    var uid = stureq.getChildText('UID');
    var password = stureq.getChildText('PASSWORD');
    var lookup = stureq.getChildText('STUID');
    var vers = stureq.getChildText('Vers');
    
    if ((uid != ACA_API_USER) || (password != ACA_API_PASSWORD)) {
      ok = false;
      errorString = '未授權';
    } else if (vers != VERS) {
      ok = false;
      errorString = '輸入資料錯誤';
    } else {
      /* Create result */
      var sheet = SpreadsheetApp.openById(DB_ID).getActiveSheet();
      var rowNum = sheet.getLastRow();
      var values = sheet.getRange('A2:E' + rowNum).getValues();
      
      // 0.STUID 1.STUTYPE 2.INCAMPUS 3.COLLEGE 4.DPTCODE
      var studentIdList = values.map(function(el){return String(el[0])});
      var idx = studentIdList.indexOf(lookup.toUpperCase());
      
      if (idx != -1) {
        ok = true;
        result = values[idx];
      } else {
        ok = false;
        errorString = '查無學號資料';
      }
    }
  } catch(err) {
    ok = false;
    errorString = '輸入資料錯誤';
  }
  
  if (ok) {
    var status = XmlService.createElement('WEBOK').setText('OK');
    
    var stuid = XmlService.createElement('STUID').setText(result[0]);
    var stutype = XmlService.createElement('STUTYPE').setText(result[1]);
    var incampus = XmlService.createElement('INCAMPUS').setText(result[2]);
    var college = XmlService.createElement('COLLEGE').setText(result[3]);
    var dptcode = XmlService.createElement('DPTCODE').setText(result[4]);
    
    stuinfo
      .addContent(status)
      .addContent(stuid)
      .addContent(stutype)
      .addContent(incampus)
      .addContent(college)
      .addContent(dptcode);
  } else {
    var status = XmlService.createElement('WEBOK').setText('error');
    var error = XmlService.createElement('ERROR').setText(errorString);
    
    stuinfo
      .addContent(status)
      .addContent(error);
  }
  
  var doc = XmlService.createDocument(stuinfo);
  var resultString = XmlService.getRawFormat().setEncoding('big5').format(doc);
  
  return resultString;
}
