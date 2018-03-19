const getBodyEmailChangePsw = (data) => {
    const body = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" /><!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=Edge" /><!--<![endif]-->
        <!--[if (gte mso 9)|(IE)]>
        <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <!--[if (gte mso 9)|(IE)]>
        <style type="text/css">
          body {width: 600px;margin: 0 auto;}
          table {border-collapse: collapse;}
          table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
          img {-ms-interpolation-mode: bicubic;}
        </style>
        <![endif]-->
    
        <style type="text/css">
          body, p, div {
            font-family: arial;
            font-size: 14px;
          }
          body {
            color: #626262;
          }
          body a {
            color: #0088cd;
            text-decoration: none;
          }
          p { margin: 0; padding: 0; }
          table.wrapper {
            width:100% !important;
            table-layout: fixed;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          img.max-width {
            max-width: 100% !important;
          }
          .column.of-2 {
            width: 50%;
          }
          .column.of-3 {
            width: 33.333%;
          }
          .column.of-4 {
            width: 25%;
          }
          @media screen and (max-width:480px) {
            .preheader .rightColumnContent,
            .footer .rightColumnContent {
                text-align: left !important;
            }
            .preheader .rightColumnContent div,
            .preheader .rightColumnContent span,
            .footer .rightColumnContent div,
            .footer .rightColumnContent span {
              text-align: left !important;
            }
            .preheader .rightColumnContent,
            .preheader .leftColumnContent {
              font-size: 80% !important;
              padding: 5px 0;
            }
            table.wrapper-mobile {
              width: 100% !important;
              table-layout: fixed;
            }
            img.max-width {
              height: auto !important;
              max-width: 480px !important;
            }
            a.bulletproof-button {
              display: block !important;
              width: auto !important;
              font-size: 80%;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            .columns {
              width: 100% !important;
            }
            .column {
              display: block !important;
              width: 100% !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
          }
        </style>
        <!--user entered Head Start-->
        
         <!--End Head user entered-->
      </head>
      <body>
        <center class="wrapper" data-link-color="#0088cd" data-body-style="font-size: 14px; font-family: arial; color: #626262; background-color: #ffffff;">
          <div class="webkit">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#ffffff">
              <tr>
                <td valign="top" bgcolor="#ffffff" width="100%">
                  <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="100%">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td>
                              <!--[if mso]>
                              <center>
                              <table><tr><td width="600">
                              <![endif]-->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width:600px;" align="center">
                                <tr>
                                  <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #626262; text-align: left;" bgcolor="#F4F4F4" width="100%" align="left">
                                    
        <table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%"
               style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
          <tr>
            <td role="module-content">
              <p>This is the preheader text.</p>
            </td>
          </tr>
        </table>
      
        <table class="module"
               role="module"
               data-type="spacer"
               border="0"
               cellpadding="0"
               cellspacing="0"
               width="100%"
               style="table-layout: fixed;">
          <tr>
            <td style="padding:0px 0px 3px 0px;"
                role="module-content"
                bgcolor="#f0354c">
            </td>
          </tr>
        </table>
      
        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td style="padding:34px 23px 34px 23px;background-color:#ffffff;"
                height="100%"
                valign="top"
                bgcolor="#ffffff">
                <h1 style="text-align: center;"><font color="#2d2d2d">Hey, ${data.name}</font></h1>
    
    <div style="text-align: center;"><span style="font-size: 14px;">Welcome to TKComidas. You can access through the following credentials but for security we invite you to update your temporal password:</span></div>
            </td>
          </tr>
        </table>
      <table class="module" role="module" data-type="code" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td height="100%" valign="top">
              <div style="width: 100%; display: flex; justify-content: center; background: #FFFFFF">
    <div style="text-align: right;font-weight: bold; width: 50%">USER: &nbsp;&nbsp;&nbsp;  </div> <div style="text-align: left;  width: 50%">${data.nickname}</div>
    </div>
    <div style="width: 100%; display: flex; justify-content: center; background: #FFFFFF">
    <div style="text-align: right;font-weight: bold; width: 50%">EMAIL: &nbsp;&nbsp;&nbsp;  </div> <div style="text-align: left;  width: 50%">${data.email}</div>
    </div>
    <div style="width: 100%; display: flex; justify-content: center; background: #FFFFFF;margin-bottom: 12px">
    <div style="text-align: right;font-weight: bold;  width: 50%">TEMP PSWD:&nbsp;&nbsp;&nbsp;  </div> <div style="text-align: left;  width: 50%">${data.randomPassword}</div>
    </div>
            </td>
          </tr>
        </table><table border="0" cellPadding="0" cellSpacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed" width="100%"><tbody><tr><td align="center" bgcolor="#ffffff" class="outer-td" style="padding:0px 0px 51px 0px;background-color:#ffffff"><table border="0" cellPadding="0" cellSpacing="0" class="button-css__deep-table___2OZyb wrapper-mobile" style="text-align:center"><tbody><tr><td align="center" bgcolor="#f0354c" class="inner-td" style="-webkit-border-radius:0px;-moz-border-radius:0px;border-radius:0px;font-size:15px;text-align:center;background-color:inherit"><a style="background-color:#f0354c;height:px;width:px;font-size:15px;line-height:px;font-family:Helvetica, Arial, sans-serif;color:#ffffff;padding:14px 56px 13px 56px;text-decoration:none;-webkit-border-radius:0px;-moz-border-radius:0px;border-radius:6px;border:1px solid #32A9D6;display:inline-block;border-color:#f0354c" href="http://40.121.85.209/changePassword" target="_blank">Go To TKComidas</a></td></tr></tbody></table></td></tr></tbody></table>
        <table class="module"
               role="module"
               data-type="spacer"
               border="0"
               cellpadding="0"
               cellspacing="0"
               width="100%"
               style="table-layout: fixed;">
          <tr>
            <td style="padding:0px 0px 3px 0px;"
                role="module-content"
                bgcolor="#f0354c">
            </td>
          </tr>
        </table>
      
        <table  border="0"
                cellpadding="0"
                cellspacing="0"
                align="center"
                width="100%"
                role="module"
                data-type="columns"
                data-version="2"
                style="padding:48px 34px 17px 34px;background-color:#f0354c;box-sizing:border-box;"
                bgcolor="#f0354c">
          <tr role='module-content'>
            <td height="100%" valign="top">
                <!--[if (gte mso 9)|(IE)]>
                  <center>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-spacing:0;border-collapse:collapse;table-layout: fixed;" >
                      <tr>
                <![endif]-->
              
        <!--[if (gte mso 9)|(IE)]>
          <td width="266.000px" valign="top" style="padding: 0px 0px 0px 0px;border-collapse: collapse;" >
        <![endif]-->
    
        <table  width="266.000"
                style="width:266.000px;border-spacing:0;border-collapse:collapse;margin:0px 0px 0px 0px;"
                cellpadding="0"
                cellspacing="0"
                align="left"
                border="0"
                bgcolor="#f0354c"
                class="column column-0 of-2
                      empty"
          >
          <tr>
            <td style="padding:0px;margin:0px;border-spacing:0;">
                
        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td style="padding:0px 0px 0px 0px;background-color:#f0354c;"
                height="100%"
                valign="top"
                bgcolor="#f0354c">
                <div style="font-size: 10px; line-height: 150%; margin: 0px;">&nbsp;</div>
                                                          <div style="font-size: 10px; line-height: 150%; margin: 0px;">&nbsp;</div>
                                                          <div style="font-size: 10px; line-height: 150%; margin: 0px;"><a href="[unsubscribe]"><span style="color:#FFFFFF;">Unsubscribe</span></a><span style="color:#FFFFFF;"> | </span><a href="[Unsubscribe_Preferences]"><span style="color:#FFFFFF;">Update Preferences</span></a></div>
            </td>
          </tr>
        </table>
      
            </td>
          </tr>
        </table>
    
        <!--[if (gte mso 9)|(IE)]>
          </td>
        <![endif]-->
        <!--[if (gte mso 9)|(IE)]>
          <td width="266.000px" valign="top" style="padding: 0px 0px 0px 0px;border-collapse: collapse;" >
        <![endif]-->
    
        <table  width="266.000"
                style="width:266.000px;border-spacing:0;border-collapse:collapse;margin:0px 0px 0px 0px;"
                cellpadding="0"
                cellspacing="0"
                align="left"
                border="0"
                bgcolor="#f0354c"
                class="column column-1 of-2
                      empty"
          >
          <tr>
            <td style="padding:0px;margin:0px;border-spacing:0;">
                
        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td style="padding:0px 0px 0px 0px;background-color:#f0354c;"
                height="100%"
                valign="top"
                bgcolor="#f0354c">
                <div style="font-size: 10px; line-height: 150%; margin: 0px; text-align: right;"><span style="color:#ffffff;">[Sender_Name]</span></div>
                                                          <div style="font-size: 10px; line-height: 150%; margin: 0px; text-align: right;"><span style="color:#ffffff;">[Sender_Address]</span></div>
                                                          <div style="font-size: 10px; line-height: 150%; margin: 0px; text-align: right;"><span style="color:#ffffff;">[Sender_City], [Sender_State] [Sender_Zip]</span></div>
            </td>
          </tr>
        </table>
      
            </td>
          </tr>
        </table>
    
        <!--[if (gte mso 9)|(IE)]>
          </td>
        <![endif]-->
                <!--[if (gte mso 9)|(IE)]>
                      <tr>
                    </table>
                  </center>
                <![endif]-->
            </td>
          </tr>
        </table>
      
                                  </td>
                                </tr>
                              </table>
                              <!--[if mso]>
                              </td></tr></table>
                              </center>
                              <![endif]-->
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>
        </center>
      </body>
    </html>`;
    return body;
}

module.exports = { getBodyEmailChangePsw };