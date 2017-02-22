export function emailService(emailClient, config) {
  function getMailHeader(email) {
    return {
      from: config.from,
      to: email,
    };
  }

  function getMailTemplate(email, event, templateName, client) {
    return {
      name: templateName,
      language: 'en-US',
      data: {
        clientId: client.clientId,
        redirectURL: encodeURIComponent(client.redirectURL),
        url: `${config.appUrl}/openid/setPassword?event=${event}&id=${email}`,
        givenName: client.givenName,
      },
    };
  }

  function sendSignUpEmail(email, client = { }) {
    const templateName = 'iam-signUp';
    const mailHeader = getMailHeader(email);
    const mailTemplate = getMailTemplate(email, 'setPassword', templateName, client);
    return emailClient.sendAsync(mailHeader, mailTemplate, client);
  }

  function sendResetPasswordEmail(email, client = { }) {
    const templateName = 'iam-resetPassword';
    const mailHeader = getMailHeader(email);
    const mailTemplate = getMailTemplate(email, 'resetPassword', templateName, client);
    return emailClient.sendAsync(mailHeader, mailTemplate, client);
  }
  return {
    sendSignUpEmail,
    sendResetPasswordEmail,
  };
}

export default emailService;
