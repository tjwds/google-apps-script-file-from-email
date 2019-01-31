var LABEL_NAME = "";
var SHEET_NAME = "";
var FOLDER_NAME = "";
var EMAIL_REGEX_TEST = new RegExp(".*", "m");
var IMAGE_REGEX_TEST = new RegExp(".*", "gm");

function getImages() {
  // get our messages ...
  var label = GmailApp.getUserLabelByName(LABEL_NAME);
  var threads = label.getThreads();
  
  // get our google drive folder...
  var folder = DriveApp.getFolderById(FOLDER_NAME);
  
  // get our last message date...
  var spreadsheet = SpreadsheetApp.openById(SHEET_NAME);
  var sheet = spreadsheet.getSheets()[0];
  
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
    
  var row = 1;
  // do we have any data at all?
  if (lastRow != 0.0) {
    var lastCell = sheet.getRange(lastRow, lastColumn);
    var data = new Date(lastCell.getValue());
    row = lastRow + 1;
    var cell = sheet.getRange(row, lastColumn);
  } else {
    // no date yet...
    var cell = sheet.getRange(row, 1);
    var data = new Date(0);
  }
  
  sheet.setCurrentCell(cell);
    
  for (var i = 0; i < threads.length; i++) {
    messages = threads[i].getMessages();
    
    for (var j = 0; j < messages.length; j++) {
      // check to see if we've already grabbed this email.
      var currentDate = messages[j].getDate();
      
      // if we haven't; find the site...
      if (currentDate > data) {
        var urlCandidate = EMAIL_REGEX_TEST.exec(messages[j].getBody())[0];
        
        urlCandidate = urlCandidate.substring(0, urlCandidate.length - 3).replace(/\n/g, "");
                
        // go to the site...
        var html = UrlFetchApp.fetch(urlCandidate).getContentText();
        
        // find images in the page, download, them, and put them in drive.
        var match = null;
        while ((match = IMAGE_REGEX_TEST.exec(html)) != null) {
          var candidate = match[0].substring(14, match[0].length - 3); 
            
          var response = UrlFetchApp.fetch(candidate);
          var fileBlob = response.getBlob()
          
          var result = folder.createFile(fileBlob);
        }
        
        // then add the email's date to the spreadsheet.
        cell.setValue(currentDate);
        row += 1;
        cell = sheet.getRange(row, 1);
      }
    }
  }
}
