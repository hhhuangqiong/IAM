import Q from 'q';

export function emailService(emailClient, config) {
  function getMailHeader(email, templateName) {
    return {
      subject: config.get(`email:templates:${templateName}:subject`),
      from: config.get('email:from'),
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
        url: `${config.get('APP_URL')}/openid/setPassword?event=${event}&id=${email}`,
      },
    };
  }

  function sendSignUpEmail(email, client = { }) {
    const templateName = 'iam-signUp';
    const mailHeader = getMailHeader(email, templateName);
    const mailTemplate = getMailTemplate(email, 'setPassword', templateName, client);
    return Q.ninvoke(emailClient, 'send', mailHeader, mailTemplate, client);
  }

  function sendResetPasswordEmail(email, client = { }) {
    const templateName = 'iam-resetPassword';
    const mailHeader = getMailHeader(email, templateName);
    const mailTemplate = getMailTemplate(email, 'resetPassword', templateName, client);
    return Q.ninvoke(emailClient, 'send', mailHeader, mailTemplate, client);
  }
  return {
    sendSignUpEmail,
    sendResetPasswordEmail,
  };
}
