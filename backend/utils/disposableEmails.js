// Curated blocklist of disposable ("temp mail") domains. Signups are rejected
// when the address' domain matches an entry exactly or is a subdomain of one
// (e.g. `user@x.10minutemail.com`).
//
// This is a static, dependency-free list covering the most common providers
// (10-minute mail, mailinator, guerrillamail, yopmail, throwaway services…).
// Add newly observed domains here.

const DISPOSABLE_DOMAINS = [
  // 10minutemail
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.info',
  '10minutemailplus.com', '10minutemail.us', '10minutemail.co.uk', '10minutemail.co',
  '10minute-mail.com', '10minute-mail.net', '10minutemail.gq', '10minutemail.cf',
  '10minutemail.ga', 'tempinbox.com',
  // mailinator
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator.co',
  'mailinator.info', 'mailinator.biz', 'mailinator.io', 'mailinator.me',
  'mailinator.cc', 'mailinator.gg', 'mailinator2.com', 'mailinator2.net',
  'mailinator2.org', 'mailinator2.co', 'mailinator2.info', 'mailinator2.biz',
  'mailinator3.com', 'mailinator4.com', 'mailinatar.com', 'mailinater.com',
  'mailinatorzz.com',
  // guerrillamail
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.info',
  'guerrillamail.biz', 'guerrillamail.co.uk', 'guerrillamailblock.com',
  'guerrillamail.de', 'guerrillamail.icu', 'guerrillamail.us', 'sharklasers.com',
  'spam4.me', 'pokemail.net', 'grr.la',
  // yopmail
  'yopmail.com', 'yopmail.net', 'yopmail.fr', 'yopmail.co', 'yopmail.org',
  'yopmail.info', 'yopmail.biz', 'yopmail.nl', 'yopmail.uk', 'yopmail.de',
  'yopmail.cz', 'yopmail.es', 'yopmail.it', 'yopmail.pt', 'yopmail.ro',
  'yopmail.in', 'yopmail.gr', 'yopmail.eu', 'yopmail.be', 'yopmail.pl',
  'yopmail.hu', 'yopmail.se', 'yopmail.ph', 'yopmail.pk', 'yopmail.io',
  'yopmail.mx', 'yopmail.kr', 'yopmail.cl', 'yopmail.ru', 'yopmail.dk',
  'yopmail.ca', 'yopmail.at', 'yopmail.fi', 'yopmail.is', 'yopmail.jp',
  'yopmail.lv', 'yopmail.my', 'yopmail.tw', 'yopmail.ae', 'yopmail.tr',
  'yopmail.si', 'yopmail.hk', 'yopmail.sg', 'yopmail.ec', 'yopmail.ch',
  // tempmail / temp-mail
  'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net', 'tempmail.org',
  'tempmail.top', 'tempmail.run', 'tempmail.work', 'tempmail.email', 'tempmailto.com',
  'temp-mail.com', 'temp-mail.info', 'temp-mail.net', 'temp-mail.de', 'temp-mail.biz',
  'temp-mail.ninja', 'temp-mailpage.com', 'tempmail.io', 'temp-mail.lol',
  'tempmail.dev', 'tmails.net', 'tempmails.net', 'tempmail.us', 'tempmail.site',
  'tempmail.ninja', 'tempmail.info', 'tempmail.ws', 'tmail.ws', 'tmailor.com',
  'tmail.io', 'tmail.com', 'tempmail.ninja',
  // throwaway / trash
  'throwawaymail.com', 'throwaway.email', 'throwaway.de', 'trash-mail.com',
  'trashmail.com', 'trash-mail.de', 'trashmailer.com', 'trashmail.net',
  'trashmail.org', 'trashmail.io', 'trashmail.gq', 'trashmail.ga', 'trashmail.co',
  'trashmails.com', 'trash2009.com', 'trash2010.com', 'trash2011.com',
  'trashymail.com', 'throwamail.com',
  // maildrop
  'maildrop.cc', 'maildrop.io', 'maildrop.net', 'maildrop.org', 'maildrop.biz',
  'maildrop.cf', 'maildrop.ga', 'maildrop.gq', 'maildrop.ml', 'maildrop.tk',
  // getnada
  'getnada.com', 'nada.email', 'nada.cf', 'nada.ga', 'nada.gq', 'nada.ml',
  'nada.tk', 'nada.online',
  // emailondeck
  'emailondeck.com', 'emailondeck.ga', 'emailondeck.gq', 'emailondeck.ml',
  'emailondeck.tk',
  // mintemail / mailnesia / mailcatch
  'mintemail.com', 'mailnesia.com', 'mailcatch.com', 'mailcatch.ga',
  'mailcatch.gq', 'mailcatch.ml', 'mailcatch.tk',
  // discard / disposable misc
  'discard.email', 'discard.cf', 'discard.ga', 'discard.gq', 'discard.ml',
  'discard.tk', 'discards.email', 'disposablemail.com', 'disposablemail.de',
  'disposemail.com', 'disposable.com', 'emaildisposable.com', 'dispose.it',
  'disposableinbox.com', 'dispostable.com', 'inboxalias.com', 'mohmal.com',
  'mohmal.in', 'mohmal.im', 'mohmal.tech', 'mohmal.net', 'mohmal.org',
  'mytemp.email', 'mytrashmail.com', 'next.ink', 'nincsmail.com', 'nwytg.net',
  'nwytg.com', 'obobbo.com', 'openinbox.com', 'quickinbox.com', 'receiveee.com',
  'receiveee.org', 'shut.name', 'shut.ws', 'sneakemail.com', 'spam.la',
  'spamcannon.com', 'spamcannon.net', 'spamdecoy.net', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org', 'spamgourmet.info', 'spamgourmet.biz',
  'spamthis.co.uk', 'temporarymail.com', 'temporarymail.net', 'temporary-mail.net',
  'temporaryforwarding.com', 'temporaryinbox.com', 'temporaryemail.net',
  'temporaryemail.us', 'temporarymail.io', 'tempinbox.com', 'tempr.email',
  'thisisnotmyrealemail.com', 'valemail.net', 'webemail.me', 'wegwerfemail.de',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'wegwerfmail.info',
  'wegwerfmail.biz', 'willselfdestruct.com', 'whyspam.me', 'mailsac.com',
  // short TLD / misc temp providers
  'mail.gw', 'mail.ml', 'mail.cf', 'mail.ga', 'mail.gq', 'mail.tk',
  'email.gw', 'email.ml', 'email.cf', 'email.ga', 'email.gq', 'email.tk',
  'dropmail.me', 'fakemail.net', 'fakemailgenerator.com', 'fakeinbox.com',
  'generator.email', 'gsrv.co.uk', 'ieatspam.eu', 'inboxbear.com', 'mail20.com',
  'mail333.com', 'mail4trash.com', 'mailbucket.org', 'mailexpire.com',
  'mailexpire.net', 'maileater.com', 'mailincubator.com', 'mailnull.com',
  'mailscrap.com', 'mailtemp.net', 'speed.1s.fr', 'tempr.email', 'umail.gg',
  'xyzfree.net', 'zeroe.ml', 'firermail.com', 'hmamail.com', 'lomotion.de',
]

// Normalized for lookup. Trailing/leading dots removed, lowercased.
const DOMAIN_SET = new Set(DISPOSABLE_DOMAINS.map((domain) => domain.trim().toLowerCase().replace(/^\.+|\.+$/g, '')))

// Returns true when the given email uses a disposable domain, either directly
// or via a subdomain of a blocked provider.
export function isDisposableEmail(email) {
  const domain = String(email ?? '').trim().toLowerCase().split('@').pop()
  if (!domain || domain.includes('@')) return false
  if (DOMAIN_SET.has(domain)) return true
  for (const blocked of DOMAIN_SET) {
    if (domain.endsWith(`.${blocked}`)) return true
  }
  return false
}