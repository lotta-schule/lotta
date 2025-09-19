const mailEndpoint = `${process.env.CORE_URL}/_debug/mails/api`;

const WAIT_TIME_MS = 500;

export type BambooMailSubject = [name: string, email: string];

export type BambooMail = {
  to: BambooMailSubject[];
  text_body: string;
  subject: string;
  html_body: string;
  headers: Record<string, string>;
  from: BambooMailSubject;
  cc: BambooMailSubject[];
  bcc: BambooMailSubject[];
  attachments: [];
};

export const resetSentMails = async () => {
  const res = await fetch(mailEndpoint + '/reset.json', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to reset sent emails. Status Code: ' + res.status);
  }
};

export const getSentMails = async (): Promise<BambooMail[]> => {
  // Wait a bit to ensure mails are processed
  await new Promise((resolve) => setTimeout(resolve, WAIT_TIME_MS));
  const res = await fetch(mailEndpoint + '/emails.json');
  if (!res.ok) {
    throw new Error('Failed to fetch sent emails. Status Code: ' + res.status);
  }
  return await res.json();
};

export const getLastMail = async () => {
  const mails = await getSentMails();
  return mails.at(0);
};
