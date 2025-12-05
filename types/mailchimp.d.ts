declare module "@mailchimp/mailchimp_transactional" {
  interface Message {
    from_email: string
    from_name?: string
    subject: string
    html?: string
    text?: string
    to: Array<{
      email: string
      name?: string
      type?: "to" | "cc" | "bcc"
    }>
    [key: string]: any
  }

  interface SendResponse {
    email: string
    status: string
    _id: string
    [key: string]: any
  }

  interface MessagesMethods {
    send(options: { message: Message }): Promise<SendResponse[]>
  }

  interface MailchimpClient {
    messages: MessagesMethods
  }

  function mailchimp(apiKey: string): MailchimpClient

  export = mailchimp
}

declare module "sib-api-v3-sdk" {
  export class ApiClient {
    static instance: ApiClient
    authentications: {
      [key: string]: any
    }
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(email: SendSmtpEmail): Promise<{ messageId: string }>
  }

  export class SendSmtpEmail {
    subject: string
    htmlContent?: string
    sender?: {
      name: string
      email: string
    }
    to?: Array<{
      email: string
      name?: string
    }>
    [key: string]: any
  }
}

