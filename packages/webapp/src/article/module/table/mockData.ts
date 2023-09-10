// Mock DataTransfer as JSDom does not ship with it
export class DataTransfer {
  constructor(public data: Record<string, string> = {}) {}

  public setData(key: string, val: string) {
    this.data[key] = val;
  }
  public getData(key: string) {
    return this.data[key];
  }

  public setDragImage = () => {};

  public get types() {
    return Object.keys(this.data);
  }

  public dropEffect = 'none';
  public effectAllowed = 'uninitialized';

  public files: any = {};
}

// This is paste data from Excel
export const excelPasteTransfer = new DataTransfer();
excelPasteTransfer.setData('text/plain', 'A	B	C\n D	E	F\n G	H	I');
excelPasteTransfer.setData('text/rtf', 'THISISSRTFDATAANDNOTIMPORTANT');
excelPasteTransfer.setData(
  'text/html',
  `<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"> <head> <meta http-equiv=Content-Type content="text/html; charset=utf-8"> <meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 15"> <link id=Main-File rel=Main-File href="file:////Users/arinaldoni/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip.htm"> <link rel=File-List href="file:////Users/arinaldoni/Library/Group%20Containers/UBF8T346G9.Office/TemporaryItems/msohtmlclip/clip_filelist.xml"> <style> <!--table {mso-displayed-decimal-separator:","; mso-displayed-thousand-separator:".";} @page {margin:.75in .7in .75in .7in; mso-header-margin:.3in; mso-footer-margin:.3in;} tr {mso-height-source:auto;} col {mso-width-source:auto;} br {mso-data-placement:same-cell;} td {padding-top:1px; padding-right:1px; padding-left:1px; mso-ignore:padding; color:black; font-size:12.0pt; font-weight:400; font-style:normal; text-decoration:none; font-family:Calibri, sans-serif; mso-font-charset:0; mso-number-format:General; text-align:general; vertical-align:bottom; border:none; mso-background-source:auto; mso-pattern:auto; mso-protection:locked visible; white-space:nowrap; mso-rotate:0;} --> </style> </head> <body link="#0563C1" vlink="#954F72"> <table border=0 cellpadding=0 cellspacing=0 width=261 style='border-collapse: collapse;width:195pt'> <!--StartFragment--> <col width=87 span=3 style='width:65pt'> <tr height=21 style='height:16.0pt'> <td height=21 width=87 style='height:16.0pt;width:65pt'>A</td> <td width=87 style='width:65pt'>B</td> <td width=87 style='width:65pt'>C</td> </tr> <tr height=21 style='height:16.0pt'> <td height=21 style='height:16.0pt'>D</td> <td>E</td> <td>F</td> </tr> <tr height=21 style='height:16.0pt'> <td height=21 style='height:16.0pt'>G</td> <td>H</td> <td>I</td> </tr> <!--EndFragment--> </table> </body> </html>`
);

// This is paste data from Numbers
export const numbersPasteTransfer = new DataTransfer();
numbersPasteTransfer.setData('text/plain', 'A	B	C\nD	E	F\nG	H	I');
numbersPasteTransfer.setData('text/rtf', 'THISISSRTFDATAANDNOTIMPORTANT');
numbersPasteTransfer.setData(
  'text/html',
  `<table cellspacing="0" cellpadding="0" style="border-collapse: collapse"> <tbody> <tr> <td valign="top" style="width: 89.0px; height: 11.0px; background-color: #b0b3b2; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000"><b>A</b></font></p> </td> <td valign="top" style="width: 89.0px; height: 11.0px; background-color: #b0b3b2; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000"><b>B</b></font></p> </td> <td valign="top" style="width: 89.0px; height: 11.0px; background-color: #b0b3b2; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000"><b>C</b></font></p> </td> </tr> <tr> <td valign="top" style="width: 89.0px; height: 12.0px; background-color: #d4d4d4; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000"><b>D</b></font></p> </td> <td valign="top" style="width: 89.0px; height: 12.0px; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000">E</font></p> </td> <td valign="top" style="width: 89.0px; height: 12.0px; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000">F</font></p> </td> </tr> <tr> <td valign="top" style="width: 89.0px; height: 11.0px; background-color: #d4d4d4; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000"><b>G</b></font></p> </td> <td valign="top" style="width: 89.0px; height: 11.0px; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000">H</font></p> </td> <td valign="top" style="width: 89.0px; height: 11.0px; border-style: solid; border-width: 1.0px 1.0px 1.0px 1.0px; border-color: #000000 #000000 #000000 #000000; padding: 4.0px 4.0px 4.0px 4.0px"> <p style="margin: 0.0px 0.0px 0.0px 0.0px"><font face="Helvetica Neue" size="2" color="#000000" style="font: 10.0px 'Helvetica Neue'; font-variant-ligatures: common-ligatures; color: #000000">I</font></p> </td> </tr> </tbody> </table>`
);
